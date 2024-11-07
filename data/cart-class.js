class Cart {
  cartItems;
  #localStorageKey;

  constructor(localStorageKey) {
    this.#localStorageKey = localStorageKey;
    this.#loadFromStorage();
  }

  // Load cart items from local storage, or initialize default items if none found
  #loadFromStorage() {
    this.cartItems = JSON.parse(localStorage.getItem(this.#localStorageKey)) || [];
  }

  // Save current cart state to local storage
  saveToStorage() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.cartItems));
  }

  // Add item to cart by productId
  addToCart(productId) {
    let matchingItem = this.cartItems.find(cartItem => cartItem.productId === productId);

    if (matchingItem) {
      matchingItem.quantity += 1;
    } else {
      this.cartItems.push({
        productId: productId,
        quantity: 1,
        deliveryOptionId: '1'
      });
    }

    this.saveToStorage();
  }

  // Remove item from cart by productId
  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(cartItem => cartItem.productId !== productId);
    this.saveToStorage();
  }

  // Update the delivery option for a specific product in the cart
  updateDeliveryOption(productId, deliveryOptionId) {
    let matchingItem = this.cartItems.find(cartItem => cartItem.productId === productId);
    if (matchingItem) {
      matchingItem.deliveryOptionId = deliveryOptionId;
      this.saveToStorage();
    }
  }

  // Helper method to get the cart items with product details from the provided product data
  getCartItemsWithDetails(products) {
    return this.cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      return {
        ...cartItem,
        name: product?.name,
        priceCents: product?.priceCents,
        rating: product?.rating
      };
    });
  }
}

// Initialize carts with their respective keys
const cart = new Cart('cart-oop');
const businessCart = new Cart('cart-business');

// Log cart data for testing
console.log(cart);
console.log(businessCart);
console.log(businessCart instanceof Cart);

// Sample product data
const products = [
  {
    "id": "1",
    "image": "./images/Kalabasa.jpg",
    "name": "Watermelon De Cadiz",
    "rating": {
      "stars": 4.5,
      "count": 87
    },
    "priceCents": 5000,
    "keywords": ["kalabasa", "fruit", "cadiz"]
  },
  {
    "id": "2",
    "image": "./images/Petchay.jpg",
    "name": "Snow Cabbage",
    "rating": {
      "stars": 4,
      "count": 127
    },
    "priceCents": 2095,
    "keywords": ["petchay", "vegetables", "cadiz"]
  },
  {
    "id": "3",
    "image": "./images/Sitaw.jpg",
    "name": "Green Beans",
    "rating": {
      "stars": 4.5,
      "count": 56
    },
    "priceCents": 799,
    "keywords": ["sitaw", "vegetables", "cadiz"]
  },
  {
    "id": "4",
    "image": "./images/Casava.jpg",
    "name": "Cassava",
    "rating": {
      "stars": 5,
      "count": 2197
    },
    "priceCents": 1899,
    "keywords": ["Casava", "vegetables", "cadiz"]
  },
  {
    "id": "5",
    "image": "./images/Corn.jpg",
    "name": "Corn",
    "rating": {
      "stars": 4,
      "count": 37
    },
    "priceCents": 2067,
    "keywords": ["Casava", "vegetables", "cadiz"]
  }
];

// Log cart items with product details
console.log(cart.getCartItemsWithDetails(products));
