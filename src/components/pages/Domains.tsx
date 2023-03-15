import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBlockchainContext } from "../../context";

interface Props {
    isAuction?: boolean
}

const Domains = ({isAuction}: Props) => {
    const [state, { translateLang }] = useBlockchainContext() as any;
    const navigate = useNavigate();
    const [floorPrice, setFloorPrice] = useState(0);
    const [volumns, setVolumns] = useState([]);

    useEffect(() => {
        if (state.orderList.length !== 0) {
            let bump = 0;
            let bumpArr = [] as any;
            state.collectionNFT.map((collectionItem: any) => {
                const currentVolumn = state.orderList.filter((item: any) => {
                    return item.contractAddress === collectionItem && item.status === 'success';
                });

                currentVolumn.map((item: any) => {
                    bump += Number(item.price);
                });
                bumpArr.push(parseFloat(bump.toFixed(3)));
            });

            setVolumns(bumpArr);
        }
    }, [state.orderList]);

    useEffect(() => {
        let bump = [] as any;
        state.collectionNFT.map((collectionItem: any) => {
            let floorBump = [] as any;
            for (let i = 0; i < collectionItem.items.length; i++) {
                if (collectionItem.items[i].marketdata.price !== '') {
                    floorBump.push(Number(collectionItem.items[i].marketdata.price));
                }
            }
            floorBump.sort();
            if (floorBump.length === 0) bump.push(0);
            else bump.push(parseFloat(floorBump[0].toFixed(3)));
        });
        setFloorPrice(bump as any);
    }, [state.collectionNFT]);

    const handle = (address: any) => {
        navigate(`/collection/${address}`);
    };
    
    return (
        <section className="page-content-area">
            <div className="container">
                <div className="row">
                    <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                        <h2 className="rt-section-title">
                            Fixed Price or Auction List Crypto Domains
                        </h2>
                        <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                        </p>
                    </div>
                </div>
                <div className="rt-spacer-60"></div>
                <div className="row align-items-center justify-content-center">
                    <div className="col-10">
                        <div className="tab-nav d-flex justify-content-between flex-lg-row flex-column top-ss">
                            <span className="f-size-18">
                                <img src="assets/images/all-img/check-icon2.png" alt="check icon"draggable="false" className="rt-mr-5" />
                                Your Search for <span className="text-338 rt-strong">"bkinds.com"</span> 2 Results </span>
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
                                                <th className="text-323639 rt-strong f-size-18">Network</th>
                                                <th className="text-323639 rt-strong f-size-18">Fixed Price (Last Bid)</th>
                                                <th className="text-323639 rt-strong f-size-18 text-right"></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                state.collectionNFT.map((item: any, index: number) => (
                                                    <tr key={index} onClick={() => handle(item.address)}>
                                                        <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{item.metadata.name}</th>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-605">10</td>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-338">{(floorPrice as any)[index]} FTM</td>
                                                        <td className="text-right"><a href="#" className="rt-btn rt-gradient2 rt-sm3 pill">Place Bid</a></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="tab-pane fade-in-bottom" id="rt-tab-2" role="tabpanel" aria-labelledby="rt-tab-2-tab">
                                <div className="table-responsive">
                                    <table className="table domain-table">
                                        <thead>
                                            <tr className="rt-light-gray">
                                                <th className="text-323639 rt-strong f-size-18">DOMAIN</th>
                                                <th className="text-323639 rt-strong f-size-18">Views</th>
                                                <th className="text-323639 rt-strong f-size-18">Price</th>
                                                <th className="text-323639 rt-strong f-size-18">PLACE BID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                state.collectionNFT.map((item: any, index: number) => (
                                                    <tr key={index} onClick={() => handle(item.address)}>
                                                        <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{item.metadata.name}</th>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-605">10</td>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-338">{(floorPrice as any)[index]} FTM</td>
                                                        <td className="text-right"><a href="#" className="rt-btn rt-gradient2 rt-sm3 pill">Place Bid</a></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="tab-pane fade-in-bottom" id="rt-tab-3" role="tabpanel" aria-labelledby="rt-tab-3-tab">
                                <div className="table-responsive">
                                    <table className="table domain-table">
                                        <thead>
                                            <tr className="rt-light-gray">
                                                <th className="text-323639 rt-strong f-size-18">DOMAIN</th>
                                                <th className="text-323639 rt-strong f-size-18">Views</th>
                                                <th className="text-323639 rt-strong f-size-18">Price</th>
                                                <th className="text-323639 rt-strong f-size-18">PLACE BID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                state.collectionNFT.map((item: any, index: number) => (
                                                    <tr key={index} onClick={() => handle(item.address)}>
                                                        <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{item.metadata.name}</th>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-605">10</td>
                                                        <td className="f-size-24 f-size-md-18 rt-semiblod text-338">{(floorPrice as any)[index]} FTM</td>
                                                        <td className="text-right"><a href="#" className="rt-btn rt-gradient2 rt-sm3 pill">Place Bid</a></td>
                                                    </tr>
                                                ))
                                            }
                                            <tr className="rt-light-gray">
                                                
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rt-spacer-60 rt-spacer-xs-40"></div>
                <div className="row">
                    <div className="col-12">
                        <div className="text-center">
                            <a href="#" className="rt-btn rt-outline-gray text-uppercase pill">
                                <i className="icofont-refresh rt-mr-5"></i> Load More
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Domains;
