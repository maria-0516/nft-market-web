declare module '*.svg' {
	import * as React from 'react';
  
	export const ReactComponent: React.FunctionComponent<React.SVGProps<
	  SVGSVGElement
	> & { title?: string }>;
  
	const src: string;
	export default src;
}
  
declare interface Window {
	ethereum: 			any
}


declare interface NftBidData {
	bidder:			string
    price:			number
    timestamp:		number
}

declare interface NftMetaData {
    description?: 	string
    coverImage?: 	string
    image?: 		string
    external_url1?: string
    external_url2?: string
    external_url3?: string
    external_url4?: string
    external_url5?: string
    fee?:            number
    fee_recipent?: 	string
}

declare interface NFTData {
	collection:		string // =collection.address - collectionAddress
    tokenId:		string
    owner: 			string // owner address
	creator: 		string // creator address
    name: 			string
    attributes?:     {
        expiryDate: number
        created:    number,
        cost:       number,
        texts:      string[]
    }
    likes?: 		string[]
    expires?:           number
    created?:          number
    cost?:           number
    // isOffchain?: 	boolean
    // metadata?: 		NftMetaData
    // marketData: {
    //     seller?:     string
    //     price?:      string
    //     token?:      string
    //     created?:    number
    // }
}

declare interface OrderData {
    id:             number
    collection:     string
    label:          string
    assetId: 		string
    price: 			string
    token: 	        string
    seller: 	    string
    expires:        number
    bids?:			NftBidData[]
    status: 		'pending'|'cancel'|'success'
}

declare interface BidData {
    id:         number
    orderId:    number
    collection:     string
    label:          string
    assetId: 		string
    bidder:     string
    token:      string
    price:      number
    expires:    number
    timestamp:  number
}

// declare interface OrderData {
//     id:         number
//     seller:     string
//     assetId:    number
//     collection: string
//     acceptedToken: string
//     price:      number
//     expires:    number
//     bidCount:   number
//     timestamp:  number
// }