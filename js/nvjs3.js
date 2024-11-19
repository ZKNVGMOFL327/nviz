function toggleFontList() {
    var fontList = document.getElementsByClassName('font-list')[0];
    fontList.style.display = fontList.style.display === 'none' ? 'block' : 'none';
  }
  
  function changeFont(fontClass) {
    var elements = document.getElementsByClassName('text');
    for (var i = 0; i < elements.length; i++) {
      elements[i].className = 'text ' + fontClass;
    }
    toggleFontList();
  }