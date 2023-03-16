import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../menu/footer';
import moment from 'moment';
import M_itemdetailRedux from '../components/M_ItemdetailRedex';
import { useBlockchainContext } from '../../context';
import BuyModal from '../components/BuyModal';
import { styledAddress } from '../../utils';
import { useWallet } from 'use-wallet';
import Action from '../../service';
import Jazzicon from 'react-jazzicon';
import { toast } from 'react-toastify';

export default function Colection() {
    const wallet = useWallet();
    const { name } = useParams();
    const navigate = useNavigate();
    const [state, { buyNFT, cancelOrder, translateLang, bidApprove, getCurrency }] =
        useBlockchainContext() as any;
    const [correctCollection, setCorrectCollection] = useState<any>(null);
    const [pageFlag, setPageFlag] = useState(0); // 1 is mine, 2 is saled mine, 3 is others, 4 is saled others
    const [modalShow, setModalShow] = useState(false);
    const [expireTime, setExpireTime] = useState([]);
    const [timeFlag, setTimeFlag] = useState(true);
    const [loading, setLoading] = useState(false);

    // item data
    const [itemData, setItemData] = useState<NFTData>({
        collection:	'',
        tokenId:	'',
        creator: 	'',
        owner: 		'',
        name: 		'',
    });

    const readNfts = async () => {
        const formData = new FormData();
        formData.append('name', name || '');

        const response = await Action.name_nft(formData);
        if (response.success) {
            if (!!response.data) {
                setItemData(response.data)
            }
        } else {
            console.log("readNftsError")
        }
        return
    }

    useEffect(() => {
        readNfts()
    }, [])

    // useEffect(() => {
    //     if (itemData !== null)
    //         if (itemData.marketdata.endTime !== '')
    //             setInterval(() => {
    //                 let endTime = moment(Number(itemData.marketdata.endTime));
    //                 let nowTime = moment(new Date());
    //                 // test
    //                 if (endTime < nowTime) setTimeFlag(true);
    //                 else {
    //                     let ms = moment(endTime.diff(nowTime));
    //                     let bump = [] as any;
    //                     bump.push(Math.floor(moment.duration(ms as any).asHours() / 24));
    //                     bump.push(Math.floor(moment.duration(ms as any).asHours()) % 24);
    //                     bump.push(moment.utc(ms).format('mm'));
    //                     bump.push(moment.utc(ms).format('ss'));
    //                     setExpireTime(bump);
    //                     setTimeFlag(false);
    //                 }
    //             }, 1000);
    // }, [itemData]);

    // useEffect(() => {
    //     if (itemData !== null) {
    //         if (itemData.owner?.toLowerCase() === state.addresses.Marketplace?.toLowerCase()) {
    //             // on market
    //             if (!state.auth?.address?.toLowerCase()) {
    //                 setPageFlag(4);
    //                 return;
    //             }
    //             itemData.marketdata.owner?.toLowerCase() === state.auth?.address?.toLowerCase()
    //                 ? setPageFlag(2)
    //                 : setPageFlag(4);
    //         } else {
    //             itemData.owner?.toLowerCase() === state.auth?.address?.toLowerCase()
    //                 ? setPageFlag(1)
    //                 : setPageFlag(3);
    //         }
    //     }
    // }, [itemData, state.auth?.address]);

    // useEffect(() => {
    //     for (let i = 0; i < state.collectionNFT.length; i++) {
    //         if (state.collectionNFT[i].address === collection) {
    //             setCorrectCollection(state.collectionNFT[i]);
    //             var itemData = state.collectionNFT[i].items.find((item: any) => item.tokenID === id);

    //             let attributeRarityies = itemData?.metadata?.attributes.map((attribute: any, index: any) => {
    //                 let itemsWithSameAttributes = state.collectionNFT[i].items.filter((item: any) => {
    //                     let hasSameAttribute = item.metadata?.attributes.find((itemAttribute: any) => {
    //                         if (
    //                             (itemAttribute.key === attribute.key ||
    //                                 itemAttribute.trait_type === attribute.trait_type) &&
    //                             itemAttribute.value === attribute.value
    //                         ) {
    //                             return true;
    //                         }
    //                     });
    //                     if (!!hasSameAttribute) {
    //                         return true;
    //                     }
    //                     return false;
    //                 });

    //                 return (
    //                     (itemsWithSameAttributes.length * 100) / state.collectionNFT[i].items.length
    //                 );
    //             });

    //             if (!itemData) navigate('/explorer');
    //             else setItemData({ ...itemData, attributeRarityies });
    //             break;
    //         }
    //     }
    // }, [state.collectionNFT, id, collection]);

    // const handleBuy = async () => {
    //     if (!state.signer) {
    //         wallet.connect();
    //         // navigate('/signPage');
    //         return;
    //     }
    //     try {
    //         setLoading(true);
    //         await buyNFT({
    //             nftAddress: itemData?.collectionAddress,
    //             assetId: itemData?.tokenID,
    //             price: itemData?.marketdata.price,
    //             acceptedToken: itemData?.marketdata.acceptedToken
    //         });
    //         // NotificationManager.success(translateLang('buynft_success'));
    //         toast(translateLang('buynft_success'), {position: "top-right", autoClose: 2000})
    //         setLoading(false);
    //     } catch (err: any) {
    //         console.log(err.message);
    //         // NotificationManager.error(translateLang('buynft_error'));
    //         toast(translateLang('buynft_error'), {position: "top-right", autoClose: 2000})
    //         setLoading(false);
    //     }
    // };

    // const handleApproveBid = async () => {
    //     try {
    //         if (itemData !== null) {
    //             setLoading(true);

    //             await bidApprove({
    //                 address: collection,
    //                 id: id,
    //                 price: itemData.marketdata.bidPrice
    //             });
    //             // NotificationManager.success(translateLang('approve_succeess'));
    //             toast(translateLang('approve_succeess'), {position: "top-right", autoClose: 2000})
    //             setLoading(false);
    //         }
    //     } catch (err: any) {
    //         console.log(err.message);
    //         setLoading(false);
    //         // NotificationManager.error(translateLang('approve_error'));
    //         toast(translateLang('approve_error'), {position: "top-right", autoClose: 2000})
    //     }
    // };

    // const handleSell = () => {
    //     navigate(`/Auction/${collection}/${id}`);
    // };

    // const handleCancel = async () => {
    //     if (itemData !== null) {
    //         setLoading(true);
    //         try {
    //             await cancelOrder({
    //                 nftAddress: collection,
    //                 assetId: id
    //             });
    //             // NotificationManager.success(translateLang('cancelorder_success'));
    //             toast(translateLang('cancelorder_success'), {position: "top-right", autoClose: 2000})

    //             setLoading(false);
    //         } catch (err: any) {
    //             console.log(err.message);
    //             // NotificationManager.error(translateLang('cancelorder_error'));
    //             toast(translateLang('cancelorder_error'), {position: "top-right", autoClose: 2000})
    //             setLoading(false);
    //         }
    //     }
    // };

    // const HandleLike = async () => {
    //     if (!state.auth.isAuth) {
    //         navigate('/signPage');
    //         return;
    //     }
    //     Action.nft_like({
    //         collectAddress: collection,
    //         tokenId: id,
    //         currentAddress: state.auth.address
    //     })
    //         .then((res) => {
    //             if (res) {
    //                 console.log(res);
    //             }
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         });
    // };

    return (
        <div>
            <section className="container domain-detail">
                {itemData === null ? (
                    'Loading...'
                ) : (
                    <>
                        {/* <div className="row mt-md-5 pt-md-4">
                            <div className="col-md-5 text-center">
                                <div style={{ position: 'sticky', top: '120px' }}>
                                    <img
                                        src={
                                            itemData?.metadata?.image ||
                                            '../../img/collections/coll-item-3.jpg'
                                        }
                                        className="mb-sm-30 item_image"
                                        alt=""
                                    />
                                    {/* <div className="social-link">
                                        {itemData?.metadata?.external_url1 != '' && (
                                            <a href={itemData?.metadata?.external_url1}>
                                                <i className="fa fa-twitter-square"></i>
                                            </a>
                                        )}
                                        {itemData?.metadata?.external_url2 != '' && (
                                            <a href={itemData?.metadata?.external_url2}>
                                                <i className="fa fa-facebook-square"></i>
                                            </a>
                                        )}
                                        {itemData?.metadata?.external_url3 != '' && (
                                            <a href={itemData?.metadata?.external_url3}>
                                                <i className="fa fa-instagram"></i>
                                            </a>
                                        )}
                                        {itemData?.metadata?.external_url4 != '' && (
                                            <a href={itemData?.metadata?.external_url4}>
                                                <i className="fa fa-pinterest-square"></i>
                                            </a>
                                        )}
                                    </div>
                                    <div className="item_info_like">
                                        <div onClick={HandleLike} className="like">
                                            <i className="fa fa-heart"></i>
                                            {'  '}
                                            {itemData?.likes?.length}
                                        </div>
                                        <div className="item_author">
                                            <p>{'Owned by'}</p>
                                            <span onClick={() => navigate(`/${itemData?.owner}`)}>
                                                {state.usersInfo[itemData?.owner]?.image ? (
                                                    <img
                                                        className="lazy"
                                                        src={state.usersInfo[itemData?.owner].image}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <Jazzicon
                                                        diameter={100}
                                                        seed={Math.round(
                                                            (Number(itemData?.owner) /
                                                                Number(
                                                                    '0xffffffffffffffffffffffffffffffffffffffffff'
                                                                )) *
                                                                10000000
                                                        )}
                                                    />
                                                )}
                                                <div className="author_list_info">
                                                    <span>{styledAddress(itemData?.owner)}</span>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-7">
                                <div className="item_info">
                                    <Link to={`/collection/${correctCollection.address}`}>
                                        {state.collectionNFT.map((item: any) => {
                                            if (item.address === itemData.collectionAddress)
                                                return item.metadata.name;
                                        })}
                                    </Link>
                                    <h2>{itemData?.metadata?.name || `#${itemData.tokenID}`}</h2>
                                    <div className="spacer-10"></div>
                                    <h3>
                                        {itemData?.marketdata?.price === '' ? (
                                            <span style={{ color: 'grey' }}>
                                                Not listed for sale
                                            </span>
                                        ) : (
                                            <span style={{ color: 'grey' }}>
                                                Listed for{' '}
                                                <b style={{ color: 'black' }}>
                                                    {itemData?.marketdata?.price +
                                                        ' ' +
                                                        getCurrency(
                                                            itemData.marketdata?.acceptedToken
                                                        )?.label}
                                                </b>
                                            </span>
                                        )}
                                    </h3>
                                    <p>{itemData?.metadata?.description}</p>
                                    <div>
                                        {itemData === null ? (
                                            'Loading...'
                                        ) : (
                                            <div className="mainside">
                                                {pageFlag === 1 ? (
                                                    <div className="attribute">
                                                        <button
                                                            className="btn-main round-button"
                                                            onClick={handleSell}>
                                                            {translateLang('btn_sell')}
                                                        </button>
                                                    </div>
                                                ) : pageFlag === 2 ? (
                                                    <div>
                                                        {loading ? (
                                                            <button className="btn-main round-button">
                                                                <span
                                                                    className="spinner-border spinner-border-sm"
                                                                    aria-hidden="true"></span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-main round-button"
                                                                onClick={handleCancel}>
                                                                {translateLang('btn_cancel')}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : pageFlag === 3 ? null : (
                                                    <div>
                                                        {loading ? (
                                                            <button className="btn-main round-button">
                                                                <span
                                                                    className="spinner-border spinner-border-sm"
                                                                    aria-hidden="true"></span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-main round-button"
                                                                onClick={handleBuy}>
                                                                {translateLang('btn_buynow')}
                                                            </button>
                                                        )}
                                                        {loading ? (
                                                            <button className="btn-main round-button">
                                                                <span
                                                                    className="spinner-border spinner-border-sm"
                                                                    aria-hidden="true"></span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-main round-button"
                                                                onClick={() => setModalShow(true)}>
                                                                {translateLang('btn_makeoffer')}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="spacer-40"></div>
                                    <hr />
                                    <div className="spacer-20"></div>
                                    {itemData.marketdata.bidders.length > 0 && (
                                        <p>
                                            Current High Bid{' '}
                                            {itemData?.marketdata?.bidPrices[0] +
                                                ' ' +
                                                itemData?.marketdata?.bidTokens[0]}{' '}
                                            by{' '}
                                            {itemData?.marketdata?.bidders[0].slice(0, 4) +
                                                '...' +
                                                itemData?.marketdata?.bidders[0].slice(-4)}
                                        </p>
                                    )}
                                    {itemData?.marketdata?.endTime === '' ? null : (
                                        <>
                                            <div className="titme_track">
                                                <p>{translateLang('saletime')}</p>
                                                <div>
                                                    {timeFlag ? null : (
                                                        <>
                                                            <h3>{expireTime[0]}d : </h3>
                                                            <h3>{expireTime[1]}h : </h3>
                                                            <h3>{expireTime[2]}m : </h3>
                                                            <h3>{expireTime[3]}s</h3>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="spacer-10"></div>
                                        </>
                                    )}
                                    {itemData?.metadata?.attributes.length > 0 && (
                                        <>
                                            <div className="spacer-10"></div>
                                            <p style={{ fontSize: '20px' }}>Attributes</p>
                                        </>
                                    )}
                                    <div className="de_tab">
                                        <div className="row">
                                            {itemData?.metadata?.attributes.map((item: any, index: any) => (
                                                <M_itemdetailRedux
                                                    key={index}
                                                    type={item.key || item.trait_type}
                                                    per={item.value}
                                                    percent={
                                                        Number(
                                                            itemData.attributeRarityies[index]
                                                        ).toFixed(3) + '%'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <div className="spacer-10"></div>
                                        {pageFlag === 2 || pageFlag === 4 ? (
                                            <>
                                                <div className="spacer-10"></div>
                                                <p style={{ fontSize: '20px' }}>Bid History</p>
                                                <hr />
                                                <div className="spacer-20"></div>
                                                {itemData.marketdata.bidders.length > 0 ? (
                                                    <div className="de_tab_content">
                                                        <div className="tab-1 onStep fadeIn">
                                                            {itemData?.marketdata?.bidders.map(
                                                                (bidder: any, index: any) => (
                                                                    <>
                                                                        <div className="p_list">
                                                                            <div className="p_list_pp">
                                                                                <span>
                                                                                    {state
                                                                                        .usersInfo[
                                                                                        bidder
                                                                                    ]?.image ? (
                                                                                        <img
                                                                                            className="lazy"
                                                                                            src={
                                                                                                state
                                                                                                    .usersInfo[
                                                                                                    bidder
                                                                                                ]
                                                                                                    ?.image
                                                                                            }
                                                                                            alt=""
                                                                                        />
                                                                                    ) : (
                                                                                        <Jazzicon
                                                                                            diameter={
                                                                                                100
                                                                                            }
                                                                                            seed={Math.round(
                                                                                                (Number(
                                                                                                    bidder
                                                                                                ) /
                                                                                                    Number(
                                                                                                        '0xffffffffffffffffffffffffffffffffffffffffff'
                                                                                                    )) *
                                                                                                    10000000
                                                                                            )}
                                                                                        />
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <div className="p_list_info">
                                                                                <b>
                                                                                    {
                                                                                        itemData
                                                                                            ?.marketdata
                                                                                            ?.bidPrices[
                                                                                            index
                                                                                        ]
                                                                                    }{' '}
                                                                                    {
                                                                                        itemData
                                                                                            ?.marketdata
                                                                                            ?.bidTokens[
                                                                                            index
                                                                                        ]
                                                                                    }
                                                                                </b>{' '}
                                                                                {translateLang(
                                                                                    'bid'
                                                                                )}
                                                                                {translateLang(
                                                                                    'by'
                                                                                )}{' '}
                                                                                <b>
                                                                                    {styledAddress(
                                                                                        bidder
                                                                                    )}
                                                                                </b>{' '}
                                                                                {translateLang(
                                                                                    'at'
                                                                                )}{' '}
                                                                                <b>
                                                                                    {itemData
                                                                                        ?.marketdata
                                                                                        ?.bidTime
                                                                                        ? moment(
                                                                                              Number(
                                                                                                  itemData
                                                                                                      ?.marketdata
                                                                                                      ?.bidTime[
                                                                                                      index
                                                                                                  ]
                                                                                              )
                                                                                          ).format(
                                                                                              'lll'
                                                                                          )
                                                                                        : ''}
                                                                                </b>
                                                                            </div>
                                                                            {index === 0 &&
                                                                            itemData?.marketdata
                                                                                .owner ===
                                                                                state.auth
                                                                                    .address ? (
                                                                                loading ? (
                                                                                    <button className="btn-main round-button">
                                                                                        <span
                                                                                            className="spinner-border spinner-border-sm"
                                                                                            aria-hidden="true"></span>
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        className="btn-main round-button"
                                                                                        onClick={
                                                                                            handleApproveBid
                                                                                        }>
                                                                                        {translateLang(
                                                                                            'btn_approvebid'
                                                                                        )}
                                                                                    </button>
                                                                                )
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="spacer-10"></div>
                                                                    </>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    'No bid history'
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                    <div className="spacer-40"></div>
                                </div>
                            </div>
                        </div>
                        <BuyModal show={modalShow} setShow={setModalShow} correctItem={itemData} /> */}
                        <section className="page-content-area">
                            <div className="container">
                            <div className="row">
                                <div className="col-lg-7">
                                        <div className="imil-box rt-mb-30">
                                            <div className="rt-box-style-2">
                                                <h4 className="f-size-36 f-size-xs-30 rt-semiblod text-422">{itemData.name}</h4>   
                                                <h5 className="f-size-18 rt-light3">is for sale</h5>
                                            
                                            Network: Ethereum
                                                <div className="row rt-mt-50">
                                                    <div className="domain-border col-lg-4">
                                                        <span className="d-block f-size-24 rt-semiblod"></span>
                                                        <span className="d-block f-size-16 rt-light3">Age</span>
                                                    </div>
                                                    <div className="domain-border col-lg-4">
                                                        <span className="d-block f-size-24 rt-semiblod">ENS Service</span>
                                                        <span className="d-block f-size-16 rt-light3">Provider</span>
                                                    </div>
                                                    <div className="col-lg-4">
                                                        <span className="d-block f-size-24 rt-semiblod">{new Date((itemData.attributes?.expiryDate || 0) * 1000).toLocaleDateString()}</span>
                                                        <span className="d-block f-size-16 rt-light3">Expires</span>
                                                    </div>
                                                </div>
                                            </div>
                                    
                                        </div>
                                        <div className="rt-box-style-2 rt-mb-30 rt-dorder-off">
                                            <span className="f-size-18"><span className="rt-strong">Ads: </span>Do you want to post your advertisement here? Contact us!</span>
                                        </div>
                                        <div className="rt-box-style-2 rt-mb-30">
                                            <div className="f-size-18 rt-light3 line-height-34" style={{display: 'flex', gap: '1em'}}>
                                                <div>Seller:</div>
                                                <div style={{display: 'flex', gap: '0.5em', cursor: 'pointer'}} onClick={() => navigate(`/${itemData.owner}`)}>
                                                    {state.usersInfo[itemData.owner]?.image ? (
                                                        <img
                                                            className="lazy"
                                                            src={state.usersInfo[itemData.owner].image}
                                                            alt=""
                                                            style={{width: 32, height: 32, borderRadius: '50%'}}
                                                        />
                                                    ) : (
                                                        <Jazzicon
                                                            diameter={100}
                                                            seed={Math.round(
                                                                (Number(itemData.owner) /
                                                                    Number(
                                                                        '0xffffffffffffffffffffffffffffffffffffffffff'
                                                                    )) *
                                                                    10000000
                                                            )}
                                                        />
                                                    )}
                                                    <div className="author_list_info">
                                                        <span>{styledAddress(itemData.owner)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    
                                </div>
                                <div className="col-lg-5">
                                        <div className="rt-box-style-3">
                                            <div className="rt-gradient-2 text-center text-white rt-light3 f-size-28 f-size-xs-24 rt-pt-25 rt-pb-25">
                                                This domain is in auction (or Fixed Price)
                                            </div>
                                            <div className="rt-p-30">
                                                <div className="d-flex justify-content-between rt-mb-20">
                                                
                                                    <span className="f-size-20 rt-light3">Current price:</span>
                                                    <span className="rt-light3 amount"><span className="f-size-40 text-422"><span className="rt-semiblod">1.5</span></span><span
                                                            className="f-size-24"> ETH</span></span>
                                                
                                                </div>
                                                <div className="d-flex justify-content-between rt-mb-20">
                                                
                                                <span className="f-size-20 rt-light3">CNS fee:(in fixed) </span>
                                                    <span className="f-size-20 rt-light3 ">0.075 ETH (5%)</span>
                                                
                                                </div>
                                                <div className="d-flex justify-content-between rt-mb-20">
                                                
                                                <span className="f-size-20 rt-light3">Total payment:(in fixed) </span>
                                                    <span className="f-size-20 rt-light3 ">1.575 ETH</span>
                                                
                                                </div>
                                                <div className="d-flex justify-content-between rt-mb-20">
                                                
                                                    <span className="f-size-20 rt-light3 text-338">Remaining time:</span>
                                                    <span className="f-size-20 rt-light3 text-eb7">1 day,10 hours</span>
                                                
                                                </div>
                                                <form action="#" className="rt-form ">
                                                    <input type="text" className="form-control pill rt-mb-15" placeholder="$ Enter bid amount (or Send Offer in fixed mode)" />
                                                    <button className="rt-btn rt-gradient pill d-block rt-mb-15">Connect Wallet</button>
                                                    <button className="rt-btn rt-gradient pill d-block rt-mb-15">Edit/Cancel Your Listing</button>

                                                    <button className="rt-btn rt-gradient pill d-block rt-mb-15">Place Bid (in auction mode)</button>
                                                    <button className="rt-btn rt-gradient pill d-block rt-mb-15">Buy it now for 1.575 ETH (in fixed mode)</button>
                                                    
                                                    <button className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Send offer (in fixed mode)</button>

                                            
                                                </form>
                                            </div>
                                        </div>
                                    
                                    
                                    
                            
                                    
                                </div>
                            </div>
                            </div>
                        </section>
                    </>
                )}
            </section>
        </div>
    );
}
