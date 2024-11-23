let pdfDoc = null;
let currentPage = 1;
let currentBookName = '';
let textContentCache = {};
let searchResults = [];
let currentResultIndex = -1;

// Retrieve the PDF URL and title from the meta tags
const url = document.querySelector('meta[name="pdf-url"]').getAttribute('content');
const title = document.querySelector('meta[name="word"]').getAttribute('content');

// Load the PDF document on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (url) {
        currentBookName = title;
        loadPdf(url);
    } else {
        console.error('PDF URL not found in meta tags.');
    }

    const savedData = JSON.parse(localStorage.getItem('savedPage'));
    if (savedData && savedData.title === title) {
        currentPage = parseInt(savedData.page, 10);
    }
});

// Load the PDF document
function loadPdf(pdfUrl) {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise
        .then((pdf) => {
            pdfDoc = pdf;
            document.getElementById('page_count').textContent = pdf.numPages;
            document.getElementById('page_count_bottom').textContent = pdf.numPages;
            renderPage(currentPage);
        })
        .catch((error) => {
            console.error('Error loading PDF:', error);
        });
}

// Load text content for a specific page
function loadTextContentForPage(pageNum) {
    if (!textContentCache[pageNum]) {
        pdfDoc.getPage(pageNum).then((page) =>
            page.getTextContent().then((text) => {
                textContentCache[pageNum] = formatTextContent(text.items);
            })
        );
    }
}

// Preload adjacent pages
function preloadAdjacentPages(pageNum) {
    const adjacentPages = [pageNum - 1, pageNum + 1].filter(
        (p) => p > 0 && p <= pdfDoc.numPages
    );
    adjacentPages.forEach(loadTextContentForPage);
}

// Format text content
function formatTextContent(items) {
    let textContent = '';
    let lastY = -1;
    items.forEach((item) => {
        const currentY = item.transform[5];
        if (lastY !== -1 && Math.abs(currentY - lastY) > 10) {
            textContent += '\n'; // Add a line break for vertical gaps
        }
        textContent += item.str.replace(/\s+/g, ' ') + ' ';
        lastY = currentY;
    });
    return textContent.trim();
}

// Render a specific page
function renderPage(num) {
    pdfDoc.getPage(num).then((page) => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: context, viewport: viewport };
        page.render(renderContext).promise.then(() => {
            document.getElementById('page_num').textContent = num;
            document.getElementById('page_num_bottom').textContent = num;

            // Dynamically fetch text content for this page
            page.getTextContent().then((text) => {
                const formattedText = formatTextContent(text.items);
                textContentCache[num] = formattedText; // Cache the text content

                // Use the line you've added to fetch text content with fallback
                let textContent = textContentCache[num] || 'click to next page';

                const textContainer = document.getElementById('text-container');
                const searchTerm = document.getElementById('search_input').value.toLowerCase();
                textContainer.innerHTML = searchTerm
                    ? highlightSearchTerm(textContent, searchTerm)
                    : textContent;
                textContainer.scrollTop = 0;
            });

            preloadAdjacentPages(num); // Preload adjacent pages
        });
    });
}

// Highlight search terms
function highlightSearchTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Navigation buttons
document.getElementById('prev').addEventListener('click', navigateToPreviousPage);
document.getElementById('next').addEventListener('click', navigateToNextPage);
document.getElementById('prev_bottom').addEventListener('click', navigateToPreviousPage);
document.getElementById('next_bottom').addEventListener('click', navigateToNextPage);

function navigateToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
}

function navigateToNextPage() {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
}

// Save the current page
document.getElementById('save').addEventListener('click', () => {
    const saveData = { title, page: currentPage };
    localStorage.setItem('savedPage', JSON.stringify(saveData));
    alert(`Page ${currentPage} of "${title}" saved!`);
});

// Load the saved page
document.getElementById('load').addEventListener('click', () => {
    const savedData = JSON.parse(localStorage.getItem('savedPage'));
    if (savedData && savedData.title === title) {
        currentPage = savedData.page;
        renderPage(currentPage);
        alert(`Loaded saved page ${savedData.page} of "${title}".`);
    } else {
        alert(`No saved page for "${title}".`);
    }
});

// Go to a specific page
document.getElementById('go').addEventListener('click', () => {
    const goToPage = parseInt(document.getElementById('page_input').value, 10);
    if (goToPage > 0 && goToPage <= pdfDoc.numPages) {
        currentPage = goToPage;
        renderPage(currentPage);
    } else {
        alert('Invalid page number.');
    }
});

// Search for a term
document.getElementById('search').addEventListener('click', () => {
    const searchTerm = document.getElementById('search_input').value.toLowerCase();
    searchResults = [];
    currentResultIndex = -1;

    Object.keys(textContentCache).forEach((page) => {
        if (textContentCache[page]?.toLowerCase().includes(searchTerm)) {
            searchResults.push(parseInt(page, 10));
        }
    });

    if (searchResults.length > 0) {
        currentResultIndex = 0;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
        updateSearchNavigationButtons();
    } else {
        alert('Term not found.');
    }
});

// Search navigation
document.getElementById('prev_search').addEventListener('click', () => {
    if (currentResultIndex > 0) {
        currentResultIndex--;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
        updateSearchNavigationButtons();
    }
});

document.getElementById('next_search').addEventListener('click', () => {
    if (currentResultIndex < searchResults.length - 1) {
        currentResultIndex++;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
        updateSearchNavigationButtons();
    }
});

// Update search navigation buttons
function updateSearchNavigationButtons() {
    document.getElementById('prev_search').disabled = currentResultIndex <= 0;
    document.getElementById('next_search').disabled =
        currentResultIndex >= searchResults.length - 1;
}