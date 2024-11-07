// Import necessary Firestore methods and Firebase
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

// Firebase configuration (same as in your main code file)
const firebaseConfig = {
  apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
  authDomain: "veggies-shop-79734.firebaseapp.com",
  projectId: "veggies-shop-79734",
  storageBucket: "veggies-shop-79734.appspot.com",
  messagingSenderId: "447883509262",
  appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cart data structure
export let cart = [];

// Function to load products from Firestore
export async function loadProducts() {
  const productsCollection = collection(db, 'Crops');
  const productSnapshot = await getDocs(productsCollection);

  const products = {};
  productSnapshot.forEach((doc) => {
    products[doc.id] = doc.data();
  });

  return products;
}

// Function to load cart from Firestore or localStorage
export function loadCart(callback) {
  // Assuming you have a 'cart' collection in Firestore. Otherwise, use localStorage or another source.
  const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(...savedCart);
  if (callback) callback();
}

// Function to save purchased items
export function savePurchasedItems() {
  localStorage.setItem('purchasedItems', JSON.stringify(cart));
}

// Function to clear the entire cart
export function clearCart() {
  cart = [];
  localStorage.removeItem('cart');
}

// Function to add a product to the cart
export async function addToCart(productId, quantity) {
  try {
    // Fetch product details from Firestore using the product ID
    const productRef = doc(db, 'Crops', productId);
    const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      const productData = productSnapshot.data();

      // Check if the product is already in the cart
      const cartItemIndex = cart.findIndex(item => item.id === productId);

      if (cartItemIndex >= 0) {
        // If product is already in cart, update its quantity
        cart[cartItemIndex].quantity += quantity;
      } else {
        // If product is not in cart, add a new entry
        const newCartItem = {
          id: productId,
          name: productData.productName,
          price: productData.productPrice, // Assuming product quantity represents price in this example
          quantity: quantity,
          imageUrl: productData.imageUrl // Store imageUrl to show in the cart if needed
        };

        cart.push(newCartItem);
      }

      console.log(`Added ${quantity} of ${productData.productName} to cart.`);
      localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage for persistence
    } else {
      console.error(`Product with ID ${productId} not found in Firestore.`);
    }
  } catch (error) {
    console.error("Error adding product to cart: ", error);
  }
}

// Function to update delivery option for a specific product in the cart
export function updateDeliveryOption(productId, deliveryOptionId) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.deliveryOptionId = deliveryOptionId;
  }
  localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart to localStorage
}

// Function to remove a product from the cart
export function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart to localStorage
}