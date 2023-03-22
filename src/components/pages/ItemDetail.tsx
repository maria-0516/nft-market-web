import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlockchainContext } from '../../context';
import { changeNetwork, styledAddress, toUSDate } from '../../utils';
import { useWallet } from '../../use-wallet/src';
import Jazzicon from 'react-jazzicon';
import { toast } from 'react-toastify';
import config from '../../config.json'
import Dialog from '../components/Dialog';
import { getEnsDomainByName, makeTokenId } from '../../thegraph';
import { storefront, storefrontWithSigner, tokens } from '../../contracts';
import { ethers } from 'ethers';
import Loading from '../components/Loading';

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

export default function ItemDetail() {
	const wallet = useWallet();
	const { name } = useParams();
	const navigate = useNavigate();
	const [state, { translateLang }] = useBlockchainContext() as any;
	const [pageFlag, setPageFlag] = useState(1); // 1 = mine, 2 = sale mine, 3 = others, 4 = sale others
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
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState({
		showCancel: false,
	})
	const [bidPrice, setBidPrice] = useState(0)
	const [remainTime, setRemainTime] = useState('')

	const setFlag = (_domain: DomainDetailType) => {
		let flag = 0
		if (_domain.orderId!==0) {
			flag = _domain.owner?.toLowerCase()===wallet.account?.toLowerCase() ? 2 : 4
		} else {
			flag = _domain.owner?.toLowerCase()===wallet.account?.toLowerCase() ? 1 : 3
		}
		setPageFlag(flag)
	}

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
				if (_domain.name==="") {
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
			setFlag(_domain)
			getRemainTime(_domain.orderExpires)
		} catch (error) {
			console.log("readData", error)
		}
		setLoading(false)
	}

	const getRemainTime = (expires: number) => {
		if (expires!==0) {
			const countDownDate = expires * 1000;
			const now = new Date().getTime();
			const distance = countDownDate - now;
			if (distance < 0) {
				setRemainTime('End')
				return
			}
			const day = Math.floor(distance / (1000 * 60 * 60 * 24));
			const hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			// const minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			// const second = Math.floor((distance % (1000 * 60)) / 1000);
			setRemainTime(`${day} days, ${hour} hours`)
		}
	}

	useEffect(() => {
		readData()
	}, [wallet.account])

	const handleBuy = async () => {
		setLoading(true)
		try {
			if (domain.orderId===0) return
			// console.log("ethers.utils.formatUnits(domain.orderPrice)", )
			const value = ethers.utils.parseEther(String(domain.orderPrice))
			const tx = await storefrontWithSigner(wallet.ethereum).executeOrder(domain.orderId, value, {value})
			await tx.wait()
			toast(translateLang('buynft_success'), {position: "top-right", autoClose: 2000})
			await readData()
		} catch (error) {
			console.log("handleBuy", error)
			toast(translateLang('buynft_error'), {position: "top-right", autoClose: 2000})
		}
		setLoading(false)
	};

	const handleBid = async () => {
		try {
			if (domain.orderId===0) return
			if (bidPrice <= domain.bidPrice) {
				return toast('Bid price only can higher than before', {position: "top-right", autoClose: 2000})
			}

			setLoading(true)
			if (wallet.account) {
				// const gasEstimated = await storefront.estimateGas.placeBid(domain.orderId, ethers.utils.parseEther(String(status.bidPrice)));
				const value = ethers.utils.parseEther(String(bidPrice))
				const tx = await await storefrontWithSigner(wallet.ethereum).placeBid(domain.orderId, value, {value})
				await tx.wait()
			} else {
				onConnectWallet()
			}
			toast('Bid successful', {position: "top-right", autoClose: 2000})
			await readData()
		} catch (error) {
			console.log("handleBid", error)
			toast('Bid failed', {position: "top-right", autoClose: 2000})
		}
		setLoading(false)
	}

	const onConnectWallet = async () => {
        console.log("wallet-status", wallet.status)
        try {
            if (wallet.ethereum) {
                const chainId = await wallet.ethereum.request({
                    method: 'eth_chainId'
                });
                if (Number(chainId)!==config.chainId) {
                    console.log('NowchainId', chainId)
                    await changeNetwork(wallet.ethereum, config.chainId);
                    return
                } else {
					wallet.connect()
					localStorage.setItem('isConnected', "1")
				}
            } else {
				wallet.connect()
			}
        } catch (error) {
            console.log("connect-wallet", error)
        }
    }

	const toAuction = () => {
		navigate(`/auction/${domain.name}`);
	};

	const handleCancel = async () => {
		setLoading(true)
		setStatus({...status, showCancel: false})
		try {
			if (domain.orderId===0) return
			const tx = await await storefrontWithSigner(wallet.ethereum).cancelOrder(domain.orderId)
			await tx.wait()
			toast(translateLang('cancelorder_success'), {position: "top-right", autoClose: 2000})
			await readData()
		} catch (error) {
			console.log("handleCancel", error)
			toast(translateLang('cancelorder_error'), {position: "top-right", autoClose: 2000})
		}
		setLoading(false)
	};

	const acceptBid = async () => {
		setLoading(true)
		try {
			if (domain.orderId===0) return
			const tx = await await storefrontWithSigner(wallet.ethereum).acceptBid(domain.orderId)
			await tx.wait()
			toast("Accepting bid was successfully done", {position: "top-right", autoClose: 2000})
			await readData()
		} catch (error) {
			console.log("acceptBid", error)
			toast("Accepting bid was failed", {position: "top-right", autoClose: 2000})
		}
		setLoading(false)
	}

	const cancelBid = async () => {
		setLoading(true)
		try {
			const tx = await await storefrontWithSigner(wallet.ethereum).cancelBid(domain.orderId)
			await tx.wait()
			toast("Canceling bid was successfully done", {position: "top-right", autoClose: 2000})		
			await readData()
		} catch (error) {
			console.log("cancelBid", error)
			toast('Canceling bid was failed', {position: "top-right", autoClose: 2000})
		}
		setLoading(false)
	}

	return (
		<div>
			<section className="container domain-detail">
				<div className="page-content-area" style={{paddingTop: '2px'}}>
					<div>
						<div className="container">
							{(!!domain.owner) ? (
								<>
									<div className="row">
										<div className="col-lg-7">
												<div className="imil-box rt-mb-30">
													<div className="rt-box-style-2">
														<h4 className="f-size-36 f-size-xs-30 rt-semiblod text-422" style={{lineBreak: 'anywhere'}}>{domain.name}</h4>  
														{/* <div onClick={HandleLike} className="like">
															<i className="fa fa-heart"></i>
															{'  '}
															{domain.likes?.length || 0}
														</div>  */}
														{/* <h5 className="f-size-18 rt-light3">is for sale</h5> */}
													
														{/* <div>Network: Ethereum</div> */}
														<div className="row rt-mt-50" style={{marginTop: '1em'}}>
															<div className="domain-border col-lg-4">
																<span className="d-block f-size-24 rt-semiblod">Ethereum</span>
																<span className="d-block f-size-16 rt-light3">Network</span>
															</div>
															<div className="domain-border col-lg-4">
																<span className="d-block f-size-24 rt-semiblod">ENS Service</span>
																<span className="d-block f-size-16 rt-light3">Provider</span>
															</div>
															<div className="col-lg-4">
																<span className="d-block f-size-24 rt-semiblod">{toUSDate(domain.expires)}</span>
																<span className="d-block f-size-16 rt-light3">Expires</span>
															</div>
														</div>
													</div>
											
												</div>
												{/* <div className="rt-box-style-2 rt-mb-30 rt-dorder-off">
													<span className="f-size-18"><span className="rt-strong">Ads: </span>Do you want to post your advertisement here? Contact us!</span>
												</div> */}
												<div className="rt-box-style-2 rt-mb-30">
													<div className="f-size-18 rt-light3 line-height-34" style={{display: 'flex', gap: '1em'}}>
														<div>Owner:</div>
														<div style={{display: 'flex', gap: '0.5em'}}>
															{state.usersInfo[domain.owner]?.image ? (
																<img
																	className="lazy"
																	src={state.usersInfo[domain.owner].image}
																	alt=""
																	style={{width: 32, height: 32, borderRadius: '50%'}}
																/>
															) : (
																<Jazzicon
																	diameter={32}
																	seed={Math.round(
																		(Number(domain.owner) /
																			Number(
																				'0xffffffffffffffffffffffffffffffffffffffffff'
																			)) *
																			10000000
																	)}
																/>
															)}
															<div className="author_list_info">
																<Link to={`/address/${domain.owner}`}>{styledAddress(domain.owner)}</Link>
															</div>
														</div>
													</div>
												</div>
										</div>
										<div className="col-lg-5">
											<div className="rt-box-style-3">
												<div className="rt-gradient-2 text-center text-white rt-light3 f-size-28 f-size-xs-24 rt-pt-25 rt-pb-25">
													{(pageFlag===1 || pageFlag===2) ? 'This is your domain' : (domain.orderId!==0 ? 'This domain is for sale' : 'This domain is not listed')}
												</div>
												<div className="rt-p-30">
													{domain.orderId!==0 && (
														<>
															<div className="d-flex justify-content-between rt-mb-20">
																<span className="f-size-20 rt-light3" style={{display: 'flex', alignItems: 'center'}}>Current price:</span>
																<span className="rt-light3 amount"><span className="f-size-40 text-422"><span className="rt-semiblod">{Math.round(Number(domain.orderPrice) * (1 - config.fee / 100) * 1e6) / 1e6}</span></span><span className="f-size-24"> ETH</span></span>
															</div>
															<div className="d-flex justify-content-between rt-mb-20">
															<span className="f-size-20 rt-light3">CNS fee:</span>
																<span className="f-size-20 rt-light3 ">{Math.round(Number(domain.orderPrice) * config.fee * 1e4) / 1e6} ETH ({config.fee}%)</span>
															</div>
															<div className="d-flex justify-content-between rt-mb-20">
															<span className="f-size-20 rt-light3">Total payment:</span>
																<span className="f-size-20 rt-light3 ">{Math.round(domain.orderPrice * 1e4) / 1e4} ETH</span>
															</div>
															{/* <div className="d-flex justify-content-between rt-mb-20">
																<span className="f-size-20 rt-light3 text-338">Remaining time:</span>
																<span className="f-size-20 rt-light3 text-eb7">{remainTime}</span>
															</div> */}
														</>
													)}
													<div className="rt-form ">
														{!wallet.account ? (
															<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={onConnectWallet}>Connect Wallet</button>
														) : (
															<>
																{pageFlag===1 && (
																	<>
																		<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={toAuction}>Sell Your Domain</button>
																	</>
																)}
																{pageFlag===2 && (
																	<>
																		<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={toAuction}>Edit Your Listing</button>
																		<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={()=>setStatus({...status, showCancel: true})}>Cancel Your Listing</button>
																	</>
																)}
																{pageFlag===3 && (
																	<>
																		<button disabled className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Edit/Cancel Your Listing</button>
																		<button disabled className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Create offer</button>
																		<button disabled className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Sell Your Domain</button>
																	</>
																)}
																{pageFlag===4 && (
																	<>
																		<button className="rt-btn rt-gradient pill d-block rt-mb-30" onClick={handleBuy}>Buy it now for {Math.round(domain.orderPrice * 1e4) / 1e4} ETH</button>
																		{domain.bidder!==wallet.account && (
																			<>
																				<input type="number" className="form-control pill rt-mb-15" placeholder="Enter bid amount" value={bidPrice} onChange={e=>setBidPrice(Number(e.target.value))} />
																				<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleBid}>Create offer</button>
																			</>
																		)}
																		{/* <button className="rt-btn rt-gradient pill d-block rt-mb-15">Buy it now for 1.575 ETH (in fixed mode)</button> */}
																		{/* <button className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Send offer (in fixed mode)</button> */}
																	</>
																)}
															</>
														)}
													</div>
												</div>
											</div>
										</div>
										<div className='col-lg-12'>
										{domain.bidPrice!==0 && (
											<div className='rt-box-style-2 rt-mb-30' style={{marginTop: '20px', padding: '30px'}}>
												<span className="f-size-30 f-size-xs-30 rt-semiblod text-422">Bid</span>
												<div className='row'>
													<div className="domain-border col-lg-4 d column between" style={{border: 0}}>
														<span className="d-block f-size-24 rt-semiblod">Bidder Address</span>
														<div className="f-size-16 rt-light3" style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
															<Jazzicon diameter={32} seed={Math.round((Number(domain.owner) / Number('0xffffffffffffffffffffffffffffffffffffffffff')) * 10000000)} />
															<div className="f-size-20"><Link to={`/address/${domain.bidder}`}>{styledAddress(domain.bidder)}</Link></div>
														</div>
													</div>
													<div className="domain-border col-lg-4 d column between" style={{border: 0}}>
														<span className="d-block f-size-24 rt-semiblod">Bid Price</span>
														<span className="rt-light3 amount"><span className="f-size-30 text-422"><span className="rt-semiblod">{domain.bidPrice}</span></span><span className="f-size-20"> ETH</span></span>
														{/* <span className="d-block f-size-16 rt-light3">{domain.bidPrice}</span> */}
													</div>
													{domain.owner?.toLowerCase()===wallet.account?.toLowerCase() ? (
														<div className="col-lg-4 d column around">
															<span className="d-block f-size-24 rt-semiblod"></span>
															<span className="f-size-16 rt-light3 d column center">
																<button className="rt-btn rt-gradient pill rt-mb-15" style={{margin: 0, padding: '16px 12px'}} onClick={acceptBid}>Accept</button>
															</span>
														</div>
													) : (
														<div className="col-lg-4 d column around">
															<span className="d-block f-size-24 rt-semiblod"></span>
															<span className="f-size-16 rt-light3 d column center" style={{height: '100%'}}>
																{wallet.account?.toLowerCase()===domain.bidder?.toLowerCase() ? (
																	<button className="rt-btn rt-gradient pill rt-mb-15" onClick={cancelBid} style={{margin: 0, padding: '16px 12px'}}>Cancel</button>
																) : (
																	<button disabled className="rt-btn rt-outline-gradientL pill rt-mb-15" style={{margin: 0, padding: '16px 12px'}}>Cancel</button>
																)}
															</span>
														</div>
													)}
												</div>
											</div>
										)}
										</div>
									</div>
								</>
							) : (
								<>
									{!loading && (
										<div className="row">
											<div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
											<h2 className="rt-section-title">
												Not Found
											</h2>
											<p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
											</p>
											</div>
										</div>
									)}
								</>
							)}
						</div>
						<div>
					</div>
						{status.showCancel && (
							<Dialog onClose={()=>setStatus({...status, showCancel: false})}>
								<div className='d column gap' style={{padding: '10px'}}>
									<div style={{fontSize: '20px',textAlign: 'center'}}>Are you sure you want to cancel this transaction?</div>
									<div className='d center middle gap' style={{marginTop: '20px'}}>
										<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={()=>setStatus({...status, showCancel: false})}>Cancel</button>
										<button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleCancel}>OK</button>
									</div>
								</div>
							</Dialog>
						)}
					</div>
					{loading && (
						<div className='layout'>
							<Loading />
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
