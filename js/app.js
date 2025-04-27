let API_URL = "http://51.38.232.174:3001";
let TOKEN = "";

let pizzasContainer = document.querySelector(".pizzas-wrapper");
let basketEmpty = document.querySelector(".empty-basket");
let basketFull = document.querySelector(".baskets-with-pizza");
let orderModal = document.querySelector(".order-modal-wrapper");
let orderButton = document.querySelector(".new-order-btn");
let basketTitle = document.querySelector(".basket-title");

basketData = [];
basketProducts = [];
updateBasket();


function registerUser() {
  console.log("Attempting user registration...");
  return fetch(API_URL + "/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Jody",
      lastName: "Cat",
      email: "jody@cat.best",
      password: "iamthebestcat-Jody"
    })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => {
        console.warn("Registration failed:", err.message || res.status);
        return null;
      });
    }
    return res.json();
  });
}

function loginUser() {
  console.log("Attempting user login...");
  return fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jody@cat.best",
      password: "iamthebestcat-Jody"
    })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => {
        throw new Error("Login failed: " + (err.message || res.status));
      });
    }
    return res.json();
  });
}

function loadProducts() {
  console.log("Loading products...");
  fetch(API_URL + "/products")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load products: " + res.status);
      return res.json();
    })
    .then(products => {
      console.log("Products loaded:", products);
      pizzasContainer.innerHTML = "";
      for (let i = 0; i < products.length; i++) {
        let pizza = createPizza(products[i]);
        pizzasContainer.appendChild(pizza);
      }
    })
    .catch(err => {
      console.error("Error loading products:", err);
    });
}

window.addEventListener("DOMContentLoaded", function() {
    if (orderModal) orderModal.style.display = "none";
  if (!pizzasContainer) {
    console.error("ERROR: Container '.pizzas-wrapper' not found in the DOM!");
    return;
  }
  pizzasContainer.innerHTML = "";

  registerUser()
    .then(() => loginUser())
    .then(data => {
      TOKEN = data.access_token;
      console.log("Login success, token:", TOKEN);
      loadProducts();
    })
    .catch(err => {
      console.error("Error during registration or login:", err.message);
      alert("Erreur : " + err.message);
    });
});

function createPizza(pizzaData) {
  let pizza = document.createElement("div");
  pizza.className = "pizza-item";

  let img = document.createElement("img");
  img.className = "pizza-picture";
  img.src = pizzaData.image;
  img.alt = pizzaData.name;

  let addToCart = document.createElement("span");
  addToCart.className = "add-to-cart-btn";

  let cartIcon = document.createElement("img");
  cartIcon.src = "./images/carbon_shopping-cart-plus.svg";
  addToCart.appendChild(cartIcon);
  addToCart.appendChild(document.createTextNode("Ajouter au panier"));

  let quantitySection = document.createElement("span");
  quantitySection.className = "select-items-btn";
  quantitySection.style.display = "none";

  let minus = document.createElement("button");
  minus.innerHTML = "-";

  let value = document.createElement("span");
  value.className = "value";
  value.innerHTML = "1";

  let plus = document.createElement("button");
  plus.innerHTML = "+";

  quantitySection.appendChild(minus);
  quantitySection.appendChild(value);
  quantitySection.appendChild(plus);

  let infos = document.createElement("ul");
  infos.className = "pizza-infos";

  let nameItem = document.createElement("li");
  nameItem.className = "pizza-name";
  nameItem.innerHTML = pizzaData.name;
  nameItem.setAttribute("uuid", pizzaData.id);

  let priceItem = document.createElement("li");
  priceItem.className = "pizza-price";
  priceItem.innerHTML = "$" + pizzaData.price;

  infos.appendChild(nameItem);
  infos.appendChild(priceItem);

  addToCart.addEventListener("click", function() {
    addToCart.style.display = "none";
    quantitySection.style.display = "flex";

    basketProducts.push({
      uuid: pizzaData.id,
      quantity: 1
    });

    basketData.push({
      name: pizzaData.name,
      price: pizzaData.price,
      image: pizzaData.image,
      uuid: pizzaData.id,
      quantity: 1
    });

    updateBasket();
  });

  plus.addEventListener("click", function() {
    value.innerHTML = parseInt(value.innerHTML) + 1;
    basketProducts.find(p => p.uuid == pizzaData.id).quantity++;
    basketData.find(p => p.uuid == pizzaData.id).quantity++;
    updateBasket();
  });

  minus.addEventListener("click", function() {
    if (parseInt(value.innerHTML) > 1) {
      value.innerHTML = parseInt(value.innerHTML) - 1;
      basketProducts.find(p => p.uuid == pizzaData.id).quantity--;
      basketData.find(p => p.uuid == pizzaData.id).quantity--;
    } else {
      let index = basketProducts.findIndex(p => p.uuid == pizzaData.id);
      basketProducts.splice(index, 1);
      basketData.splice(index, 1);
      quantitySection.style.display = "none";
      addToCart.style.display = "flex";
    }
    updateBasket();
  });

  pizza.appendChild(img);
  pizza.appendChild(quantitySection);
  pizza.appendChild(addToCart);
  pizza.appendChild(infos);

  return pizza;
}

