import { getProduct, loadProductsFetch } from "../data/products.js";
import { orders } from "../data/orders.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import formatCurrency from "./utils/money.js";
import { addToCart } from "../data/cart.js";
import { calculateCartQuantity } from "../data/cart.js";

async function loadPage() {
  await loadProductsFetch();

  let ordersHTML = "";

  orders.forEach((order) => {
    const orderTimeString = dayjs(order.orderTime).format("MMMM D");

    ordersHTML += `
      <div class="orders-grid">
        <div class="order-container">
          <div class="order-header">
            <div class="order-header-left-section">
              <div class="order-date">
                <div class="order-header-label">Order Placed:</div>
                <div>${orderTimeString}</div>
              </div>
              <div class="order-total">
                <div class="order-header-label">Total:</div>
                <div>$${formatCurrency(order.totalCostCents)}</div>
              </div>
            </div>

            <div class="order-header-right-section">
              <div class="order-header-label">Order ID:</div>
              <div>${order.id}</div>
            </div>
          </div>

          <div class="order-details-grid">
            ${productsListHTML(order)}
          </div>
        </div>
      </div>
    `;
  });

  function productsListHTML(order) {
    let productsListHTML = "";

    order.products.forEach((productDetails) => {
      const product = getProduct(productDetails.productId);

      productsListHTML += `
        <div class="product-image-container">
          <img src="${product.image}">
        </div>
        <div class="product-details">
          <div class="product-name">
            ${product.name}
          </div>
          <div class="product-delivery-date">
            Arriving on: ${dayjs(productDetails.estimatedDeliveryTime).format(
              "MMMM D"
            )}
          </div>
          <div class="product-quantity">
            Quantity: ${productDetails.quantity}
          </div>
          <button class="buy-again-button button-primary js-buy-again"
            data-product-id="${product.id}">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>
        <div class="product-actions">
          <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
            <button class="track-package-button button-secondary">
              Track package
            </button>
          </a>
        </div>
      `;
    });

    return productsListHTML;
  }
  document.querySelector(".js-orders-grid").innerHTML = ordersHTML;

  const cartQuantity = calculateCartQuantity();

  document.querySelector(".js-amazon-header").innerHTML = `
    <div class="amazon-header-left-section">
      <a href="amazon.html" class="header-link">
        <img class="amazon-logo" src="images/amazon-logo-white.png" />
        <img
          class="amazon-mobile-logo"
          src="images/amazon-mobile-logo-white.png"
        />
      </a>
    </div>

    <div class="amazon-header-middle-section">
      <input class="search-bar" type="text" placeholder="Search" />

      <button class="search-button">
        <img class="search-icon" src="images/icons/search-icon.png" />
      </button>
    </div>

    <div class="amazon-header-right-section">
      <a class="orders-link header-link" href="orders.html">
        <span class="returns-text">Returns</span>
        <span class="orders-text">& Orders</span>
      </a>

      <a class="cart-link header-link" href="checkout.html">
        <img class="cart-icon" src="images/icons/cart-icon.png" />
        <div class="cart-quantity">${cartQuantity}</div>
        <div class="cart-text">Cart</div>
      </a>
    </div>
  `;

  document.querySelectorAll(".js-buy-again").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.productId, 1);

      // (Optional) display a message that the product was added,
      // then change it back after a second.
      button.innerHTML = "Added";
      setTimeout(() => {
        button.innerHTML = `
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        `;
      }, 1000);
    });
  });
}
loadPage();
