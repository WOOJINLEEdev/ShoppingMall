class OrderPriceCalculator {
  cartItems = [];
  user;
  coupon;
  mileage = 0;

  setUser(user) {
    console.log("[OrderPriceCalculator] user", JSON.stringify(user, null, 2));
    this.user = user;
  }

  setCartItems(cartItems) {
    console.log(
      "[OrderPriceCalculator] cartItems",
      JSON.stringify(cartItems, null, 2)
    );
    this.cartItems = cartItems;
  }

  setCouponByType(couponType) {
    if (!this.user || !this.user.coupons || this.user.coupons.length === 0) {
      return;
    }

    console.log(
      "[OrderPriceCalculator] couponType",
      JSON.stringify(couponType, null, 2)
    );
    const selectedCoupon = this.user.coupons.find(
      (c) => c.coupon_type === couponType
    );
    if (selectedCoupon) {
      this.coupon = selectedCoupon;
    }
  }

  setMileage(mileage) {
    console.log("[OrderPriceCalculator] mileage", mileage);
    this.mileage = mileage;
  }

  getMileage() {
    return this.mileage;
  }

  getFormattedTotalPrice() {
    return this.formatPrice(this.getTotalPrice());
  }

  getTotalPrice() {
    return (
      this.getProductPrice() +
      this.getShippingPrice() -
      this.getMileage() -
      this.getDiscountPrice()
    );
  }

  getProductPrice() {
    if (!this.cartItems || this.cartItems.length === 0) {
      return 0;
    }

    return this.cartItems.reduce(
      (total, item) => total + Number(item.variant_price * item.quantity),
      0
    );
  }

  getShippingPrice() {
    return this.getProductPrice() < 50000 ? 3000 : 0;
  }

  getDiscountPriceText() {
    return this.getDiscountPrice() > 0
      ? `-${this.getFormattedDiscountPrice()}`
      : "0";
  }

  getFormattedDiscountPrice() {
    return this.formatPrice(this.getDiscountPrice());
  }

  getDiscountPrice() {
    if (!this.coupon) {
      return 0;
    }

    switch (this.coupon.coupon_type) {
      case "percent":
        const discountPrice = this.getProductPrice() * 0.2;
        return discountPrice > 0 ? discountPrice : 0;
      case "amount":
        return 5000;
    }

    return 0;
  }

  formatPrice(price) {
    return price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  getOrderTotalHtml() {
    const orderTotalLabel = [
      {
        name: "??? ????????????",
        className: "total_price_zone",
      },
      {
        name: "?????????",
        className: "delivery_charge_zone",
      },
      {
        name: "???????????? ??????",
        className: "mileage_in_zone",
      },
      {
        name: "?????? ??????",
        className: "coupon_in_zone",
      },
      {
        name: "??? ????????????",
        className: "final_price_zone",
      },
    ];

    return orderTotalLabel
      .map(
        (label) => `<li class="detail_box">
          <div class="label_box">
            <label>${label.name}</label>
          </div>
          <p class="price_unit">
            <span class=${label.className}></span>???
          </p>
        </li>`
      )
      .join("");
  }

  toString() {
    return `
      user: ${JSON.stringify(this.user, null, 2)}
      cartItems: ${JSON.stringify(this.cartItems, null, 2)}
      coupon: ${JSON.stringify(this.coupon, null, 2)}
      mileage: ${this.mileage}
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const new_write = document.querySelector(".new");
  const old_write = document.querySelector(".old");
  const deliveryWrap1 = document.querySelector(".delivery_box_wrap");
  const deliveryWrap2 = document.querySelector(".delivery_box_wrap_second");

  const orderPriceCalculator = new OrderPriceCalculator();

  new_write.addEventListener("click", function () {
    console.log("????????????");
    new_write.style.backgroundColor = "#fff";
    new_write.style.color = "#333";
    old_write.style.backgroundColor = "#eee";
    old_write.style.color = "#bababa";

    if (deliveryWrap2.classList.contains("hide")) {
      deliveryWrap2.classList.remove("hide");
      deliveryWrap1.classList.add("hide");
      return;
    }
  });

  old_write.addEventListener("click", function () {
    console.log("????????????");
    old_write.style.backgroundColor = "#fff";
    old_write.style.color = "#333";
    new_write.style.backgroundColor = "#eee";
    new_write.style.color = "#bababa";

    if (deliveryWrap1.classList.contains("hide")) {
      deliveryWrap1.classList.remove("hide");
      deliveryWrap2.classList.add("hide");
      return;
    }
  });

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    const decoded = jwt_decode(accessToken);
    const mileage = decoded.user.mileage;
    let mileageIn = document.querySelector(".mileage_in");
    const couponQty = decoded.user.coupons.length;
    const couponSelect = document.querySelector(".coupon_select");
    let sign_link = document.querySelector(".signin_link");

    orderPriceCalculator.setUser(decoded.user);

    console.log("decoded:", decoded);
    console.log(couponQty);

    const orderTotal = document.querySelector(".detail_wrap");
    orderTotal.innerHTML = orderPriceCalculator.getOrderTotalHtml();

    // ---??????---
    couponSelect.innerHTML = `<option value=""> ???????????? ?????? ${couponQty}???</option>`;

    for (let i = 0; i < couponQty; i++) {
      couponSelect.innerHTML += couponOption(i);
    }

    function couponOption(i) {
      return `<option value="${decoded.user.coupons[i].coupon_type}">${decoded.user.coupons[i].coupon_name}</option>`;
    }

    // --- ?????? 3?????? ??????
    function toString(element) {
      return element.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    const [_, checkoutId] = window.location.search.substring(1).split("=");
    console.log("?????????????????????", checkoutId);

    fetch(`https://shopping-mall-api-lab.click/v1/checkouts/${checkoutId}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data:::", data);
        orderPriceCalculator.setCartItems(data.line_items);

        let deliveryCharge = document.querySelector(".delivery_charge_zone");
        let mileageZone = document.querySelector(".mileage_in_zone");
        let couponZone = document.querySelector(".coupon_in_zone");
        const $mileageBtn = document.querySelector(".all_mileage");
        let totalPriceZone = document.querySelector(".total_price_zone");
        let totalQty = document.querySelector(".total");
        let deliveryFee = localStorage.getItem("delivery_charge");
        let sum = 0;
        for (let i = 0; i < data.line_items.length; i++) {
          infoGroup.innerHTML += generateCartItemHtml(data.line_items[i], i);

          sum += Number(
            data.line_items[i].variant_price * data.line_items[i].quantity
          );
        }

        console.log("productPrice: ", orderPriceCalculator.getProductPrice());

        totalQty.innerText = data.line_items.length;
        totalPriceZone.innerText = toString(sum);
        deliveryCharge.innerText = toString(deliveryFee);
        mileageIn.innerText = toString(mileage);
        mileageZone.innerText = 0;
        couponZone.innerText = 0;

        finalPriceZone.innerText =
          orderPriceCalculator.getFormattedTotalPrice();

        sign_link.setAttribute("href", "mypage.html");

        $mileageBtn.addEventListener("click", () => {
          mileageAll();
        });

        // ---???????????? ?????? ??????---
        function mileageAll() {
          let mileage_in = document.querySelector(".mileage_in");

          if (mileageInput.value === "") {
            mileageInput.value = mileage;
            mileageZone.innerHTML = mileage;
            orderPriceCalculator.setMileage(Number(mileage));
          } else if (
            Number(mileageInput.value) === Number(mileage_in.textContent)
          ) {
            mileageInput.value = "";
            mileageZone.innerHTML = 0;
            orderPriceCalculator.setMileage(0);
          }
          console.log("log === ", orderPriceCalculator.toString());
          countPrice();
        }

        // ???????????? ?????????
        mileageInput.addEventListener("keyup", () => {
          if (Number(mileageInput.value) > Number(mileageStatus)) {
            alert("?????? ?????????????????? ?????? ????????? ??? ????????????.");
            mileage_zone.innerHTML = Number(mileageStatus);
            if (Number(mileageStatus) > Number(finalPriceZone.textContent)) {
              alert("??????????????? ??? ?????????????????? ??? ????????? ??? ????????????.");
              mileageInput.value = Number(finalPriceZone.textContent);
              return false;
            } else {
              mileageInput.value = mileageStatus;
              countPrice();
              return false;
            }
          } else if (
            Number(mileageInput.value) > Number(finalPriceZone.textContent)
          ) {
            alert("??????????????? ??? ?????????????????? ??? ????????? ??? ????????????.");
            mileageInput.value = Number(finalPriceZone.textContent);
            countPrice();
            return false;
          }
          countPrice();
        });

        function selectedCoupon() {
          const opt = couponSelect.options[couponSelect.selectedIndex];
          orderPriceCalculator.setCouponByType(opt.value);

          couponZone.innerText = orderPriceCalculator.getDiscountPriceText();
          countPrice();
        }

        // --- ??????????????? ??????
        function countPrice() {
          finalPriceZone.innerHTML =
            orderPriceCalculator.getFormattedTotalPrice();
        }

        // --- ??????????????? ????????? ??????
        couponSelect.addEventListener("change", selectedCoupon);

        finalPriceZone.innerHTML =
          orderPriceCalculator.getFormattedTotalPrice();
      });
  }

  // ???????????? ??????
  const $checkOutBtn = document.querySelector(".checkout_btn");

  $checkOutBtn.addEventListener("click", () => {
    orderCheck();
  });

  // --- ???????????? ?????????
  let mileageStatus = document.querySelector(".mileage_in").textContent;
  let mileageInput = document.querySelector(".mileage_input");
  let mileage_zone = document.querySelector(".mileage_in_zone");
  let finalPriceZone = document.querySelector(".final_price_zone");

  let mileageIn = document.querySelector(".mileage_in");
  mileageInput.oninput = function (e) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
    if (mileageIn.textContent === "0") {
      e.target.value = 0;
    }

    const mileage = e.target.value || 0;
    orderPriceCalculator.setMileage(mileage);
    handleMileage();
  };

  function handleMileage() {
    mileage_zone.innerHTML = mileageInput.value;

    if (Number(mileage_zone.textContent) > Number(finalPriceZone.textContent)) {
      alert("stop");

      mileage_zone.innerHTML = 0;
      mileageInput.value = "";
    }
  }

  const payments = document.querySelectorAll(".payment");
  const paymentUl = document.querySelector(".payment_method");
  const onClass = "on";

  console.log(payments.length);

  paymentUl.addEventListener("click", (e) => {
    if (e.target instanceof HTMLUListElement) {
      return;
    }
    console.log(e.target);
    console.log(e.target instanceof HTMLUListElement);

    for (let i = 0; i < payments.length; i++) {
      if (e.target === payments[i]) {
        continue;
      }
      payments[i].classList.remove(onClass);
    }

    e.target.classList.toggle(onClass);
  });

  const infoGroup = document.querySelector(".info_group");

  function generateCartItemHtml(cartItem, i) {
    return `<li class="info_wrap">
        <img class="item_img" alt="" src="${cartItem.image_src}">
        <a href="item_detail.html?item_id=${
          cartItem.product_id
        }" class="info_box">
          <div class="brand_box">
            <label class="brand_label">?????????</label>
            <p class="brand_name"></p>
          </div>
          <div class="info_text">
            <label class="info_name">?????????</label>
            <p class="goods name">${cartItem.product_name}</p>
          </div>

          <div class="info_text">
            <label class="info_name opt">?????? : </label>
            <p class="goods option">${cartItem.variant_name}</p>
          </div>

          <div class="info_text priceAndQuantity">
           <label class="info_name  pAndq">?????? / ??????<span class="price_quantity">${
             cartItem.quantity
           }</span>???</label>
           <p class="price_text"><span class="price_dollar"></span><span class="goods price">${toString(
             cartItem.variant_price
           )}</span>???</p>
          </div>
        </a>
      </li>`;
  }

  function orderCheck() {
    let name = document.querySelector(".second");
    let $postalCode = document.getElementById("sample3_postcode");
    let address = document.getElementById("sample3_address");
    let addressDetail = document.getElementById("sample3_detailAddress");
    let tel1 = document.getElementById("tel_first");
    let tel2 = document.getElementById("tel_second");
    let tel3 = document.getElementById("tel_third");

    let newName = document.querySelector(".secondName");
    let newPostalCode = document.getElementById("sample4_postcode");
    let newAddress = document.getElementById("sample4_address");
    let newAddressDetail = document.getElementById("sample4_detailAddress");
    let newTel1 = document.getElementById("tel_fourth");
    let newTel2 = document.getElementById("tel_fifth");
    let newTel3 = document.getElementById("tel_sixth");

    const orderAgree = document.querySelector(".order_agree");
    let paymentSelected = document.querySelector(
      ".payment_method li.payment.on"
    );

    if (deliveryWrap2.classList.contains("hide")) {
      if (name.value === "") {
        alert("???????????? ??????????????????.");
        name.focus();
        return false;
      }

      if ($postalCode.value === "") {
        alert("??????????????? ??????????????????.");
        $postalCode.focus();
        return false;
      }

      if (address.value === "") {
        alert("????????? ??????????????????.");
        address.focus();
        return false;
      }

      if (addressDetail.value === "") {
        alert("??????????????? ??????????????????.");
        addressDetail.focus();
        return false;
      }

      if (tel1.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        tel1.focus();
        return false;
      }

      if (tel2.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        tel2.focus();
        return false;
      }

      if (tel3.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        tel3.focus();
        return false;
      }
    }

    if (deliveryWrap1.classList.contains("hide")) {
      if (newName.value === "") {
        alert("???????????? ??????????????????.");
        newName.focus();
        return false;
      }
      if (newPostalCode.value === "") {
        alert("??????????????? ??????????????????.");
        newPostalCode.focus();
        return false;
      }
      if (newAddress.value === "") {
        alert("????????? ??????????????????.");
        newAddress.focus();
        return false;
      }

      if (newAddressDetail.value === "") {
        alert("??????????????? ??????????????????.");
        newAddressDetail.focus();
        return false;
      }

      if (newTel1.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        newTel1.focus();
        return false;
      }

      if (newTel2.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        newTel2.focus();
        return false;
      }

      if (newTel3.value === "") {
        alert("?????????1 ????????? ?????? ??????????????????.");
        newTel3.focus();
        return false;
      }
    }

    if (!paymentSelected) {
      alert("??????????????? ??????????????????.");
      return false;
    }

    if (!orderAgree.checked) {
      alert("???????????? ?????? ??? ??????, ???????????? ?????? ????????? ??????????????????.");
      return false;
    }

    alert("????????? ?????? ??????");
    location.href = "index.html";
  }
});

