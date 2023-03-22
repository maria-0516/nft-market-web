import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import Pager from '../components/Pager';
import { getEnsDomainsByAddress } from '../../thegraph';
import { storefront, tokens } from '../../contracts';
import { ethers } from 'ethers';
import { useWallet } from '../../use-wallet/src';
import Loading from '../components/Loading';


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
	const wallet = useWallet()
	const navigate = useNavigate();
	const {address} = useParams()
	const [loading, setLoading] = useState(false)
	const [domains, setDomains] = useState<DomainType[]>([]);

	const account = address || wallet.account
	const [status, setStatus] = useState({
		address: account,
		limit: 10,
		page: 0,
		loadMore: true
	})
	
	useEffect(() => {
		if (!wallet.account && localStorage.getItem('isConnected')==="0") return navigate('/')
	}, [wallet.account])

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
								orderPrice: Number(ethers.utils.formatEther(i.price)),
								orderToken: tokens[i.token],
								orderExpires: Number(i.expires),
							}
						} else {
							_domains[tokenId].orderId = 	orderId
							_domains[tokenId].orderPrice = 	Number(ethers.utils.formatEther(i.price))
							_domains[tokenId].orderToken = 	tokens[i.token]
							_domains[tokenId].orderExpires= Number(i.expires)
						}
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
		if (address===wallet.account) return navigate('/my-domains')
		readNfts(status.address!==account)
		if (status.address!==account) setStatus({...status, address: account})
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
														<th className="text-323639 rt-strong f-size-18">Create Date</th>
														<th className="text-323639 rt-strong f-size-18" style={{minWidth: '7em'}}>Expire Date</th>
														{wallet.account===account && (<th className="text-323639 rt-strong f-size-18 text-right"></th>)}
													</tr>
												</thead>
												<tbody>
													{domains.map((i, k) => (
														<tr key={k} onClick={()=>navigate(`/domain/${i.name}`)}>
															<th className="f-size-18 f-size-md-18 rt-semiblod text-234">{i.name}</th>
															<td className="f-size-18 f-size-md-18 rt-semiblod text-605">{i.created ? new Date((i.created || 0) * 1000).toLocaleDateString() : '-'}</td>
															<td className="f-size-18 f-size-md-18 rt-semiblod text-338">{i.expires ? new Date((i.expires || 0) * 1000).toLocaleDateString() : '-'}</td>
															{wallet.account===account && (
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
