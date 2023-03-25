import { ethers } from 'ethers';
import config from '../config.json'
import Addresses from './contracts/addresses.json';
import storefrontAbi from './contracts/storefrontAbi.json';

export const provider = new ethers.providers.JsonRpcProvider(config.rpc[0])
export const storefront = new ethers.Contract(Addresses.storefront, storefrontAbi, provider);

export const storefrontWithSigner = (signer: any) => {
    return new ethers.Contract(Addresses.storefront, storefrontAbi, signer);
}
export const collectionWithSigner = (signer: any) => {
    return new ethers.Contract(Addresses.nft, ["function approve(address,uint256) external", "function getApproved(uint256) external view returns (address)"], signer);
}

export const toLower = (s: string) => String(s).toLowerCase() 

export const tokens = {
    '0x0000000000000000000000000000000000000000': "ETH",
} as {[key: string]: string}