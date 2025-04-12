// page-linker.js - 개선된 버전
(function() {
    // 상대 경로로 sitemap.json을 참조 (더 안정적)
    const sitemapUrl = 'sitemap.json';
    
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
     * Add the next page link to the current page
     */
    function addNextPageLink(pages) {
        // Find the current and next pages
        const currentPage = findCurrentPage(pages);
        if (!currentPage) {
            console.warn("Current page not found in sitemap");
            return;
        }
        
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
