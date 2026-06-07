window.addEventListener('orientationchange', function() {
  if (window.orientation === 90 || window.orientation === -90) {
    document.body.style.transform = 'rotate(-90deg)';
    document.body.style.transformOrigin = 'left top';
  } else {
    document.body.style.transform = 'none';
  }
});