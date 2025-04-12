// page-linker.js
(function() {
    // Path to your sitemap.json file
    const sitemapUrl = '/sitemap.json';
    
    /**
     * Load the sitemap data and process the page
     */
    async function initPageLinker() {
        try {
            // Fetch the sitemap
            const response = await fetch(sitemapUrl);
            if (!response.ok) {
                throw new Error(`Failed to load sitemap: ${response.status}`);
            }
            
            // Parse the JSON data
            const pages = await response.json();
            
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
        return path.split('/').pop(); // Get the last part of the path
    }
    
    /**
     * Find the current page in the sitemap
     */
    function findCurrentPage(pages) {
        const currentFilename = getCurrentFilename();
        return pages.find(page => page.file === currentFilename);
    }
    
    /**
     * Find the next page based on the current page index
     */
    function findNextPage(pages, currentPage) {
        if (!currentPage || !currentPage.index) return null;
        
        // Find the page with the next sequential index
        return pages.find(page => page.index === currentPage.index + 1);
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
     * Add the next page link to the current page
     */
    function addNextPageLink(pages) {
        // Find the current and next pages
        const currentPage = findCurrentPage(pages);
        const nextPage = findNextPage(pages, currentPage);
        
        // Exit if there's no next page
        if (!nextPage) return;
        
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
    }
    
    // Initialize when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageLinker);
    } else {
        initPageLinker();
    }
})();
