import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Breakpoint, BreakpointProvider, setDefaultBreakpoints } from 'react-socks';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBlockchainContext } from '../../context';
import { changeNetwork } from '../../utils';
import config from '../../config.json'
import { useWallet } from '../../use-wallet/src';
import AnchorLink from 'react-anchor-link-smooth-scroll'

setDefaultBreakpoints([{ xs: 0 }, { l: 1199 }, { xl: 1200 }]);

const NavLink = (props: any) => (
    <Link
        {...props}
        getProps={({ isCurrent }: {isCurrent: any}) => {
            // the object returned here is passed to the
            // anchor element's props
            return {
                className: isCurrent ? 'active' : 'non-active'
            };
        }}
    />
);



const Header = () => {
    const navigate = useNavigate();
    const wallet = useWallet();
    const { address } = useParams();
    
    const [state, { dispatch, setSearch }] = useBlockchainContext() as any;
    const [openMenu1, setOpenMenu1] = useState(false);
    const [searchModal, setSearchModal] = useState(false);
    const [searchKey, setSearchKey] = useState('');
    const [focused, setFocused] = useState(false);
    const [scroll, setScroll] = useState(false)
    const [headerClass, setHeaderClass] = useState("main-header rt-sticky");
    const [mobileMenu, setMobileMenu] = useState({
		main: false,
		sub1: false,
		sub2: false
	});
    const [menu, setMenu] = useState('')
	const [langMenu, setLangMenu] = useState(false)
	const location = useLocation()
    const [status, setStatus] = useState({
        search: ''
    })
    const [walletInited, setWalletInited] = useState(false)

    // const account = address || wallet.account

    useEffect(() => {
        if (searchKey.trim() !== '' && focused) {
            setSearchModal(true);
        } else {
            setTimeout(() => {
                setSearchModal(false);
            }, 200);
        }
    }, [searchKey, focused]);

    // const collectionFilter = useCallback(
    //     (item: any) => {
    //         const searchParams = ['address', 'name', 'description'];
    //         return searchParams.some((newItem) => {
    //             try {
    //                 return (
    //                     item['metadata'][newItem]
    //                         ?.toString()
    //                         .toLowerCase()
    //                         .indexOf(searchKey.toLowerCase()) > -1
    //                 );
    //             } catch (err) {
    //                 return false;
    //             }
    //         });
    //     },
    //     [searchKey]
    // );

    // const nftFilter = useCallback(
    //     (item: any) => {
    //         const searchParams = ['owner', 'name', 'description', 'collectionAddress'];
    //         return searchParams.some((newItem) => {
    //             try {
    //                 return (
    //                     item[newItem]?.toString().toLowerCase().indexOf(searchKey.toLowerCase()) >
    //                         -1 ||
    //                     item['metadata'][newItem]
    //                         ?.toString()
    //                         .toLowerCase()
    //                         .indexOf(searchKey.toLowerCase()) > -1
    //                 );
    //             } catch (err) {
    //                 return false;
    //             }
    //         });
    //     },
    //     [searchKey]
    // );

    // const collectionDatas = useMemo(() => {
    //     try {
    //         return state.collectionNFT.filter(collectionFilter).splice(0, 20);
    //     } catch (err) {
    //         return [];
    //     }
    // }, [state.collectionNFT, collectionFilter]);

    // const nftDatas = useMemo(() => {
    //     try {
    //         return state.allNFT.filter(nftFilter).splice(0, 20);
    //     } catch (err) {
    //         return [];
    //     }
    // }, [state.allNFT, nftFilter]);

    const checkNetwork = async () => {
        console.log("checkNetwork")
        try {
            const {ethereum} = wallet
            //if metamask is connected and wallet is not connected ( chain error))
            if (ethereum) {
                const chainId = await ethereum.request({method: 'eth_chainId'});
                console.log('chainId', chainId)
                if (Number(chainId)!==config.chainId) {
                    await changeNetwork(ethereum, config.chainId);
                }
            }
            // window.sessionStorage.setItem('isConnected', "1");
        } catch (err) {
            console.log((err as any).message);
        }
    }
    const handleConnect = () => {
        if (wallet.status == 'connected') {
            wallet.reset();
            dispatch({
                type: 'auth',
                payload: {
                    isAuth: false,
                    name: '',
                    email: '',
                    bio: '',
                    address: '',
                    image: null,
                    bannerImage: null
                }
            });
            window.sessionStorage.setItem('isConnected', "0");
        } else {
            wallet.connect()
        }
    };

    const closeMenu1 = () => {
        setOpenMenu1(false);
    };
    const onConnectWallet = async () => {
        try {
            const storage = window.sessionStorage
            const isConnected = storage.getItem('isConnected')==="1";
            if (wallet.ethereum) {
                if (wallet.status==='disconnected' && isConnected) {
                    if (!walletInited) {
                        setWalletInited(true)
                        wallet.connect()
                    }
                } else if ((wallet.status==='connected' || wallet.status==='error') && !isConnected) {
                    storage.setItem('isConnected', "1")
                    checkNetwork()
                }
            } else if (!walletInited && isConnected) {
                setWalletInited(true)
                wallet.connect()
            }
        } catch (error) {
            console.log("connect-wallet", error)
        }
    }

	React.useEffect(()=>{
		if (wallet.error) console.log('wallet error', wallet.error)
	}, [wallet.error])


    useEffect(() => {
        onConnectWallet()
    }, [wallet.status, wallet.account]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        const _path = location.pathname
        if (_path==='/') {
            setMenu('Buy Crypto Domains')
        } else if (_path.indexOf('listed-domains')===1) {
            setMenu('Buy Crypto Domains')
        } else if (_path.indexOf('how-work')===1) {
            setMenu('How it works')
        } else if (_path.indexOf('partnership')===1) {
            setMenu('Partnership')
        } else if (_path.indexOf('faq')===1) {
            setMenu('Faq')
        } else if (_path.indexOf('cns-token')===1) {
            setMenu('CNS Token')
        } else if (_path.indexOf('auction')===1) {
            setMenu('List Domain For Sale')
        } else if (_path.indexOf('my-domains')===1) {
            setMenu('My Domains')
        } else if (_path.indexOf('address')===1) {
            const address = _path.replace('/address/', '')
            if (/^0x[0-9A-Fa-f]{40}$/.test(address)) {
                setMenu(`${address.slice(0, 6)}...${address.slice(-4)}`)
            } else {
                setMenu("no selected address")
            }
        } else if (_path.indexOf('domain')===1) {
            const menu = decodeURI(_path.slice(_path.lastIndexOf('/')+1))
            setMenu(menu.length > 25 ? menu.slice(0, 22) + '...eth' : menu)
        }
    }, [location.pathname])

    const onScroll = () => {
        const sticky = 170
        if (window.pageYOffset > sticky) {
			setHeaderClass("main-header rt-sticky rt-sticky-active fadeInDown animated")
        } else {
			setHeaderClass("main-header rt-sticky")
        }
        if (window.pageYOffset > sticky) {
            closeMenu1();
        }
        if (window.pageYOffset > 200) {
            setScroll(true)
        } else {
            setScroll(false)
        }
    }

    const onSearch = async () => {
        if (status.search.length < 3) return;
        // if (location.pathname.indexOf('listed-domains')===1) {
        //     const label = status.search.slice(0, status.search.lastIndexOf('.'))
        //     const tokenId = makeTokenId(label)
        //     const _order = await storefront.getOrderByTokenId(tokenId)
        //     const id = Number(_order.id) || 0
        //     if (!!id) {
                
        //     }

        // } else {
            let search = status.search.slice(-4)==='.eth' ? status.search : `${status.search}.eth`
            navigate(`/domain/${search}`);
        // }
    }

    return (
        <>
            <header className='rt-site-header rt-fixed-top white-menu' id="top">
				<div className="top-header">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6 md-start sm-center">
							
							<ul className="text-center text-md-left top-social">
								<li><span><Link to='https://t.me/CryptoNamesStore' target='_blank' className="f-size-14 text-white"><img src="/assets/images/all-img/top-1.png" alt="" draggable="false" /> Support</Link></span></li>
								<li style={{position: 'relative', cursor: 'pointer'}} onClick={()=>setLangMenu(!langMenu)}>
									<span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="2" style={{width: '100%'}}>
										<span className="selection">
											<span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" aria-disabled="false" aria-labelledby="select2-from-l2-container">
												<span className="select2-selection__rendered" id="select2-from-l2-container" role="textbox" aria-readonly="true" title="EN">EN</span>
												<span className="select2-selection__arrow" role="presentation">
													<b role="presentation"></b>
												</span>
											</span>
										</span>
										<span className="dropdown-wrapper" aria-hidden="true"></span>
									</span>
									<span className="select-arrwo">
										<i className="icofont-thin-down"></i>
									</span>
									<ul className='lang-menu' style={{display: `${langMenu ? 'block' : 'none'}`}}>
										<li>EN</li>
									</ul>
								</li>
								<li><Link to='https://t.me/CryptoNamesStore' target='_blank'><i className="icofont-telegram"></i></Link></li>
								<li><Link to='https://twitter.com/CryptoNames_ERC' target='_blank'><i className="icofont-twitter"></i></Link></li>
			
							</ul>
						</div>
						<div className="col-md-6 text-center text-md-right md-end sm-center" style={{gap: '0.5em'}}>
							<button className="rt-btn rt-gradient pill text-uppercase" style={{lineHeight: '10px', fontSize: '1.5rem', fontWeight: 'bold'}} onClick={handleConnect}>
								{wallet.status==='connecting' ? 'Connecting...' : (
									(wallet.status == 'connected' && wallet.account) ? `${wallet.account.slice(0, 4)}...${wallet.account.slice(-4)}` : 'Connect Wallet'
								)}
							</button>
							{/* <a href="#" className="rt-btn rt-gradient pill text-uppercase" style={{lineHeight: '10px', width: '75%', fontSize: '1.5rem', fontWeight: 'bold'}}>Connect Wallet
							</a> */}
						</div>
					</div>
				</div>
			</div> 
				<div id="myHeader" className={headerClass}>
					<nav className="navbar">
						<div className="container">
							<Link to="/" className="brand-logo"><img src="/assets/images/logo/logo.png" alt="" style={{width: '250px', height: 'auto'}} /></Link>
							<Link to="/" className="sticky-logo"><img src="/assets/images/logo/logo.png" alt="" style={{width: '250px', height: 'auto'}} /></Link>
							<div className="ml-auto d-flex align-items-center">
									<div className="main-menu">
									<ul className={mobileMenu.main ? 'show' : ''}>
										{/* <li className={menu==='Buy Crypto Domains' ? 'current-menu-item' : ''}><Link to="/" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>Home</Link></li> */}
										<li className={menu==='Buy Crypto Domains' ? 'current-menu-item' : ''}><Link to="/" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>Buy Domain</Link></li>
									
										{/* <li className="menu-item-has-children" onClick={()=>setMobileMenu({...mobileMenu, sub1: !mobileMenu.sub1})}><Link to="#">Buy Domain</Link>
											<ul className="sub-menu" style={{display: `${mobileMenu.sub1 ? 'block' : ''}`}}>
												<li><Link to="/listed-domains">All Listed Domains</Link></li>
												<li><Link to="/fixed-price">Fixed Price</Link></li>
												<li><Link to="/auctions">Auction List</Link></li>
											</ul>
										</li> */}
                                        {!!wallet.account && <li className={menu==='My Domains' ? 'current-menu-item' : ''}><Link to="/my-domains" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>Sell your Domain</Link></li>}
										<li className={`menu-item-has-children ${menu==='How it works' || menu==='Faq' || menu==='Partnership' ? 'current-menu-item' : ''}`} onClick={()=>setMobileMenu({...mobileMenu, sub2: !mobileMenu.sub2})}><Link to="#">Information</Link>
											<ul className="sub-menu" style={{display: `${mobileMenu.sub2 ? 'block' : ''}`}}>
												<li><Link to="/how-work" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>How It Works</Link></li>
												<li><Link to="/faq" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>FAQ</Link></li>
												<li><Link to="/partnership" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>Partnership</Link></li>
											</ul>
										</li>
										<li className={menu==='CNS Token' ? 'current-menu-item' : ''}><Link to="/cns-token" onClick={()=>setMobileMenu({...mobileMenu, main: false})}>CNS Token</Link></li>
									</ul>
								</div>
							<div className="rt-nav-tolls d-flex align-items-center">
								<div className="mobile-menu" onClick={()=>setMobileMenu({...mobileMenu, main: !mobileMenu.main})}>
									<div className="menu-click">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>
							</div>
						</div>
						</div>
					</nav>
				</div>
			</header>
			<div className="rt-breadcump rt-breadcump-height breaducump-style-2">
				<div className="rt-page-bg rtbgprefix-full" style={{backgroundImage: 'url(/assets/images/banner/breadcump-img.png)'}}>
				</div>
				<div className="container">
					<div className="rt-spacer-60"></div>

					<div className="row rt-breadcump-height align-items-center">
						<div className="col-lg-8 col-xl-7 mx-auto text-center text-white">
							<h4 className="f-size-70 f-size-lg-50 f-size-md-40 f-size-xs-24 rt-strong" style={{lineBreak: `${location.pathname.indexOf('domain')===1 ? 'anywhere' : 'auto'}`}}>{menu}</h4>
                            {/* {location.pathname.indexOf('domain')===1 && <h4 className="f-size-36 f-size-lg-30 f-size-md-24 f-size-xs-16 rt-light3">is listed for sale!</h4>} */}
                            {menu==='My Domains' && <p style={{marginTop: '4rem', lineBreak: 'anywhere'}}>{wallet.account?.slice(0, 8) + '...' + wallet.account?.slice(-8)}</p>}
							{
								(menu === 'Listed Crypto Domains' || menu === 'Buy Crypto Domains') && (
									<div className="rt-mt-30 domain-searh-form" data-duration="1.8s" data-dealy="0.9s"
										data-animation="wow fadeInUp">
										<input type="text" placeholder="enter a new search" value={status.search} onChange={e=>setStatus({...status, search: e.target.value})} onKeyDown={e=>e.key==='Enter' && onSearch()} />
								
										<button className="rt-btn rt-gradient pill rt-Bshadow-1" onClick={onSearch}>Search <span><i className="icofont-simple-right"></i></span>
										</button>
									</div>
								)
							}
						</div>
					</div>
				</div>
				{/* <div className="container">
					<div className="rt-spacer-60"></div>

					<div className="row rt-breadcump-height align-items-center">
						<div className="col-lg-12 mx-auto text-center text-white">
							<h4 className="f-size-70 f-size-lg-50 f-size-md-40 f-size-xs-24 rt-strong">ELON.ETH</h4>
							<h4 className="f-size-36 f-size-lg-30 f-size-md-24 f-size-xs-16 rt-light3">is listed for sale!</h4>
						</div>
					</div>
				</div> */}
			</div>
            {scroll && (
                <AnchorLink  id="scrollUp" href="#top" style={{position: 'fixed', zIndex: 100000}}>
                    <i className="fa fa-angle-up"></i>
                </AnchorLink >
            )}
        </>
    );
}

export default Header
