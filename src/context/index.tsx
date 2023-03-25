import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
// import { useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import {
    // getNFTContract,
    // getTokenContract,
    // marketplaceContract,
    // storeFontContract,
    provider
} from '../contracts';
import { toBigNum } from '../utils';
// import {
//     GET_ALLNFTS,
//     GET_USERSINFO,
//     GET_COLLECTIONNFTS,
//     GET_ORDER,
//     GET_ACTIVITIES
// } from '../components/gql';
import addresses from '../contracts/contracts/addresses.json';
import Action from '../service';

import { translations } from '../components/language/translate';
// import { useWallet } from '../use-wallet/src';

const BlockchainContext = createContext({});

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state: any, { type, payload }: {type: any, payload: any}) {
    return {
        ...state,
        [type]: payload
    };
}

const INIT_STATE = {
    allNFT: [],
    collectionNFT: [],
    orderList: [],
    activities: [],
    usersInfo: {},
    provider: provider,
    auth: {
        isAuth: false,
        user: '',
        address: '',
        bio: '',
        image: '',
        bannerImage: ''
    },
    lang: 'en',
    fee: {
        buyer: 5,
        seller: 0
    },
    // currencies: Currency,
    addresses: addresses,
    search: '',
    loading: ''
};

export default function Provider({ children }: {children: any}) {
    // const location = useLocation();
    const [state, dispatch] = useReducer(reducer, INIT_STATE);
    // set language
    const setLanguage = (props: any) => {
        const { newLang } = props;
        dispatch({
            type: 'lang',
            payload: newLang
        });

        localStorage.setItem('lang', newLang);
    };

    const setFee = (props: any) => {
        const { buyer, seller } = props as {buyer: number, seller: number};
        dispatch({
            type: 'fee',
            payload: {
                buyer,
                seller
            }
        });
        // localStorage.setItem('fee', {buyer, seller});
    };

    const setSearch = (props: any) => {
        const {search} = props as {search: string}
        dispatch({
            type: 'search',
            payload: {
                search
            }
        })
        localStorage.setItem('search', search);
    }
    
    const setLoading = (props: any) => {
        
        const {loading} = props as {loading: string}
        dispatch({
            type: 'loading',
            payload: loading ? {loading} : null
        })
        localStorage.setItem('loading', loading);
    }

    const translateLang = (txt: any) => {
        return (translations as any)[state.lang][txt];
    };

    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [
                    state,
                    {
                        dispatch,
                        setLanguage,
                        translateLang,
                        setSearch,
                        setLoading,
                        setFee
                    }
                ],
                [
                    state,
                    dispatch,
                    setLanguage,
                    translateLang,
                ]
            )}>
            {children}
        </BlockchainContext.Provider>
    );
}
