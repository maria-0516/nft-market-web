import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { storefront, tokens } from '../../contracts';
import Pager from '../components/Pager';
import Loading from '../components/Loading';
import { toUSDate } from '../../utils';
import { Helmet } from 'react-helmet';
import { getEnsDomainExpireByName } from '../../thegraph';

export default function ListedDomains() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderData[]>([])
    const [status, setStatus] = useState({
        page:   0,
        limit:  10,
        loadMore: true
    })
    const [loading, setLoading] = useState(false)

    const readOrders = async () => {
        setLoading(true)
        try {
            const result = await storefront.getOrders(status.page, status.limit);
            let _domains = Object.fromEntries(orders.map(i=>[i.assetId, i]))
            let _count = 0
            const _names = {} as {[name: string]: string}
            for (let i of result) {
                const assetId = i.assetId.toString()
                const id = Number(i.id)
                if (id===0) continue
                _count++
                if (_domains[assetId]===undefined) {
                    _domains[assetId] = {
                        id:             id,
                        collection:     '',
                        label:          i.label,
                        assetId: 		assetId,
                        price: 			Number(ethers.utils.formatEther(i.price)),
                        token: 	        tokens[i.acceptedToken],
                        seller: 	    i.seller,
                        expires:        Number(i.expires),
                        timestamp:      0,
                        bidder:         '',
                        bidPrice:       0,
                        dealPrice:      0
                    }
                    _names[`${i.label}.eth`] = assetId
                }
            }
            const __names = Object.keys(_names);
            if (__names.length!==0) {
                const _expires = await getEnsDomainExpireByName(__names)
                for (let k in _expires) {
                    _domains[_names[k]].expires = _expires[k]
                }
            }
            if (_count!==status.limit) setStatus({...status, loadMore: false})
            setOrders(Object.values(_domains))
        } catch (error) {
            console.log("readOrders", error)
        }
        setLoading(false)
    }

    const onPage = (page: number) => {
		setStatus({...status, page})
	}

    useEffect(() => {
        readOrders()
    }, [status.page])

    return (
        <div>
            <section className="price-area rtbgprefix-cover bg-elements-parent" style={{backgroundImage: 'url(assets/images/all-img/section-bg-1.png)', paddingTop: '2px'}}>
                
            {orders.length > 0 ? (
                <>
                    <div className=" rt-spacer-xs-50"></div>
                    <div className="rt-bg-elemtnts rt-shape-ani-1">
                        <div className="spin-container">
                            <div className="shape">
                                <div className="bd border_bg-1"></div>
                            </div>
                        </div>
                    </div>
                    <div className="rt-bg-elemtnts rt-shape-ani-2">
                        <div className="spin-container">
                            <div className="shape">
                                <div className="bd border_bg-2"></div>
                            </div>
                        </div>
                    </div>
                    <div className="rt-bg-elemtnts rt-shape-ani-3">
                        <div className="spin-container">
                            <div className="shape">
                                <div className="bd border_bg-3"></div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        {/* <div className="row">
                            <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                                <h2 className="rt-section-title">
                                    Listed Crypto Domains
                                </h2>
                                <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                                </p>
                            </div>
                        </div> */}
                        <div className="rt-spacer-60"></div>
                        {/* <div className="row">
                            <div className="col-12 mx-auto rt-mb-30 wow fade-in-bottom">
                                <div className="rt-price-1">
                                    <div className="price-body rt-pt-10">
                                        <ul className="rt-list">
                                            {orders.map((i: OrderData, k: number) => (
                                                <li className="clearfix" key={k} onClick={()=>navigate(`/domain/${i.label}.eth`)}>
                                                    <Link to={`/domain/${i.label}.eth`} style={{cursor: 'pointer'}}>
                                                        <span className="f-size-24 f-size-md-18 rt-semiblod text-234">{i.label.length > 25 ? i.label.slice(0,22) + '...' : i.label}.eth</span>
                                                        <span className="f-size-24 f-size-md-18 rt-semiblod text-338 text-right">{new Date((i.expires || 0) * 1000).toDateString()}</span>
                                                        <span className="f-size-24 f-size-md-18 rt-semiblod text-338"><code>{i.seller.slice(0, 8) + '...' + i.seller.slice(-5)}</code></span>
                                                        <span className="float-right">{i.price} ETH</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                        <div className="row align-items-center justify-content-center">
                            <div className="col-10">
                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade-in-bottom show active" id="rt-tab-1" role="tabpanel" aria-labelledby="rt-tab-1-tab">
                                        <div className="table-responsive">
                                            <table className="table domain-table">
                                                <thead>
                                                    <tr className="rt-light-gray">
                                                        <th className="text-323639 rt-strong f-size-18">Domain</th>
                                                        <th className="text-323639 rt-strong f-size-18">Network</th>
                                                        <th className="text-323639 rt-strong f-size-18">Price</th>
                                                        <th className="text-323639 rt-strong f-size-18 text-right" style={{minWidth: '7em'}}>Domain Expire</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        orders.map((i: OrderData, index: number) => (
                                                            <tr key={index} onClick={()=>navigate(`/domain/${i.label}.eth`)} style={{cursor: 'pointer'}}>
                                                                <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{i.label.length > 18 ? i.label.slice(0, 12) + '...' : i.label}.eth</th>
                                                                <td className="f-size-24 f-size-md-18 rt-semiblod text-338"><code>Ethereum (ENS Service)</code></td>
                                                                <th className="f-size-24 f-size-md-18 rt-semiblod text-338">{Number(i.price.toFixed(6))} ETH</th>
                                                                <th className="f-size-24 f-size-md-18 rt-semiblod text-338 text-right">{toUSDate(i.expires)}</th>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
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
                                        No listed domains
                                    </h2>
                                    <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {loading && (
                    <div className='layout'>
                        <Loading />
                    </div>
                )}
            </section>
        </div>
    );
}
