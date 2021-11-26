window.addEventListener("DOMContentLoaded", function () {
  console.log("테스트 signup");

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    const decoded = jwt_decode(accessToken);
    const $userId = decoded.user.user_id;

    const user_id = document.querySelector(".greet_user");
    let sign_link = document.querySelector(".signin_link");
    let main = document.querySelector(".main");
    let my_wrap = document.querySelector(".my_wrap");

    console.log("decoded:", decoded);

    user_id.innerText = $userId;
    sign_link.setAttribute("href", "mypage.html");

    my_wrap.innerHTML = "";

    function infoWrite() {
      return `<ul class="info_wrap"><li class="info_li_coupon">쿠폰</li></ul>`;
    }

    main.innerHTML += infoWrite();
    showInfo();

    function showInfo() {
      let infoWrap = document.querySelector(".info_wrap");
      let li_coupon = document.querySelector(".info_li_coupon");

      for (let i = 0; i < decoded.user.coupons.length; i++) {
        li_coupon.innerHTML += `<span class="coupon_in"> ${decoded.user.coupons[i].coupon_name}</span>`;
      }

      infoWrap.innerHTML += `<li class="info_li"> 마일리지 <span class="mileage_in">${decoded.user.mileage}</span> </li>
        <li class="info_li">주문내역 조회<li>
          <li class="info_li">배송지 등록 / 변경</li>`;
    }

    // --- 마일리지 3자리 마다 콤마 표시
    let mileageIn = document.querySelector(".mileage_in");
    let mileage = Number(mileageIn.textContent);

    mileageIn.innerHTML = toString(mileage);

    function toString(element) {
      return element.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

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
        console.log("cart:", data);
        console.log(data);
      });

    const logoutBtn = document.querySelector(".myInfo_logout");
    logoutBtn.addEventListener("click", function () {
      alert("로그아웃 되었습니다.");
      localStorage.clear();
      location.href = "postman.html";
    });
  }
});
