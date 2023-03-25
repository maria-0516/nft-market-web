import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import ItemDetail from './pages/ItemDetail';
import Author from './pages/Author';
import ListedDomains from './pages/ListedDomains';

import Footer from './menu/footer';
import HowWork from './pages/HowWork';
import Faq from './pages/Faq';
import Partnership from './pages/Partnership';
import CNSToken from './pages/CNSToken'
import Auction from './pages/Auction';
import { storefront } from '../contracts';
import { useBlockchainContext } from '../context';
import config from '../config.json'

const App = () => {
    const [state, { setFee }] = useBlockchainContext() as any;
    const [inited, setInited] = React.useState(false)
    const getFee = async () => {
        try {
            const fee = Number(await storefront.cutPerMillion()) / 1e4
            let seller = 0
            let buyer = 0
            if (fee > config.buyerFee) {
                buyer = config.buyerFee
                seller = fee - config.buyerFee
            } else {
                buyer = fee
            }
            setFee({buyer, seller})
        } catch (error) {
            console.log("getFee", error)
        }
    }

    React.useEffect(() => {
        if (!inited) {
            getFee()
            setInited(true)
        }
    }, [])

    return (
        <div className="wraper">
            <Router>
                <GlobalStyles />
                <Header />
                <Routes>
                    <Route path="/" element={<ListedDomains />} />
                    <Route path="/my-domains" element={<Author />} />
                    <Route path="/how-work" element={<HowWork />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/partnership" element={<Partnership />} />
                    <Route path="/cns-token" element={<CNSToken />} />
                    <Route path="/auction/:name" element={<Auction />} />
                    <Route path="/domain/:name" element={<ItemDetail />}/>
                    <Route path="/address/:address" element={<Author />} />
                    <Route path="*" element={<Navigate to={'/'} />} />
                </Routes>
                <Footer />
                <ScrollToTopBtn />
            </Router>
        </div>
    );
}

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export default App;