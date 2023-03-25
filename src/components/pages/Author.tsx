import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import Pager from '../components/Pager';
import { getEnsDomainExpireByName, getEnsDomainsByAddress } from '../../thegraph';
import { storefront, tokens } from '../../contracts';
import { ethers } from 'ethers';
// import { useWallet } from '../../use-wallet/src';
import Loading from '../components/Loading';
import { toUSDate } from '../../utils';
import config from '../../config.json'
import { useAccount } from 'wagmi';
import { useBlockchainContext } from '../../context';


interface DomainType {
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
}

export default function Author() {
	const wallet = useAccount();
	const navigate = useNavigate();
	const {address} = useParams()
	const [state, {  }] = useBlockchainContext() as any;
	const [loading, setLoading] = useState(false)
	const [domains, setDomains] = useState<DomainType[]>([]);

	const account = address || wallet.address
	const [status, setStatus] = useState({
		address: account,
		limit: 10,
		page: 0,
		loadMore: true
	})
	
	useEffect(() => {
		if (!wallet.address && localStorage.getItem('isConnected')==="0") return navigate('/')
	}, [wallet.address])

	const readNfts = async (initial?: boolean) => {
		setLoading(true)
		try {
			if (account) {
				const [rows, loadMore] = await getEnsDomainsByAddress(account.toLowerCase(), status.page * status.limit, status.limit)
				setStatus({...status, loadMore})
				let _domains = {} as {[k: string]: DomainType}
				if (!initial) {
					_domains = Object.fromEntries(domains.map(i=>[i.tokenId, i])); // as {[tokenId: string]: DomainType}
				}
				console.log("page", status.page, "rows", rows, account)
				for (let i of rows) {
					_domains[i.tokenId] = {
						tokenId:    i.tokenId,
						owner:      i.owner,
						name:       i.name,
						expires:    i.expires || 0,
						created:    i.created || 0,
						cost:       i.cost || 0,
						orderId: 	0,
						orderPrice: 0,
						orderToken: '',
						orderExpires: 0
					}
				}
				const orders = await storefront.getOrdersByAddress(account.toLowerCase(), 0, 100)
				const _names = {} as {[name: string]: string}
				for (let i of orders) {
					const orderId = Number(i.id);
					if (orderId!==0) {
						const tokenId = i.assetId.toString()
						if (_domains[tokenId]===undefined) {
							_domains[tokenId] = {
								tokenId,
								owner:      i.seller,
								name:       `${i.label}.eth`,
								expires:    0,
								created:    0,
								cost:       0,
								orderId,
								orderPrice: Number((Number(ethers.utils.formatEther(i.price)) / (1 + state.fee.buyer / 100)).toFixed(6)),
								orderToken: tokens[i.token],
								orderExpires: Number(i.expires),
							}
							_names[`${i.label}.eth`] = tokenId
						} else {
							_domains[tokenId].orderId = 	orderId
							_domains[tokenId].orderPrice = 	Number((Number(ethers.utils.formatEther(i.price)) / (1 + state.fee.buyer / 100)).toFixed(6))
							_domains[tokenId].orderToken = 	tokens[i.token]
							_domains[tokenId].orderExpires= Number(i.expires)
						}
					}
					
				}
				const __names = Object.keys(_names);
				if (__names.length!==0) {
					const _expires = await getEnsDomainExpireByName(__names)
					for (let k in _expires) {
						_domains[_names[k]].expires = _expires[k]
					}
				}
				setDomains(Object.values(_domains))
			}
		} catch (error) {
			console.log("readNfts", error)
		}
		setLoading(false)
	}

	React.useEffect(() => {
		if (address?.toLowerCase()===wallet.address?.toLowerCase()) return navigate('/my-domains')
		readNfts(status.address?.toLowerCase()!==account?.toLowerCase())
		if (status.address?.toLowerCase()!==account?.toLowerCase()) setStatus({...status, address: account})
	}, [account, status.page])

	// const onLoadMore = () => {
	// 	setStatus({...status, page: status.page + 1})
	// }

	return (
		<div style={{ paddingTop: '2px' }}>
		<section className="page-content-area">
			<div className="container">
				<div className="rt-spacer-40"></div>
				<div className="row align-items-center justify-content-center">
					<div className="col-10">
						<div className="tab-content" id="myTabContent">
							<div className="tab-pane fade-in-bottom show active" id="rt-tab-1" role="tabpanel"
								aria-labelledby="rt-tab-1-tab">
									{(domains.length!==0) ? (
										<>
										<div className="table-responsive">
											<table className="table domain-table">
												<thead>
													<tr className="rt-light-gray">
														<th className="text-323639 rt-strong f-size-18">Domain</th>
														<th className="text-323639 rt-strong f-size-18">Network</th>
														{/* <th className="text-323639 rt-strong f-size-18">Domain Register</th> */}
														<th className="text-323639 rt-strong f-size-18" style={{minWidth: '7em'}}>Domain Expire</th>
														<th className="text-323639 rt-strong f-size-18">Price</th>
														{wallet.address?.toLowerCase()===account?.toLowerCase() && (<th className="text-323639 rt-strong f-size-18 text-right"></th>)}
													</tr>
												</thead>
												<tbody>
													{domains.map((i, k) => (
														<tr key={k} onClick={()=>navigate(`/domain/${i.name}`)} style={{cursor: 'pointer'}}>
															<th className="f-size-18 f-size-md-18 rt-semiblod text-234"><label>Domain</label>{i.name}</th>
															<th><code className="f-size-18 f-size-md-18"><label>Network</label>Ethereum (ENS Service)</code></th>
															{/* <td className="f-size-18 f-size-md-18 rt-semiblod text-605">{i.created ? new Date(i.created * 1000).toLocaleDateString() : '-'}</td> */}
															<td className="f-size-18 f-size-md-18 rt-semiblod text-338"><label>Domain Expire</label>{i.expires ? toUSDate(i.expires) : '-'}</td>
															<th className="f-size-18 f-size-md-18 rt-semiblod text-234"><label>Price</label>{i.orderId!==0 ? `${Number(i.orderPrice.toFixed(6))} ETH` : '-'}</th>
															{wallet.address?.toLowerCase()===account?.toLowerCase() && (
																<td className="text-right">
																	<Link to={`/domain/${i.name}`} className="rt-btn rt-gradient2 rt-sm4 pill">{i.orderId!==0 ? 'Listed' : 'List it now!'}</Link>
																</td>
															)}
														</tr>
													))}
												</tbody>
											</table>
										</div>
										{status.loadMore && (																
											<div className="row" style={{marginTop: '1.5em'}}>
												<div className="col-12" style={{display: 'flex', justifyContent: 'center'}}>
													<button className="rt-btn rt-outline-gray text-uppercase pill" onClick={()=>setStatus({...status, page: status.page + 1})}>
														<i className="icofont-refresh rt-mr-5"></i> Load More
													</button>
													{/* <Pager page={status.page} total={status.total} onChange={page=>onPage(page)} /> */}
												</div>
											</div>
										)}	
										</>
									) : (
										<>
										{!loading && (
											<div className="row">
												<div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
												<h2 className="rt-section-title">
													No domains
												</h2>
												<p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
												</p>
												</div>
											</div>
										)}
										</>
									)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		{loading && (
			<div className='layout'>
				<Loading />
			</div>
		)}
		</div>
	);
}
