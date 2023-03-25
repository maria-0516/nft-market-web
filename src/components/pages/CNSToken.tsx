import React from "react";
const OwlCarousel = require('react-owl-carousel2')
import CountUp from 'react-countup';

const CNSToken = () => {

    const options = {
        items: 3,
        nav: true,
        rewind: true,
        margin: 30,
        dots: false,
        loop: true,
        center: true,
        responsive: {
            0:{
                cetner: false,
                items:1,
            },
            600:{
                cetner: false,
                items:2,
            },
            1000:{
                items:3
            }
        },
        navText: [
            '<i class="icofont-long-arrow-left"></i>',
            '<i class="icofont-long-arrow-right"></i>'
        ]
    };
    const options2 = {
        items: 4,
        nav: true,
        rewind: true,
        margin: 20,
        dots: false,
        loop: true,
        responsive: {
            0:{
                items:1
            },
            900:{
                items:2
            },
            1000:{
                items:4
            }
        },
        navText: ['', '']
    };
    return (
    <div>
        <section className="rt-banner-area default-slider">
            <div className="rt-slider-active owl-carousel owl-loaded">
                <div className="single-rt-banner rt-banner-height rtbgprefix-full" style={{backgroundImage: 'url(assets/images/banner/banner_01.png)'}}>
                    <div className="container">
                        <div className="row rt-banner-height align-items-center">
                            <div className="col-lg-6 md-mt-5">
                                <div className="rt-banner-content text-white">
                                    <h1>
                                        <span className="d-block f-size-36 f-size-xs-18 rt-light1 rt-mb-10" data-duration="1s" data-dealy="0.3s" data-animation="wow fadeInUp" style={{animationDuration: '1s', lineHeight: 1.3}}>Crypto Names Store</span>
                                        <span className="f-size-40 f-size-xs-24 rt-strong rt-mb-13 d-block " data-duration="1s" data-dealy="0.3s" data-animation="wow fadeInDown" style={{animationDuration: '1s', lineHeight: 1.3}}>Crypto Domains Markertplace</span>
                                    </h1>
                                    <h4 className="f-size-20 f-size-xs-16 rt-light1" data-duration="1.5s" data-dealy="0.6s" data-animation="wow fade-in-left" style={{animationDuration: '1.5s'}}></h4>
                                    <a href="https://cryptonames.store/resources/litepaper.pdf" className="rt-btn rt-gradient pill text-uppercase rt-Bshadow-1 long rt-mt-15" data-duration="1.8s" data-dealy="0.9s" data-animation="wow fadeInUp" style={{animationDuration: '1.8s', marginLeft: 5}}>Whitepaper
                                        <span><i className="icofont-simple-right"></i></span>
                                    </a>
                                    <a href="https://app.uniswap.org/#/swap?outputCurrency=0x6C320C7047620ef78c11Ae8eF3Da4cD31E1017ED&amp;inputCurrency=eth" className="rt-btn rt-gradient pill text-uppercase rt-Bshadow-1 long rt-mt-15" data-duration="1.8s" data-dealy="0.9s" data-animation="wow fadeInUp" style={{animationDuration: '1.8s', marginLeft: 5}}>Buy $CNS
                                        <span><i className="icofont-simple-right"></i></span>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6 d-lg-block d-none">
                                <div className="banner-add-img">
                                    <img src="assets/images/all-img/pc2.png" alt="pc image" draggable="false" className="front-img" data-duration="2s" data-dealy="1s" data-animation="fade-in-bottom" style={{animationDuration: '2s'}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="owl-nav disabled">
                    <button type="button" role="presentation" className="owl-prev">
                        <i className="fa fa-angle-left"></i>
                        </button>
                    <button type="button" role="presentation" className="owl-next">
                        <i className="fa fa-angle-right"></i>
                    </button>
                </div>
                <div className="owl-dots disabled"></div>
            </div>
        </section>
        <section className="chhose-area" style={{marginTop: '2em'}}>
            <div className="rt-spacer-180 rt-spacer-lg-100 rt-spacer-xs-50"></div>
            <div className="container rtbgprefix-contain" style={{backgroundImage: 'url(assets/images/all-img/section-bg-2.png)',maxWidth: '1140px'}}>
                <div className="row">
                    <div className="col-xl-12 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                        <h2 className="rt-section-title">Why Choose CNS?</h2>
                        <p className="rt-mb-0 rt-light3 line-height-34 section-paragraph">One of the biggest challenges for crypto businesses is finding a premium domain name.</p>
                    </div>
                </div>
                <div className="rt-spacer-60"></div>
                <div className="row">
                    <div className="col-12">
                        <OwlCarousel options={options} >
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_3.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Cannot be overstated</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">The crypto industry continues to grow, having a memorable and relevant domain name is essential for businesses to establish a strong online presence. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_1.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Easier for businesses</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">With the sheer number of new projects and startups entering the market, it can be difficult to find a domain name that is both available and relevant to the business </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_2.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Provides a Unique Value</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">users can benefit from the increasing value of the token as more trades are made on the platform. This incentivizes users to use the platform. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_1.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Growth Of Crypto</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">In recent years, the crypto world has exploded with new projects, startups, and innovative products. One of the most significant aspects of this ecosystem. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_2.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Economy Model</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">Crypto Names Store earns a commission of 15% on each trade made on the platform, and this commission is then used to buy back $CNS. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_3.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Cannot be overstated</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">The crypto industry continues to grow, having a memorable and relevant domain name is essential for businesses to establish a strong online presence. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_1.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Easier for businesses</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">With the sheer number of new projects and startups entering the market, it can be difficult to find a domain name that is both available and relevant to the business </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_2.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Provides a Unique Value</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">users can benefit from the increasing value of the token as more trades are made on the platform. This incentivizes users to use the platform. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_1.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Growth Of Crypto</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">In recent years, the crypto world has exploded with new projects, startups, and innovative products. One of the most significant aspects of this ecosystem. </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_2.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Economy Model</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">Crypto Names Store earns a commission of 15% on each trade made on the platform, and this commission is then used to buy back $CNS. </p>
                                    </div>
                                </div>
                            </div>
                            {/* <div>
                                <div className="rt-single-icon-box icon-center text-center shdoaw-style rt-rounded-10 rt-pt-50 rt-pb-50 rt-pl-30 rt-pr-30 rt-mt-60 rt-mb-100 rt-mb-xs-30">
                                    <div className="icon-thumb">
                                        <img src="assets/images/all-img/icon_3.png" alt="box-icon" draggable="false" />
                                    </div>
                                    <div className="iconbox-content">
                                        <h5 className="f-size-24 rt-semiblod rt-mb-15">Cannot be overstated</h5>
                                        <p className="line-height-34 rt-light3 rt-mb-20 section-p-content">The crypto industry continues to grow, having a memorable and relevant domain name is essential for businesses to establish a strong online presence. </p>
                                    </div>
                                </div>
                            </div> */}
                        </OwlCarousel>
                    </div>
                </div>
            </div>
        </section>
        <section className="domain-want-area rtbgprefix-cover bg-elements-parent rt-pt-200 rt-pb-200 parallaxie rt-pt-lg-0 rt-pb-lg-0" style={{backgroundImage: 'url(assets/images/all-img/section-bg-3.png)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed'}}>
            <div className="rt-bg-elemtnts shape-right rtbgprefix-contain " style={{backgroundImage: 'url(assets/images/all-img/shape-right.png)'}}></div>
            <div className="container">
                <div className="row">
                    <div className="col-xl-7 col-lg-12">
                        <h2 className="rt-section-title">Tokenomics</h2>
                        <p className="line-height-34 rt-light3 section-p-content">
                            <b> Token Name: Crypto Names Store<br />Token Symbol: CNS</b>
                        </p>
                        <p className="line-height-34 rt-light3 section-p-content" style={{lineBreak: 'anywhere'}}>
                            <b> Ethereum ERC20 Smart Contract:<br />0x6C320C7047620ef78c11Ae8eF3Da4cD31E1017ED</b>
                        </p>
                        <p className="line-height-34 rt-light3 section-p-content">
                            <b> Ownership Renounced</b>
                        </p>
                    </div>
                </div>
                <div className="rt-spacer-25"></div>
                <div className="row">
                    <div className="col-xl-9 col-lg-12">
                        <div className="row">
                            <div className="col-lg-4 col-md-6 col-12 rt-mb-30">
                                <div className="counter-box-1  wow fadeInUp has-border-right">
                                    <h6>
                                        <span className="counter">
                                            <CountUp start={0} end={1} duration={2} />  
                                        </span>
                                        <span>M</span>
                                    </h6>
                                    <h5>Total Supply</h5>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-12 rt-mb-30">
                                <div className="counter-box-1  wow fadeInUp has-border-right">
                                    <h6>
                                        <span className="counter">
                                            <CountUp start={0} end={5} duration={2} />  
                                        </span>
                                        <span>%</span>
                                    </h6>
                                    <h5>Trade Tax</h5>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-12 rt-mb-30">
                                <div className="counter-box-1  wow fadeInUp">
                                    <h6>
                                        <span className="counter">
                                            <CountUp start={0} end={100} duration={2} />  
                                        </span>
                                        <span>%</span>
                                        </h6>
                                    <h5>Liquidity Lock</h5>
                                </div>
                            </div>
                            <div className="col-12 rt-mt-15">
                                <a href="https://etherscan.io/token/0x6c320c7047620ef78c11ae8ef3da4cd31e1017ed" className="rt-btn rt-outline-gray pill" style={{marginLeft: 5}}>Etherscan</a>
                                <a href="https://www.dextools.io/app/en/ether/pair-explorer/0x6C320C7047620ef78c11Ae8eF3Da4cD31E1017ED" className="rt-btn rt-outline-gray pill" style={{marginLeft: 5}}>Live Chart</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="feature-area" style={{marginTop: '2em'}}>
            <div className="container">
                <div className="row">
                    <div className="col-xl-6 col-lg-8 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                        <h2 className="rt-section-title">CNS RoadMap</h2>
                    </div>
                </div>
                <div className="rt-spacer-25"></div>
                <div className="row">
                    <div className="col-12 road-map">
                        <OwlCarousel options={options2}>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="">
                                    <span className="f-size-18 d-block"><b>March 2023</b></span>
                                    <div className="domian-bg-color color--4 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Building Phase</b></span>
                                    <span className="f-size-16 d-block">Developing Platform</span>
                                    <span className="f-size-16 d-block">Marketing &amp; Branding Awareness</span>
                                    <span className="f-size-16 d-block">Platform Release v1.0</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>April to June</b></span>
                                    <div className="domian-bg-color color--1 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Product Phase</b></span>
                                    <span className="f-size-16 d-block">Telegram Bots Release v1.0</span>
                                    <span className="f-size-16 d-block">Discord Bot Release v1.0</span>
                                    <span className="f-size-16 d-block">Youtube Promotions</span>
                                    <span className="f-size-16 d-block">Continues Development</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>July to September</b></span>
                                    <div className="domian-bg-color color--2 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Expansion Phase</b></span>
                                    <span className="f-size-18 d-block">Fiat Payments</span>
                                    <span className="f-size-18 d-block">Mobile App Release</span>
                                    <span className="f-size-18 d-block">New Whitepaper &amp; Future Plans</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>October to December:</b></span>
                                    <div className="domian-bg-color color--3 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block">TBA ...</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="">
                                    <span className="f-size-18 d-block"><b>March 2023</b></span>
                                    <div className="domian-bg-color color--4 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Building Phase</b></span>
                                    <span className="f-size-16 d-block">Developing Platform</span>
                                    <span className="f-size-16 d-block">Marketing &amp; Branding Awareness</span>
                                    <span className="f-size-16 d-block">Platform Release v1.0</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>April to June</b></span>
                                    <div className="domian-bg-color color--1 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Product Phase</b></span>
                                    <span className="f-size-16 d-block">Telegram Bots Release v1.0</span>
                                    <span className="f-size-16 d-block">Discord Bot Release v1.0</span>
                                    <span className="f-size-16 d-block">Youtube Promotions</span>
                                    <span className="f-size-16 d-block">Continues Development</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>July to September</b></span>
                                    <div className="domian-bg-color color--2 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Expansion Phase</b></span>
                                    <span className="f-size-18 d-block">Fiat Payments</span>
                                    <span className="f-size-18 d-block">Mobile App Release</span>
                                    <span className="f-size-18 d-block">New Whitepaper &amp; Future Plans</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>October to December:</b></span>
                                    <div className="domian-bg-color color--3 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block">TBA ...</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="">
                                    <span className="f-size-18 d-block"><b>March 2023</b></span>
                                    <div className="domian-bg-color color--4 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Building Phase</b></span>
                                    <span className="f-size-16 d-block">Developing Platform</span>
                                    <span className="f-size-16 d-block">Marketing &amp; Branding Awareness</span>
                                    <span className="f-size-16 d-block">Platform Release v1.0</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>April to June</b></span>
                                    <div className="domian-bg-color color--1 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Product Phase</b></span>
                                    <span className="f-size-16 d-block">Telegram Bots Release v1.0</span>
                                    <span className="f-size-16 d-block">Discord Bot Release v1.0</span>
                                    <span className="f-size-16 d-block">Youtube Promotions</span>
                                    <span className="f-size-16 d-block">Continues Development</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>July to September</b></span>
                                    <div className="domian-bg-color color--2 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block"><b>Expansion Phase</b></span>
                                    <span className="f-size-18 d-block">Fiat Payments</span>
                                    <span className="f-size-18 d-block">Mobile App Release</span>
                                    <span className="f-size-18 d-block">New Whitepaper &amp; Future Plans</span>
                                </a>
                            </div>
                            <div className="single-feature-item wow fade-in-bottom">
                                <a className="rt-feature-box rt-rounded-10 rt-p-20" href="#">
                                    <span className="f-size-18 d-block"><b>October to December:</b></span>
                                    <div className="domian-bg-color color--3 text-center f-size-28" style={{height:'5px'}}></div>
                                    <span className="f-size-18 d-block">TBA ...</span>
                                </a>
                            </div>
                        </OwlCarousel>
                    </div>
                </div>
            </div>
        </section>
        <div className="rt-spacer-170 rt-spacer-lg-100 rt-spacer-xs-0"></div>
        <section className="feature-area" style={{marginTop: '2em'}}>
            <div className="container">
                <div className="row">
                    <div className="col-xl-12 col-lg-12 mx-auto text-center wow fade-in-bottom" data-wow-duration="1s">
                        <div className="rt-single-widget wow fade-in-bottom">
                            <h2 className="rt-section-title">Follow CNS</h2>
                            <ul className="rt-list rt-mt-35">
                                <li className="d-inline-block">
                                    <a href="https://t.me/CryptoNamesStore" className="rt-hw-100 text-center icon-white-secondary d-block rt-circle rt-mr-4" style={{fontSize:'6rem'}}>
                                        <i className="fab fa-telegram" aria-hidden="true"></i>
                                        </a>
                                    </li>
                                <li className="d-inline-block">
                                    <a href="https://twitter.com/CryptoNames_ERC" className="rt-hw-100 text-center icon-white-secondary d-block rt-circle rt-mr-4" style={{fontSize:'6rem'}}>
                                        <i className="fab fa-twitter" aria-hidden="true"></i>
                                    </a>
                                </li>
                                <li className="d-inline-block">
                                    <a href="https://medium.com/@CryptoNamesStore/" className="rt-hw-100 text-center icon-white-secondary d-block rt-circle rt-mr-4" style={{fontSize:'6rem'}}>
                                        <i className="fab fa-medium" aria-hidden="true"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    </div>
            </div>
        </section>
    </div>
    )
}

export default CNSToken;