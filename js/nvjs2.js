let currentTheme = '';
let currentFont = 'font-1';

// Function to toggle the visibility of the theme list
function toggleThemeList() {
    const themeList = document.getElementById('theme-list');
    if (themeList.style.display === 'none' || themeList.style.display === '') {
        themeList.style.display = 'block';
    } else {
        themeList.style.display = 'none';
    }
}

// Function to change the theme
function changeTheme(theme) {
    const textElements = document.querySelectorAll('.text');
    
    // Remove current theme class if it exists
    if (currentTheme) {
        textElements.forEach((el) => {
            el.classList.remove(currentTheme);
        });
    }
    
    // Add new theme class
    currentTheme = theme;
    textElements.forEach((el) => {
        el.classList.add(currentTheme);
    });
    
    // Hide theme list after selection
    document.getElementById('theme-list').style.display = 'none';
}