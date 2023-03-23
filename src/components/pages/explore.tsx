/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';

import { useBlockchainContext } from '../../context';
import Pager from '../components/Pager';
import { useNavigate } from 'react-router-dom';
import { getEnsDomains } from '../../thegraph';
import Loading from '../components/Loading';
import { toUSDate } from '../../utils';

export default function Explore() {
    const [state, {  }] = useBlockchainContext() as any;
    const [loading, setLoading] = useState(false);
    const [nfts, setNfts] = useState<Array<NFTData>>([])
    const [status, setStatus] = useState({
        limit: 10,
		page: 0,
        total: 500,
        initialize: false,
        loadMore: true
    })
    const navigate = useNavigate();

    const onPage = (page: number) => {
		setStatus({...status, page})
	}

    const readNfts = async () => {
        setLoading(true)
        try {
            const [rows, loadMore] = await getEnsDomains(status.page * status.limit, status.limit)
            setStatus({...state, loadMore})
            let _domains = Object.fromEntries(nfts.map(i=>[i.tokenId, i]))
            for (let i of rows) {
                if (_domains[i.tokenId]===undefined) {
                    _domains[i.tokenId] = {
                        collection: i.collection || '',
                        tokenId: i.tokenId,
                        owner: i.owner,
                        creator: i.creator,
                        name: 	i.name,
                        expires: i.expires,
                        created: i.created,
                        cost: i.cost
                    }
                }
            }
            setStatus({...status, loadMore})
            setNfts(Object.values(_domains))
        } catch (error) {
            console.log("readNfts", error)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        readNfts()
    }, [status.page])

    return (
        <div>
            <section className="page-content-area" style={{ paddingTop: '2px' }}>
                    {nfts.length > 0 ? (
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                                <h2 className="rt-section-title">
                                    All Domains
                                </h2>
                                <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                                </p>
                            </div>
                        </div>
                        <div className="rt-spacer-60"></div>
                        {
                            state.search && (
                                <div className="row align-items-center justify-content-center">
                                    <div className="col-10">
                                        <div className="tab-nav d-flex justify-content-between flex-lg-row flex-column top-ss">
                                            <span className="f-size-18">
                                                <img src="assets/images/all-img/check-icon2.png" alt="check icon"draggable="false" className="rt-mr-5" />
                                                Your Search for <span className="text-338 rt-strong">"{state.search}"</span> 2 Results </span>
                                            <div className="tab-navsitem">
                                                <div className="dropdown">
                                                    <a className="dropdown-toggle nav-1" href="#" role="button" id="dropdownMenuLink"
                                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        Most Recent
                                                    </a>
                                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuLink" x-placement="bottom-start" style={{position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px, 35px, 0px)'}}>
                                                        <ul className="nav " id="myTab" role="tablist">
                                                            <li className="nav-item">
                                                                <a className="nav-link active" id="rt-tab-1-tab" data-toggle="tab" href="#rt-tab-1"
                                                                    role="tab" aria-controls="rt-tab-1" aria-selected="true"> Lowest Price</a>
                                                            </li>
                                                            <li className="nav-item">
                                                                <a className="nav-link" id="rt-tab-2-tab" data-toggle="tab" href="#rt-tab-2"
                                                                    role="tab" aria-controls="rt-tab-2" aria-selected="false"> Highest Price</a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <div className="rt-spacer-40"></div>
                        <div className="row align-items-center justify-content-center">
                            <div className="col-10">
                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade-in-bottom show active" id="rt-tab-1" role="tabpanel" aria-labelledby="rt-tab-1-tab">
                                        <div className="table-responsive">
                                            <table className="table domain-table">
                                                <thead>
                                                    <tr className="rt-light-gray">
                                                        <th className="text-323639 rt-strong f-size-18">Domain</th>
                                                        <th className="text-323639 rt-strong f-size-18">Owner Address</th>
                                                        <th className="text-323639 rt-strong f-size-18 text-right" style={{minWidth: '7em'}}>Domain Expire</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        nfts.map((i: NFTData, index: number) => (
                                                            <tr key={index} onClick={()=>navigate(`/domain/${i.name}`)} style={{cursor: 'pointer'}}>
                                                                <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{i.name.length > 18 ? i.name.slice(0, 12) + '...eth' : i.name}</th>
                                                                <td className="f-size-24 f-size-md-18 rt-semiblod text-338"><code>{i.owner.slice(0, 8) + '...' + i.owner.slice(-5)}</code></td>
                                                                <th className="f-size-24 f-size-md-18 rt-semiblod text-338 text-right">{i.expires ? toUSDate(i.expires) : '-'}</th>
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
                        <div className="rt-spacer-60 rt-spacer-xs-40"></div>
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
                    </div>
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
                    {loading && (
                        <div className='layout'>
                            <Loading />
                        </div>
                    )}
            </section>
        </div>
    );
}
