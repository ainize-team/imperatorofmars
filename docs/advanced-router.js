// advanced-router.js

(function() {
    // Sitemap URL - replace with your actual sitemap path
    const siteMapUrl = '/sitemap.json';
    
    /**
     * Load site map data
     */
    async function loadSiteMap() {
        try {
            const response = await fetch(siteMapUrl);
            if (!response.ok) {
                throw new Error('Failed to load sitemap');
            }
            
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                pagesInfo = data;
                console.log('Sitemap loaded successfully');
            }
        } catch (error) {
            console.warn('Using default page information:', error);
        }
        
        // After loading (or failing to load) sitemap, initialize routing and links
        initializePageFunctionality();
    }
    
    /**
     * Initialize page routing and next page links
     */
    function initializePageFunctionality() {
        // Make page information accessible globally
        window.pagesInfo = pagesInfo;
        
        // Try routing first, then add next page link if on a content page
        if (!handleRouting()) {
            addNextPageLink();
        }
    }
    
    /**
     * Handle routing to pattern-matched files
     */
    function handleRouting() {
        const path = window.location.pathname;
        
        // Check for '/number' pattern (e.g., /2)
        const numPattern = /^\/(\d+)$/;
        const numMatch = path.match(numPattern);
        
        if (numMatch && numMatch[1]) {
            const requestedIndex = parseInt(numMatch[1]);
            const pageInfo = pagesInfo.find(page => page.index === requestedIndex);
            
            if (pageInfo) {
                // Redirect to the matched file
                window.location.href = pageInfo.file;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get current page information
     */
    function getCurrentPageInfo() {
        const fileName = window.location.pathname.split('/').pop();
        return pagesInfo.find(page => page.file === fileName);
    }
    
    /**
     * Get next page information
     */
    function getNextPageInfo(currentPageInfo) {
        if (!currentPageInfo) return null;
        
        const currentIndex = currentPageInfo.index;
        return pagesInfo.find(page => page.index === currentIndex + 1);
    }
    
    /**
     * Add styles for next page link
     */
    function addStyles() {
        if (document.getElementById('next-page-styles')) {
            return; // Styles already added
        }
        
        const style = document.createElement('style');
        style.id = 'next-page-styles';
        style.textContent = `
            .next-page-container {
                margin: 30px 0;
                padding: 15px;
                border-top: 1px solid #eee;
                text-align: right;
            }
            .next-page-link {
                display: inline-block;
                padding: 8px 16px;
                background-color: #f5f5f5;
                color: #333;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                transition: all 0.2s;
            }
            .next-page-link:hover {
                background-color: #e0e0e0;
                transform: translateX(3px);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Create and add next page link
     */
    function addNextPageLink() {
        const currentPageInfo = getCurrentPageInfo();
        if (!currentPageInfo) return; // Exit if current page info not found
        
        const nextPageInfo = getNextPageInfo(currentPageInfo);
        if (!nextPageInfo) return; // Exit if no next page exists
        
        // Add styles
        addStyles();
        
        // Create link container
        const container = document.createElement('div');
        container.className = 'next-page-container';
        
        // Create link
        const link = document.createElement('a');
        link.href = nextPageInfo.file;
        link.className = 'next-page-link';
        link.innerHTML = `Next: ${nextPageInfo.title} &rarr;`;
        
        container.appendChild(link);
        document.body.appendChild(container);
    }
    
    // Start by loading the sitemap
    window.addEventListener('DOMContentLoaded', loadSiteMap);
})();
