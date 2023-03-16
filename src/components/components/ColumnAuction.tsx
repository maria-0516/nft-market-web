import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useBlockchainContext } from '../../context';
import { useNavigate } from 'react-router-dom';
import Action from '../../service';
import { toBigNum } from '../../utils';
import { toast } from 'react-toastify';
import Jazzicon from 'react-jazzicon';
import { styledAddress } from '../../utils';

const DateTimeField = require('@1stquad/react-bootstrap-datetimepicker')

interface Props {
    name: string
}

export default function Responsive({name}: Props) {
    const navigate = useNavigate();
    const [state, { onsaleNFT, onsaleLazyNFT, translateLang, approveNFT, checkNFTApprove }] =
        useBlockchainContext() as any;
    const [nft, setNft] = useState<NFTData>({
        collection:	'',
        tokenId:	'',
        creator: 	'',
        owner: 		'',
        name: 		'',
        listed:     false
    });
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [approveFlag, setApproveFlag] = useState(false);
    const [currency, setCurrency] = useState(state.currencies[0].value);

    // useEffect(() => {
    //     const initialDate = new Date();
    //     initialDate.setDate(initialDate.getDate() + 10);
    //     setDate(initialDate);
    // }, []);

    const readNfts = async () => {
        const formData = new FormData();
        formData.append('name', name || '');

        const response = await Action.name_nft(formData);
        if (response.success) {
            if (!!response.data) {
                setNft(response.data)
            }
        } else {
            console.log("readNftsError")
        }
        return
    }

    useEffect(() => {
        readNfts()
    }, [])

    useEffect(() => {
        (async () => {
            setApproveFlag(nft.isOffchain || true);
            if (nft !== null && !nft.isOffchain) {
                const validation = await checkNFTApprove({
                    assetId: nft.tokenId,
                    nftAddress: nft.collection
                });
                setApproveFlag(validation);
            }
        })();
    }, [nft]);

    // useEffect(() => {
    //     for (let i = 0; i < state.collectionNFT.length; i++) {
    //         if (state.collectionNFT[i].address === nft.collection) {
    //             var itemData = state.collectionNFT[i].items.find((item: NFTData) => item.tokenId === id);
    //             if (!itemData) navigate('/auction');
    //             else setNft(itemData);
    //             break;
    //         }
    //     }
    // }, [state.collectionNFT]);

    const handle = (newDate: any) => {
        setDate(newDate);
    };

    const handlelist = async () => {
        if (price === '') return;
        if (!moment(date).isValid()) return;

        try {
            setLoading(true);
            if (!nft.isOffchain) {
                let txOnSale = await onsaleNFT({
                    nftAddress: nft.collection,
                    assetId: nft.tokenId,
                    name: nft.name,
                    currency: currency,
                    price: price,
                    expiresAt: moment(date).valueOf()
                });

                if (txOnSale) {
                    // NotificationManager.success(translateLang('listing_success'));
                    toast(translateLang('listing_success'), {position: "top-right", autoClose: 2000})
                    navigate('/explore');
                } else {
                    // NotificationManager.error(translateLang('listingerror'));
                    toast(translateLang('listingerror'), {position: "top-right", autoClose: 2000})
                }
                setLoading(false);
            } else {
                const lazyAction = await Action.lazy_onsale({
                    nftAddress: nft.collection,
                    assetId: nft.tokenId,
                    currency: currency,
                    priceGwei: toBigNum(price, 18),
                    expiresAt: moment(date).valueOf()
                });

                if (!lazyAction.success) {
                    setLoading(false);
                    // NotificationManager.error(translateLang('listingerror'));
                    toast(translateLang('listingerror'), {position: "top-right", autoClose: 2000})
                    return;
                }

                let txOnSale = await onsaleLazyNFT({
                    tokenId: nft.tokenId,
                    priceGwei: toBigNum(price, 18),
                    expiresAt: moment(date).valueOf(),
                    singature: lazyAction.result
                });

                if (txOnSale) {
                    // NotificationManager.success(translateLang('listing_success'));
                    toast(translateLang('listing_success'), {position: "top-right", autoClose: 2000})
                    navigate('/explore');
                } else {
                    // NotificationManager.error(translateLang('listingerror'));
                    toast(translateLang('listingerror'), {position: "top-right", autoClose: 2000})
                }
                setLoading(false);
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            // NotificationManager.error(translateLang('operation_error'));
            toast(translateLang('operation_error'), {position: "top-right", autoClose: 2000})
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        let txOnSale = await approveNFT({
            nftAddress: nft.collection,
            assetId: nft.tokenId
        });

        if (txOnSale) {
            // NotificationManager.success('Successfully Approve');
            toast('Successfully Approve', {position: "top-right", autoClose: 2000})
            setApproveFlag(true);
        } else {
            // NotificationManager.error('Failed Approve');
            toast('Failed Approve', {position: "top-right", autoClose: 2000})
        }
        setLoading(false);
    };

    return (
        <>
            <section className="container" style={{ paddingTop: '20px' }}>
                {nft === null ? (
                    'Loading...'
                ) : (
                    <>
                        <div className="row">
                            <div className="col-lg-7 offset-lg-1 mb-5" style={{margin: 0}}>
                                <div id="form-create-item" className="form-border rt-box-style-2">
                                    <div className="field-set">
                                        <div>
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
                                            <div className="price mt">
                                                <div
                                                    style={{
                                                        flex: '1 1 0'
                                                    }}>
                                                    <select
                                                        className="form-control"
                                                        onChange={(e) => {
                                                            setCurrency(e.target.value);
                                                        }}>
                                                        {state.currencies.map((currency: any, index: any) => (
                                                            <option value={currency.value} key={index}>
                                                                {currency.label}
                                                            </option>
                                                        ))}
                                                    </select>
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
                                            <p>0%</p>
                                        </div>

                                        <div className="spacer-40"></div>
                                        {loading ? (
                                            <button className="btn-main">
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    aria-hidden="true"></span>
                                            </button>
                                        ) : approveFlag || nft.isOffchain ? (
                                            <button
                                                className="btn-main"
                                                disabled={
                                                    price === '' || !moment(date).isValid()
                                                        ? true
                                                        : false
                                                }
                                                onClick={handlelist}>
                                                {translateLang('btn_completelisting')}
                                            </button>
                                        ) : (
                                            <button className="rt-btn rt-gradient pill d-block rt-mb-15" onClick={handleApprove}>
                                                {'Approve'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-5">
                                <div className='rt-box-style-2'>
                                    <h5>{translateLang('previewitem')}</h5>
                                    <div className="nft__item m-0">
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
                                                    <p>
                                                        {/* {nft.name.length > 15
                                                            ? correctCollection.metadata?.name.slice(
                                                                0,
                                                                15
                                                            ) + '...'
                                                            : correctCollection.metadata?.name} */}
                                                        {nft.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p>
                                                        {price === ''
                                                            ? '0  FTM'
                                                            : price?.length > 15
                                                            ? price.slice(0, 15) + '...' + '  FTM'
                                                            : price + '  FTM'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <section className="page-content-area">
                            <div className="container">
                            <div className="row">
                                <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                                    <h2 className="rt-section-title">
                                        List domain for sale
                                    </h2>
                                    <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">
                                    </p>
                                </div>
                            </div>
                            <div className="rt-spacer-60"></div>
                            <div className="row">
                                <div className="col-lg-7">
                                        <div className="imil-box rt-mb-30">
                                            <div className="rt-box-style-2">
                                                <h4 className="f-size-36 f-size-xs-30 rt-semiblod text-422">{nft.name}</h4>   
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
                                                        <span className="d-block f-size-24 rt-semiblod">{new Date((nft.attributes?.expiryDate || 0) * 1000).toLocaleDateString()}</span>
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
                                                <div style={{display: 'flex', gap: '0.5em', cursor: 'pointer'}} onClick={() => navigate(`/${nft.owner}`)}>
                                                    {state.usersInfo[nft.owner]?.image ? (
                                                        <img
                                                            className="lazy"
                                                            src={state.usersInfo[nft.owner].image}
                                                            alt=""
                                                            style={{width: 32, height: 32, borderRadius: '50%'}}
                                                        />
                                                    ) : (
                                                        <Jazzicon
                                                            diameter={32}
                                                            seed={Math.round(
                                                                (Number(nft.owner) /
                                                                    Number(
                                                                        '0xffffffffffffffffffffffffffffffffffffffffff'
                                                                    )) *
                                                                    10000000
                                                            )}
                                                        />
                                                    )}
                                                    <div className="author_list_info">
                                                        <span>{styledAddress(nft.owner)}</span>
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
                                                    <span className="rt-light3 amount"><span className="f-size-40 text-422"><span className="rt-semiblod">1.5</span></span><span className="f-size-24"> ETH</span></span>
                                                
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
                                                    <button className="rt-btn rt-outline-gradientL pill d-block rt-mb-15">Send offer (in fixed mode)</button></form>
                                            </div>
                                        </div>
                                </div>
                                </div>
                            </div>
                            <div>
                        </div>
                        </section> */}
                    </>
                )}
            </section>
        </>
    );
}
