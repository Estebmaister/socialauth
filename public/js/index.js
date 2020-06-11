var pupil = document.getElementsByClassName("pupil");
document.onmousemove = function () {
  var x = (event.clientX * 8) / window.innerWidth + "%";
  var y = (event.clientY * 8) / window.innerHeight + "%";

  for (var i = 0; i < 4; i++) {
    pupil[i].style.left = x;
    pupil[i].style.top = y;
    pupil[i].style.transform = "translate(" + x + "," + y + ")";
  }
};

const aLogin = document.querySelector("#a-login");
const aRegister = document.querySelector("#a-register");
const divLogin = document.querySelector(".login");
const divRegister = document.querySelector(".register");

aLogin.addEventListener("click", () => {
  divLogin.style.display = "inline-block";
  divRegister.style.display = "none";
});
aRegister.addEventListener("click", () => {
  divRegister.style.display = "inline-block";
  divLogin.style.display = "none";
});
