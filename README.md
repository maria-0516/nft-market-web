# CNS Frontend

```ts

const sendRawTx = async (_contract: any, method, params: any, value?: string) => {
	try {
		const _options = {} as any
		if (value) _options.value = value;
		const _estimation = await _contract.estimateGas[method](...params, _options);
		const tx = await _contract[method](...params, {gasLimit: _estimation.mul(2), ..._options});
		console.log('\t', method, tx.hash, 'success'.green);
		await tx.wait();
	} catch (error) {
		console.log('sendRawTx', method, error)
	}
}

const deployContract = async (name: string, args: Array<any>=[]) => {
	const _Contract = await ethers.getContractFactory(name)
	const _contract = await _Contract.deploy(...args)
	await _contract.deployed()
	console.log('\t', `${name}`, _contract.address.green)
	return _contract
}

async function main() {
	const [owner] = await ethers.getSigners();
	console.log("owner", owner.address)
	// saveAbis();
	// ERC20
	// const ERC20Token_ = await ethers.getContractFactory("Token");
	// const ERC20Token = await ERC20Token_.deploy(1e9);
	

	// for (var i = 1; i < 5; i++) {
	//     await NFT3.create(metadata_hashs[i]);
	// }


	// const weth_ = await ethers.getContractFactory("WETH");
	// const weth = await weth_.deploy();
	// await weth.deployed();

	//marketplace

	// const Marketplace_ = await ethers.getContractFactory("Marketplace");
	// const Marketplace = await Marketplace_.deploy(weth.address);
	// await Marketplace.deployed();

	// const token_ = await ethers.getContractFactory("Token");
	// const token = await token_.deploy(10000);
	// await token.deployed();

	const storefront = await deployContract("Storefront");

	

	const addresses = {
		// ERC20: ERC20Token.address,
		// NFT: {
		//     NFT1: NFT1.address,
		//     NFT2: NFT2.address,
		//     NFT3: NFT3.address,
		// },
		// Marketplace: Marketplace.address,
		// WETH: weth.address,
		// TestToken: token.address,
		storefront: storefront.address
	};
	await saveFiles("addresses.json", JSON.stringify(addresses, undefined, 4));

	await test(storefront);
}

const N =  (n: number, p = 18) => ethers.utils.parseUnits(String(n), p)
const ZERO = '0x0000000000000000000000000000000000000000'
const EXPIRES = Math.round(new Date().getTime() / 1000) + 86400 * 30
const currentTime = () => Math.round(new Date().getTime() / 1000)

const localnodeKeys = [
	"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
	"0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
	"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
	"0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
	"0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
	"0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
	"0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
	"0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
	"0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
	"0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897",
	"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
	"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
	"0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
	"0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa",
	"0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61",
	"0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
	"0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
	"0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
	"0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
]
	
const getAllOrders = async (storefront: any, page: number, limit: number) => {
	const orders = await storefront.getOrders(page, limit)
	return orders.map(i => ({id: Number(i[0]), label: i[1], price: i[6].toString()})).filter(i => i.id !=0 )
}

const getOrdersByAddress = async (storefront: any, address: string, page: number, limit: number) => {
	const ordersByOwner = await storefront.getOrdersByAddress(address, page, limit)
	return ordersByOwner.map(i => Number(i[0])).filter(i => i !=0 );
}

const getBidsByAddress = async (storefront: any, address: string, page: number, limit: number) => {
	const bids = await storefront.getBidsByAddress(address, page, limit)
	return bids.map(i => ({id: Number(i[0]), label: i[3], price: ethers.utils.formatUnits(i[7], 18)})).filter(i => i.id !=0 );
}

const test = async (storefront: any) => {
	try {
		const [owner] = await ethers.getSigners();
		
		// deploy NFT contracts
		const usdt = await deployContract("TetherToken", [N(1e8), "Tether USD", "USDT", 6]);
		const nft = await deployContract("NFT", ["test1 NFT", "t1NFT"]);


		// mint nft via NFT contracts
		const tokenIds = [
			{label: "bittrex", 				tokenId: "305638785357667841704819260044569792226553176877311822798918224005267718320"},  // update
			{label: "coindash", 			tokenId: "1047244300711308005502691544352853532897644948485530147806652033478270764633"}, // cancel
			// {label: "locations", 			tokenId: "217186629421343442058574315717344430350387817465866244494234513886299410962"},
			// {label: "generalatomics", 		tokenId: "44029076422232490676113501201379737341056420713462570111460414651147741889"},
			// {label: "chubbgroup", 			tokenId: "354332744511276740242662285504744784660696550027049856620094052210367967889"},
			// {label: "johnjohnjohn", 		tokenId: "721504116075778540988914843235400482006739517293910402816287200197276505111"},
			// {label: "digitalgov", 			tokenId: "173794838510765389710398181428030909850604475559401811567047620195722187011"},
			// {label: "cofounder", 			tokenId: "284164939948106997506135635840128783333225700218939186691846467039566093341"},
			// {label: "ilfattoquotidiano", 	tokenId: "253885747395429636230890330830742261025128284554244930512575486936917276822"},
			// {label: "nicefunblackpeople", 	tokenId: "684168767579123580215232683117056202536048369850128634938333879485821863336"},
			// {label: "vehicles", 			tokenId: "917414890432902783721787213875523745311415191652851227107046393306453733247"},
			// {label: "upgrade", 				tokenId: "429286934060636239444256046255241512105662385954349596568652644383873724621"},
			// {label: "coin777", 				tokenId: "130637526329616131658144818424303905943237629934140558972979359208001291518"},
			// {label: "sandbox", 				tokenId: "739560381641203212243126268464268963092240187523454903658234487877802199183"},
			// {label: "exrnnrxe", 			tokenId: "2457430117691765919161633848808611230996640439582757182395106923844202509"},
		];
		await sendRawTx(nft, "mintMultipleWithTokenId", ["https://localhost", tokenIds.map(i=>i.tokenId)]);

		// await sendRawTx(storefront, "addtoken", [usdt.address]);

		// await sendRawTx(nft, "approve", [storefront.address, tokenIds[0].tokenId]);
		// await sendRawTx(storefront, "createOrder", [nft.address, tokenIds[0].label, tokenIds[0].tokenId, ZERO, _price1, EXPIRES]);

		// const _price1 = N(10), _price2 = N(20), _price3 = N(30), _price4 = N(40);
		const _price1 = N(0.001), _price2 = N(0.002), _price3 = N(0.003), _price4 = N(0.004);

		for (let k = 0; k < tokenIds.length; k++) {
			await sendRawTx(nft, "approve", [storefront.address, tokenIds[k].tokenId]);
			await sendRawTx(storefront, "createOrder", [nft.address, tokenIds[k].label, tokenIds[k].tokenId, ZERO, _price1, EXPIRES]);
		}

		const addresses = {
			storefront: storefront.address,
			nft: nft.address,
			tokenIds: tokenIds
		};
		await saveFiles("addresses.json", JSON.stringify(addresses, undefined, 4));

		if (!conf.local) {
			const orderIds = await getAllOrders(storefront, 0, 20)
			console.log('orders', orderIds)
			await sendRawTx(storefront, "cancelOrder", [orderIds[1].id]);
			await sendRawTx(storefront, "updateOrder", [orderIds[0].id, _price4, EXPIRES]);

			console.log('orders', await getAllOrders(storefront, 0, 2))
			console.log('orders', await getAllOrders(storefront, 1, 2))
			console.log('orders by address', await getOrdersByAddress(storefront, owner.address, 0, 20))

			let _signer = null as any, _signer2 = null as any
			if (conf.local) {
				_signer = new ethers.Wallet(localnodeKeys[0], owner.provider)
				_signer2 = new ethers.Wallet(localnodeKeys[1], owner.provider)
			} else {
				_signer = new ethers.Wallet(conf.domainControllerKey, owner.provider)
				_signer2 = new ethers.Wallet(conf.adminKey, owner.provider)
			}
			
			console.log("signer1 balance ", ethers.utils.formatEther(await _signer.getBalance()))
			await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[0].id, _price1], _price1);
			await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[0].id, _price2], _price2);
			console.log("signer1 balance ", ethers.utils.formatEther(await _signer.getBalance()))
			await sendRawTx(storefront.connect(_signer2), "placeBid", [orderIds[0].id, _price3], _price3);
			console.log("signer1 balance ", ethers.utils.formatEther(await _signer.getBalance()))
			
			// await sendRawTx(storefront.connect(_signer), "placeBid", [orderIds[2].id, _price1], _price1);

			// console.log("signer2 balance ", ethers.utils.formatEther(await _signer2.getBalance()))
			// await sendRawTx(storefront.connect(_signer), "executeOrder", [orderIds[0].id, _price4], _price4);
			// console.log("signer1 balance ", ethers.utils.formatEther(await _signer.getBalance()).yellow)
			// console.log("signer2 balance ", ethers.utils.formatEther(await _signer2.getBalance()).yellow)

			// await sendRawTx(storefront, "acceptBid", [orderIds[2].id]);

			// console.log("owner balance ", ethers.utils.formatEther(await owner.getBalance()).yellow)
			// await sendRawTx(storefront, "withdraw", [ZERO, owner.address]);
			// console.log("owner balance ", ethers.utils.formatEther(await owner.getBalance()).yellow)
			// console.log("balance ", owner.address, ethers.utils.formatEther(await owner.getBalance()))

			// const trades = await storefront.getTrades(0, 10);
			// console.log('trades', trades.length)
		}
		
	} catch (error) {
		console.log('test', error)
	}
}

```