let pdfDoc = null;
let currentPage = 1;
let textContentCache = [];
let searchResults = [];
let currentResultIndex = -1;

// Retrieve the PDF URL from the meta tag
const url = document.querySelector('meta[name="pdf-url"]').getAttribute('content');

// Load the PDF document on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadPdf(url);

    const savedPage = localStorage.getItem('savedPage');
    if (savedPage) {
        currentPage = parseInt(savedPage, 10);
    }
});

// Load and initialize the PDF document
function loadPdf(url) {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(pdf => {
        pdfDoc = pdf;
        document.getElementById('page_count').textContent = pdf.numPages;
        document.getElementById('page_count_bottom').textContent = pdf.numPages;
        renderPage(currentPage);

        // Cache text content for each page
        for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(page => {
                return page.getTextContent().then(text => {
                    textContentCache[i] = formatTextContent(text.items);
                });
            });
        }
    }).catch(reason => {
        console.error(reason);
    });
}

function formatTextContent(items) {
    let textContent = '';
    let lastY = -1;
    const lineThreshold = 5; // Adjust for tighter or looser line spacing
    const paragraphThreshold = 15; // Threshold for paragraph breaks

    items.forEach(item => {
        const currentY = item.transform[5];
        const text = item.str.trim();

        // Skip empty strings or artifacts
        if (!text) return;

        // Add a paragraph break for larger vertical gaps
        if (lastY !== -1 && Math.abs(currentY - lastY) > paragraphThreshold) {
            textContent += '\n\n'; // Paragraph break
        } 
        // Add a line break for moderate gaps
        else if (lastY !== -1 && Math.abs(currentY - lastY) > lineThreshold) {
            textContent += '\n'; // Line break
        }

        // Add the item text, preserving spaces between words
        textContent += (textContent.endsWith(' ') ? '' : ' ') + text;
        lastY = currentY;
    });

    return textContent.trim();
}

function highlightSearchTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span style="background-color: yellow;">$1</span>');
}

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            document.getElementById('page_num').textContent = num;
            document.getElementById('page_num_bottom').textContent = num;

            const textContainer = document.getElementById('text-container');
            let textContent = textContentCache[num] || 'Click to next page';
            const searchTerm = document.getElementById('search_input').value.toLowerCase();

            if (searchTerm) {
                textContent = highlightSearchTerm(textContent, searchTerm);
            }

            textContainer.innerHTML = textContent;

            // Scroll the text container to the top
            textContainer.scrollTop = 0;
        });
    });
}

// Navigation buttons and search functionality
document.getElementById('prev').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
});

// Bottom Navigation buttons
document.getElementById('prev_bottom').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
});

document.getElementById('next_bottom').addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
});

// Search functionality
document.getElementById('search').addEventListener('click', () => {
    const searchTerm = document.getElementById('search_input').value.toLowerCase();
    searchResults = [];
    currentResultIndex = -1;

    for (let i = 1; i < textContentCache.length; i++) {
        if (textContentCache[i] && textContentCache[i].toLowerCase().includes(searchTerm)) {
            searchResults.push(i);
        }
    }

    if (searchResults.length > 0) {
        currentResultIndex = 0;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
    } else {
        alert('Word not found in the document.');
    }
});

// Navigate to the next search result
document.getElementById('next_search').addEventListener('click', () => {
    if (searchResults.length > 0 && currentResultIndex < searchResults.length - 1) {
        currentResultIndex++;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
    }
});

// Navigate to the previous search result
document.getElementById('prev_search').addEventListener('click', () => {
    if (searchResults.length > 0 && currentResultIndex > 0) {
        currentResultIndex--;
        currentPage = searchResults[currentResultIndex];
        renderPage(currentPage);
    }
});

// Save page functionality
document.getElementById('save').addEventListener('click', () => {
    localStorage.setItem('savedPage', currentPage);
    alert(`Page ${currentPage} saved!`);
});

// Load saved page functionality
document.getElementById('load').addEventListener('click', () => {
    const savedPage = localStorage.getItem('savedPage');
    if (savedPage) {
        currentPage = parseInt(savedPage, 10);
        renderPage(currentPage);
        alert(`Saved page ${currentPage} loaded!`);
    } else {
        alert('No saved page found.');
    }
});

// Go to specific page
document.getElementById('go').addEventListener('click', () => {
    const inputPage = parseInt(document.getElementById('page_input').value);
    if (inputPage > 0 && inputPage <= pdfDoc.numPages) {
        currentPage = inputPage;
        renderPage(currentPage);
    } else {
        alert('Please enter a valid page number.');
    }
});

// Swipe functionality
let touchstartX = 0;
let touchendX = 0;

const handleSwipe = () => {
    if (touchendX < touchstartX) {
        if (currentPage < pdfDoc.numPages) {
            currentPage++;
            renderPage(currentPage);
        }
    }
    if (touchendX > touchstartX) {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    }
};

const canvas = document.getElementById('pdf-canvas');
canvas.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
});

canvas.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
});