function updateBasket() {
  if (basketEmpty) basketEmpty.style.display = basketData.length > 0 ? "none" : "block";
  if (basketFull) basketFull.style.display = basketData.length > 0 ? "block" : "none";

  if (basketFull) {
    basketFull.innerHTML = "";
    let ul = document.createElement("ul");
    ul.className = "basket-products";

    let total = 0;

    for (let i = 0; i < basketData.length; i++) {
      let item = basketData[i];

      let li = document.createElement("li");
      li.className = "basket-product-item";

      let name = document.createElement("span");
      name.className = "basket-product-item-name";
      name.innerHTML = item.name;

      let details = document.createElement("span");
      details.className = "basket-product-details";

      let quantity = document.createElement("span");
      quantity.className = "basket-product-details-quantity";
      quantity.innerHTML = item.quantity + "x";

      let unitPrice = document.createElement("span");
      unitPrice.className = "basket-product-details-unit-price";
      unitPrice.innerHTML = "@ $" + item.price.toFixed(2);

      let totalPrice = document.createElement("span");
      totalPrice.className = "basket-product-details-total-price";
      totalPrice.innerHTML = "$" + (item.price * item.quantity).toFixed(2);

      details.appendChild(quantity);
      details.appendChild(unitPrice);
      details.appendChild(totalPrice);

      let removeIcon = document.createElement("img");
      removeIcon.className = "basket-product-remove-icon";
      removeIcon.src = "./images/remove-icon.svg";
      removeIcon.alt = "x";
      removeIcon.addEventListener("click", function() {
        removeFromBasket(item.uuid);
      });

      li.appendChild(name);
      li.appendChild(details);
      li.appendChild(removeIcon);

      ul.appendChild(li);

      total += item.price * item.quantity;
    }

    basketFull.appendChild(ul);

    let totalBlock = document.createElement("p");
    totalBlock.className = "total-order";
    totalBlock.innerHTML = `<span class="total-order-title">Order total</span><span class="total-order-price">$${total.toFixed(2)}</span>`;

    let delivery = document.createElement("p");
    delivery.className = "delivery-info";
    delivery.innerHTML = "This is a <span>carbon neutral</span> delivery";

    let confirmButton = document.createElement("a");
    confirmButton.href = "#";
    confirmButton.className = "confirm-order-btn";
    confirmButton.innerHTML = "Confirm order";
    confirmButton.addEventListener("click", function(event) {
      event.preventDefault(); 
      sendOrder();
    });
    

    basketFull.appendChild(totalBlock);
    basketFull.appendChild(delivery);
    basketFull.appendChild(confirmButton);
    if (basketTitle) {
        let totalQuantity = basketData.reduce((sum, item) => sum + item.quantity, 0);
        basketTitle.textContent = `Votre panier (${totalQuantity})`;
      }
  }
}

function removeFromBasket(uuid) {
  let index = basketProducts.findIndex(p => p.uuid == uuid);
  if (index > -1) {
    basketProducts.splice(index, 1);
    basketData.splice(index, 1);
    updateBasket();
  }
}
function sendOrder() {
    console.trace("sendOrder called");
    console.log("Sending order with TOKEN:", TOKEN);
  
    let orderProducts = basketData.map(item => ({
      uuid: item.uuid,
      quantity: item.quantity
    }));
  
    fetch(API_URL + "/orders", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ products: orderProducts })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(`Error ${res.status}: ${err.message || JSON.stringify(err)}`);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Order confirmed", data);
      showOrderModal();
      loadProducts();
    })
    .catch(error => {
      console.error("Order failed:", error.message);
      alert("Order failed: " + error.message);
    });
  }
   
  
  function showOrderModal() {
    if (orderModal) {
      orderModal.style.display = "block";
      let ul = orderModal.querySelector("ul");
      if (ul) {
        ul.innerHTML = "";
        for (let i = 0; i < basketData.length; i++) {
          let item = basketData[i];
          let li = document.createElement("li");
          li.className = "order-detail-product-item";
          li.innerHTML = `<img class="order-detail-product-image" src="${item.image}" alt="">
            <span class="order-detail-product-name">${item.name}</span>
            <span class="order-detail-product-quantity">x${item.quantity}</span>
            <span class="order-detail-product-unit-price">@ $${item.price.toFixed(2)}</span>
            <span class="order-detail-product-total-price">$${(item.price * item.quantity).toFixed(2)}</span>`;
          ul.appendChild(li);
        }
      }

      basketData = [];
      basketProducts = [];
      updateBasket();
  
      let pizzas = document.querySelectorAll(".pizza-item");
      pizzas.forEach(pizza => {
        let addToCart = pizza.querySelector(".add-to-cart-btn");
        let quantitySection = pizza.querySelector(".select-items-btn");
        if (addToCart && quantitySection) {
          addToCart.style.display = "flex"; 
          quantitySection.style.display = "none"; 
          let valueSpan = quantitySection.querySelector(".value");
          if (valueSpan) valueSpan.innerHTML = "1";
        }
      });
    }
  }
  

if (orderButton) {
  orderButton.addEventListener("click", function() {
    if (orderModal) orderModal.style.display = "none";
  });
}

let pizzas = document.querySelectorAll(".pizza-item");
pizzas.forEach(pizza => {
  let addToCart = pizza.querySelector(".add-to-cart-btn");
  let quantitySection = pizza.querySelector(".select-items-btn");
  if (addToCart && quantitySection) {
    addToCart.style.display = "flex";
    quantitySection.style.display = "none";
    let valueSpan = quantitySection.querySelector(".value");
    if (valueSpan) valueSpan.innerHTML = "1";
  }
});