import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Explore from './pages/explore';
import ItemDetail from './pages/ItemDetail';
import Author from './pages/Author';
import ListedDomains from './pages/ListedDomains';

import { toast } from 'react-toastify';
import Footer from './menu/footer';
import HowWork from './pages/HowWork';
import Faq from './pages/Faq';
import Partnership from './pages/Partnership';
import CNSToken from './pages/CNSToken';
// import { useWallet } from '../use-wallet/src';
import Auction from './pages/Auction';
import config from '../config.json'

const App = () => {
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