document.addEventListener("DOMContentLoaded", function () {
  var navbar = document.querySelector(".navbar");
  var btn = document.querySelector(".hamburger");
  if (!navbar || !btn) return;

  btn.addEventListener("click", function () {
    navbar.classList.toggle("open");
  });
});



