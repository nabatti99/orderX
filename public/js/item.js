window.addEventListener("load", function () {
  const button = document.querySelector("#post-button");
  if (button.classList.contains("disabled"))
    button.disabled = true;
});