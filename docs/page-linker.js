// page-linker.js - 개선된 버전
(function() {
    // 상대 경로로 sitemap.json을 참조 (더 안정적)
    const sitemapUrl = '/sitemap.json';
    
    /**
     * Load the sitemap data and process the page
     */
    async function initPageLinker() {
        try {
            // Fetch the sitemap
            const response = await fetch(sitemapUrl);
            if (!response.ok) {
                console.warn(`Failed to load sitemap: ${response.status}`);
                return;
            }
            
            // Parse the JSON data
            const pages = await response.json();
            console.log("Sitemap loaded:", pages); // 디버깅을 위한 로그

            // Add the next page link
            addNextPageLink(pages);
            
        } catch (error) {
            console.warn('Page linker error:', error);
        }
    }
    
    /**
     * Get the current filename from the URL
     */
    function getCurrentFilename() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html'; // 빈 문자열이면 index.html로 처리
        console.log("Current filename:", filename); // 디버깅을 위한 로그
        return filename;
    }
    
    /**
     * Find the current page in the sitemap
     */
    function findCurrentPage(pages) {
        const currentFilename = getCurrentFilename();
        const currentPage = pages.find(page => page.file === currentFilename);
        console.log("Current page:", currentPage); // 디버깅을 위한 로그
        return currentPage;
    }
    
    /**
     * Find the next page based on the current page index
     */
    function findNextPage(pages, currentPage) {
        if (!currentPage || typeof currentPage.index !== 'number') return null;
        
        // Find the page with the next sequential index
        const nextPage = pages.find(page => page.index === currentPage.index + 1);
        console.log("Next page:", nextPage); // 디버깅을 위한 로그
        return nextPage;
    }
    
    /**
     * Add CSS styles for the next page link
     */
    function addStyles() {
        // Skip if styles are already added
        if (document.getElementById('page-linker-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'page-linker-styles';
        styles.textContent = `
            .next-page-link {
                display: block;
                margin: 30px 0;
                padding: 15px;
                border-top: 1px solid #eee;
                text-align: right;
            }
            
            .next-page-link a {
                display: inline-block;
                padding: 8px 16px;
                background-color: #f5f5f5;
                color: #333;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                transition: all 0.2s ease;
            }
            
            .next-page-link a:hover {
                background-color: #e0e0e0;
                transform: translateX(3px);
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * Try to add an image based on the current page index
     */
    async function tryAddImage(index) {
        const imagePath = `${index}.png`;
        
        // Check if the image exists
        try {
            // Use fetch to check if the image exists
            const response = await fetch(imagePath, { method: 'HEAD' });
            
            if (response.ok) {
                // Image exists, add it to the page
                addImageToPage(imagePath);
                console.log(`Added image: ${imagePath}`);
            } else {
                console.log(`Image not found: ${imagePath}`);
            }
        } catch (error) {
            console.log(`Error checking image: ${error.message}`);
            
            // Alternative approach: try to add the image anyway and let the browser handle missing images
            addImageToPage(imagePath);
        }
    }
    
    /**
     * Add an image to the page
     */
    function addImageToPage(imagePath) {
        // Add styles for the image container
        const styles = document.createElement('style');
        styles.textContent = `
            .page-image-container {
                margin: 20px 0;
                text-align: center;
            }
            .page-image {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(styles);
        
        // Create image container
        const container = document.createElement('div');
        container.className = 'page-image-container';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'page-image';
        img.alt = 'Page Illustration';
        
        // Add image to the container
        container.appendChild(img);
        
        // Find a good place to insert the image (after the first heading or at the top of the body)
        const firstHeading = document.querySelector('h1, h2');
        if (firstHeading) {
            // Insert after the first heading
            firstHeading.parentNode.insertBefore(container, firstHeading.nextSibling);
        } else {
            // Insert at the beginning of the body
            const body = document.body;
            body.insertBefore(container, body.firstChild);
        }
    }
    
    /**
     * Add the next page link to the current page
     */
    function addNextPageLink(pages) {
        // Find the current and next pages
        const currentPage = findCurrentPage(pages);
        if (!currentPage) {
            console.warn("Current page not found in sitemap");
            return;
        }
        
        // Add image if it exists
        tryAddImage(currentPage.index);
        
        const nextPage = findNextPage(pages, currentPage);
        
        // Exit if there's no next page
        if (!nextPage) {
            console.log("No next page found");
            return;
        }
        
        // Add styles
        addStyles();
        
        // Create the next page link container
        const container = document.createElement('div');
        container.className = 'next-page-link';
        
        // Create the link
        const link = document.createElement('a');
        link.href = nextPage.file;
        link.innerHTML = `Next: ${nextPage.title} &rarr;`;
        
        // Add to the page
        container.appendChild(link);
        document.body.appendChild(container);
        console.log("Next page link added");
    }
    
    // Initialize when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageLinker);
    } else {
        initPageLinker();
    }
})();
