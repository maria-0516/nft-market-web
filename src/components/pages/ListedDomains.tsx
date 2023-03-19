import React, { useState, useEffect } from 'react';
import Footer from '../menu/footer';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchainContext } from '../../context';
import Action from '../../service';

export default function ListedDomains() {
    const [state, { translateLang }] = useBlockchainContext() as any;
    const navigate = useNavigate();
    const [floorPrice, setFloorPrice] = useState(0);
    const [volumns, setVolumns] = useState([]);
    const [orders, setOrders] = useState<NFTData[]>([])

    useEffect(() => {
        if (state.orderList?.length !== 0) {
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

    const readOrders = async () => {
        const response = await Action.all_orders({});
        if (response.success) {
            if (!!response.data) {
                setOrders(response.data)
            }
        } else {
            console.log("readOrders")
        }
    }

    useEffect(() => {
        readOrders()
    }, [])

    // useEffect(() => {
    //     let bump = [] as any;
    //     state.collectionNFT.map((collectionItem: any) => {
    //         let floorBump = [] as any;
    //         for (let i = 0; i < collectionItem.items.length; i++) {
    //             if (collectionItem.items[i].marketdata.price !== '') {
    //                 floorBump.push(Number(collectionItem.items[i].marketdata.price));
    //             }
    //         }
    //         floorBump.sort();
    //         if (floorBump.length === 0) bump.push(0);
    //         else bump.push(parseFloat(floorBump[0].toFixed(3)));
    //     });
    //     setFloorPrice(bump as any);
    // }, [state.collectionNFT]);

    const handle = (name: string) => {
        navigate(`/domain/${name}`);
    };

    return (
        // <div>
        //     <section className="jumbotron no-bg" style={{ paddingBottom: '30px' }}>
        //         <div className="container">
        //             <h1>{translateLang('allcollection_title')}</h1>
        //         </div>
        //     </section>

        //     <div className="container">
        //         <div className="row">
        //             <table className="collections_table">
        //                 <thead>
        //                     <tr>
        //                         <th style={{ padding: '0 30px' }}>#</th>
        //                         <th>Collection</th>
        //                         <th>Sales Volume</th>
        //                         <th>Floor price</th>
        //                         <th>Items</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {state.collectionNFT.map((item: any, index: any) => (
        //                         <tr key={index} onClick={() => handle(item.address)}>
        //                             <td style={{ padding: '5px 30px' }}>{index + 1}</td>
        //                             <td>
        //                                 <div className="collection_name">
        //                                     <img
        //                                         className="lazy"
        //                                         src={item.metadata.image}
        //                                         alt=""
        //                                     />
        //                                     <h4 className="card-title text-center">
        //                                         {item.metadata.name}
        //                                     </h4>
        //                                 </div>
        //                             </td>
        //                             <td>{volumns[index]} FTM</td>
        //                             <td>{(floorPrice as any)[index]} FTM</td>
        //                             <td>{item.items.length}</td>
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>

        //         <div className="spacer-single"></div>
        //     </div>

        //     <Footer />
        // </div>
        <div>
            <section className="price-area rtbgprefix-cover bg-elements-parent" style={{backgroundImage: 'url(assets/images/all-img/section-bg-1.png)'}}>
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
                                {/* <div className="price-hrader text-center rt-mb-30">
                                    <img src="assets/images/all-img/price-1.png" alt="price image" draggable="false" />
                                    <h3 className="f-size-36 f-size-xs-32 rt-normal">
                                        Auctions
                                    </h3>
                                    <p className="rt-light3 f-size-xs-22 section-p-content">
                                    </p>
                                </div> */}
                                <div className="price-body rt-pt-10">
                                    <ul className="rt-list">
                                        {
                                            orders.map((i: NFTData, k: number) => (
                                                <li className="clearfix" key={k} onClick={() => handle(i.name)}>
                                                    <a style={{cursor: 'pointer'}}>
                                                        {i.name.length > 25 ? i.name.slice(0,22) + '...eth' : i.name}
                                                        <span className="float-right">{`${i.marketData?.price} ${i.marketData?.token}`}</span>
                                                    </a>
                                                </li>
                                            ))
                                        }
                                        {/* <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                {"ddddddddddddddddddddddddddddddd.eth".length > 25 ? "ddddddddddddddddddddddddddddddd.eth".slice(0,23) + '...eth' : "ddddddddddddddddddddddddddddddd.eth"}
                                                <span className="float-right">5 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                broadcom.eth
                                                <span className="float-right">0.3 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                etherscanio.eth
                                                <span className="float-right">0.4 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                irina.eth
                                                <span className="float-right">0.8 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                gregmaxwell.eth
                                                <span className="float-right">1 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                generalatomics.eth
                                                <span className="float-right">4 ETH</span>
                                            </a>
                                        </li>
                                        <li className="clearfix">
                                            <a style={{cursor: 'pointer'}}>
                                                maria.eth
                                                <span className="float-right">2 ETH</span>
                                            </a>
                                        </li> */}
                                    </ul>
                                </div>
                                <div className="price-footer rt-mt-30 text-center">
                                    <a href="">View More </a>
                                </div>
                            </div>
                        </div>
                        {/* <div className="col-lg-6 col-md-6 mx-auto rt-mb-30 wow fade-in-bottom">
                            <div className="rt-price-1">
                                <div className="price-hrader text-center rt-mb-30">
                                    <img src="assets/images/all-img/price-2.png" alt="price image" draggable="false" />
                                    <h3 className="f-size-36  f-size-xs-32 rt-normal">
                                        Fixed Price
                                    </h3>
                                    <p className="rt-light3 f-size-xs-22 section-p-content">
                                    </p>
                                </div>
                                <div className="price-body rt-pt-10">
                                    <ul className="rt-list">
                                        {
                                            state.collectionNFT.map((item: any, index: number) => (
                                                <li className="clearfix" key={index} onClick={() => handle(item.address)}>
                                                    <a style={{cursor: 'pointer'}}>
                                                        {item.metadata.name}
                                                        <span className="float-right">{(floorPrice as any)[index]} FTM</span>
                                                    </a>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <div className="price-footer rt-mt-30 text-center">
                                    <a href="#">View More </a>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>
        </div>
    );
}
