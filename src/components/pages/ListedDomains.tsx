import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { storefront, tokens } from '../../contracts';
import Pager from '../components/Pager';
import Loading from '../components/Loading';

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
            const result = await storefront().getOrders(status.page, status.limit);
            let _domains = Object.fromEntries(orders.map(i=>[i.assetId, i]))
            let _count = 0
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
                        assetId: 		i.assetId.toString(),
                        price: 			Number(ethers.utils.formatEther(i.price)),
                        token: 	        tokens[i.acceptedToken],
                        seller: 	    i.seller,
                        expires:        Number(i.expires),
                        timestamp:      0,
                        bidder:         '',
                        bidPrice:       0,
                        dealPrice:      0
                    }
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
                        <div className="row">
                            <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                                <h2 className="rt-section-title">
                                    Listed Crypto Domains
                                </h2>
                                <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                                </p>
                            </div>
                        </div>
                        <div className="rt-spacer-60"></div>
                        <div className="row">
                            <div className="col-12 mx-auto rt-mb-30 wow fade-in-bottom">
                                <div className="rt-price-1">
                                    <div className="price-body rt-pt-10">
                                        <ul className="rt-list">
                                            {orders.map((i: OrderData, k: number) => (
                                                <li className="clearfix" key={k} onClick={()=>navigate(`/domain/${i.label}.eth`)}>
                                                    <Link to={`/domain/${i.label}.eth`} style={{cursor: 'pointer'}}>
                                                        {i.label.length > 25 ? i.label.slice(0,22) + '...' : i.label}.eth
                                                        <span className="float-right">{i.price} {tokens[i.assetId]}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
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
