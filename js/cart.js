function goToBuySubmit(userId) {
  console.log("userId:", userId);
  location.href = `buy_submit.html?cart_id=${userId}`;
}

function calculateTotalAmount(cartItems) {
  let totalAmount = 0;
  for (let item of cartItems) {
    let $qty = item.quantity;
    let $prc = item.variant_price;
    totalAmount += $prc * $qty;
  }

  return totalAmount;
}

document.addEventListener("DOMContentLoaded", function () {
  const deliveryhChargeZone = document.querySelector(".delivery_charge_zone");
  const totalPrice = document.querySelector(".total_price_zone");
  const finalPrice = document.querySelector(".final_price_zone");
  const totalQty = document.querySelector(".total");
  const totalQty2 = document.querySelector(".total_qty");

  const $buyBtn = document.querySelector(".buy_btn");
  $buyBtn.addEventListener("click", () => {
    console.log("buy now 버튼 클릭");
    checkCart();
  });

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    let sign_link = document.querySelector(".signin_link");

    sign_link.setAttribute("href", "mypage.html");

    let cartItems = [];
    fetch(`http://localhost:8282/v1/me/cart`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        cartItems = data.items;

        totalQty.innerText = data.items.length;
        totalQty2.innerText = data.items.length;
        totalQty2.setAttribute("data-value", data.items.length);

        const itemGroup = document.querySelector(".item_group");
        let totalAmount = calculateTotalAmount(data.items);

        for (let i = 0; i < data.items.length; i++) {
          itemGroup.innerHTML += generateCartItemHtml(data.items[i], i);
        }

        totalPrice.setAttribute("data-value", totalAmount);
        finalPrice.setAttribute("data-value", totalAmount);

        console.log("totalAmount ", totalAmount);
        console.log("s totalAmount ", toString(totalAmount));
        totalPrice.innerHTML = toString(totalAmount);
        finalPrice.innerHTML = toString(totalAmount);

        itemGroup.addEventListener("click", function (e) {
          let target = e.target;
          let targetVariantId = target.dataset.variantId;
          let cartPrice = target.dataset.cartPrice;
          let itemsQty = document.querySelector(
            `.item_quantity[data-variant-id="${targetVariantId}"]`
          );

          if (target.classList.contains("plus")) {
            console.log("플러스 버튼 클릭되었습니다.");
            count("plus", itemsQty, cartPrice);
          }

          if (target.classList.contains("minus")) {
            console.log("마이너스 버튼 클릭되었습니다.");
            count("minus", itemsQty, cartPrice);
          }

          if (target.classList.contains("item_remove")) {
            const cartItemId = target.dataset.cartItemId;
            console.log("삭제 버튼 클릭되었습니다.");
            itemRemove(target, cartItemId);
          }
        });

        function itemRemove(target, cartItemId) {
          fetch(`http://localhost:8282/v1/me/cart/items/${cartItemId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              let li = target.parentElement.parentElement;
              li.remove();

              const cartItemId = Number(target.dataset.cartItemId);
              cartItems = cartItems.filter(
                (cartItem) => cartItem.id !== cartItemId
              );

              totalQty.innerHTML = cartItems.length;
              totalQty2.innerHTML = cartItems.length;

              const totalAmount = calculateTotalAmount(cartItems);
              const shippingAmount = calculateShippingAmount(cartItems);
              totalPrice.innerText = toString(totalAmount);
              deliveryhChargeZone.innerText = toString(shippingAmount);
              finalPrice.innerText = toString(totalAmount + shippingAmount);

              localStorage.setItem("delivery_charge", String(shippingAmount));
            });
        }

        const shippingAmount = calculateShippingAmount(cartItems);
        totalPrice.innerText = toString(totalAmount);
        deliveryhChargeZone.innerText = toString(shippingAmount);
        finalPrice.innerText = toString(totalAmount + shippingAmount);

        localStorage.setItem("delivery_charge", String(shippingAmount));
      });
  }
});

function generateCartItemHtml(cartItem, i) {
  return `<li class="item">
            <div class="item_select">
              
              <input type="button" value="삭제" class="item_remove ${[
                i,
              ]}" data-cart-item-id="${cartItem.id}">
            </div>
            
            <div class="info_wrap">
              <a href="item_detail.html?item_id=${
                cartItem.product_id
              }" class="info_box imgLink">
                <img class="item_img" alt="" src="${
                  cartItem.product_image_src
                }">
              </a>
              <div class="info_box">
                <div class="brand_box">
                  <p class="brand_name"></p>
                </div>
                <div class="info_text">
                  <p class="goods name">${cartItem.product_name}</p>
                </div>
                
                <div class="info_text">
                  <p class="price_area"><span class="price_zone">${toString(
                    cartItem.variant_price
                  )}</span>원</p>
                </div>
              
                <div class="info_text">
                  <p class="goods option">옵션 : <span class="option_zone">${
                    cartItem.variant_name
                  }</span></p>
                </div>
    
                <div class="info_text priceAndQuantity">
                  <div class="quantity_area">
                    <input type="button" class="qty minus ${[
                      i,
                    ]}" data-variant-id="${
    cartItem.variant_id
  }"  value="-" name="count" data-cart-price="${cartItem.variant_price}">
                    <input type="text" name="itemQty" class="item_quantity ${[
                      i,
                    ]}" data-variant-id="${cartItem.variant_id}" value="${
    cartItem.quantity
  }" data-counter="${
    cartItem.quantity
  }" onkeyup="this.value=this.value.replace(/[^0-9]/g,'');" data-counter>
                    <input type="button" class="qty plus ${[
                      i,
                    ]}" data-variant-id="${
    cartItem.variant_id
  }" value="+" name="count" data-cart-price="${cartItem.variant_price}">
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </li>`;
}

function count(type, target, prc) {
  let variantId = Number(target.dataset.variantId);
  let itemsQtyMinusBtn = document.querySelector(
    `.qty.minus[data-variant-id="${variantId}"]`
  );
  const qty = Number(target.value);

  if (type === "plus") {
    target.value = qty + 1;
  } else if (type === "minus") {
    target.value = qty - 1;
  } else {
    throw new Error(`잘못된 타입 ${type}`);
  }

  itemsQtyMinusBtn.disabled = target.value == 1;

  let foundIndex = cartItems.findIndex(
    (cartItem) => cartItem.variant_id === variantId
  );
  if (foundIndex >= 0) {
    cartItems[foundIndex].quantity = target.value;
  }

  const totalAmount = calculateTotalAmount(cartItems);
  const shippingAmount = calculateShippingAmount(cartItems);
  totalPrice.innerText = toString(totalAmount);
  deliveryhChargeZone.innerText = toString(shippingAmount);
  finalPrice.innerText = toString(totalAmount + shippingAmount);

  localStorage.setItem("delivery_charge", String(shippingAmount));
}

async function checkCart() {
  const res = await fetch(`http://localhost:8282/v1/me/cart`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => response.json());

  console.log("res", res);

  const cartItemsData = res.items.map((item) => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
  }));
  console.log("cartItemsData", cartItemsData);

  const checkoutRes = await fetch("http://localhost:8282/v1/checkouts", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      line_items: cartItemsData,
    }),
  }).then((response) => response.json());

  goToBuySubmit(checkoutRes.checkout_id);
}

function calculateShippingAmount(cartItems) {
  const totalAmount = calculateTotalAmount(cartItems);

  return totalAmount > 50000 ? 0 : 3000;
}

function toString(mileage) {
  return mileage.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
