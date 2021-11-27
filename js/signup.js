window.addEventListener("DOMContentLoaded", function () {
  fetch("https://shopping-mall-api-lab.click/v1/products")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });

  const joinBtn = document.getElementById("joinBtn");

  joinBtn.addEventListener("click", function () {
    console.log("반응");

    let $userId = document.getElementById("userId");
    let $userPassword1 = document.getElementById("userPassword1");
    let $userPassword2 = document.getElementById("userPassword2");
    let $name = document.getElementById("name");
    let $birthMonth = document.getElementById("month");
    let $birthDate = document.getElementById("date");
    let $emailAddress = document.getElementById("emailAddress");

    const birthMonth = Number($birthMonth.value);
    const birthDate = Number($birthDate.value);

    if ($userId.value === "" || $userId.value.length < 6) {
      alert("아이디는 6자리 이상으로 입력해야 합니다.");
      $userId.focus();
    } else if ($userPassword1.value.length < 8 || isNaN($userPassword1.value)) {
      alert("비밀번호를 숫자 8자리 이상으로 입력해야 합니다.");
      $userPassword1.focus();
    } else if ($userPassword1.value != $userPassword2.value) {
      alert("비밀번호가 일치하지 않습니다.");
      $userPassword2.focus();
    } else if ($name.value === "") {
      alert("이름을 입력해주세요.");
      $name.focus();
    } else if ($name.value.length < 2) {
      alert("2글자 이상 입력해주세요.");
    } else if (birthMonth < 1 || birthMonth > 12) {
      alert("생일의 월은 1~12까지만 입력해야 합니다.");
      $birthMonth.focus();
    } else if (birthDate < 1 || birthDate > 31) {
      alert("생일의 일은 1~31까지만 입력해야 합니다.");
      $birthMonth.focus();
    } else if ($emailAddress.value === "") {
      alert("이메일을 입력해주세요.");
      $emailAddress.focus();
    } else {
      alert("회원가입이 완료되었습니다!");
      localStorage.setItem("userId", $userId.value);

      location.href = "signin.html";
    }

    fetch("https://shopping-mall-api-lab.click/v1/auth/join", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: $name.value,
        email: $emailAddress.value,
        user_id: $userId.value,
        user_password: $userPassword2.value,
      }),
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          alert("저장 완료");
        }
      });
  });
});
