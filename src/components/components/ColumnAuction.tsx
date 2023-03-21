import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useBlockchainContext } from '../../context';
import { useNavigate } from 'react-router-dom';
import Action from '../../service';
import { toBigNum } from '../../utils';
import { toast } from 'react-toastify';
import config from '../../config.json'
import { useWallet } from '../../use-wallet/src';
import { getEnsDomainByName, makeTokenId } from '../../thegraph';
import { storefront, tokens } from '../../contracts';
import { ethers } from 'ethers';
import Loading from './Loading';

const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000

const DateTimeField = require('@1stquad/react-bootstrap-datetimepicker')

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
    const wallet = useWallet()
    const navigate = useNavigate();
    const [state, { translateLang }] = useBlockchainContext() as any;
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
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
			const order = await storefront().getOrderByTokenId(tokenId)
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
						orderPrice: Number(ethers.utils.formatEther(order.price)),
						orderToken: tokens[order.token],
						orderExpires: parseInt(order.expires),
						bidder: order.bidder,
						bidPrice: Number(ethers.utils.formatEther(order.bidPrice))
					}
				} else {
					_domain.owner = 	order.seller
					_domain.orderId = 	orderId
					_domain.orderPrice = 	Number(ethers.utils.formatEther(order.price))
					_domain.orderToken = 	tokens[order.token]
					_domain.orderExpires= parseInt(order.expires)
					_domain.bidder= order.bidder
					_domain.bidPrice= Number(ethers.utils.formatEther(order.bidPrice))
				}
			}
			setDomain(_domain)
            if (_domain.orderExpires!==0) setDate(new Date(_domain.orderExpires * 1000))
            setPrice(String(_domain.orderPrice))
		} catch (error) {
			console.log("readData", error)
		}
		setLoading(false)
		// setStatus({...state, loaded: true})
	}

    useEffect(() => {
		readData()
	}, [wallet.account])


    useEffect(() => {
        (async () => {
            // setApproveFlag(nft.isOffchain || true);
            // if (nft !== null && !nft.isOffchain) {
            //     const validation = await checkNFTApprove({
            //         assetId: nft.tokenId,
            //         nftAddress: nft.collection
            //     });
            //     setApproveFlag(validation);
            // }
        })();
    }, [domain]);

    const handle = (newDate: any) => {
        setDate(newDate);
    };

    const handlelist = async () => {
        setLoading(true)
        try {
            const label = domain.name.slice(0, domain.name.lastIndexOf('.'))
            const time = Math.round(new Date(date).getTime() / 1000)
            await storefront().createOrder(config.ens, label, '0x' + BigInt(domain.tokenId).toString(16), ZERO_ADDRESS, ethers.utils.parseEther(price), '0x' + time.toString(16))
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
            const time = Math.round(new Date(date).getTime() / 1000)
            const tx = await storefront().updateOrder(domain.orderId, ethers.utils.parseEther(price), '0x' + time.toString(16))
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
                                <div className='rt-form'>
                                    {/* <h5>{translateLang('method')}</h5>
                                    <p
                                        className="form-control"
                                        style={{
                                            boxShadow: '0 0 5 0 #d05e3c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                        <i
                                            className="arrow_right-up"
                                            style={{
                                                fontWeight: 'bolder'
                                            }}
                                        />
                                        <span>{translateLang('sellnote')}</span>
                                    </p> */}
                                    {/* <div className="spacer-single"></div> */}
                                    <h5>{translateLang('sellprice')}</h5>
                                    {/* <input type="text" className="form-control rt-mb-15" placeholder="$ Enter bid amount (or Send Offer in fixed mode)" /> */}
                                    <div className="price mt">
                                        <div
                                            style={{
                                                flex: '1 1 0'
                                            }}>
                                            <select className='form-control' style={{height: '100%'}}>
                                                <option value="ETH">ETH</option>
                                            </select>
                                            {/* <select
                                                className="form-control"
                                                style={{height: '100%'}}
                                                onChange={(e) => {
                                                    setCurrency(e.target.value);
                                                }}>
                                                {state.currencies.map((currency: any, index: number) => (
                                                    <option value={currency.value} key={index}>
                                                        {currency.label}
                                                    </option>
                                                ))}
                                            </select> */}
                                        </div>
                                        <input
                                            type="number"
                                            name="item_price"
                                            id="item_price"
                                            className="form-control"
                                            style={{
                                                flex: '4 4 0'
                                            }}
                                            placeholder={translateLang('amount')}
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="spacer-30"></div>
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
                                    />
                                </div>

                                <div className="spacer-20"></div>
                                <h5>{translateLang('fees')}</h5>
                                <div className="fee">
                                    <p>{translateLang('servicefee')}</p>
                                    <p>{config.fee}%</p>
                                </div>

                                <div className="spacer-40"></div>
                                {domain.orderId!==0 ? (
                                    <>
                                    {false ? (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15">
                                                <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{backgroundColor: 'transparent'}}></span>
                                            </button>
                                        ) : (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleEdit}>
                                                Edit
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {false ? (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15">
                                                <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{backgroundColor: 'transparent'}}></span>
                                            </button>
                                        ) : (
                                            <button
                                                className="rt-btn rt-gradient pill d-block rt-mb-15"
                                                disabled={
                                                    price === '' || !moment(date).isValid()
                                                        ? true
                                                        : false
                                                }
                                                onClick={handlelist}>
                                                List Domain
                                            </button>
                                        ) 
                                        // : (
                                        //     <button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleApprove}>
                                        //         {'Approve'}
                                        //     </button>
                                        // )
                                    }
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className='rt-box-style-2'>
                            <h5>{translateLang('previewitem')}</h5>
                            <div className="nft_item m-0">
                                <div className="author_list_pp"></div>
                                {/* <div className="nft__item_wrap">
                                    <span>
                                        <img
                                            src={
                                                nft.metadata.image ||
                                                '../../img/collections/coll-item-3.jpg'
                                            }
                                            id="get_file_2"
                                            className="lazy nft__item_preview"
                                            alt=""
                                        />
                                    </span>
                                </div> */}
                                <div className="nft__item_info">
                                    <div className="sell_preview">
                                        <div>
                                            <p style={{fontWeight: '600'}}>
                                                {name.length > 15
                                                    ? name.slice(
                                                        0,
                                                        15
                                                    ) + '...'
                                                    : name}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{fontWeight: '500'}}>
                                                {price === ''
                                                    ? `0 ETH`
                                                    : price?.length > 15
                                                    ? price.slice(0, 15) + '...' + ` ETH`
                                                    : price + ` ETH`}
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
