import axios from 'axios'
import {keccak_256} from 'js-sha3';

const apiUrl = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
export const makeTokenId = (label: string) => BigInt('0x' + keccak_256(label)).toString();

export const getEnsCount = async () => {
	const now = Math.round(new Date().getTime() / 1000)
	const response = await axios.post(apiUrl, 
		{query: `{
			domains (
				where: {
					name: "eth",
					registration_: {
						expiryDate_gt: ${now}
					}
				}
			) {
				subdomainCount
			}
		}`},
		{
			"headers": {
				"accept": "application/json, multipart/mixed",
				"content-type": "application/json"
			}
		}
	);
	return response.data.data.domains[0].subdomainCount;
}

export const getEnsDomains = async (skip: number, limit: number) => {
	const now = Math.round(new Date().getTime() / 1000)
	if (skip>5000) skip = 5000;
	const response = await axios.post(apiUrl, 
		{query: `{
			domains (
				first: ${limit}
				skip: ${skip}
				orderBy: createdAt, 
				orderDirection: desc
				where: {
					labelName_not: null
					name_ends_with: ".eth"
					registration_: {
					expiryDate_gt: ${now}
					}
				}
			) {
				name
				owner {
					id
				}
				subdomainCount
				resolver {
					texts
				}
				registration {
					expiryDate
					registrant {
						id
					}
					registrationDate
					cost
				}
				createdAt
			}
		}`},
		{
			"headers": {
				"accept": "application/json, multipart/mixed",
				"content-type": "application/json"
			}
		}
	);
	const json = [] as any[]
	if (!!response?.data?.data?.domains) {
		for (let i of response.data.data.domains) {
			if (!!i.registration?.registrant?.id && !!i.owner?.id && !!i.registration?.expiryDate && i.registration?.expiryDate > now) {
				json.push({
					tokenId: makeTokenId(i.name.slice(0, -4)),
					owner: i.registration.registrant.id,
					creator: i.owner.id,
					// attributeKeys: i.resolver?.texts || [],
					// subdomainCount: i.subdomainCount,
					name: i.name,
					expires: Number(i.registration?.expiryDate || 0),
					created: Number(i.registration?.registrationDate || 0),
					cost: Number(i.registration?.cost || 0)
				})
				
			} else {
				// console.log('\t', 'excluded'.red, String(i.name).yellow, 'expires'.white, i.registration?.expiryDate ? D(i.registration.expiryDate) : '-')
			}
		}
	} else {
		console.log("no result")
	}
	return [json, response.data.data.domains.length===limit] as [Array<NFTData>, boolean]
}
export const getEnsDomainsByAddress = async (address: string, skip: number, limit: number) => {
	if (skip>5000) skip = 5000;
	const response = await axios.post(apiUrl, 
		{query: `{
			domains (
				first: ${limit}
				skip: ${skip}
				where: {
					registration_ : {
						registrant: "${address}"
					}
				}
				
		  	) {
				name
				owner {
					id
				}
				registration {
					expiryDate
					registrant {
						id
					}
					registrationDate
					cost
				}
				createdAt
			}
		}`},
		{
			"headers": {
				"accept": "application/json, multipart/mixed",
				"content-type": "application/json"
			}
		}
	);
	const json = [] as any[]
	const now = Math.round(new Date().getTime() / 1000)
	if (!!response?.data?.data?.domains) {
		for (let i of response.data.data.domains) {
			if (!!i.registration?.registrant?.id && !!i.owner?.id && !!i.registration?.expiryDate && i.registration?.expiryDate > now) {
				json.push({
					tokenId: makeTokenId(i.name.slice(0, -4)),
					owner: i.registration.registrant.id,
					creator: i.owner.id,
					// attributeKeys: i.resolver?.texts || [],
					// subdomainCount: i.subdomainCount,
					name: i.name,
					expires: Number(i.registration?.expiryDate || 0),
					created: Number(i.registration?.registrationDate || 0),
					cost: Number(i.registration?.cost || 0)
				})
				
			} else {
				// console.log('\t', 'excluded'.red, String(i.name).yellow, 'expires'.white, i.registration?.expiryDate ? D(i.registration.expiryDate) : '-')
			}
		}
	} else {
		console.log("no result")
	}
	return [json, response.data.data.domains.length===limit] as [Array<NFTData>, boolean]
}

export const getEnsDomainByName = async (name: string) => {
	const response = await axios.post(apiUrl, 
		{query: `{
			domains (
			where: {
				name: "${name}"  
			}
			  
		  ) {
			name
			owner {
			  id
			}
			registration {
			  expiryDate
			  registrant {
				id
			  }
			  registrationDate
			  cost
			}
			createdAt
		  }
		}`},
		{
			"headers": {
				"accept": "application/json, multipart/mixed",
				"content-type": "application/json"
			}
		}
	);
	if (!!response?.data?.data?.domains && response.data.data.domains[0]) {
		const i = response.data.data.domains[0]
		return {
			tokenId: makeTokenId(i.name.slice(0, -4)),
			owner: i.registration.registrant.id,
			creator: i.owner.id,
			// attributeKeys: i.resolver?.texts || [],
			// subdomainCount: i.subdomainCount,
			name: i.name,
			expires: Number(i.registration?.expiryDate || 0),
			created: Number(i.registration?.registrationDate || 0),
			cost: Number(i.registration?.cost || 0)
		}
	} else {
		console.log("no result")
	}
	return null
}