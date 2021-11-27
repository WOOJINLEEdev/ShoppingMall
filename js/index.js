function goToItemDetail(itemId) {
  console.log("itemId:", itemId);
  location.href = `item_detail.html?item_id=${itemId}`;
}

document.addEventListener("DOMContentLoaded", function () {
  // const [_, userId] = window.location.search.substring(1).split("=");

  const userToken = localStorage.getItem("user_token");
  const userPass = localStorage.getItem("user_pass");
  const $listGroup = document.querySelector(".list_group");
  const isLoggedIn = Boolean(userToken);
  if (isLoggedIn) {
    const $signin = document.querySelector(".signin");
  }

  function toString(mileage) {
    return mileage.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  fetch("https://shopping-mall-api-lab.click/v1/products")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data[0].variants[0].price);

      $listGroup.innerHTML = "";

      let productsHTML1 = "";
      for (let i = 0; i < data.length; i++) {
        productsHTML1 += `<li class="list" onclick="goToItemDetail('${
          data[i].id
        }')">
          <div class="list_element">
              <a class="image_link">
                  <div class="image_wrap">
                    <img class="test_img" alt="" src="${data[i].images[0].src}">
                  </div>
              </a>
              <a href="#" class="image_dim"></a>
            <p class="item_name ${[i]}">${data[i].name}</p>
            <p class="item_price" data-price="price">${toString(
              Number(data[i].variants[0].price)
            )}원</p>
          </div>
        </li>`;

        console.log(data[i].name);
      }
      $listGroup.insertAdjacentHTML("beforeend", productsHTML1);
    });

  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    const decoded = jwt_decode(accessToken);
    // const userId = decoded.user.id;
    // const $userId = decoded.user.user_id;

    console.log("decoded:", decoded);

    let sign_link = document.querySelector(".signin_link");
    sign_link.setAttribute("href", "mypage.html");

    fetch(`https://shopping-mall-api-lab.click/v1/me/cart`, {
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
  }

  const more = document.querySelector(".more_btn");

  more.addEventListener("click", () => {
    paging();
  });

  function paging() {
    fetch("https://shopping-mall-api-lab.click/v1/products")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(data[0].variants[0].price);

        let productsHTML2 = "";
        for (let i = 0; i < data.length; i++) {
          productsHTML2 += `<li class="list" onclick="goToItemDetail('${
            data[i].id
          }')">
          <div class="list_element">
              <a class="image_link">
                  <div class="image_wrap">
                    <img class="test_img" alt="" src="${data[i].images[0].src}">
                  </div>
              </a>
              <a href="#" class="image_dim"></a>
            <p class="item_name ${[i]}">${data[i].name}</p>
            <p class="item_price ${[i]}">${toString(
            Number(data[i].variants[0].price)
          )}원</p>
          </div>
        </li>`;
        }
        $listGroup.insertAdjacentHTML("beforeend", productsHTML2);
      });
  }
});

window.onload = async () => {
  const $main = document.getElementsByClassName("main")[0];
  $main.classList.add("hide");
  let response = await fetch("https://shopping-mall-api-lab.click/v1/products");

  $main.classList.remove("hide");
  document.getElementById("loading").style.display = "none";
};
