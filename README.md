# CNS Frontend

```ts
const getAllOrders = async (storefront: any, page: number, limit: number) => {
	const orders = await storefront.getOrders(page, limit)
	return orders.map(i => ({id: Number(i[0]), price: i[5]})).filter(i => i.id !=0 )
}

const getOrdersByAddress = async (storefront: any, address: string, page: number, limit: number) => {
	const ordersByOwner = await storefront.getOrdersByAddress(address, page, limit)
	return ordersByOwner.map(i => Number(i[0])).filter(i => i !=0 );
}

const getBidsByAddress = async (storefront: any, address: string, page: number, limit: number) => {
	const bids = await storefront.getBidsByAddress(address, page, limit)
	return bids.map(i => ({id: Number(i[0]), /* address: i[2],  */price: ethers.utils.formatUnits(i[4], 18)})).filter(i => i.id !=0 );
}

const test = async (storefront: any) => {
	try {
		const [owner] = await ethers.getSigners();
		
		// deploy NFT contracts
		const usdt = await deployContract("TetherToken", [N(1e8), "Tether USD", "USDT", 6]);
		const nft = await deployContract("NFT", ["test1 NFT", "t1NFT"]);


		// mint nft via NFT contracts
		const tokenIds = [
			"305638785357667841704819260044569792226553176877311822798918224005267718320",
			"1047244300711308005502691544352853532897644948485530147806652033478270764633",
			"217186629421343442058574315717344430350387817465866244494234513886299410962",
			"44029076422232490676113501201379737341056420713462570111460414651147741889",
			"354332744511276740242662285504744784660696550027049856620094052210367967889",
			"721504116075778540988914843235400482006739517293910402816287200197276505111",
			"173794838510765389710398181428030909850604475559401811567047620195722187011",
			"284164939948106997506135635840128783333225700218939186691846467039566093341",
			"253885747395429636230890330830742261025128284554244930512575486936917276822",
			"684168767579123580215232683117056202536048369850128634938333879485821863336",
			"917414890432902783721787213875523745311415191652851227107046393306453733247",
			"429286934060636239444256046255241512105662385954349596568652644383873724621",
			"130637526329616131658144818424303905943237629934140558972979359208001291518",
			"739560381641203212243126268464268963092240187523454903658234487877802199183",
			"2457430117691765919161633848808611230996640439582757182395106923844202509",
		];
		await sendRawTx(nft, "mintMultipleWithTokenId", ["https://localhost", tokenIds]);
		
		

		

		await sendRawTx(storefront, "addAcceptedToken", [usdt.address]);

		await sendRawTx(nft, "approve", [storefront.address, tokenIds[0]]);
		await sendRawTx(storefront, "createOrder", [nft.address, tokenIds[0], ZERO, N(0.001), EXPIRES]);
		for (let k = 1; k < tokenIds.length; k++) {
			await sendRawTx(nft, "approve", [storefront.address, tokenIds[k]]);
			await sendRawTx(storefront, "createOrder", [nft.address, tokenIds[k], ZERO, N(0.001), EXPIRES]);
		}

		const addresses = {
			storefront: storefront.address,
			nft: nft.address,
			tokenIds: tokenIds
		};
		await saveFiles("addresses.json", JSON.stringify(addresses, undefined, 4));

		if (conf.local) {
			// const now = currentTime()
			// const _date = now - now % 86400;
			// for (let k = 0; k < 5 ; k++) {
			// 	const _buckets = await storefront.buckets(_date, k)
			// 	const _orders = await storefront.orderById(_buckets)
			// 	console.log('_buckets', _buckets)
			// 	console.log('_orders', _orders)
			// }

			const orderIds = await getAllOrders(storefront, 0, 20)
			console.log('orders', orderIds)

			await sendRawTx(storefront, "cancelOrder", [orderIds[orderIds.length - 1].id]);
			await sendRawTx(storefront, "updateOrder", [orderIds[0].id, N(0.0015), EXPIRES]);
			

			console.log('orders', await getAllOrders(storefront, 0, 10))
			console.log('orders', await getAllOrders(storefront, 1, 10))
			console.log('orders by address', await getOrdersByAddress(storefront, owner.address, 0, 20))

			let _signer = null as any
			if (conf.local) {
				_signer = new ethers.Wallet(localnodeKeys[0], owner.provider)
			} else {
				_signer = new ethers.Wallet(conf.domainControllerKey, owner.provider)
			}
			// for (let k = 0; k < localnodeKeys.length; k++) {
			// 	_signers.push(new ethers.Wallet(localnodeKeys[k], owner.provider))
			// }

			for (let k = 1; k < orderIds.length - 1; k++) { // 
				await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[k].id, N(0.001), EXPIRES], N(0.001));
			}
			console.log("balance ", _signer.address, ethers.utils.formatEther(await _signer.getBalance()))
			await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[1].id, N(0.0009), EXPIRES]);
			
			const bids1_1 = await getBidsByAddress(storefront, _signer.address, 0, 2)
			console.log('bids_1', bids1_1)
			console.log("balance ", _signer.address, ethers.utils.formatEther(await _signer.getBalance()))
			
			await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[1].id, N(0.0011), EXPIRES], N(0.0002));
			const bids1_2 = await getBidsByAddress(storefront, _signer.address, 0, 2)
			console.log('bids_2', bids1_2)
			console.log("balance ", _signer.address, ethers.utils.formatEther(await _signer.getBalance()))
			await sendRawTx(storefront.connect(_signer), "cancelBid", [bids1_2[0].id]);

			await sendRawTx(storefront.connect(_signer), "executeOrder", [orderIds[0].id, N(0.0015)], N(0.0015));
			console.log('executeOrder', await getAllOrders(storefront, 0, 20))

			await sendRawTx(storefront, "acceptBid", [bids1_2[1].id]);

			const bidCount = await storefront.getBidCountByAddress(_signer.address);
			console.log('bidCount', bidCount)
			const bids1 = await getBidsByAddress(storefront, _signer.address, 0, 5)
			console.log('bids - 1', bids1)
			const bids2 = await getBidsByAddress(storefront, _signer.address, 1, 5)
			console.log('bids - 2', bids2)
			const bids3 = await getBidsByAddress(storefront, _signer.address, 2, 5)
			console.log('bids - 3', bids3)

			console.log("balance ", owner.address, ethers.utils.formatEther(await owner.getBalance()))
			await sendRawTx(storefront, "withdraw", [ZERO, owner.address]);
			console.log("balance ", owner.address, ethers.utils.formatEther(await owner.getBalance()))
		}
		
	} catch (error) {
		console.log('test', error)
	}
}
```