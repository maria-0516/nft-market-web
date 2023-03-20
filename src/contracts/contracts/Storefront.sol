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
	struct Bid {
		uint id;// Bid Id
		uint orderId;
		address collection;
		string label;
		uint assetId;
		address bidder;// Bidder address
		address token;// accepted token for trading item
		uint price;// Price for the bid in wei
		uint expires;// Time when this bid ends
		uint timestamp; // created time
	}
	
	struct Order {
		uint id; // // Order ID
		string label;
		address seller; // Owner of the NFT
		uint assetId;
		address collection;// NFT registry address
		address acceptedToken;// accepted token for trading item
		uint price;// Price (in wei) for the published item
		uint expires;// Time when this sale ends
		uint bidCount; // 
		uint timestamp; // created time
	}

	// ORDER EVENTS
	event OrderCreated(
		uint id,
		address indexed seller,
		address indexed collection,
		uint indexed assetId,
		address acceptedToken,
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
		address indexed collection,
		uint indexed assetId,
		address indexed bidder,
		uint price,
		uint expires
	);

	event BidUpdated(uint id, uint price, uint expires);
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
	mapping(address=>bool) public acceptedTokens;
	uint public lastOrderId = 10000001;
	uint public lastBidId = 20000001;
	uint public constant MAX_BID_LIMIT = 100;


	mapping(uint => Order) public orderById; // orderId => Order
	mapping(uint => uint) public orderByTokenId; // tokenId => orderId
	mapping(uint => uint[]) public buckets; // timestamp => orderId[]
	mapping(address => uint[]) ordersByOwner; // address => orderId[]
	
	
	mapping(uint => Bid) public bidById; // bidId => Bid
	mapping(uint => uint[]) public bidsByOrderId; // orderId => bidId[]
	mapping(address => uint[]) bidsByOwner; // address => orderId[]

	//mapping(address => uint[]) getOrdersByOwner; // address => orderId[]

	// From ERC721 registry assetId to Order (to avoid asset collision)
	// mapping(address => mapping(uint => Order)) public orderByAssetId;

	// From ERC721 registry assetId to Bid (to avoid asset collision)
	// mapping(address => mapping(uint => Bid)) public bidByOrderId;

	// 721 Interfaces
	bytes4 public constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

	event ChangedFeePerMillion(uint256 cutPerMillion);

    // Market fee on sales
    uint256 public cutPerMillion=0;
    uint256 public constant maxCutPerMillion = 100000; // 10% cut
    
    uint256 public royaltyPerMillion=0;
	/**
	 * @dev Initialize this contract. Acts as a constructor
	 */
	constructor() {
		// weth = _weth;
		// acceptedTokens.push(_weth);
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
	// 	acceptedTokens.push(_weth);
	// }

	function addAcceptedToken(address _acceptedToken) public onlyOwner {
		acceptedTokens[_acceptedToken] = true;
	}

	function removeAcceptedToken(address _acceptedToken) public onlyOwner {
		delete acceptedTokens[_acceptedToken];
	}

	/**
	 * @dev Sets the paused failsafe. Can only be called by owner
	 * @param _setPaused - paused state
	 */
	function setPaused(bool _setPaused) public onlyOwner {
		return (_setPaused) ? _pause() : _unpause();
	}

	function _deleteOrder(address _owner, uint _orderId, uint _timestamp) internal {
		uint _bucket = _timestamp - _timestamp % 1 days;
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
		_count = ordersByOwner[_owner].length;
		if (_count==0) {
			delete ordersByOwner[_owner];
		} else if (ordersByOwner[_owner][_count - 1]==_orderId) {
			ordersByOwner[_owner].pop();
		} else {
			for (uint k = 0; k < _count; k++) {
				if (ordersByOwner[_owner][k]==_orderId) {
					ordersByOwner[_owner][k] = ordersByOwner[_owner][_count - 1];
					ordersByOwner[_owner].pop();
					break;
				}
			}
		}
		
		delete orderByTokenId[orderById[_orderId].assetId];
		delete orderById[_orderId];
	}

	function _deleteBid(address _bidder, uint _orderId, uint _bidId) internal {
		uint _count = bidsByOwner[_bidder].length;
		if (_count==1) {
			delete bidsByOwner[_bidder];
		} else if (bidsByOwner[_bidder][_count - 1] == _bidId) {
			bidsByOwner[_bidder].pop();
		} else {
			for (uint k = 0; k < _count; k++) {
				if (bidsByOwner[_bidder][k] == _bidId) {
					bidsByOwner[_bidder][k] = bidsByOwner[_bidder][_count - 1];
					bidsByOwner[_bidder].pop();
					break;
				}
			}
		}
		// delete in bidsByOrderId
		_count = bidsByOrderId[_orderId].length;
		if (_count==1) {
			delete bidsByOrderId[_orderId];
		} else if (bidsByOrderId[_orderId][_count - 1] == _bidId) {
			bidsByOrderId[_orderId].pop();
		} else {
			for (uint k = 0; k < _count; k++) {
				if (bidsByOrderId[_orderId][k] == _bidId) {
					bidsByOrderId[_orderId][k] = bidsByOrderId[_orderId][_count - 1];
					bidsByOrderId[_orderId].pop();
					break;
				}
			}
		}
		// delete bidById
		delete bidById[_bidId];
	}
	function _deleteExpiredBucket() internal {
		if (buckets[block.timestamp - 31 days].length!=0) delete buckets[block.timestamp - 31 days];
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
	function verifyTokenId(string memory _name, uint _tokenId) public pure returns(bool) {
        return uint(keccak256(bytes(_name)))==_tokenId;
    }

	/**
	 * @dev Creates a new order
	 * @param _collection - Non fungible registry address
	 * @param _assetId - ID of the published NFT
	 * @param _acceptedToken - accepted token to buy NFT
	 * @param _price - Price in Wei for the supported coin
	 * @param _expires - Duration of the order (in hours)
	 */
	function createOrder(address _collection, string memory _label, uint _assetId, address _acceptedToken, uint _price, uint _expires) public whenNotPaused {
		// Check nft registry
		require(verifyTokenId(_label, _assetId), "Marketplace: invalid domain name");
		IERC721 nftRegistry = _requireERC721(_collection);
		require(nftRegistry.ownerOf(_assetId) == msg.sender, "Marketplace: Only the asset owner can create orders");
		require(_price > 0, "Marketplace: Price should be bigger than 0");
		require(_expires > block.timestamp + 1 minutes, "Marketplace: expires should be more than 1 minute");
		require(_expires <= block.timestamp + 180 days, "Marketplace: expires should be less than 180 days");
		if (_acceptedToken!=address(0)) require(acceptedTokens[_acceptedToken], "Marketplace: accept token must be whitelisted");
		// get NFT asset from seller
		nftRegistry.transferFrom(msg.sender, address(this), _assetId);

		// save order
		orderById[lastOrderId] = Order({
			id: lastOrderId,
			seller: msg.sender,
			collection: _collection,
			label: _label,
			assetId: _assetId,
			acceptedToken: _acceptedToken,
			price: _price,
			bidCount: 0,
			expires: _expires,
			timestamp: block.timestamp
		});
		orderByTokenId[_assetId] = lastOrderId;
		_deleteExpiredBucket();
		buckets[block.timestamp - block.timestamp % 10 days].push(lastOrderId);
		ordersByOwner[msg.sender].push(lastOrderId);
		emit OrderCreated(lastOrderId, msg.sender, _collection, _assetId, _acceptedToken, _price, _expires);
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

		_deleteOrder(_order.seller, _orderId, _order.timestamp);
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
		require(_expires <= block.timestamp + 30 days, "Marketplace: expires should be less than 30 days");
		// require(order.acceptedToken == _acceptedToken || order.bidCount==0, "Marketplace: order has bidders");
		// order.acceptedToken = _acceptedToken;
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
		/// Check the execution price matches the order price
		require(_order.price == _price, "Marketplace: invalid price");
		uint _fee = _price * cutPerMillion / 1e6;
		if (_order.acceptedToken == address(0)) {
			require(_order.price == msg.value, "Marketplace: invalid price");
			TransferHelper.safeTransferETH(_order.seller, _price - _fee);
		} else {
			TransferHelper.safeTransferFrom(_order.acceptedToken, msg.sender, address(this), _price);
			TransferHelper.safeTransfer(_order.acceptedToken, _order.seller, _price - _fee);
		}
		IERC721(_order.collection).transferFrom(address(this), msg.sender, _order.assetId);
		_deleteOrder(_order.seller, _orderId, _order.timestamp);
		emit OrderSuccessful(_orderId, msg.sender, _price);
	}

	/**
	 * @dev Places a bid for a published NFT and checks for the asset fingerprint
	 * @param _orderId - ID of the published NFT
	 * @param _price - Bid price in weth currency
	 * @param _expires - Bid expiration time
	 */
	function placeBid(uint _orderId, uint _price, uint _expires) public payable whenNotPaused {
		Order memory _order = _validateOrder(_orderId);
		if (_expires > _order.expires) _expires = _order.expires;

		uint _oldBidId;
		for (uint k = 0; k < bidsByOwner[msg.sender].length; k++) {
			if (bidById[bidsByOwner[msg.sender][k]].orderId == _orderId) {
				_oldBidId = bidsByOwner[msg.sender][k];
				break;
			}
		}
		if (_oldBidId!=0) {
			uint _oldPrice = bidById[_oldBidId].price;
			if (_order.acceptedToken == address(0)) {
				uint _value = _oldPrice + msg.value;
				require(_value >= _price, "Marketplace: bid count reached limitation");
				if (_value - _price > 1e14) { // 0.0001
					// refund extra
					TransferHelper.safeTransferETH(msg.sender, _value - _price);
				}
			} else {
				if (_oldPrice > _price) {
					TransferHelper.safeTransfer(_order.acceptedToken, msg.sender, _oldPrice - _price);
				} else if (_oldPrice < _price) {
					TransferHelper.safeTransferFrom(_order.acceptedToken, msg.sender, address(this), _price - _oldPrice);
				}
			}
			bidById[_oldBidId].price = _price;
			bidById[_oldBidId].expires = _expires;
            emit BidUpdated(_oldBidId, _price, _expires);
		} else {
			require(_order.bidCount < MAX_BID_LIMIT, "Marketplace: bid count reached limitation");
			require(bidsByOwner[msg.sender].length < MAX_BID_LIMIT, "Marketplace: bid count reached limitation");

			if (_order.acceptedToken == address(0)) {
				require(msg.value == _price, "Marketplace: invalid price");
			} else {
				TransferHelper.safeTransferFrom(_order.acceptedToken, msg.sender, address(this), _price);
			}
			_order.bidCount++;
			bidById[lastBidId] = Bid({
				id: lastBidId,
				orderId: _orderId,
				collection: _order.collection,
				label: _order.label,
				assetId: _order.assetId,
				bidder: msg.sender,
				token: _order.acceptedToken,
				price: _price,
				expires: _expires,
				timestamp: block.timestamp
			});
			bidsByOrderId[_orderId].push(lastBidId);
			bidsByOwner[msg.sender].push(lastBidId);

            emit BidCreated(
                lastBidId,
                _order.collection,
                _order.assetId,
                msg.sender, // bidder
                _price,
                _expires
            );
            lastBidId++;
		}

		
	}

	/**
	 * @dev Cancel an already published bid, can only be canceled by seller or the contract owner
	 * @param _bidId - ID of the published NFT
	 */
	function cancelBid(uint _bidId) public whenNotPaused {
		Bid memory _bid = bidById[_bidId];
		require(_bid.id != 0, "Marketplace: invalid bid id");
		// Order memory _order = orderById[_bid.orderId];
		// require(_order.id != 0, "Marketplace: invalid bid id");
		require(_bid.bidder == msg.sender || msg.sender == owner(), "Marketplace: Unauthorized sender");
		// refund bid amount
		if (_bid.token == address(0)) {
			TransferHelper.safeTransferETH(_bid.bidder, _bid.price);
		} else {
			TransferHelper.safeTransfer(_bid.token, _bid.bidder, _bid.price);
		}
		_deleteBid(_bid.bidder, _bid.orderId, _bidId);
		emit BidCancelled(_bidId);
	}

	/**
	 * @dev Executes the sale for a published NFT by accepting a current bid
	 * @param _bidId - ID of bid
	 */
	function acceptBid(uint _bidId) public whenNotPaused {
		Bid memory _bid = bidById[_bidId];
		require(_bid.id != 0, "Marketplace: bid invalid");
		require(_bid.expires > block.timestamp, "Marketplace: bid expired");
		Order memory _order = _validateOrder(_bid.orderId);
		// item seller is the only allowed to accept a bid
		require(_order.seller == msg.sender, "Marketplace: unauthorized sender");
		uint _fee = _bid.price * cutPerMillion / 1e6;
		if (_bid.token == address(0)) {
			TransferHelper.safeTransferETH(_order.seller, _bid.price - _fee);
		} else {
			TransferHelper.safeTransfer(_bid.token, _order.seller, _bid.price - _fee);
		}
		IERC721(_order.collection).transferFrom(address(this), _bid.bidder, _order.assetId);
		_deleteOrder(_order.seller, _bid.orderId, _order.timestamp);
		_deleteBid(_bid.bidder, _bid.orderId, _bidId);
		emit BidAccepted(_bidId);
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
	
	function getBidCountByAddress(address _owner) public view returns(uint) {
		return bidsByOwner[_owner].length;
	}

	// if bid expires is zero,  it means order is invalid.
	function getBidsByAddress(address _owner, uint _page, uint _limit) public view returns(Bid[] memory _bids) {
		// uint _start = _page * _limit;
		uint _skip = _page * _limit;
		uint _index = 0;
		uint _count = bidsByOwner[_owner].length;
		_bids = new Bid[](_limit);
		
		for (uint k = 0; k < _count; k++) {
			Bid memory _bid = bidById[bidsByOwner[_owner][k]];
			if (block.timestamp < _bid.expires) {
				if (_skip > 0) {
					_skip--;
				} else if (_index < _limit) {
					Order memory _order = orderById[_bid.orderId];
					if (_order.id==0 || _order.expires < block.timestamp) {
						_bid.expires = 0;
					}
					_bids[_index++] = _bid;
				} else {
					break;
				}
			}
		}
	}

	function getBidsByOrderId(uint _orderId, uint _page, uint _limit) public view returns(Bid[] memory _bids) {
		// uint _start = _page * _limit;
		uint _skip = _page * _limit;
		uint _index = 0;
		uint _count = bidsByOrderId[_orderId].length;
		_bids = new Bid[](_limit);
		
		for (uint k = 0; k < _count; k++) {
			Bid memory _bid = bidById[bidsByOrderId[_orderId][k]];
			if (block.timestamp < _bid.expires) {
				if (_skip > 0) {
					_skip--;
				} else if (_index < _limit) {
					_bids[_index++] = _bid;
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
}
