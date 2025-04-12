import { cart, removeFromCart, calculateCartQuantity, updateQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import formatCurrency from './utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions } from '../data/deliveryOptions.js';

let cartSummaryHTML = '';

const today = dayjs();
const deliveryDate = today.add(7, 'days');
console.log(deliveryDate.format('dddd, MMMM D'));

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct;

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  const deliveryOptionId = cartItem.deliveryOptionId;

  let deliveryOption;

  deliveryOptions.forEach((option) => {
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
    }
  })

  const today = dayjs();
  const deliveryDate = today.add(
    deliveryOption.deliveryDays,
    'days'
  );
  const dateString = deliveryDate.format(
    'dddd, MMMM D'
  );

  cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image"
          src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity js-product-quantity" data-product-id="${matchingProduct.id}">
            <span>
              Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
              Update
            </span>
            <input class="quantity-input js-quantity-input-${matchingProduct.id}" data-product-id="${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${matchingProduct.id}">Save</span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
  `;
});

function deliveryOptionsHTML(matchingProduct, cartItem) {

  let html = ``

  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays,
      'days'
    );
    const dateString = deliveryDate.format(
      'dddd, MMMM D'
    );

    const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      : `${formatCurrency(deliveryOption.priceCents)} -`;
    
      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
    
      html +=
    `
    <div class="delivery-option">
      <input type="radio"
      ${isChecked ? 'checked' : ''} 
        class="delivery-option-input"
        name="delivery-option-${matchingProduct.id}">
      <div>
        <div class="delivery-option-date">
          ${dateString}
        </div>
        <div class="delivery-option-price">
          ${priceString} Shipping
        </div>
      </div>
    </div>
    `
  });

  return html;
}

document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

function validateQuantityInput(productId, newQuantity) {
  if (newQuantity >= 0 && newQuantity < 1000) {
    updateQuantity(productId, newQuantity);
    updateCartQuantity();

    document.querySelector(`.js-quantity-label-${productId}`).innerHTML = newQuantity;
  }
}

function updateCartQuantity() {
  let cartQuantity = calculateCartQuantity();
  
  document.querySelector('.js-checkout-cart-quantity').innerHTML = `${cartQuantity} items`
};

updateCartQuantity();

document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const {productId} = link.dataset;
    removeFromCart(productId);
    updateCartQuantity();

    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    container.remove();
  });
});

document.querySelectorAll('.js-update-link').forEach((link) => {
  link.addEventListener('click', () => {
    const {productId} = link.dataset;

    document.querySelector(`.js-cart-item-container-${productId}`).classList.add('is-editing-quantity');
  });
});

document.querySelectorAll('.js-save-quantity-link').forEach((link) => {
  link.addEventListener('click', () => {
    const {productId} = link.dataset; 

    document.querySelector(`.js-cart-item-container-${productId}`).classList.remove('is-editing-quantity');

    const input = document.querySelector(`.js-quantity-input-${productId}`);

    let newQuantity = Number(input.value);

    validateQuantityInput(productId, newQuantity)
  });
});

document.querySelectorAll('.js-product-quantity').forEach((product) => {
  product.addEventListener('keydown', (event) => {
    const {productId} = product.dataset;

    const input = document.querySelector(`.js-quantity-input-${productId}`);

    let newQuantity = Number(input.value);

    if (event.key === 'Enter') {
      validateQuantityInput(productId, newQuantity)
      document.querySelector(`.js-cart-item-container-${productId}`).classList.remove('is-editing-quantity');
    }
  })
})
