/**
 * Daaris Global - Main Application JavaScript
 * Handles offer loading, search functionality, and modal interactions
 */

(function() {
    'use strict';

    // ========================================
    // State Management
    // ========================================
    const state = {
        offers: [],
        filteredOffers: [],
        currentModalIndex: -1,
        isModalOpen: false
    };

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        offersGrid: document.getElementById('offersGrid'),
        resultsCount: document.getElementById('resultsCount'),
        noResults: document.getElementById('noResults'),
        loading: document.getElementById('loading'),
        modal: document.getElementById('imageModal'),
        modalImage: document.getElementById('modalImage'),
        modalTitle: document.getElementById('modalTitle'),
        closeModal: document.getElementById('closeModal'),
        prevImage: document.getElementById('prevImage'),
        nextImage: document.getElementById('nextImage')
    };

    // ========================================
    // Utility Functions
    // ========================================
    
    /**
     * Debounce function to limit the rate of function execution
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generate thumbnail URL from Google Drive file ID
     */
    function getThumbnailUrl(imageId) {
        if (!imageId) {
            return null;
        }
        return `${CONFIG.googleDriveThumbnailUrl}${imageId}&sz=w400`;
    }

    /**
     * Generate full image URL from Google Drive file ID
     */
    function getFullImageUrl(imageId) {
        if (!imageId) {
            return null;
        }
        // Google Drive `uc?export=view` can return an HTML interstitial (and fail in <img>).
        // The thumbnail endpoint reliably returns actual image bytes.
        return `${CONFIG.googleDriveThumbnailUrl}${imageId}&sz=w2000`;
    }

    /**
     * Fallback full image URL (kept as a secondary option)
     */
    function getFullImageFallbackUrl(imageId) {
        if (!imageId) {
            return null;
        }
        return `${CONFIG.googleDriveViewUrl}${imageId}`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // Render Functions
    // ========================================

    /**
     * Create HTML for a single offer card
     */
    function createOfferCard(offer, index) {
        const thumbnailUrl = getThumbnailUrl(offer.imageId);
        const escapedName = escapeHtml(offer.name);
        const placeholderHtml = '<div class="offer-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>';
        const imageContent = thumbnailUrl
            ? `<img data-src="${thumbnailUrl}" alt="${escapedName}" class="offer-image lazy" onerror="this.parentElement.innerHTML='${placeholderHtml.replace(/'/g, "\\'")}'">`
            : placeholderHtml;

        return `<article class="offer-card" data-index="${index}" data-image-id="${offer.imageId}" tabindex="0" role="button" aria-label="View ${escapedName}"><div class="offer-image-wrapper">${imageContent}<div class="offer-overlay"><div class="view-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div></div></div><div class="offer-info"><h3 class="offer-title">${escapedName}</h3></div></article>`;
    }

    /**
     * Render all offers to the grid
     */
    function renderOffers(offers) {
        if (offers.length === 0) {
            elements.offersGrid.innerHTML = '';
            elements.noResults.classList.remove('hidden');
            elements.resultsCount.textContent = 'No offers found';
            return;
        }

        elements.noResults.classList.add('hidden');
        elements.offersGrid.innerHTML = offers.map((offer, index) => createOfferCard(offer, index)).join('');
        elements.resultsCount.textContent = `Showing ${offers.length} educational offer${offers.length !== 1 ? 's' : ''}`;
        
        // Add click listeners to cards
        attachCardListeners();
        
        // Initialize lazy loading for images
        initLazyLoading();
    }

    /**
     * Attach click/keyboard listeners to offer cards
     */
    function attachCardListeners() {
        const cards = elements.offersGrid.querySelectorAll('.offer-card');
        cards.forEach(card => {
            card.addEventListener('click', handleCardClick);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(e);
                }
            });
        });
    }

    /**
     * Initialize lazy loading for images using Intersection Observer
     */
    function initLazyLoading() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately
            const lazyImages = elements.offersGrid.querySelectorAll('img.lazy');
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                }
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',  // Start loading 50px before the image enters viewport
            threshold: 0.01
        });

        const lazyImages = elements.offersGrid.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ========================================
    // Search Functionality
    // ========================================

    /**
     * Filter offers based on search query (contains match)
     */
    function filterOffers(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            state.filteredOffers = [...state.offers];
        } else {
            state.filteredOffers = state.offers.filter(offer => 
                offer.name.toLowerCase().includes(searchTerm)
            );
        }
        
        renderOffers(state.filteredOffers);
    }

    /**
     * Handle search input changes
     */
    const handleSearch = debounce((e) => {
        const query = e.target.value;
        filterOffers(query);
        
        // Toggle clear button visibility
        if (query.length > 0) {
            elements.clearSearch.classList.add('visible');
        } else {
            elements.clearSearch.classList.remove('visible');
        }
    }, 300);

    /**
     * Clear search input
     */
    function clearSearch() {
        elements.searchInput.value = '';
        elements.clearSearch.classList.remove('visible');
        filterOffers('');
        elements.searchInput.focus();
    }

    // ========================================
    // Modal Functionality
    // ========================================

    /**
     * Open modal with specific offer
     */
    function openModal(index, imageId) {
        const offer = state.filteredOffers[index];
        if (!offer) return;

        // Use provided imageId or get from offer
        const actualImageId = imageId || offer.imageId;
        const fullImageUrl = getFullImageUrl(actualImageId);
        const fallbackUrl = getFullImageFallbackUrl(actualImageId);
        
        state.currentModalIndex = index;
        state.isModalOpen = true;
        
        // Clear previous image and show loading state
        elements.modalImage.src = '';
        elements.modalImage.style.opacity = '0';
        
        // Load the full image (with fallback)
        const img = new Image();
        img.onload = function() {
            elements.modalImage.src = fullImageUrl;
            elements.modalImage.style.opacity = '1';
        };
        img.onerror = function() {
            if (fallbackUrl && fallbackUrl !== fullImageUrl) {
                const img2 = new Image();
                img2.onload = function() {
                    elements.modalImage.src = fallbackUrl;
                    elements.modalImage.style.opacity = '1';
                };
                img2.onerror = function() {
                    // Last resort: set original URL so user sees *something* if it eventually works
                    elements.modalImage.src = fullImageUrl;
                    elements.modalImage.style.opacity = '1';
                };
                img2.src = fallbackUrl;
                return;
            }

            elements.modalImage.src = fullImageUrl;
            elements.modalImage.style.opacity = '1';
        };
        img.src = fullImageUrl;
        
        elements.modalImage.alt = offer.name;
        elements.modalTitle.textContent = offer.name;
        
        elements.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        updateNavigationButtons();
        
        // Focus trap
        elements.closeModal.focus();
    }

    /**
     * Close modal
     */
    function closeModal() {
        state.isModalOpen = false;
        state.currentModalIndex = -1;
        
        elements.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the card that was clicked
        const cards = elements.offersGrid.querySelectorAll('.offer-card');
        if (cards[state.currentModalIndex]) {
            cards[state.currentModalIndex].focus();
        }
    }

    /**
     * Navigate to previous image
     */
    function showPreviousImage() {
        if (state.currentModalIndex > 0) {
            const prevOffer = state.filteredOffers[state.currentModalIndex - 1];
            openModal(state.currentModalIndex - 1, prevOffer.imageId);
        }
    }

    /**
     * Navigate to next image
     */
    function showNextImage() {
        if (state.currentModalIndex < state.filteredOffers.length - 1) {
            const nextOffer = state.filteredOffers[state.currentModalIndex + 1];
            openModal(state.currentModalIndex + 1, nextOffer.imageId);
        }
    }

    /**
     * Update navigation button states
     */
    function updateNavigationButtons() {
        elements.prevImage.disabled = state.currentModalIndex <= 0;
        elements.nextImage.disabled = state.currentModalIndex >= state.filteredOffers.length - 1;
    }

    /**
     * Handle card click
     */
    function handleCardClick(e) {
        const card = e.currentTarget;
        const index = parseInt(card.dataset.index, 10);
        const imageId = card.dataset.imageId;
        openModal(index, imageId);
    }

    // ========================================
    // Event Handlers
    // ========================================

    /**
     * Handle keyboard events
     */
    function handleKeydown(e) {
        if (!state.isModalOpen) return;

        switch (e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }

    /**
     * Handle modal backdrop click
     */
    function handleModalClick(e) {
        if (e.target === elements.modal) {
            closeModal();
        }
    }

    // ========================================
    // Touch/Swipe Support
    // ========================================
    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next image
                showNextImage();
            } else {
                // Swiped right - previous image
                showPreviousImage();
            }
        }
    }

    // ========================================
    // Initialization
    // ========================================

    /**
     * Fetch offers from Google Drive folder
     */
    async function loadOffersFromGoogleDrive() {
        try {
            // Check if API key and folder ID are configured
            if (!CONFIG.googleApiKey || CONFIG.googleApiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
                throw new Error('Google API Key not configured');
            }
            if (!CONFIG.googleDriveFolderId || CONFIG.googleDriveFolderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE') {
                throw new Error('Google Drive Folder ID not configured');
            }

            // Fetch files from Google Drive folder
            const url = `${CONFIG.googleDriveApiUrl}?q='${CONFIG.googleDriveFolderId}'+in+parents+and+mimeType+contains+'image/'&key=${CONFIG.googleApiKey}&fields=files(id,name,mimeType,thumbnailLink)`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.files || data.files.length === 0) {
                throw new Error('No images found in the folder');
            }
            
            // Map Google Drive files to offers
            state.offers = data.files.map((file, index) => ({
                id: index + 1,
                name: file.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, ''), // Remove extension
                imageId: file.id,
                mimeType: file.mimeType
            }));
            
            state.filteredOffers = [...state.offers];
            
            elements.loading.classList.add('hidden');
            renderOffers(state.filteredOffers);
            
        } catch (error) {
            console.error('Error loading offers:', error);
            const msg = String(error && error.message ? error.message : 'Unknown error');
            elements.loading.innerHTML = `<div style="color: var(--accent-purple); text-align: center;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;margin:0 auto 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><h3 style="margin-bottom:.5rem;">Unable to Load Offers</h3><p style="color: var(--text-muted); max-width: 500px; margin: 0 auto;">${escapeHtml(msg)}<br><br>Please check your configuration in <code>js/config.js</code></p><details style="margin-top:1rem;cursor:pointer;"><summary style="color: var(--text-muted);">Setup Instructions</summary><ol style="text-align:left;max-width:600px;margin:1rem auto;color: var(--text-muted);font-size:.875rem;"><li>Create a folder in Google Drive and upload images</li><li>Right-click folder → Share → "Anyone with the link" can view</li><li>Copy the folder ID from the URL</li><li>Get an API key from Google Cloud Console</li><li>Enable Google Drive API</li><li>Update js/config.js with your API key and folder ID</li></ol></details></div>`;
        }
    }
    
    /**
     * Load offers - main entry point
     */
    function loadOffers() {
        loadOffersFromGoogleDrive();
    }

    /**
     * Initialize all event listeners
     */
    function initEventListeners() {
        // Search
        elements.searchInput.addEventListener('input', handleSearch);
        elements.clearSearch.addEventListener('click', clearSearch);

        // Modal
        elements.closeModal.addEventListener('click', closeModal);
        elements.prevImage.addEventListener('click', showPreviousImage);
        elements.nextImage.addEventListener('click', showNextImage);
        elements.modal.addEventListener('click', handleModalClick);

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        // Touch/Swipe support for modal
        elements.modal.addEventListener('touchstart', handleTouchStart, { passive: true });
        elements.modal.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    /**
     * Initialize the application
     */
    function init() {
        initEventListeners();
        loadOffers();
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
