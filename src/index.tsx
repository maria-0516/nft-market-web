import React from 'react';
import ReactDOM from "react-dom/client";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, avalanche, bsc, fantom, gnosis, mainnet, optimism, polygon } from "wagmi/chains";
// import { UseWalletProvider } from './use-wallet/src'
import Provider from './context';
import '@1stquad/react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './assets/animated.css';
import './assets/style.scss';
import 'react-toastify/dist/ReactToastify.css'
import 'react-tabs/style/react-tabs.css';

import App from './components/app';
import { ToastContainer } from 'react-toastify';
import config from './config.json'
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const chains = [ mainnet, polygon, avalanche, arbitrum, gnosis, bsc, optimism, fantom ];
const projectId = 'YOUR_PROJECT_ID'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

root.render(
    <>
        <WagmiConfig client={wagmiClient}>
            <Provider>
                <App />
                <ToastContainer />
            </Provider>
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
)

