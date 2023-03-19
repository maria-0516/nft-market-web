import React, { useCallback, useState, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import Select from 'react-select';

import NFTLists from '../components/NFTLists';
import Acitivity from './Activity';
import Footer from '../menu/footer';
import { useBlockchainContext } from '../../context';
import Action from '../../service';
import Pager from '../components/Pager';
import { useNavigate } from 'react-router-dom';

const customStyles = {
    option: (base: any, state: any) => ({
        ...base,
        background: '#fff',
        color: '#000',
        borderRadius: 0,
        '&:hover': {
            background: '#ddd'
        }
    }),
    menu: (base: any) => ({
        ...base,
        background: '#fff !important',
        borderRadius: '20px',
        marginTop: 0
    }),
    menuList: (base: any) => ({
        ...base,
        padding: 0
    }),
    control: (base: any, state: any) => ({
        ...base,
        padding: 2
    })
};

const options = [
    { value: 'All categories', label: 'All categories' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'Domain Names', label: 'Domain Names' }
];
const options2 = [
    { value: 'Rating', label: 'Rating' },
    { value: 'PriceLTH', label: 'Price (Low to High)' },
    { value: 'PriceHTL', label: 'Price (High to Low)' },
    { value: 'NameASC', label: 'Name (ASC)' },
    { value: 'NameDESC', label: 'Name (DESC)' }
];

export default function Explore() {
    const [state, { translateLang, setLoading }] = useBlockchainContext() as any;
    const [searchWord, setSearchWord] = useState('');

    const [selectedOption2, setSelectedOption2] = useState<any>(options2[0]);
    const [option1, setOption1] = useState('forsale');
    const [nfts, setNfts] = useState<Array<NFTData>>([])
    const [status, setStatus] = useState({
        limit: 10,
		page: 0,
        total: 0
    })
    const navigate = useNavigate();

    const onPage = (page: number) => {
		setStatus({...status, page})
	}

    // status filter
    const filter1 = useCallback(
        (item: any) => {
            switch (option1) {
                case 'forsale':
                    return (
                        item?.owner?.toUpperCase() === state.addresses?.Marketplace?.toUpperCase()
                    );
                case 'all':
                    return (
                        item?.owner?.toUpperCase() !== state.addresses?.Marketplace?.toUpperCase()
                    );
                default:
                    return true;
            }
        },
        [option1]
    );

    const filter2 = useCallback((item: any) => {
        return true;
    }, []);

    //search filter
    const filter3 = useCallback(
        (item: any) => {
            const searchParams = ['owner', 'name', 'description', 'collectionAddress'];
            return searchParams.some((newItem) => {
                return (
                    item[newItem]?.toString().toLowerCase().indexOf(searchWord.toLowerCase()) >
                        -1 ||
                    item['metadata'][newItem]
                        ?.toString()
                        .toLowerCase()
                        .indexOf(searchWord.toLowerCase()) > -1
                );
            });
        },
        [searchWord]
    );

    // sort option
    const sortBy = useCallback(
        (a: any, b: any) => {
            let res = true;
            switch (selectedOption2.value) {
                case 'Rating':
                    res = Number(a.likes?.length) < Number(b.likes?.length);
                    break;
                case 'PriceLTH':
                    if (a.marketdata?.price == null || Number(b.marketdata?.price) == 0) return -1;
                    res = Number(a.marketdata?.price) > Number(b.marketdata?.price);
                    break;
                case 'PriceHTL':
                    if (a.marketdata?.price == null || Number(b.marketdata?.price) == 0) return -1;
                    res = Number(b.marketdata?.price) > Number(a.marketdata?.price);
                    break;
                case 'NameASC':
                    res = a.metadata?.name > b.metadata?.name;
                    break;
                case 'NameDESC':
                    res = b.metadata?.name > a.metadata?.name;
                    break;
                default:
                    res = true;
            }
            return res ? 1 : -1;
        },
        [selectedOption2]
    );

    const readNfts = async () => {
        setLoading("1")
        try {
            const formData = new FormData();
            formData.append('p', String(status.page + 1));
            // formData.append('query', );

            const response = await Action.all_nfts(formData);
            if (response.success) {
                let _data = [] as NFTData[]
                if (response.data?.length > 0) {
                    response.data.map((i: NFTData ,k: any) => _data.push(i))
                }
                setNfts([..._data])
                setStatus({...status, total: response.meta.total})
            } else {
                console.log("readNftsError")
            }
        } catch (error) {
            console.log("readNfts", error)
        }
        setLoading("")
    }

    React.useEffect(() => {
        readNfts()
    }, [status.page])

    const handleClick = (name: string, listed: string) => {
        navigate(`/domain/${name}`);
    };

    return (
        <div>
            {/* <div className="jumbotron no-bg">
                <div className="container">
                    <h1>{translateLang('allnft_title')}</h1>
                </div>
            </div>

            <section className="container" style={{ paddingTop: '30px', position: 'relative' }}>
                <div className="search_group">
                    <form className="form-dark" id="form_quick_search" name="form_quick_search">
                        <input
                            type="text"
                            className="form-control"
                            id="name_1"
                            name="name_1"
                            placeholder={translateLang('seachtext')}
                            onChange={(e) => setSearchWord(e.target.value)}
                            value={searchWord}
                        />
                    </form>
                <div className="spacer-single"></div>
                <div className="dropdownSelect">
                    <Select
                        className="select1"
                        styles={customStyles}
                        defaultValue={options2[0]}
                        options={options2}
                        onChange={setSelectedOption2}
                    />
                </div>
                <Tabs
                    activeKey={option1}
                    onSelect={(k) => {
                        setOption1(k || '');
                    }}
                    className="mb-3">
                    <Tab eventKey="forsale" title="For Sale">
                        <div className="spacer-20"></div>
                        <NFTLists
                            filter1={filter1}
                            filter2={filter2}
                            filter3={filter3}
                            sortBy={sortBy}
                        />
                    </Tab>
                    <Tab eventKey="all" title="All NFT">
                        <div className="spacer-20"></div>
                        <NFTLists
                            filter1={filter1}
                            filter2={filter2}
                            filter3={filter3}
                            sortBy={sortBy}
                        />
                    </Tab>
                    <Tab eventKey="activity" title="Activity">
                        <div className="spacer-20"></div>
                        <Acitivity activitiesData={state.activities} />
                    </Tab>
                </Tabs>
            </section> */}

            <section className="page-content-area">
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
                                                    <th className="text-323639 rt-strong f-size-18 text-right">Expire Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    nfts.map((i: NFTData, index: number) => (
                                                        <tr key={index} onClick={() => handleClick(i.name, i.marketData?.seller || "")}>
                                                            <th className="f-size-24 f-size-md-18 rt-semiblod text-234">{i.name}</th>
                                                            <td className="f-size-24 f-size-md-18 rt-semiblod text-338"><code>{i.owner.slice(0, 8) + '...' + i.owner.slice(-5)}</code></td>
                                                            <th className="f-size-24 f-size-md-18 rt-semiblod text-338 text-right">{new Date((i.attributes?.expiryDate || 0) * 1000).toDateString()}</th>
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
                    <div className="row">
                        <div className="col-12" style={{display: 'flex', justifyContent: 'center'}}>
                                {/* <a href="#" className="rt-btn rt-outline-gray text-uppercase pill">
                                    <i className="icofont-refresh rt-mr-5"></i> Load More
                                </a> */}
                            <Pager page={status.page} total={status.total} onChange={page=>onPage(page)} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
