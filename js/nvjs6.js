// Get the content of the meta tag
  const metaContent = document.querySelector('meta[name="word"]').getAttribute("content");

  // Select elements by class
  const wordElement = document.querySelector(".word");
  const svgElement = document.querySelector(".line");
  const lineElement = svgElement.querySelector("line");

  // Set the content of the span
  wordElement.textContent = metaContent;

  // Wait for DOM updates to measure the width of the content
  window.addEventListener("load", () => {
    // Measure the width of the word
    const wordWidth = wordElement.offsetWidth;

    // Set the SVG and line width dynamically
    svgElement.setAttribute("width", wordWidth);
    lineElement.setAttribute("x2", wordWidth);
  });