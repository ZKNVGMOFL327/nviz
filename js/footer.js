const foundingYear = 2024;
    const currentYear = new Date().getFullYear();
    const yearText = (foundingYear === currentYear) ? `${foundingYear}` : `${foundingYear}–${currentYear}`;
    
    // Check if it's December
    const isChristmasSeason = new Date().getMonth() === 11;
    
    // Display the year and optional Christmas message
    const yearElement = document.getElementById("year");
    yearElement.textContent = yearText + (isChristmasSeason ? " 🌲Merry Christmas!" : "");
// Set the font size to 14px
yearElement.style.fontSize = "15px";