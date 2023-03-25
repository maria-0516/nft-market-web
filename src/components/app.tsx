import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Explore from './pages/explore';
import ItemDetail from './pages/ItemDetail';
import Author from './pages/Author';
import ListedDomains from './pages/ListedDomains';
import { useBlockchainContext } from '../context';

import { toast } from 'react-toastify';
import Footer from './menu/footer';
import HowWork from './pages/HowWork';
import Faq from './pages/Faq';
import Partnership from './pages/Partnership';
import CNSToken from './pages/CNSToken';
// import { useWallet } from '../use-wallet/src';
import Auction from './pages/Auction';

// const PrivateRoute = ({ children }: {children: any}) => {
//     const location = useLocation();
//     const wallet = useWallet();
//     const [state, {}] = useBlockchainContext() as any;

//     if (!state.auth.isAuth) {
//         if (wallet.status==='connected' && localStorage.getItem('isConnected')==="0") {
//             return children;
//             // checkNetwork()
//         }
//         // NotificationManager.warning('Please connect wallet');
//         toast('Please connect wallet', {position: "top-right", autoClose: 2000})
//         return <Navigate to="/" replace state={{ from: location }} />;
//     }

//     return children;
// };

const App = () => {
    return (
        <div className="wraper">
            <Router>
                <GlobalStyles />
                <Header />
                <Routes>
                    {/* <Route path="/" element={<Explore />} /> */}
                    {/* <Route path="/listed-domains" element={<ListedDomains />} /> */}
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