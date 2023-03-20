// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

library TransferHelper {
	function safeTransfer(address token, address to, uint value) internal {
		(bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
		require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
	}

	function safeTransferFrom(address token, address from, address to, uint value) internal {
		(bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
		require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
	}

	function safeTransferETH(address to, uint value) internal {
		(bool success,) = to.call{value:value}(new bytes(0));
		require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
	}
}


contract Storefront is Ownable, Pausable {
	struct Order {
		uint id; // // Order ID
		string label;
		address seller; // Owner of the NFT
		uint assetId;
		address collection;// NFT registry address
		address token;// accepted token for trading item
		uint price;// Price (in wei) for the published item
		uint expires;// Time when this sale ends
		uint timestamp;// Time when this sale ends
		address bidder;// Bidder address
		uint bidPrice;// Price for the bid in wei
		uint dealPrice; // non-zero, means success
	}

	// ORDER EVENTS
	event OrderCreated(
		uint id,
		address indexed seller,
		address indexed collection,
		uint indexed assetId,
		address token,
		uint price,
		uint expires
	);

	event OrderUpdated(uint id, uint price, uint expires);

	event OrderSuccessful(
		uint id,
		address indexed buyer,
		uint price
	);

	event OrderCancelled(uint id);

	// BID EVENTS
	event BidCreated(
		uint id,
		address indexed bidder,
		uint price
	);

	event BidUpdated(uint id, uint price);
	event BidAccepted(uint id);
	event BidCancelled(uint id);

	event BuyCreated(
		address indexed collection,
		uint indexed assetId,
		address indexed bidder,
		address seller,
		uint price
	);

	//using SafeERC20 for IERC20;

	// address public weth;
	mapping(address=>bool) public tokens;
	uint public lastOrderId = 10000001;
	// uint public constant MAX_BID_LIMIT = 100;

	mapping(uint => Order) public orderById; // orderId => Order
	mapping(uint => uint) public orderByTokenId; // tokenId => orderId
	mapping(uint => uint[]) public buckets; // timestamp => orderId[]
	mapping(address => uint[]) ordersByOwner; // address => orderId[]
	mapping(uint => Order) trades; // index => order
	uint public tradeCount;

	//mapping(address => uint[]) getOrdersByOwner; // address => orderId[]

	// From ERC721 registry assetId to Order (to avoid asset collision)
	// mapping(address => mapping(uint => Order)) public orderByAssetId;

	// From ERC721 registry assetId to Bid (to avoid asset collision)
	// mapping(address => mapping(uint => Bid)) public bidByOrderId;

	// 721 Interfaces
	bytes4 public constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

	event ChangedFeePerMillion(uint256 cutPerMillion);

    // Market fee on sales
    uint256 public cutPerMillion = 100000;
    uint256 public constant maxCutPerMillion = 300000; // 30% cut
    
    uint256 public royaltyPerMillion=0;
    address public treasury;
	/**
	 * @dev Initialize this contract. Acts as a constructor
	 */
	constructor() {
		// weth = _weth;
		// tokens.push(_weth);
	}

	

    /**
     * @dev Sets the share cut for the owner of the contract that's
     *  charged to the seller on a successful sale
     * @param _cutPerMillion - Share amount, from 0 to 99,999
     */
    function setOwnerCutPerMillion(uint256 _cutPerMillion) external onlyOwner {
        require(
            _cutPerMillion < maxCutPerMillion,
            "The owner cut should be between 0 and maxCutPerMillion"
        );

        cutPerMillion = _cutPerMillion;
        emit ChangedFeePerMillion(cutPerMillion);
    }
	// function setWETH(address _weth) public onlyOwner {
	// 	weth = _weth;
	// 	tokens.push(_weth);
	// }

	function setTreasury(address _treasury) public onlyOwner {
		treasury = _treasury;
	}
	
	function addtoken(address _token) public onlyOwner {
		tokens[_token] = true;
	}

	function removetoken(address _token) public onlyOwner {
		delete tokens[_token];
	}

	/**
	 * @dev Sets the paused failsafe. Can only be called by owner
	 * @param _setPaused - paused state
	 */
	function setPaused(bool _setPaused) public onlyOwner {
		return (_setPaused) ? _pause() : _unpause();
	}

	function verifyTokenId(string memory _name, uint _tokenId) public pure returns(bool) {
        return uint(keccak256(bytes(_name)))==_tokenId;
    }

	/**
	 * @dev Creates a new order
	 * @param _collection - Non fungible registry address
	 * @param _assetId - ID of the published NFT
	 * @param _token - accepted token to buy NFT
	 * @param _price - Price in Wei for the supported coin
	 * @param _expires - Duration of the order (in hours)
	 */
	function createOrder(address _collection, string memory _label, uint _assetId, address _token, uint _price, uint _expires) public whenNotPaused {
		// Check nft registry
		require(verifyTokenId(_label, _assetId), "Marketplace: invalid domain name");
		IERC721 nftRegistry = _requireERC721(_collection);
		require(nftRegistry.ownerOf(_assetId) == msg.sender, "Marketplace: Only the asset owner can create orders");
		require(_price > 0, "Marketplace: Price should be bigger than 0");
		require(_expires > block.timestamp + 1 minutes, "Marketplace: expires should be more than 1 minute");
		require(_expires <= block.timestamp + 180 days, "Marketplace: expires should be less than 180 days");
		if (_token!=address(0)) require(tokens[_token], "Marketplace: accept token must be whitelisted");
		// get NFT asset from seller
		nftRegistry.transferFrom(msg.sender, address(this), _assetId);

		// save order
		orderById[lastOrderId] = Order({
			id: lastOrderId,
			seller: msg.sender,
			collection: _collection,
			label: _label,
			assetId: _assetId,
			token: _token,
			price: _price,
			expires: _expires,
			timestamp: block.timestamp,
			bidder: address(0),
			bidPrice: 0,
			dealPrice: 0
		});
		orderByTokenId[_assetId] = lastOrderId;
		_deleteExpiredBucket();
		buckets[block.timestamp - block.timestamp % 10 days].push(lastOrderId);
		ordersByOwner[msg.sender].push(lastOrderId);
		emit OrderCreated(lastOrderId, msg.sender, _collection, _assetId, _token, _price, _expires);
		lastOrderId++;
	}

	/**
	 * @dev Cancel an already published order
	 *  can only be canceled by seller or the contract owner
	 * @param _orderId - ID of order
	 */
	function cancelOrder(uint _orderId) public whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
        require(_order.seller == msg.sender || msg.sender == owner(), "Marketplace: unauthorized sender");
        IERC721(_order.collection).transferFrom(address(this), msg.sender, _order.assetId);
		_deleteOrder(_order.seller, address(0), _orderId, _order.timestamp);
		if (_order.bidder!=address(0)) _refundBid(_order.bidder, _order.token, _order.bidPrice);
		emit OrderCancelled(_orderId);
	}

	/**
	 * @dev Update an already published order, can only be updated by seller
	 * @param _orderId - ID of the published NFT
	 * @param _price - price
	 * @param _expires - expires at
	 */
	function updateOrder(uint _orderId, uint _price, uint _expires) public whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
		require(_order.id != 0, "Marketplace: asset not published");
		require(_order.expires >= block.timestamp, "Marketplace: order expired");
		// Order storage _order = _validateOrder(_orderId);
        require(_order.seller == msg.sender || msg.sender == owner(), "Marketplace: unauthorized sender");
		require(_price > 0, "Marketplace: Price should be bigger than 0");
		require(_expires > block.timestamp + 1 minutes, "Marketplace: expires should be more than 1 minute");
		require(_expires <= block.timestamp + 180 days, "Marketplace: expires should be less than 30 days");
		// require(order.token == _token || order.bidCount==0, "Marketplace: order has bidders");
		// order.token = _token;
		orderById[_orderId].price = _price;
		orderById[_orderId].expires = _expires;

		emit OrderUpdated(_order.id, _price, _expires);
	}

	/**
	 * @dev Executes the sale for a published NFT and checks for the asset fingerprint
	 * @param _orderId - ID of order
	 * @param _price - Order price
	 */
	function executeOrder(uint _orderId, uint _price) public payable whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
		require(_order.price == _price, "Marketplace: invalid price"); // Check the execution price matches the order price
		if (_order.bidder!=address(0)) _refundBid(_order.bidder, _order.token, _order.bidPrice);
		_executeOrder(_orderId, msg.sender, _price);
		_deleteOrder(_order.seller, address(0), _orderId, _order.timestamp);
		emit OrderSuccessful(_orderId, msg.sender, _price);
	}

	/**
	 * @dev Places a bid for a published NFT and checks for the asset fingerprint
	 * @param _orderId - ID of the published NFT
	 * @param _price - Bid price in weth currency
	 */
	function placeBid(uint _orderId, uint _price) public payable whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
		require(_order.bidPrice==0 || _order.bidPrice < _price, "Marketplace: bid count reached limitation");
		if (_order.bidder==msg.sender) {
			uint _oldPrice = _order.bidPrice;
			if (_order.token == address(0)) {
				uint _value = _oldPrice + msg.value;
				require(_value >= _price, "Marketplace: bid count reached limitation");
				if (_value - _price > 1e14) { // 0.0001
					// refund extra
					TransferHelper.safeTransferETH(msg.sender, _value - _price);
				}
			} else {
				if (_oldPrice > _price) {
					TransferHelper.safeTransfer(_order.token, msg.sender, _oldPrice - _price);
				} else if (_oldPrice < _price) {
					TransferHelper.safeTransferFrom(_order.token, msg.sender, address(this), _price - _oldPrice);
				}
			}
		} else {
			if (_order.bidder!=address(0)) _refundBid(_order.bidder, _order.token, _order.bidPrice);
			if (_order.token == address(0)) {
				require(msg.value == _price, "Marketplace: invalid price");
			} else {
				TransferHelper.safeTransferFrom(_order.token, msg.sender, address(this), _price);
			}
            emit BidCreated(
                _orderId,
                msg.sender, // bidder
                _price
            );
			ordersByOwner[msg.sender].push(_orderId);
		}
		orderById[_orderId].bidder = msg.sender;
		orderById[_orderId].bidPrice = _price;

		emit BidUpdated(_orderId, _price);
	}

	/**
	 * @dev Cancel an already published bid, can only be canceled by seller or the contract owner
	 * @param _orderId - ID of the published NFT
	 */
	function cancelBid(uint _orderId) public whenNotPaused {
		Order memory _order = orderById[_orderId];
		require(_order.id != 0, "Marketplace: asset not published");
		require(_order.dealPrice==0, "Marketplace: order already processed");
		require(_order.bidder == msg.sender || msg.sender == owner(), "Marketplace: Unauthorized sender");
		_refundBid(_order.bidder, _order.token, _order.bidPrice);
		_order.bidder = address(0);
		_order.bidPrice = 0;
		emit BidCancelled(_orderId);
	}

	/**
	 * @dev Executes the sale for a published NFT by accepting a current bid
	 * @param _orderId - ID of order id
	 */
	function acceptBid(uint _orderId) public whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
		// item seller is the only allowed to accept a bid
		require(_order.seller == msg.sender, "Marketplace: unauthorized sender");
		_executeOrder(_orderId, _order.bidder, _order.bidPrice);
		_deleteOrder(_order.seller, _order.bidder, _orderId, _order.timestamp);
		emit BidAccepted(_orderId);
	}

	/**
	 * @dev fetch order list by page
	 * @param _page - page number, started from zero
	 * @param _limit - order count per a page
	 */
	function getOrders(uint _page, uint _limit) public view returns(Order[] memory _orders) {
		uint _lastBucket = block.timestamp - block.timestamp % 10 days;
		uint _startBucket = _lastBucket - 180 days; // max 30 days1
		// uint _start = _page * _limit;
		
		uint _skip = _page * _limit;
		uint _count = 0;

		_orders = new Order[](_limit);
		for (uint _bucket = _lastBucket; _bucket >= _startBucket; _bucket -= 10 days) {
			uint _countInBucket = buckets[_bucket].length;
			if (_countInBucket==0) continue ;
            
			for (uint k = 0; k < _countInBucket; k++) {
				Order memory _order = orderById[buckets[_bucket][k]];
				if (block.timestamp < _order.expires) {
					if (_skip > 0) {
						_skip--;
					} else if (_count < _limit) {
						_orders[_count++] = _order;
					} else {
						break;
					}
				}
			}
            if (_count==_limit) break;
		}
	}

	function getOrderByTokenId(uint _assetId) public view returns(Order memory _order) {
		uint _orderId = orderByTokenId[_assetId];
		_order = orderById[_orderId];
	}

	function getOrdersByAddress(address _owner, uint _page, uint _limit) public view returns(Order[] memory _orders) {
		uint _start = _page * _limit;
		uint _skip = 0;
		uint _index = 0;
		uint _count = ordersByOwner[_owner].length;
		_orders = new Order[](_limit);
		
		for (uint k = 0; k < _count; k++) {
			Order memory _order = orderById[ordersByOwner[_owner][k]];
			if (block.timestamp < _order.expires) {
				if (_skip < _start) {
					_skip++;
				} else if (_index < _limit) {
					_orders[_index++] = _order;
				} else {
					break;
				}
			}
		}
	}
	
	function withdraw(address _token, address to) public onlyOwner {
		require(to!=address(0), "Marketplace: should be non zero");		
		if (_token==address(0)) {
			(bool _result,) = to.call{value: address(this).balance}("");
			require(_result, "refund ethers");
		} else {
			TransferHelper.safeTransfer(_token, to, IERC20(_token).balanceOf(address(this)));
		}
	}

	
	function _requireERC721(address _collection) internal view returns (IERC721) {
		// require(_collection.isContract(), "The NFT Address should be a contract");
		require(IERC721(_collection).supportsInterface(_INTERFACE_ID_ERC721), "The NFT contract has an invalid ERC721 implementation");
		return IERC721(_collection);
	}

	function _deleteOrder(address _seller, address _buyer, uint _orderId, uint _timestamp) internal {
		uint _bucket = _timestamp - _timestamp % 10 days;
		// remove bucket
		uint _count = buckets[_bucket].length;
		if (_count==0) {
			delete buckets[_bucket];
		} else if (buckets[_bucket][_count - 1]==_orderId) {
			buckets[_bucket].pop();
		} else {
			for (uint k = 0; k < _count; k++) {
				if (buckets[_bucket][k]==_orderId) {
					buckets[_bucket][k] = buckets[_bucket][_count - 1];
					buckets[_bucket].pop();
					break;
				}
			}
		}
		// remove seller order
		_count = ordersByOwner[_seller].length;
		if (_count==0) {
			delete ordersByOwner[_seller];
		} else if (ordersByOwner[_seller][_count - 1]==_orderId) {
			ordersByOwner[_seller].pop();
		} else {
			for (uint k = 0; k < _count; k++) {
				if (ordersByOwner[_seller][k]==_orderId) {
					ordersByOwner[_seller][k] = ordersByOwner[_seller][_count - 1];
					ordersByOwner[_seller].pop();
					break;
				}
			}
		}
		// remove buyer order
		if (_buyer!=address(0)) {
			_count = ordersByOwner[_buyer].length;
			if (_count==0) {
				delete ordersByOwner[_buyer];
			} else if (ordersByOwner[_buyer][_count - 1]==_orderId) {
				ordersByOwner[_buyer].pop();
			} else {
				for (uint k = 0; k < _count; k++) {
					if (ordersByOwner[_buyer][k]==_orderId) {
						ordersByOwner[_buyer][k] = ordersByOwner[_buyer][_count - 1];
						ordersByOwner[_buyer].pop();
						break;
					}
				}
			}
		}
		
		delete orderByTokenId[orderById[_orderId].assetId];
		delete orderById[_orderId];
	}

	function getTradeCount() public view returns(uint) {
		return tradeCount;
	}

	function getTrades(uint page, uint limit) public view returns(Order[] memory _orders) {
		_orders = new Order[](limit);
		uint _start = page * limit;
		for (uint k = _start; k < _start + limit; k++) {
			_orders[k - _start] = trades[k];
		}
	}

	function _deleteExpiredBucket() internal {
		if (buckets[block.timestamp - 181 days].length!=0) delete buckets[block.timestamp - 181 days];
	}
	/**
	 * @dev Internal function gets Order by nftRegistry and assetId. Checks for the order validity
	 * @param _orderId - ID of order
	 */
	function _validateOrder(uint _orderId) internal view returns (Order memory order) {
		order = orderById[_orderId];
		require(order.id != 0, "Marketplace: asset not published");
		require(order.expires >= block.timestamp, "Marketplace: order expired");
	}

	function _executeOrder(uint _orderId, address _buyer, uint _price) internal {
		Order memory _order = orderById[_orderId];
		uint _fee = _price * cutPerMillion / 1e6;
		if (_order.token == address(0)) {
			TransferHelper.safeTransferETH(_order.seller, _price - _fee);
			if (treasury!=address(0)) TransferHelper.safeTransferETH(treasury, _fee);
		} else {
			TransferHelper.safeTransfer(_order.token, _order.seller, _price - _fee);
			if (treasury!=address(0)) TransferHelper.safeTransfer(treasury, _order.seller, _price - _fee);
		}
		IERC721(_order.collection).transferFrom(address(this), _buyer, _order.assetId);
		orderById[_orderId].dealPrice = _price;
		trades[tradeCount++] = _order; // address => orderId[]
	}
	
	function _refundBid(address _bidder, address _token, uint _price) internal {
		if (_token == address(0)) {
			TransferHelper.safeTransferETH(_bidder, _price);
		} else {
			TransferHelper.safeTransfer(_token, _bidder, _price);
		}
	}
}
