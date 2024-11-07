import { cart, removeFromCart, updateDeliveryOption } from '../../data/cart.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { getDeliveryOption, deliveryOptions } from '../../data/deliveryOptions.js'; // Import the delivery options logic

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const selectedDeliveryOption = getDeliveryOption(cartItem.deliveryOptionId || '1');
    const deliveryDate = dayjs().add(selectedDeliveryOption.deliveryDays, 'days').format('dddd, MMMM D');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container js-cart-item-container-${cartItem.id}">
        <div class="delivery-date">
          Delivery date: ${deliveryDate}
        </div>
        <div class="cart-item-details-grid">
          <img class="product-image" src="${cartItem.imageUrl}">

          <div class="cart-item-details">
            <div class="product-name">
              ${cartItem.name}
            </div>
            <div class="product-price">
              ${formatCurrency(cartItem.price)}
            </div>
            <div class="product-quantity js-product-quantity-${cartItem.id}">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link" data-product-id="${cartItem.id}">
                Add
              </span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${cartItem.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${generateDeliveryOptionsHTML(cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  // Render the cart summary HTML to the appropriate container
  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;
// Attach event listeners for "Delete" buttons to decrease quantity or remove item
document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId;
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;  // Decrease quantity by 1 if more than 1
    } else {
      removeFromCart(productId);  // Remove item from cart if quantity is 1
    }

    renderOrderSummary();       // Re-render the order summary
    renderPaymentSummary();     // Update the payment summary
  });
});


  // Attach event listeners for "Add" buttons to increase quantity
  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const cartItem = cart.find(item => item.id === productId);
      if (cartItem) {
        cartItem.quantity += 1;    // Increment the quantity by 1
        renderOrderSummary();      // Re-render the order summary
        renderPaymentSummary();    // Update the payment summary
      }
    });
  });

  // Attach event listeners for delivery option changes
  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);  // Update the delivery option
      renderOrderSummary();                               // Re-render the order summary
      renderPaymentSummary();                             // Update the payment summary
    });
  });
}

function generateDeliveryOptionsHTML(cartItem) {
  const selectedDeliveryOptionId = cartItem.deliveryOptionId || '1';

  return deliveryOptions.map(option => `
    <div class="delivery-option js-delivery-option" data-product-id="${cartItem.id}" data-delivery-option-id="${option.id}">
      <input 
        type="radio" 
        class="delivery-option-input" 
        name="delivery-option-${cartItem.id}" 
        ${option.id === selectedDeliveryOptionId ? 'checked' : ''}
      >
      <div>
        <div class="delivery-option-date">
          ${option.label} - ${formatCurrency(option.priceCents)} <!-- Format price here -->
        </div>
      </div>
    </div>
  `).join('');
}