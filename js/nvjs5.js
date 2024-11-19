// Retrieve the word from the meta tag in the head
    const wordFromHead = document.querySelector('meta[name="word"]').content;
    
    // Display the word in the body
    document.querySelector('.displayWord').textContent = wordFromHead;
