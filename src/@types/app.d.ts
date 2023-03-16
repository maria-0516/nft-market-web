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
    token:			string
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
    creator: 		string // creator address
    owner: 			string // owner address
	name: 			string
    attributes?:     {
        expiryDate: number
        created:    number,
        cost:       number,
        texts:      string[]
    }
    likes?: 		string[]
    isOffchain?: 	boolean
    metadata?: 		NftMetaData
    listed:         boolean
}

declare interface OrderData {
    collection:     string
    assetId: 		string
    name:           string
    price: 			string
    token: 	        string
    assetOwner: 	string
    expiresAt:      number
    bids?:			NftBidData[]
    status: 		'pending'|'cancel'|'success'
}