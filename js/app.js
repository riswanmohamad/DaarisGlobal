/**
 * Daaris Global - Main Application
 * Handles fetching and displaying educational offers from Google Drive
 */

// State management
let allOffers = [];
let filteredOffers = [];

// DOM Elements
const offersGrid = document.getElementById('offersGrid');
const searchInput = document.getElementById('searchInput');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close-modal');

/**
 * Initialize the application
 */
function init() {
    setupEventListeners();
    fetchOffers();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterOffers(e.target.value);
        }, 300);
    });

    // Modal close events
    closeModal.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) {
            closeImageModal();
        }
    });
}

/**
 * Fetch educational offers from Google Drive
 */
async function fetchOffers() {
    try {
        showLoading(true);
        hideError();

        // Construct the API URL to fetch files from the specified folder
        const url = `${CONFIG.googleDriveApiUrl}?q='${CONFIG.googleDriveFolderId}'+in+parents+and+mimeType+contains+'image/'&key=${CONFIG.googleApiKey}&fields=files(id,name,mimeType)`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.files || data.files.length === 0) {
            showError('No educational offers found.');
            return;
        }

        // Process and store offers
        allOffers = data.files.map(file => ({
            id: file.id,
            name: extractOfferName(file.name),
            originalName: file.name,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
            fullImageUrl: `https://lh3.googleusercontent.com/d/${file.id}`
        }));

        filteredOffers = [...allOffers];
        renderOffers();
        
    } catch (error) {
        console.error('Error fetching offers:', error);
        showError('Unable to load educational offers. Please check your API configuration.');
    } finally {
        showLoading(false);
    }
}

/**
 * Extract offer name from filename (remove extension)
 */
function extractOfferName(filename) {
    // Remove file extension
    return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Filter offers based on search query
 */
function filterOffers(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredOffers = [...allOffers];
    } else {
        // Use 'contains' operator - filter offers where name contains the search term
        filteredOffers = allOffers.filter(offer => 
            offer.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderOffers();
}

/**
 * Render offers to the grid
 */
function renderOffers() {
    // Clear existing content
    offersGrid.innerHTML = '';
    
    // Check if there are offers to display
    if (filteredOffers.length === 0) {
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    
    // Create and append offer cards
    filteredOffers.forEach((offer, index) => {
        const card = createOfferCard(offer, index);
        offersGrid.appendChild(card);
    });
}

/**
 * Create an offer card element
 */
function createOfferCard(offer, index) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="offer-image-container">
            <img 
                src="${offer.thumbnailUrl}" 
                alt="${offer.name}" 
                class="offer-image"
                loading="lazy"
            >
        </div>
        <div class="offer-name">${offer.name}</div>
    `;
    
    // Add click event to open full screen modal
    card.addEventListener('click', () => openImageModal(offer));
    
    return card;
}

/**
 * Open the image modal with full-screen image
 */
function openImageModal(offer) {
    modalImage.src = offer.fullImageUrl;
    modalImage.alt = offer.name;
    modalCaption.textContent = offer.name;
    imageModal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close the image modal
 */
function closeImageModal() {
    imageModal.classList.remove('active');
    modalImage.src = '';
    modalCaption.textContent = '';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.querySelector('p').textContent = message;
    offersGrid.style.display = 'none';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
    offersGrid.style.display = 'grid';
}

/**
 * Show/hide no results message
 */
function showNoResults(show) {
    noResults.style.display = show ? 'block' : 'none';
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
