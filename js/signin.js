function goToMyPage(userId) {
  const accessToken = localStorage.getItem("access_token");
  const decoded = jwt_decode(accessToken);
  const $userId = decoded.user.id;

  fetch(`http://localhost:8282/v1/auth/join`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("data check:", data);
      console.log(data);
    });

  console.log("itemId:", $userId);
  location.href = `mypage.html?user_id=${$userId}`;
}

window.addEventListener("DOMContentLoaded", function () {
  const [_, userId] = window.location.search.substring(1).split("=");
  console.log("페이지 테스트", userId);

  console.log("테스트 signup");

  let $userId = document.getElementById("userId");
  let $userPassword = document.getElementById("userPassword");
  const $signInButton = document.getElementById("logInButton");

  const userToken = localStorage.getItem("user_token");

  $signInButton.addEventListener("click", () => {
    handleSignBtn();
  });

  $userPassword.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSignBtn();
    }
  });

  function handleSignBtn() {
    fetch("http://localhost:8282/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: $userId.value,
        user_password: $userPassword.value,
      }),
    })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          return res.json();
        }

        console.error(res.statusText);
        throw new Error("입력하신 정보와 회원 정보가 일치하지 않습니다.");
      })
      .then((accessToken) => {
        console.log(accessToken);
        const decoded = jwt_decode(accessToken);
        console.log("decoded:", decoded);
        alert("로그인되었습니다.");
        localStorage.setItem("access_token", accessToken);
        goToMyPage(userId);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  }

  function bgRed() {
    let main = document.querySelector(".main");
    main.style.backgroundColor = "rgb(255, 0, 0)";
    localStorage.setItem("bgColor", "red");
  }

  function bgGreen() {
    let main = document.querySelector(".main");

    main.style.backgroundColor = "green";
    localStorage.setItem("bgColor", "green");
  }

  function signIn(event) {
    const ID = $userId.value;
    const PASS = $userPassword.value;

    if ("a" === ID && "1" === PASS) {
      alert("로그인되었습니다.");
      localStorage.setItem("user_token", "jwe0f9we8f09w8e9f0809wf");
      location.href = "postman.html";
      bgGreen();
    } else {
      alert("회원 정보와 일치하지 않습니다.");
      bgRed();
    }
  }

  function signOut() {
    console.log("로그아웃되었습니다.");
    localStorage.removeItem("user_tocken");
    localStorage.removeItem("user_pass");
  }

  fetch("http://localhost:8282/v1/products")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data[0].variants[0].price);
    });
});
