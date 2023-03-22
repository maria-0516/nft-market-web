import { ethers } from 'ethers';
// import { Contract, Provider, setMulticallAddress } from "ethers-multicall";
import config from '../config.json'

// const Abis = require('./contracts/abis.json');
import Addresses from './contracts/addresses.json';
import storefrontAbi from './contracts/storefrontAbi.json';

const supportChainId = config.chainId;
// const multicallAddress = "0x402C435EA85DFdA24181141De1DE66bad67Cdf12";
// setMulticallAddress(supportChainId, multicallAddress);

// const RPCS = {
//     1: config.rpc[0],
//     5: "https://rpc.ankr.com/eth_goerli",
//     // [config.chainId]: 'https://rpc.ftm.tools/'
//     // 4002: 'https://ftm-test.babylonswap.finance'
//     // 4: 'http://85.206.160.196'
//     // 1337: "http://localhost:7545",
//     // 31337: "http://localhost:8545/",
// };
// const providers = {
//     1: new ethers.providers.JsonRpcProvider(RPCS[1]),
//     5: new ethers.providers.JsonRpcProvider(RPCS[5]),
    // 4002: new ethers.providers.JsonRpcProvider(RPCS[4002])
    // 4: new ethers.providers.JsonRpcBatchProvider(RPCS[4])
    // [config.chainId]: new ethers.providers.JsonRpcBatchProvider(RPCS[config.chainId])
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337]),
// } as any;

// const provider = providers[supportChainId];
// const provider = new ethers.providers.Web3Provider(window.ethereum)
// const signer = provider.getSigner();

// const testToken = new ethers.Contract(Addresses.TestToken, Abis.ERC20, provider);

// const marketplaceContract = new ethers.Contract(Addresses.Marketplace, Abis.Marketplace, signer);

export const provider = new ethers.providers.JsonRpcProvider(config.rpc[0])
export const storefront = new ethers.Contract(Addresses.storefront, storefrontAbi, provider);

export const storefrontWithSigner = (ethereum: any) => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
    return new ethers.Contract(Addresses.storefront, storefrontAbi, signer);
}

export const tokens = {
    '0x0000000000000000000000000000000000000000': "ETH",
} as {[key: string]: string}
// const getNFTContract = (address: any) => new ethers.Contract(address, Abis.NFT, signer);
// const getTokenContract = (address: any) => {
//     return new ethers.Contract(address, Abis.ERC20, provider);
// };

// export {
//     supportChainId,
//     provider,
//     marketplaceContract,
//     storeFontContract,
//     testToken,
//     getNFTContract,
//     getTokenContract
// };
