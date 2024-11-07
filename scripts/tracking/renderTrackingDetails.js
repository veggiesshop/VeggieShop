async function renderTrackingDetails() {
    const products = await fetchProducts(); // Fetch products from products.json
  
    if (cart.length === 0) {
      console.error('Cart is empty.');
      return;
    }
  
    const trackingContainer = document.querySelector('.main');
    if (!trackingContainer) {
      console.error('Tracking container not found.');
      return;
    }
  
    // Clear any previous content
    trackingContainer.innerHTML = '';
  
    cart.forEach((cartItem) => {
      // Find the product in the fetched product data
      const product = products.find(product => product.id === cartItem.productId);
      if (!product) {
        console.error(`Product with ID ${cartItem.productId} not found.`);
        return;
      }
  
      const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
      if (!deliveryOption) {
        console.error(`Delivery option with ID ${cartItem.deliveryOptionId} not found.`);
        return;
      }
  
      // Calculate the delivery date
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days').format('dddd, MMMM D');
  
      // Create a new div for each cart item
      const cartItemHTML = `
        <div class="order-tracking">
          <a class="back-to-orders-link link-primary" href="./orders.html">View all orders</a>
          <div class="delivery-date">Arriving on ${deliveryDate}</div>
          <div class="product-info">
            <img class="product-image" 
                 src="${product.image}" 
                 onerror="this.onerror=null; this.src='http://127.0.0.1:5500/VeggiesShop/images/products/placeholder.jpg';" 
                 alt="${product.name}" />
            ${product.name}
          </div>
          <div class="product-info">Quantity: ${cartItem.quantity}</div>
          <div class="progress-labels-container">
            <div class="progress-label">Preparing</div>
            <div class="progress-label current-status">Shipped</div>
            <div class="progress-label">Delivered</div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar"></div>
          </div>
        </div>
      `;
  
      // Append the cart item HTML to the tracking container
      trackingContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });
  }
  