// Import Firebase functions from SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { cart, addToCart, loadCart } from '../data/cart.js';
import { formatCurrency } from './utils/money.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
  authDomain: "veggies-shop-79734.firebaseapp.com",
  projectId: "veggies-shop-79734",
  storageBucket: "veggies-shop-79734.appspot.com",
  messagingSenderId: "447883509262",
  appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Store products globally so they can be accessed for search filtering
let productsList = [];

// Function to load products from Firestore
async function loadProductsFromCollection() {
  try {
    const productsCollection = collection(db, 'Crops');  // Use the 'Crops' collection
    const productSnapshot = await getDocs(productsCollection);  // Fetch the documents
    const products = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()  // Spread the document data and include document ID
    }));

    productsList = products;  // Save products globally
    renderProductsGrid(productsList);
  } catch (error) {
    console.error("Error loading products from Firestore: ", error);
  }
}

// Function to filter products based on search query
function filterProducts(searchQuery) {
  const lowerCaseQuery = searchQuery.toLowerCase();

  const filteredProducts = productsList.filter(product => {
    const productName = product.productName.toLowerCase();
    const productDescription = product.productDescription.toLowerCase();
    return productName.includes(lowerCaseQuery) || productDescription.includes(lowerCaseQuery);
  });

  renderProductsGrid(filteredProducts);
}

// Function to render products on the grid
function renderProductsGrid(products) {
  let productsHTML = '';

  products.forEach((product) => {
    // Generate the dropdown options based on product quantity
    let quantityOptionsHTML = '';

    for (let i = 1; i <= 10; i++) {
      const isDisabled = product.productQuantity < i ? 'disabled' : '';
      const strikeThrough = product.productQuantity < i ? 'text-decoration: line-through;' : '';

      quantityOptionsHTML += `
        <option value="${i}" ${isDisabled} style="${strikeThrough}">
          ${i} ${isDisabled ? '(Not available)' : ''}
        </option>
      `;
    }

    let stockStatusHTML = '';
    if (product.productQuantity === 0) {
      stockStatusHTML = '<span class="stock-status out-of-stock">Out of Stock</span>';
    } else if (product.productQuantity <= 5) {
      stockStatusHTML = '<span class="stock-status low-stock">Low Stock</span>';
    }

    const outOfStockClass = product.productQuantity === 0 ? 'out-of-stock' : '';

    productsHTML += `
      <div class="product-container ${outOfStockClass}">
        <div class="product-image-container">
          <img class="product-image" src="${product.imageUrl}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.productName}
        </div>

        <div class="product-Desc">
          ${product.productDescription}
        </div>

        <div class="product-quantity">
          ${product.productQuantity} ${stockStatusHTML}
        </div>

        <div class="product-price">
          ${formatCurrency(product.productPrice)}
        </div>

        <div class="product-quantity-container">
          <select class="js-product-quantity" ${product.productQuantity === 0 ? 'disabled' : ''}>
            ${quantityOptionsHTML}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart"
        data-product-id="${product.id}" ${product.productQuantity === 0 ? 'disabled' : ''}>
          ${product.productQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    `;
  });

  document.querySelector('.js-products-grid').innerHTML = productsHTML;

  function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });

    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
  }

  document.querySelectorAll('.js-add-to-cart')
    .forEach((button) => {
      button.addEventListener('click', async () => {
        const productId = button.dataset.productId;

        const productContainer = button.closest('.product-container');
        const quantitySelect = productContainer.querySelector('.js-product-quantity');
        const quantity = parseInt(quantitySelect.value);

        const productQuantity = parseInt(productContainer.querySelector('.product-quantity').textContent);

        if (quantity > productQuantity) {
          alert(`The selected quantity (${quantity}) exceeds the available stock (${productQuantity}).`);
          return;
        }

        if (!isNaN(quantity) && quantity > 0) {
          await addToCart(productId, quantity);

          updateCartQuantity();
        } else {
          console.error("Invalid quantity selected");
        }
      });
    });

  updateCartQuantity();
}

// Event listener for dynamic search functionality
document.querySelector('.search-bar').addEventListener('input', (event) => {
  const searchQuery = event.target.value;
  filterProducts(searchQuery); // Dynamically filter products as the user types
});

// Load cart and products from Firestore on page load
loadCart(() => {
  loadProductsFromCollection();
});