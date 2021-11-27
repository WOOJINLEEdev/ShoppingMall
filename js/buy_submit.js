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
        name: "총 상품금액",
        className: "total_price_zone",
      },
      {
        name: "배송비",
        className: "delivery_charge_zone",
      },
      {
        name: "마일리지 사용",
        className: "mileage_in_zone",
      },
      {
        name: "쿠폰 사용",
        className: "coupon_in_zone",
      },
      {
        name: "총 결제금액",
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
            <span class=${label.className}></span>원
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
    console.log("새로입력");
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
    console.log("기존입력");
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

    // ---쿠폰---
    couponSelect.innerHTML = `<option value=""> 사용가능 쿠폰 ${couponQty}장</option>`;

    for (let i = 0; i < couponQty; i++) {
      couponSelect.innerHTML += couponOption(i);
    }

    function couponOption(i) {
      return `<option value="${decoded.user.coupons[i].coupon_type}">${decoded.user.coupons[i].coupon_name}</option>`;
    }

    // --- 숫자 3자리 콤마
    function toString(element) {
      return element.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    const [_, checkoutId] = window.location.search.substring(1).split("=");
    console.log("체크아웃아이디", checkoutId);

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

        // ---마일리지 모두 사용---
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

        // 마일리지 입력창
        mileageInput.addEventListener("keyup", () => {
          if (Number(mileageInput.value) > Number(mileageStatus)) {
            alert("보유 마일리지보다 많이 입력할 수 없습니다.");
            mileage_zone.innerHTML = Number(mileageStatus);
            if (Number(mileageStatus) > Number(finalPriceZone.textContent)) {
              alert("마일리지는 총 상품금액보다 더 사용할 수 없습니다.");
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
            alert("마일리지는 총 상품금액보다 더 사용할 수 없습니다.");
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

        // --- 총결제금액 계산
        function countPrice() {
          finalPriceZone.innerHTML =
            orderPriceCalculator.getFormattedTotalPrice();
        }

        // --- 쿠폰선택시 이벤트 발생
        couponSelect.addEventListener("change", selectedCoupon);

        finalPriceZone.innerHTML =
          orderPriceCalculator.getFormattedTotalPrice();
      });
  }

  // 체크아웃 버튼
  const $checkOutBtn = document.querySelector(".checkout_btn");

  $checkOutBtn.addEventListener("click", () => {
    orderCheck();
  });

  // --- 마일리지 컨트롤
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
            <label class="brand_label">브랜드</label>
            <p class="brand_name"></p>
          </div>
          <div class="info_text">
            <label class="info_name">제품명</label>
            <p class="goods name">${cartItem.product_name}</p>
          </div>

          <div class="info_text">
            <label class="info_name opt">옵션 : </label>
            <p class="goods option">${cartItem.variant_name}</p>
          </div>

          <div class="info_text priceAndQuantity">
           <label class="info_name  pAndq">가격 / 수량<span class="price_quantity">${
             cartItem.quantity
           }</span>개</label>
           <p class="price_text"><span class="price_dollar"></span><span class="goods price">${toString(
             cartItem.variant_price
           )}</span>원</p>
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
        alert("수령인을 입력해주세요.");
        name.focus();
        return false;
      }

      if ($postalCode.value === "") {
        alert("우편번호를 입력해주세요.");
        $postalCode.focus();
        return false;
      }

      if (address.value === "") {
        alert("주소를 입력해주세요.");
        address.focus();
        return false;
      }

      if (addressDetail.value === "") {
        alert("상세주소를 입력해주세요.");
        addressDetail.focus();
        return false;
      }

      if (tel1.value === "") {
        alert("연락처1 첫번째 칸을 입력해주세요.");
        tel1.focus();
        return false;
      }

      if (tel2.value === "") {
        alert("연락처1 두번째 칸을 입력해주세요.");
        tel2.focus();
        return false;
      }

      if (tel3.value === "") {
        alert("연락처1 세번째 칸을 입력해주세요.");
        tel3.focus();
        return false;
      }
    }

    if (deliveryWrap1.classList.contains("hide")) {
      if (newName.value === "") {
        alert("수령인을 입력해주세요.");
        newName.focus();
        return false;
      }
      if (newPostalCode.value === "") {
        alert("우편번호를 입력해주세요.");
        newPostalCode.focus();
        return false;
      }
      if (newAddress.value === "") {
        alert("주소를 입력해주세요.");
        newAddress.focus();
        return false;
      }

      if (newAddressDetail.value === "") {
        alert("상세주소를 입력해주세요.");
        newAddressDetail.focus();
        return false;
      }

      if (newTel1.value === "") {
        alert("연락처1 첫번째 칸을 입력해주세요.");
        newTel1.focus();
        return false;
      }

      if (newTel2.value === "") {
        alert("연락처1 두번째 칸을 입력해주세요.");
        newTel2.focus();
        return false;
      }

      if (newTel3.value === "") {
        alert("연락처1 세번째 칸을 입력해주세요.");
        newTel3.focus();
        return false;
      }
    }

    if (!paymentSelected) {
      alert("결제방법을 선택해주세요.");
      return false;
    }

    if (!orderAgree.checked) {
      alert("주문하실 상품 및 결제, 주문정보 확인 동의를 체크해주세요.");
      return false;
    }

    alert("유효성 체크 완료");
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
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
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
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
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
