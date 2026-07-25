/** Блокировка копирования контента (лёгкая, для честных пользователей). */
(function () {
  var root = document.querySelector('.copy-protected');
  if (!root) return;

  function block(e) {
    e.preventDefault();
  }

  root.addEventListener('copy', block);
  root.addEventListener('cut', block);
  root.addEventListener('contextmenu', block);
  root.addEventListener('dragstart', block);
})();
