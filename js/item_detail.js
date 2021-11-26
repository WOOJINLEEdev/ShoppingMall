function goToBuySubmit(itemId) {
  console.log("itemId:", itemId);
  location.href = `buy_submit.html?item_id=${itemId}`;
}

function goToCart(itemId) {
  console.log("itemId:", itemId);
  location.href = `cart.html?item_id=${itemId}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const [_, itemId] = window.location.search.substring(1).split("=");
  console.log("페이지 테스트", itemId);

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    let sign_link = document.querySelector(".signin_link");

    sign_link.setAttribute("href", "mypage.html");
  }

  let variants;
  fetch(`http://localhost:8282/v1/products/${itemId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const id = document.createElement("div");
      const name = document.createElement("h3");
      const price = document.createElement("p");

      id.textContent = data.id;
      id.dataset.productId = data.id;
      name.dataset.productId = data.name;
      name.textContent = data.name;
      price.textContent = data.variants[0].price;

      let selectBox = document.querySelector(".td_select");
      selectBox.innerHTML += `<option value="${data.variants[0].name}" class="option">${data.variants[0].option1}</option>
      <option value="${data.variants[1].name}" class="option">${data.variants[1].option1}</option>
      <option value="${data.variants[2].name}" class="option">${data.variants[2].option1}</option>`;

      let first = document.getElementById("imageTextHead");
      let second = document.getElementById("imageTextBody");

      const image = document.querySelector(".image_wrap > img.image");
      image.setAttribute("src", data.images[0].src);

      name.classList.add("img_name");
      price.classList.add("img_price");

      first.appendChild(name);
      second.appendChild(price);

      second.innerHTML = toString(Number(second.textContent));

      variants = data.variants;
    });

  // --- 숫자 3자리 콤마
  function toString(mileage) {
    console.log("숫자콤마");
    return mileage.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  const $buyBtn = document.getElementById("buyBtn");
  const $cartBtn = document.querySelector(".cart");

  // 장바구니 버튼
  $cartBtn.addEventListener("click", () => {
    console.log("장바구니 버튼 클릭");

    let select = document.querySelector(".td_select").value;
    let itemQuantity = document.querySelector(".td_quantity").value;
    let maxQuantity = 5;

    if (!accessToken) {
      alert("로그인 후 이용 가능합니다!");
      location.href = "signin.html";
      return false;
    }

    if (select === "") {
      alert("옵션을 선택해주세요.");
      return false;
    }

    if (itemQuantity < 1) {
      alert("수량은 1개 이상 선택해야 합니다.");
      return false;
    } else if (itemQuantity > maxQuantity) {
      alert("재고가 부족합니다.");
      return false;
    }

    // let prc1 = document.getElementById("imageTextBody").textContent;
    // let qty1 = document.querySelector(".td_quantity").value;

    if (!accessToken) {
      return false;
    }

    const decoded = jwt_decode(accessToken);
    // const userId = decoded.user.id;

    const variantsFiltered = variants.filter(
      (variant) => variant.option1 === select
    );
    if (variantsFiltered.length === 0) {
      return false;
    }

    const variantId = variantsFiltered[0].id;

    fetch(`http://localhost:8282/v1/me/cart`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            product_id: Number(itemId),
            variant_id: variantId,
            quantity: Number(itemQuantity),
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("test:", data);
        console.log(data);
        alert("장바구니에 상품이 담겼습니다.");
        goToCart(itemId);
      });
  });

  // 구매하기 버튼
  $buyBtn.addEventListener("click", () => {
    console.log("구매버튼 클릭");

    let select = document.querySelector(".td_select").value;
    let itemQuantity = document.querySelector(".td_quantity").value;
    let maxQuantity = 5;
    console.log("수량", itemQuantity);

    if (!accessToken) {
      alert("로그인 후 이용 가능합니다!");
      location.href = "signin.html";
      return false;
    }

    if (select === "") {
      alert("옵션을 선택해주세요.");
      return false;
    }

    if (itemQuantity < 1) {
      alert("수량은 1개 이상 선택해야 합니다.");
      return false;
    } else if (itemQuantity > maxQuantity) {
      alert("재고가 부족합니다.");
      return false;
    }

    const variantsFiltered = variants.filter(
      (variant) => variant.option1 === select
    );
    if (variantsFiltered.length === 0) {
      return false;
    }

    const variantId = variantsFiltered[0].id;
    console.log("variantId", variantId);

    fetch("http://localhost:8282/v1/checkouts", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        line_items: [
          {
            variant_id: variantId,
            quantity: Number(itemQuantity),
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const checkoutId = data.checkout_id;

        let itemPrice = document.getElementById("imageTextBody");
        let $itemPrice = itemPrice.textContent.replace(",", "");

        if (Number($itemPrice) * itemQuantity < 50000) {
          localStorage.setItem("delivery_charge", "3000");
        } else {
          localStorage.setItem("delivery_charge", 0);
        }
        goToBuySubmit(checkoutId);
      });
  });
});

window.onload = async () => {
  const $main = document.querySelector(".main");
  $main.classList.add("hide");
  let response = await fetch("http://localhost:8282/v1/products");

  $main.classList.remove("hide");
  document.querySelector(".loading").style.display = "none";
};