var element_wrap = document.getElementById("wrap");
function foldDaumPostcode() {
  element_wrap.style.display = "none";
}

function sample3_execDaumPostcode() {
  var currentScroll = Math.max(
    document.body.scrollTop,
    document.documentElement.scrollTop
  );
  new daum.Postcode({
    oncomplete: function (data) {
      var addr = "";
      var extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[???|???|???]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }

        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }

        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }

        document.getElementById("sample3_extraAddress").value = extraAddr;
      } else {
        document.getElementById("sample3_extraAddress").value = "";
      }

      document.getElementById("sample3_postcode").value = data.zonecode;
      document.getElementById("sample3_address").value = addr;

      document.getElementById("sample3_detailAddress").focus();

      element_wrap.style.display = "none";

      document.body.scrollTop = currentScroll;
    },
    onresize: function (size) {
      element_wrap.style.height = size.height + "px";
    },
    width: "100%",
    height: "100%",
  }).embed(element_wrap);

  element_wrap.style.display = "block";
}

var element_wrap1 = document.getElementById("wrap1");
function foldDaumPostcode1() {
  element_wrap1.style.display = "none";
}

function sample4_execDaumPostcode() {
  var currentScroll = Math.max(
    document.body.scrollTop,
    document.documentElement.scrollTop
  );
  new daum.Postcode({
    oncomplete: function (data) {
      var addr = "";
      var extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[???|???|???]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }

        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }

        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }

        document.getElementById("sample4_extraAddress").value = extraAddr;
      } else {
        document.getElementById("sample4_extraAddress").value = "";
      }

      document.getElementById("sample4_postcode").value = data.zonecode;
      document.getElementById("sample4_address").value = addr;

      document.getElementById("sample4_detailAddress").focus();

      element_wrap1.style.display = "none";

      document.body.scrollTop = currentScroll;
    },
    onresize: function (size) {
      element_wrap1.style.height = size.height + "px";
    },
    width: "100%",
    height: "100%",
  }).embed(element_wrap1);

  element_wrap1.style.display = "block";
}
