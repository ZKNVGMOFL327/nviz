const foundingYear = 2024; // Replace with your actual founding year
  const currentYear = new Date().getFullYear();
  const yearText = (foundingYear === currentYear) ? `${foundingYear}` : `${foundingYear}–${currentYear}`;
  
  document.getElementById("year").textContent = yearText;