import React, { useEffect, useState } from 'react';
import { useBlockchainContext } from '../../context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import config from '../../config.json'
// import { useWallet } from '../../use-wallet/src';
import { getEnsDomainByName, makeTokenId } from '../../thegraph';
import { collectionWithSigner, storefront, storefrontWithSigner, tokens, toLower } from '../../contracts';
import { ethers } from 'ethers';
import Loading from './Loading';
import addresses from '../../contracts/contracts/addresses.json'
import { validNumberChar } from '../../utils';
import { useAccount, useProvider, useSigner } from 'wagmi';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

interface Props {
    name: string
}

interface DomainDetailType {
	tokenId: string
	owner: string
	name: string
	expires: number
	created: number
	cost: number
	orderId: number
	orderPrice: number
	orderToken: string
	orderExpires: number
	bidder: string
	bidPrice: number
}

export default function ColumnAuction({name}: Props) {
    // const provider = useProvider();
	const { data: signer } = useSigner();
	const { address} = useAccount();
    const navigate = useNavigate();
    const [state, { translateLang }] = useBlockchainContext() as any;
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [approved, setApproved] = useState(false)
    const [domain, setDomain] = useState<DomainDetailType>({
		tokenId: '',
		owner: '',
		name: '',
		expires: 0,
		created: 0,
		cost: 0,
		orderId: 0,
		orderPrice: 0,
		orderToken: '',
		orderExpires: 0,
		bidder: '',
		bidPrice: 0
	})

    const readData = async () => {
		setLoading(true)
		try {
			const row = await getEnsDomainByName(name || '')
			let _domain = {} as DomainDetailType
			if (!!row) {
				_domain = {
					tokenId:    row.tokenId,
					owner:      row.owner,
					name:       row.name,
					expires:    row.expires,
					created:    row.created,
					cost:       row.cost,
					orderId: 	0,
					orderPrice: 0,
					orderToken: '',
					orderExpires: 0,
					bidder: '',
					bidPrice: 0
				}
			}
			const tokenId = makeTokenId(name?.slice(0, name?.lastIndexOf('.')) || '')
			const order = await storefront.getOrderByTokenId(tokenId)
			const orderId = Number(order.id);
			if (orderId!==0) {
				const tokenId = order.assetId.toString()
				if (domain.name==="") {
					_domain = {
						tokenId,
						owner:      order.seller,
						name:       `${order.label}.eth`,
						expires:    0,
						created:    0,
						cost:       0,
						orderId,
						orderPrice: Number((Number(ethers.utils.formatEther(order.price)) / (1 + (state.fee.buyer || config.buyerFee) / 100)).toFixed(6)),
						orderToken: tokens[order.token],
						orderExpires: parseInt(order.expires),
						bidder: order.bidder,
						bidPrice: Number(ethers.utils.formatEther(order.bidPrice))
					}
				} else {
					_domain.owner = 	order.seller
					_domain.orderId = 	orderId
					_domain.orderPrice = 	Number((Number(ethers.utils.formatEther(order.price)) / (1 + (state.fee.buyer || config.buyerFee) / 100)).toFixed(6))
					_domain.orderToken = 	tokens[order.token]
					_domain.orderExpires= parseInt(order.expires)
					_domain.bidder= order.bidder
					_domain.bidPrice= Number(ethers.utils.formatEther(order.bidPrice))
				}
			}
			setDomain(_domain)
            // if (_domain.orderExpires!==0) setDate(new Date(_domain.orderExpires * 1000))
            if (_domain.orderPrice!==0) setPrice(String(_domain.orderPrice))
		} catch (error) {
			console.log("readData", error)
		}
		setLoading(false)
		// setStatus({...state, loaded: true})
	}

    useEffect(() => {
		readData()
	}, [address])


    useEffect(() => {
       checkApprove()
    }, [domain]);

    // const handle = (newDate: any) => {
    //     setDate(newDate);
    // };

    const checkApprove = async () => {
        const tokenId = '0x' + BigInt(domain.tokenId).toString(16)
        const collection = await collectionWithSigner(signer);
        const _spender = await collection.getApproved(tokenId)
        const isApproved = toLower(_spender)===toLower(addresses.storefront)
        setApproved(isApproved)
        return isApproved
    }

    const handleApprove = async () => {
        setLoading(true)
        try {
            const tokenId = '0x' + BigInt(domain.tokenId).toString(16)
            const collection = await collectionWithSigner(signer);
            // const isApproved = await checkApprove()
            if (!approved) {
                const txApprove = await collection.approve(addresses.storefront, tokenId)
                await txApprove.wait()
                toast("Approving domain was successfully done", {position: "top-right", autoClose: 2000})
                setApproved(true)
            }
        } catch (error) {
            console.log("handleApprove", error)
            toast("Approving domain was failed", {position: "top-right", autoClose: 2000})
        }
        setLoading(false)
    }

    const handlelist = async () => {
        setLoading(true)
        try {
            const label = domain.name.slice(0, domain.name.lastIndexOf('.'))
            const now = Math.round(new Date().getTime() / 1000)
            const time = now + 179 * 86400
            const tokenId = '0x' + BigInt(domain.tokenId).toString(16)
            // const collection = await collectionWithSigner(wallet.ethereum);
            // const _spender = await collection.getApproved(tokenId)
            // if (toLower(_spender)!==toLower(addresses.storefront)) {
            //     const txApprove = await collection.approve(addresses.storefront, tokenId)
            //     await txApprove.wait()
            //     toast(translateLang('listing_approve'), {position: "top-right", autoClose: 2000})
            // }
            const tx = await storefrontWithSigner(signer).createOrder(addresses.nft, label, tokenId, ZERO_ADDRESS, ethers.utils.parseEther(String(Number(price) * (1 + (state.fee.buyer || config.buyerFee) / 100))), time)
            await tx.wait();
            toast(translateLang('listing_success'), {position: "top-right", autoClose: 2000})
            navigate(`/domain/${name}`)
        } catch (error) {
            console.log("handlelist", error)
            toast(translateLang('listingerror'), {position: "top-right", autoClose: 2000})
        }
        setLoading(false)
    };

    const handleEdit = async () => {
        setLoading(true)
        try {
            // const time = Math.round(new Date(date).getTime() / 1000)
            const tx = await await storefrontWithSigner(signer).updateOrder(domain.orderId, ethers.utils.parseEther(String(Number(price) * (1 + (state.fee.buyer || config.buyerFee) / 100))), '0x' + domain.orderExpires.toString(16))
            await tx.wait()
            navigate(`/domain/${name}`)
        } catch (error) {
            console.log("handleEdit", error)
        }
        setLoading(false)
    }

    return (
        <>
            <section className="container" style={{ paddingTop: '2px' }}>
                <div className="row">
                    <div className="col-lg-7 offset-lg-1 mb-5" style={{margin: 0}}>
                        <div id="form-create-item" className="form-border rt-box-style-2">
                            <div className="field-set">
                            <Tabs>
                                <TabList>
                                    <Tab>Fixed</Tab>
                                    <Tab disabled>Auction (Soon)</Tab>
                                </TabList>

                                <TabPanel>
                                    <div className='rt-form'>
                                        <div className="spacer-single"></div>
                                        <h5>{translateLang('sellprice')}</h5>
                                        <div className="price mt">
                                            <div style={{flex: '1 1 0'}}>
                                                <select className='form-control' style={{height: '100%'}}>
                                                    <option value="ETH">ETH</option>
                                                </select>
                                            </div>
                                            <input type="text" minLength={1} maxLength={10} name="item_price" id="item_price" className="form-control" style={{flex: '4 4 0'}} placeholder={translateLang('amount')} value={price} onKeyDown={e=>!validNumberChar(e.key) && e.preventDefault()}  onChange={(e) => setPrice(e.target.value)} />
                                        </div>
                                        {/* <div className="spacer-30"></div>
                                        <h5>{translateLang('expiredate')}</h5>
                                        <DateTimeField
                                            dateTime={date}
                                            onChange={handle}
                                            mode={'datetime'}
                                            format={'MM/DD/YYYY hh:mm A'}
                                            inputFormat={'DD/MM/YYYY hh:mm A'}
                                            minDate={new Date()}
                                            showToday={true}
                                            startOfWeek={'week'}
                                            readonly
                                        /> */}
                                    </div>
                                    <div className="spacer-20"></div>
                                    {/* <h5>{translateLang('fees')}</h5>
                                    <div className="fee">
                                        <p style={{fontWeight: 500}}>{translateLang('servicefee')}</p>
                                        <p>{(state.fee.seller || config.serviceFee)}%</p>
                                    </div> */}
                                </TabPanel>
                                <TabPanel>

                                </TabPanel>
                            </Tabs>
                               
                                <div className="spacer-40"></div>
                                {domain.orderId!==0 ? (
                                    <button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleEdit}>Edit</button>
                                ) : (
                                    <>
                                        {!approved ? (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15" disabled={Number(price) === 0} onClick={handleApprove}>Step1: Approve</button>
                                        ) : (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15" disabled={Number(price) === 0} onClick={handlelist}>Step2: Listing in Store</button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className='rt-box-style-2'>
                            {/* <h5>{translateLang('previewitem')}</h5> */}
                            <div className="nft_item m-0">
                                <div className="author_list_pp"></div>
                                <div className="nft__item_info">
                                    <div className="sell_preview">
                                        <div>
                                            <h4 className="f-size-25 f-size-xs-30 rt-semiblod text-422" style={{lineBreak: 'anywhere',marginBottom: '20px'}}>{domain.name}</h4>  
                                        </div>
                                        <div>
                                            <p style={{fontWeight: '500'}} className="d column gap">
                                                <div>
                                                    <span className="f-size-20 rt-light3" style={{fontWeight: '500'}}>Listing Price: </span>
                                                    <span className="rt-light3 amount"><span><span style={{fontWeight: 400}} className="f-size-25">{Number(Number(price).toFixed(6))} ETH</span></span><span className="f-size-24"></span></span>
                                                </div>
                                                <div>
                                                    <span className="f-size-20 rt-light3" style={{fontWeight: '500'}}>Service Fee: </span>
                                                    <span className="rt-light3 amount"><span><span style={{fontWeight: 400}} className="f-size-25">{Number((Number(price) * (state.fee.seller || config.serviceFee) / 100).toFixed(6))} ETH</span></span><span className="f-size-24"></span></span> ({(state.fee.seller || config.serviceFee)}%)
                                                </div>
                                                <div>
                                                    <span className="f-size-20 rt-light3" style={{fontWeight: '500'}}>Final Earning: </span>
                                                    <span className="rt-light3 amount"><span className="f-size-25"><span style={{fontWeight: 600}}>{Number((Number(price) * (1 - (state.fee.seller || config.serviceFee) / 100)).toFixed(6))} ETH</span></span><span className="f-size-24"></span></span>
                                                </div>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {loading && (
                <div className='layout'>
                    <Loading />
                </div>
            )}
            </section>
        </>
    );
}
