

const SHOP_DOMAIN = '1cb12f-54.myshopify.com';

const STOREFRONT_TOKEN = '9460b0b6db23e5243a0dd946bd430609';

const SHOPIFY_STOREFRONT_API = `https://${SHOP_DOMAIN}/api/2023-07/graphql.json`; 

let products = [];

let xAxisCollections = []; 

let yAxisCollections = [];

let currentXAxisCollection = null;

let yAxisProducts = [];

const PANEL_COUNT = 5;

let horizontalIndex = 0;

let verticalIndex = 0;

let activeCarousel = "horizontal";

let touchStartX = 0;

let touchStartY = 0;

let touchEndX = 0;

let touchEndY = 0;

let listenersAttached = false;

let isMouseDown = false;

let isSwiping = false;

let clickStartTime = 0;

let clickStartX = 0;

let clickStartY = 0;

let isProductPage = false;



// Interaction tracking system

const INTERACTIONS_STORAGE_KEY = 'spinning_tool_interactions';



// Utility functions for managing interactions in localStorage

function getInteractions() {

  try {

    const stored = localStorage.getItem(INTERACTIONS_STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];

  } catch (error) {

    console.error('[InteractionTracker] ❌ Error loading interactions from localStorage:', error);

    return [];

  }

}



function saveInteractions(interactions) {

  try {

    localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(interactions));

    console.log('[InteractionTracker] 💾 Saved interactions to localStorage:', interactions.length, 'items');

  } catch (error) {

    console.error('[InteractionTracker] ❌ Error saving interactions to localStorage:', error);

  }

}



function trackInteraction(product, interactionType) {

  if (!product || !product.id || !product.title) {

    console.warn('[InteractionTracker] ⚠️ Invalid product data for tracking:', product);

    return;

  }



  const interactions = getInteractions();

  const currentTime = new Date().toISOString();

  

  // Find existing interaction with same productId and interactionType

  const existingIndex = interactions.findIndex(

    interaction => interaction.productId === product.id && interaction.interactionType === interactionType

  );



  if (existingIndex !== -1) {

    // Update existing interaction

    interactions[existingIndex].count += 1;

    interactions[existingIndex].timestamps.push(currentTime);

    console.log(`[InteractionTracker] 📈 Updated ${interactionType} for product ${product.title}: count = ${interactions[existingIndex].count}`);

  } else {

    // Create new interaction

    const newInteraction = {

      productId: product.id,

      productName: product.title || product.name,

      productImage: product.images && product.images[0] ? product.images[0] : '',

      interactionType: interactionType,

      count: 1,

      timestamps: [currentTime]

    };

    interactions.push(newInteraction);

    console.log(`[InteractionTracker] ➕ New ${interactionType} for product ${product.title}`);

  }



  saveInteractions(interactions);

}



// Utility function to view tracked interactions (for testing)

function viewTrackedInteractions() {

  const interactions = getInteractions();

  console.log('[InteractionTracker] 📊 Current tracked interactions:', interactions);

  return interactions;

}



// Utility function to clear all tracked interactions (for testing)

function clearTrackedInteractions() {

  localStorage.removeItem(INTERACTIONS_STORAGE_KEY);

  console.log('[InteractionTracker] 🗑️ Cleared all tracked interactions');

}



// Make utility functions available globally for testing

window.viewTrackedInteractions = viewTrackedInteractions;

window.clearTrackedInteractions = clearTrackedInteractions;



// Make mobile carousel functions available globally for debugging

window.populateMobileCarousel = populateMobileCarousel;

window.initMobileHierarchicalCarousel = initMobileHierarchicalCarousel;

window.navigateToMobileLevel = navigateToMobileLevel;

window.selectMobileThirdLevelCollection = selectMobileThirdLevelCollection;



// Theme toggle functionality

function toggleTheme() {

  // Get all toggle switches (both mobile and desktop)
  const toggleSwitches = document.querySelectorAll('.toggle-switch');

  if (toggleSwitches.length > 0) {
    // Toggle all toggle switches to keep them in sync
    toggleSwitches.forEach(toggleSwitch => {
      toggleSwitch.classList.toggle('active');
    });

    const isDarkMode = toggleSwitches[0].classList.contains('active');

    // Apply dark mode class to body
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      console.log('[Theme] 🎨 Theme toggled: Dark Mode');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('[Theme] 🎨 Theme toggled: Light Mode');
    }
    
    // Store theme preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }

}

// Load saved theme on page load

function loadTheme() {

  const savedTheme = localStorage.getItem('theme');

  const toggleSwitches = document.querySelectorAll('.toggle-switch');

  

  if (savedTheme === 'dark') {

    document.body.classList.add('dark-mode');

    // Sync all toggle switches
    toggleSwitches.forEach(toggleSwitch => {
      toggleSwitch.classList.add('active');
    });

    console.log('[Theme] 🎨 Loaded theme: Dark Mode');

  } else {

    document.body.classList.remove('dark-mode');

    // Sync all toggle switches
    toggleSwitches.forEach(toggleSwitch => {
      toggleSwitch.classList.remove('active');
    });

    console.log('[Theme] 🎨 Loaded theme: Light Mode (default)');

  }

}



// Test function to manually populate mobile carousel with test data

window.testMobileCarousel = function() {

  console.log('[MobileApp] 🧪 Testing mobile carousel population');

  const mobileLevel1Items = document.getElementById('mobile-level-1-items');

  if (!mobileLevel1Items) {

    console.log('[MobileApp] ❌ Mobile level 1 items container not found');

    return;

  }

  

  // Clear existing content

  mobileLevel1Items.innerHTML = '';

  

  // Add test items

  const testItems = ['Watches', 'Bags', 'T-Shirts', 'Headphones'];

  testItems.forEach((item, index) => {

    const collectionItem = document.createElement('div');

    collectionItem.className = 'collection-item';

    collectionItem.style.background = '#000000';

    collectionItem.innerHTML = `

      <div class="folder-icon">${index + 1}</div>

      <div class="collection-title">${item}</div>

    `;

    mobileLevel1Items.appendChild(collectionItem);

  });

  

  console.log('[MobileApp] ✅ Test items added to mobile carousel');

};



function showLoading() {

const isMobile = window.innerWidth < 668;
const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
const carouselHorizontal = isMobile ? document.querySelector('.mobile-carousel-horizontal') : document.querySelector('.desktop-carousel-horizontal');
if (carouselVertical) carouselVertical.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2em;">Loading...</div>';

if (carouselHorizontal) carouselHorizontal.innerHTML = ''; }

function getProductHandleFromURL() {

const url = window.location.href;

const productMatch = url.match(/\/products\/([^\/\?]+)/);

const handle = productMatch ? productMatch[1] : null;

return handle;

}

function checkIfProductPage() {

const handle = getProductHandleFromURL();

console.log('[SpinningTool] 📍 Product handle found:', handle);

if (handle) {

  console.log('[SpinningTool] ✅ Product page detected!');

  isProductPage = true;

  

  const productIndicators = [

    document.querySelector('[data-product]'),

    document.querySelector('.product'),

    document.querySelector('.product-single'),

    document.querySelector('[data-product-json]'),

    document.querySelector('form[action*="/cart/add"]')

  ];

  const hasProductIndicators = productIndicators.some(indicator => indicator !== null);

  console.log('[SpinningTool] 📍 Product indicators found:', hasProductIndicators);

  

  if (hasProductIndicators) {

    console.log('[SpinningTool] 🎯 Confirmed product page, applying styling...');

    applyProductPageStyling();

    return true;

  } else {

    console.log('[SpinningTool] ⚠️ Product handle found but no product indicators detected');

  }

} else {

  console.log('[SpinningTool] ❌ Not on a product page');

}

return false; }

function applyProductPageStyling() {

console.log('[SpinningTool] 🎨 Applying product page styling...');

const carouselContainer = document.getElementById('spinning-tool-carousel');

const wrapper = document.getElementById('spinning-tool-wrapper');

if (!carouselContainer || !wrapper) {

  return;

}

if (carouselContainer) {

  carouselContainer.classList.add('product-page');

  carouselContainer.style.width = '450px';

  carouselContainer.style.height = '450px';

  carouselContainer.style.maxWidth = '450px';

  carouselContainer.style.maxHeight = '450px';

  // Apply responsive perspective based on screen width
  const isSmallScreen = window.innerWidth < 550;
  carouselContainer.style.perspective = isSmallScreen ? '800px' : '1000px';

  carouselContainer.style.transformStyle = 'preserve-3d';

  carouselContainer.style.borderRadius = '8px';

  carouselContainer.style.background = '#fff';

  carouselContainer.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';

  carouselContainer.style.overflow = 'hidden';

  carouselContainer.style.position = 'relative';

  carouselContainer.style.flexShrink = '0';

  const verticalCarousel = carouselContainer.querySelector('.carousel-vertical');

  const horizontalCarousel = carouselContainer.querySelector('.carousel-horizontal');

  if (verticalCarousel) {

    verticalCarousel.style.transformStyle = 'preserve-3d';

    verticalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

    console.log('[SpinningTool] ✅ Styled vertical carousel');

  }

  if (horizontalCarousel) {

    horizontalCarousel.style.transformStyle = 'preserve-3d';

    horizontalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

    console.log('[SpinningTool] ✅ Styled horizontal carousel');

  } }

if (wrapper) {

  wrapper.className = 'wrapper product-page-wrapper';

  wrapper.style.width = '100%';

  wrapper.style.maxWidth = '450px';

  wrapper.style.height = '450px';

  wrapper.style.margin = '0';

  wrapper.style.display = 'flex';

  wrapper.style.justifyContent = 'center';

  wrapper.style.alignItems = 'center';

  wrapper.style.padding = '0';

  wrapper.style.boxSizing = 'border-box';

  wrapper.style.flexShrink = '0';

  wrapper.style.flex = '0 0 auto';

  wrapper.style.alignSelf = 'flex-start';

  console.log('[SpinningTool] ✅ Styled wrapper');

}

setTimeout(() => {

  console.log('[SpinningTool] 🎯 Attempting to position spinning tool...');

  const success = positionSpinningToolInProductArea();

  if (success) {

    console.log('[SpinningTool] ✅ Successfully positioned, marking as active...');

    markSpinningToolAsActive();

  } else {

    console.log('[SpinningTool] ⚠️ Positioning failed, showing wrapper normally...');

    wrapper.style.display = 'block';

    wrapper.style.visibility = 'visible';

    wrapper.style.opacity = '1';

  }

  fix3DTransforms();

  console.log('[SpinningTool] ✅ Product page styling applied successfully');

}, 500);

}



function positionSpinningToolInProductArea() {

const carouselContainer = document.getElementById('spinning-tool-carousel');

const wrapper = document.getElementById('spinning-tool-wrapper');

if (!carouselContainer || !wrapper) {

  return false;

}

const productSelectors = [

  '.product',

  '.product-single', 

  '.product-container',

  '.product-main',

  '.main-content',

  '[data-product]',

  '.product__main',

  '.product-single__main'

];



let productContainer = null;

for (const selector of productSelectors) {

  productContainer = document.querySelector(selector);

  if (productContainer) {

    console.log('[SpinningTool] ✅ Found product container with selector:', selector);

    break;

  } }



if (!productContainer) {

  console.log('[SpinningTool] ❌ No product container found');

  return false;

}

// Try multiple selectors to find the media container

const mediaSelectors = [

  '.product__media',

  '.product-media',

  '.product__gallery', 

  '.product-gallery',

  '.media-gallery',

  '.product-single__media',

  '.product__photos',

  '.product__image',

  '.product-image',

  '.product__media-wrapper',

  '.product-media-wrapper'

];



let mediaContainer = null;

for (const selector of mediaSelectors) {

  mediaContainer = productContainer.querySelector(selector);

  if (mediaContainer && !mediaContainer.contains(wrapper)) {

    console.log('[SpinningTool] ✅ Found media container with selector:', selector);

    break;

  } }



if (!mediaContainer) {

  console.log('[SpinningTool] ❌ No media container found');

  return false;

}

const parent = mediaContainer.parentNode;

if (!parent.classList.contains('spinning-tool-positioned')) {

  parent.classList.add('spinning-tool-positioned');

  parent.style.display = 'flex';

  parent.style.gap = '2rem';

  parent.style.alignItems = 'flex-start';

  parent.style.maxWidth = '1200px';

  parent.style.margin = '0 auto';

  parent.style.padding = '1.5rem';

  console.log('[SpinningTool] ✅ Added positioning styles to parent');

}



parent.insertBefore(wrapper, mediaContainer);

mediaContainer.style.display = 'none';

console.log('[SpinningTool] ✅ Successfully positioned spinning tool');

return true;

}



function markSpinningToolAsActive() {

document.body.classList.add('spinning-tool-active');

const carouselContainer = document.getElementById('spinning-tool-carousel');

const wrapper = document.getElementById('spinning-tool-wrapper');

if (carouselContainer) {

  carouselContainer.style.touchAction = 'none';

}

if (wrapper) {

  wrapper.style.touchAction = 'none';

}



const panels = carouselContainer?.querySelectorAll('.carousel-panel');

if (panels) {

  panels.forEach(panel => {

    panel.style.touchAction = 'none';

  });

} }



function fix3DTransforms() {

const carouselContainer = document.getElementById('spinning-tool-carousel');

if (!carouselContainer || !carouselContainer.classList.contains('product-page')) {

  return;

}

const verticalCarousel = carouselContainer.querySelector('.carousel-vertical');

const horizontalCarousel = carouselContainer.querySelector('.carousel-horizontal');

// Apply responsive perspective based on screen width
const isSmallScreen = window.innerWidth < 550;
carouselContainer.style.perspective = isSmallScreen ? '800px' : '1000px';

carouselContainer.style.transformStyle = 'preserve-3d';



if (verticalCarousel) {

  verticalCarousel.style.transformStyle = 'preserve-3d';

  verticalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

  

  const verticalPanels = verticalCarousel.querySelectorAll('.carousel-panel');

  verticalPanels.forEach((panel, index) => {

    const rotateAngle = index * (360 / 5);

    // Apply responsive translateZ based on screen width
    const translateZ = window.innerWidth < 550 ? '162px' : '170px'; 
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(${translateZ})`;

    panel.style.transformStyle = 'preserve-3d'; 
    applyIPhonePanelFixes(panel);

    panel.style.backfaceVisibility = 'hidden';

  });

}



if (horizontalCarousel) {

  horizontalCarousel.style.transformStyle = 'preserve-3d';

  horizontalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

  

  const horizontalPanels = horizontalCarousel.querySelectorAll('.carousel-panel');

  horizontalPanels.forEach((panel, index) => {

    const rotateAngle = index * (360 / 5);

    // Apply responsive translateZ based on screen width
    const translateZ = window.innerWidth < 550 ? '162px' : '170px';
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(${translateZ})`;

    panel.style.transformStyle = 'preserve-3d';
    applyIPhonePanelFixes(panel);

    panel.style.backfaceVisibility = 'hidden';

  });

} }



function duplicateVerticalPanels(images) {

const duplicatedImages = [...images];

const totalImages = images.length;

if (totalImages < PANEL_COUNT) {

  let i = 0;

  while (duplicatedImages.length < PANEL_COUNT) {

    duplicatedImages.push(images[i % totalImages]);

    i++;

  } }

return duplicatedImages;

}



function createNonDuplicateOrder(items) {

if (!items || items.length === 0) {

  return [];

}

const result = [...items];

const totalItems = items.length;

if (totalItems < PANEL_COUNT) {

  let i = 0;

  while (result.length < PANEL_COUNT) {

    result.push(items[i % totalItems]);

    i++;

  } }

return result;

}



function createDynamicProductArray(items, currentIndex) {

if (!items || items.length === 0) {

  return [];

}

const totalItems = items.length;

const totalPages = Math.ceil(totalItems / PANEL_COUNT);

const normalizedIndex = currentIndex % 5;

const currentPage = Math.floor(currentIndex / PANEL_COUNT) % totalPages;

if (totalItems === 0) return [];

const getCircularIndex = (index) => (index + totalItems) % totalItems;

const shiftTriggerLeft = normalizedIndex === 0 && currentIndex % 5 == 0;

const shiftTriggerRight = normalizedIndex === 4;

let startIndex = currentPage * PANEL_COUNT;

const result = [];

for (let i = 0; i < 5; i++) {

  result.push(items[getCircularIndex(startIndex + i)]);

}

if (shiftTriggerRight) {

  let nextPageStartIndex = (startIndex + PANEL_COUNT) % totalItems;

  result[0] = items[nextPageStartIndex];

}

if (shiftTriggerLeft) {

  let prevPageStartIndex = totalItems - (startIndex + 1);

  result[4] = items[prevPageStartIndex];

}

return result;

}

function renderCarousels() {
  // Apply responsive carousel settings based on current viewport
  applyResponsiveCarouselSettings();

  const isMobile = window.innerWidth < 668;
  const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
  const carouselHorizontal = isMobile ? document.querySelector('.mobile-carousel-horizontal') : document.querySelector('.desktop-carousel-horizontal');


const hasXAxisCollections = xAxisCollections.length > 0;

const hasYAxisCollections = yAxisCollections.length > 0;



if (!hasXAxisCollections && !products.length) {

  showLoading();

  return;

}

const rotationPerPanelHorizontal = 360 / PANEL_COUNT;

const rotationPerPanelVertical = 360 / PANEL_COUNT;

if (hasXAxisCollections) {

  const totalXAxisCollections = xAxisCollections.length;

  const normalizedHorizontalIndex = ((horizontalIndex % totalXAxisCollections) + totalXAxisCollections) % totalXAxisCollections;

  const currentXAxisCollection = xAxisCollections[normalizedHorizontalIndex];

  

  if (currentXAxisCollection !== window.currentXAxisCollection) {

    console.log(`[SpinningTool] 🔄 X-axis collection changed from "${window.currentXAxisCollection?.title || 'none'}" to "${currentXAxisCollection.title}"`);

    window.currentXAxisCollection = currentXAxisCollection;

    updateYAxisProductsForXAxisCollection(currentXAxisCollection);

  }  

  const dynamicXAxisArray = totalXAxisCollections > PANEL_COUNT 

    ? createDynamicProductArray(xAxisCollections, normalizedHorizontalIndex)

    : createNonDuplicateOrder(xAxisCollections);

  

  carouselHorizontal.innerHTML = '';

  dynamicXAxisArray.forEach(function(collection, index) {

    const rotateAngle = index * rotationPerPanelHorizontal;

    const panel = document.createElement('div');

    panel.className = 'carousel-panel';

    // Apply responsive translateZ based on screen width 
    const translateZ = window.innerWidth < 550 ? '162px' : '170px';
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(${translateZ})`;
    applyIPhonePanelFixes(panel);

    

    // Check if current collection has videos - only show icon on the front panel

    const hasVideos = collection && collection.videos && collection.videos.length > 0;

    // The front panel is determined by the current horizontalIndex rotation

    const isFrontPanel = ((index - horizontalIndex) % PANEL_COUNT + PANEL_COUNT) % PANEL_COUNT === 0;

    const videoPayload = hasVideos ? encodeURIComponent(JSON.stringify(collection.videos)) : '';

    

    // Debug front panel calculation

    console.log(`[SpinningTool] 🔍 Collection "${collection.title}" - index: ${index}, horizontalIndex: ${horizontalIndex}, isFrontPanel: ${isFrontPanel}`);

    

    // Debug logging

    if (hasVideos) {

      console.log(`[SpinningTool] 🎥 Collection "${collection.title}" has ${collection.videos.length} videos, isFrontPanel: ${isFrontPanel}, index: ${index}, horizontalIndex: ${horizontalIndex}`);

    } else if (collection && collection.videos) {

      console.log(`[SpinningTool] ⚠️ Collection "${collection.title}" has videos but hasVideos is false. Videos:`, collection.videos);

    } else {

      console.log(`[SpinningTool] ℹ️ Collection "${collection.title}" has no videos`);

    }

    

    panel.innerHTML = `

      <div class="panel-content">

        <img src="${collection.displayImage}" alt="${collection.title}" />

        ${hasVideos && isFrontPanel ? `<div class="video-icon" data-videos="${videoPayload}">▶</div>` : ''}

      </div>

    `;

    carouselHorizontal.appendChild(panel);

  });

  carouselHorizontal.style.zIndex = activeCarousel === 'horizontal' ? 2 : 1;

  carouselHorizontal.style.transform = `rotateY(${horizontalIndex * -rotationPerPanelHorizontal}deg)`;

  

  // Always use yAxisProducts (which now contains products from the current X-axis collection)

  console.log(`[SpinningTool] 🎯 Rendering Y-axis with ${yAxisProducts.length} products from current X-axis collection: ${currentXAxisCollection?.title}`);

  

  if (yAxisProducts.length > 0) {

    const totalYAxisProducts = yAxisProducts.length;

    const normalizedVerticalIndex = ((verticalIndex % totalYAxisProducts) + totalYAxisProducts) % totalYAxisProducts;

    const currentYAxisProduct = yAxisProducts[normalizedVerticalIndex];

    const currentProductImages = duplicateVerticalPanels(currentYAxisProduct?.images || []);

    

    console.log(`[SpinningTool] 📍 Current Y-axis product: ${currentYAxisProduct?.title} (index: ${normalizedVerticalIndex}/${totalYAxisProducts})`);

    

    // Track center_view when product appears at center

    if (currentYAxisProduct) {

      trackInteraction(currentYAxisProduct, 'center_view');

    }

    

    carouselVertical.innerHTML = '';

    currentProductImages.forEach(function(image, index) {

      const rotateAngle = index * rotationPerPanelVertical;

      const panel = document.createElement('div');

      panel.className = 'carousel-panel';

      // Apply responsive translateZ based on screen width
    const translateZ = window.innerWidth < 550 ? '162px' : '170px';
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(${translateZ})`;

      panel.innerHTML = `

        <div class="panel-content">

          <img src="${image}" alt="vertical-carousel-img" />

        </div>

      `;

      carouselVertical.appendChild(panel);

    });

    carouselVertical.style.zIndex = activeCarousel === 'vertical' ? 2 : 1;

    carouselVertical.style.transform = `rotateX(${verticalIndex * -rotationPerPanelVertical}deg)`;

    

    // Track variation_view when vertical carousel is active and showing variations

    if (activeCarousel === 'vertical' && currentYAxisProduct) {

      trackInteraction(currentYAxisProduct, 'variation_view');

    }

  } else {

    console.log(`[SpinningTool] ⚠️ No Y-axis products available, showing loading message`);

    carouselVertical.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.2em;">Loading products...</div>';

  }

} else {

  if (!products.length) {

    showLoading();

    return;

  }

  const totalProducts = products.length;

  const normalizedHorizontalIndex = ((horizontalIndex % totalProducts) + totalProducts) % totalProducts;

  const currentProduct = products[normalizedHorizontalIndex];

  const currentProductImages = duplicateVerticalPanels(currentProduct?.images || []);



  // Track center_view when product appears at center

  if (currentProduct) {

    trackInteraction(currentProduct, 'center_view');

  }



  const dynamicProductsArray = totalProducts > PANEL_COUNT 

    ? createDynamicProductArray(products, normalizedHorizontalIndex)

    : createNonDuplicateOrder(products);



  carouselVertical.innerHTML = '';

  currentProductImages.forEach(function(image, index) {

    const rotateAngle = index * rotationPerPanelVertical;

    const panel = document.createElement('div');

    panel.className = 'carousel-panel';

    // Apply responsive translateZ based on screen width
    const translateZ = window.innerWidth < 550 ? '162px' : '170px';
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(${translateZ})`;

    panel.innerHTML = `

      <div class="panel-content">

        <img src="${image}" alt="vertical-carousel-img" />

      </div>

    `;

    carouselVertical.appendChild(panel);

  });

  carouselVertical.style.zIndex = activeCarousel === 'vertical' ? 2 : 1;

  carouselVertical.style.transform = `rotateX(${verticalIndex * -rotationPerPanelVertical}deg)`;

  

  // Track variation_view when vertical carousel is active and showing variations

  if (activeCarousel === 'vertical' && currentProduct) {  
    trackInteraction(currentProduct, 'variation_view');
  }
 
  carouselHorizontal.innerHTML = '';

  dynamicProductsArray.forEach(function(product, index) {

    const rotateAngle = index * rotationPerPanelHorizontal;

    const panel = document.createElement('div');

    panel.className = 'carousel-panel';

    // Apply responsive translateZ based on screen width
    const translateZ = window.innerWidth < 550 ? '162px' : '170px';
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(${translateZ})`;


    // Check if current product has videos - only show icon on the front panel

    const hasVideos = product && product.videos && product.videos.length > 0;

    // The front panel is determined by the current horizontalIndex rotation

    const isFrontPanel = ((index - horizontalIndex) % PANEL_COUNT + PANEL_COUNT) % PANEL_COUNT === 0;

    const videoPayload = hasVideos ? encodeURIComponent(JSON.stringify(product.videos)) : '';

    

    // Debug logging

    if (hasVideos) {

      console.log(`[SpinningTool] 🎥 Product "${product.name}" has ${product.videos.length} videos, isFrontPanel: ${isFrontPanel}, index: ${index}, horizontalIndex: ${horizontalIndex}`);

    } else if (product && product.videos) {

      console.log(`[SpinningTool] ⚠️ Product "${product.name}" has videos but hasVideos is false. Videos:`, product.videos);

    } else {

      console.log(`[SpinningTool] ℹ️ Product "${product.name}" has no videos`);

    }

    

    panel.innerHTML = `

      <div class="panel-content">

        <img src="${product.images[0]}" alt="${product.name}" />

        ${hasVideos && isFrontPanel ? `<div class="video-icon" data-videos="${videoPayload}">▶</div>` : ''}

      </div>

    `;

    carouselHorizontal.appendChild(panel);

  });

  carouselHorizontal.style.zIndex = activeCarousel === 'horizontal' ? 2 : 1;

  carouselHorizontal.style.transform = `rotateY(${horizontalIndex * -rotationPerPanelHorizontal}deg)`;

}

attachListenersToPanels();

attachListenersToVideoIcons();

}

// Apply responsive carousel settings based on current viewport with iPhone-specific fixes
function applyResponsiveCarouselSettings() {
  const isMobile = window.innerWidth < 668;
  const isSmallScreen = window.innerWidth < 500;
  const isExtraSmallScreen = window.innerWidth < 400;
  
  // Detect iPhone specifically
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  console.log(`[iPhone Fix] 🔍 Device detection - iPhone: ${isIPhone}, iOS: ${isIOS}, Safari: ${isSafari}`);
  
  // Get carousel containers
  const carouselContainer = isMobile ? 
    document.getElementById('mobile-spinning-tool-carousel') : 
    document.getElementById('desktop-spinning-tool-carousel');
  
  if (carouselContainer) {
    // Apply responsive perspective with iPhone-specific adjustments
    let perspective;
    if (isIPhone) {
      // iPhone-specific perspective values for better 3D rendering (slightly reduced)
      if (isExtraSmallScreen) {
        perspective = '500px';
      } else if (isSmallScreen) {
        perspective = '700px';
      } else {
        perspective = '900px';
      }
    } else {
      // Standard perspective for other devices
      if (isExtraSmallScreen) {
        perspective = '600px';
      } else if (isSmallScreen) {
        perspective = '800px';
      } else {
        perspective = '1000px';
      }
    }
    
    console.log(`[iPhone Fix] 📐 Applying perspective: ${perspective} for ${isIPhone ? 'iPhone' : 'other device'}`);
    
    carouselContainer.style.perspective = perspective;
    carouselContainer.style.transformStyle = 'preserve-3d';
    carouselContainer.style.maxHeight = isMobile ? '350px' : '450px';
    
    // iPhone-specific CSS fixes
    if (isIPhone) {
      carouselContainer.style.webkitPerspective = perspective;
      applyIPhoneContainerFixes(carouselContainer);
    }
  }
  
  // Update translateZ values for all carousel panels with iPhone-specific adjustments
  updateCarouselPanelTransforms();
}

// Apply iPhone-specific CSS fixes to a panel
function applyIPhonePanelFixes(panel) {
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  
  if (isIPhone) {
    panel.style.webkitTransformStyle = 'preserve-3d';
    panel.style.backfaceVisibility = 'hidden';
    panel.style.webkitBackfaceVisibility = 'hidden';
    panel.style.transformOrigin = 'center center';
    panel.style.webkitTransformOrigin = 'center center';
    panel.style.willChange = 'transform';
    panel.style.webkitWillChange = 'transform';
  }
}

// Force re-render for iPhone Safari to fix 3D rendering issues
function forceIPhoneRerender() {
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  
  if (isIPhone) {
    console.log('[iPhone Fix] 🔄 Forcing re-render for iPhone Safari');
    
    // Force a reflow by temporarily changing a style property
    const carouselContainer = document.getElementById('mobile-spinning-tool-carousel') || 
                             document.getElementById('desktop-spinning-tool-carousel');
    
    if (carouselContainer) {
      const originalTransform = carouselContainer.style.transform;
      carouselContainer.style.transform = 'translateZ(0)';
      
      // Use requestAnimationFrame to ensure the change is applied
      requestAnimationFrame(() => {
        carouselContainer.style.transform = originalTransform;
        console.log('[iPhone Fix] ✅ Re-render completed');
      });
    }
  }
}

// Apply iPhone-specific CSS fixes to carousel containers
function applyIPhoneContainerFixes(container) {
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  
  if (isIPhone && container) {
    container.style.webkitTransformStyle = 'preserve-3d';
    container.style.backfaceVisibility = 'hidden';
    container.style.webkitBackfaceVisibility = 'hidden';
    container.style.transformOrigin = 'center center';
    container.style.webkitTransformOrigin = 'center center';
    container.style.willChange = 'transform';
    container.style.webkitWillChange = 'transform';
    
    // Additional iPhone-specific fixes
    container.style.position = 'relative';
    container.style.overflow = 'visible';
    
    // Force re-render after applying fixes
    setTimeout(() => {
      forceIPhoneRerender();
    }, 100);
  }
}

// Update carousel panel transforms based on current viewport with iPhone fixes
function updateCarouselPanelTransforms() {
  const isExtraSmallScreen = window.innerWidth < 400;
  const isSmallScreen = window.innerWidth < 500;
  const translateZ = isExtraSmallScreen ? '100px' : (isSmallScreen ? '162px' : '170px');
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  
  console.log(`[iPhone Fix] 🔄 Applying translateZ: ${translateZ} for ${isIPhone ? 'iPhone' : 'other device'}`);
  
  // Update horizontal carousel panels
  const horizontalPanels = document.querySelectorAll('.carousel-horizontal .carousel-panel');
  horizontalPanels.forEach((panel, index) => {
    const rotateAngle = index * (360 / 5);
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(${translateZ})`;
    panel.style.transformStyle = 'preserve-3d';
    applyIPhonePanelFixes(panel);
  });
  
  // Update vertical carousel panels
  const verticalPanels = document.querySelectorAll('.carousel-vertical .carousel-panel');
  verticalPanels.forEach((panel, index) => {
    const rotateAngle = index * (360 / 5);
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(${translateZ})`;
    panel.style.transformStyle = 'preserve-3d';
    applyIPhonePanelFixes(panel);
  });
}

function handleTouchStart(e) {

// Don't prevent default for video icons or buttons

const target = e.target;

const isVideoIcon = target.classList.contains('video-icon') || target.closest('.video-icon');

const isButton = target.tagName === 'BUTTON' || target.closest('button');

const isOverlay = target.closest('.product-overlay') || target.closest('.video-modal');



if (isVideoIcon || isButton || isOverlay) {

  return; // Let these elements handle their own events

}



e.preventDefault();

e.stopPropagation();

const touch = e.touches[0];

touchStartX = touch.clientX;

touchStartY = touch.clientY;

clickStartX = touch.clientX;

clickStartY = touch.clientY;

clickStartTime = Date.now();

isSwiping = false;

}

function handleTouchMove(e) {

// Don't prevent default for video icons or buttons

const target = e.target;

const isVideoIcon = target.classList.contains('video-icon') || target.closest('.video-icon');

const isButton = target.tagName === 'BUTTON' || target.closest('button');

const isOverlay = target.closest('.product-overlay') || target.closest('.video-modal');



if (isVideoIcon || isButton || isOverlay) {

  return; // Let these elements handle their own events

}



e.preventDefault();

e.stopPropagation();

const touch = e.touches[0];

touchEndX = touch.clientX;

touchEndY = touch.clientY;

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);



// More sensitive swipe detection for mobile

if (deltaX > 25 || deltaY > 25) {

  isSwiping = true;

} }

function handleTouchEnd(e) {

// Don't prevent default for video icons or buttons

const target = e.target;

const isVideoIcon = target.classList.contains('video-icon') || target.closest('.video-icon');

const isButton = target.tagName === 'BUTTON' || target.closest('button');

const isOverlay = target.closest('.product-overlay') || target.closest('.video-modal');



if (isVideoIcon || isButton || isOverlay) {

  return; // Let these elements handle their own events

}



e.preventDefault();

e.stopPropagation();

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);

// Only trigger swipe if there was significant movement

if (deltaX > 25 || deltaY > 25) {

  handleSwipe();

} }

function handleMouseDown(e) {

e.preventDefault();

e.stopPropagation();

isMouseDown = true;

touchStartX = e.clientX;

touchStartY = e.clientY;

clickStartX = e.clientX;

clickStartY = e.clientY;

clickStartTime = Date.now();

isSwiping = false;

}

function handleMouseMove(e) {

if (!isMouseDown) return;

e.preventDefault();

e.stopPropagation();

touchEndX = e.clientX;

touchEndY = e.clientY;

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);

if (deltaX > 10 || deltaY > 10) {

  isSwiping = true;

} }



function handleMouseUp(e) {

if (!isMouseDown) return;

e.preventDefault();

e.stopPropagation();

isMouseDown = false;

touchEndX = e.clientX;

touchEndY = e.clientY;

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);



if (deltaX > 10 || deltaY > 10) {

  handleSwipe();

} }

function handleSwipe() {

const deltaX = touchStartX - touchEndX;

const deltaY = touchStartY - touchEndY;

const horizontalSwipe = Math.abs(deltaX) > 80;

const verticalSwipe = Math.abs(deltaY) > 80;



if (horizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {

  activeCarousel = "horizontal";

  

  let slides = 0;

  if (Math.abs(deltaX) > 80) slides = 1;

  if (Math.abs(deltaX) > 200) slides = 2;

  if (Math.abs(deltaX) > 350) slides = 3;

  if (deltaX > 80) {

    horizontalIndex += slides;

    console.log(`[SpinningTool] ➡️ Swiped right: horizontalIndex = ${horizontalIndex}`);

  } else if (deltaX < -80) {

    horizontalIndex -= slides;

    console.log(`[SpinningTool] ⬅️ Swiped left: horizontalIndex = ${horizontalIndex}`);

  }

  verticalIndex = 0;

}



if (verticalSwipe && Math.abs(deltaY) > Math.abs(deltaX)) {

  activeCarousel = "vertical";

  

  let slides = 0;

  if (Math.abs(deltaY) > 80) slides = 1;

  if (Math.abs(deltaY) > 200) slides = 2;

  if (Math.abs(deltaY) > 350) slides = 3;

  if (deltaY < 80) {

    verticalIndex += slides;

  } else if (deltaY > -80) {

    verticalIndex -= slides;

  }

  // Update product detail section if it's visible
  const productDetailSection = document.getElementById('product-detail-section');
  if (productDetailSection && productDetailSection.style.display === 'block') {
    updateProductDetailSection();
  }

}

const isMobile = window.innerWidth < 668;
const carouselHorizontal = isMobile ? document.querySelector('.mobile-carousel-horizontal') : document.querySelector('.desktop-carousel-horizontal');
const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
if (carouselHorizontal) {

  carouselHorizontal.style.transition = 'transform 0.3s ease';

}

if (carouselVertical) {

  carouselVertical.style.transition = 'transform 0.3s ease';

}

renderCarousels();

setTimeout(() => {

  if (carouselHorizontal) {

    carouselHorizontal.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

  }

  if (carouselVertical) {

    carouselVertical.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

  }

}, 300);

}



function attachListenersWhenReady() {

const isMobile = window.innerWidth < 668;
const carouselContainer = isMobile ? document.getElementById('mobile-spinning-tool-carousel') : document.getElementById('desktop-spinning-tool-carousel');
const wrapper = isMobile ? document.getElementById('mobile-spinning-tool-wrapper') : document.getElementById('desktop-spinning-tool-wrapper');


if ((carouselContainer || wrapper) && !listenersAttached) {

  if (carouselContainer) {

    carouselContainer.addEventListener('touchstart', handleTouchStart, {passive: false});

    carouselContainer.addEventListener('touchmove', handleTouchMove, {passive: false});

    carouselContainer.addEventListener('touchend', handleTouchEnd, {passive: false});

    carouselContainer.style.touchAction = 'none';

    carouselContainer.style.webkitTouchCallout = 'none';

    carouselContainer.style.webkitUserSelect = 'none';

    carouselContainer.style.userSelect = 'none';

  }

  if (wrapper) {

    wrapper.addEventListener('touchstart', handleTouchStart, {passive: false});

    wrapper.addEventListener('touchmove', handleTouchMove, {passive: false});

    wrapper.addEventListener('touchend', handleTouchEnd, {passive: false});

    wrapper.style.touchAction = 'none';

    wrapper.style.webkitTouchCallout = 'none';

    wrapper.style.webkitUserSelect = 'none';

    wrapper.style.userSelect = 'none';

  }

  

  if (carouselContainer) {

    carouselContainer.addEventListener('mousedown', handleMouseDown);   }

  if (wrapper) {

    wrapper.addEventListener('mousedown', handleMouseDown);

  }

  window.addEventListener('mousemove', handleMouseMove);

  window.addEventListener('mouseup', handleMouseUp);

  

  listenersAttached = true;

} }

function attachListenersToPanels() {

const panels = document.querySelectorAll('.carousel-panel');

if (panels.length > 0) {

  panels.forEach(panel => {

    panel.removeEventListener('touchstart', handleTouchStart);

    panel.removeEventListener('touchmove', handleTouchMove);

    panel.removeEventListener('touchend', handleTouchEnd);

    panel.removeEventListener('mousedown', handleMouseDown);

    panel.removeEventListener('mouseup', handleMouseUp);

    panel.removeEventListener('click', handlePanelClick);

    panel.removeEventListener('touchend', handlePanelTouchEnd);

    // On mobile we want taps on UI elements to work without being eaten by swipe

    panel.addEventListener('touchstart', handleTouchStart, {passive: false});

    panel.addEventListener('touchmove', handleTouchMove, {passive: false});

    panel.addEventListener('touchend', handleTouchEnd, {passive: false});

    panel.addEventListener('mousedown', handleMouseDown);

    panel.addEventListener('mouseup', handleMouseUp);

    panel.addEventListener('click', handlePanelClick);

    

    // Add specific touch handler for better mobile tap detection

    panel.addEventListener('touchend', handlePanelTouchEnd, {passive: false});

    panel.style.touchAction = 'none';

    panel.style.webkitTouchCallout = 'none';

    panel.style.webkitUserSelect = 'none';

    panel.style.userSelect = 'none';

  });

} }



function attachListenersToVideoIcons() {

const videoIcons = document.querySelectorAll('.video-icon');

if (videoIcons.length > 0) {

  videoIcons.forEach(icon => {

    // Remove existing listeners

    icon.removeEventListener('click', window.showVideoModal);

    icon.removeEventListener('touchstart', handleVideoIconTouch);

    icon.removeEventListener('touchend', handleVideoIconTouchEnd);

    

    // Add new listeners

    icon.addEventListener('click', window.showVideoModal);

    icon.addEventListener('touchstart', handleVideoIconTouch, {passive: false});

    icon.addEventListener('touchend', handleVideoIconTouchEnd, {passive: false});

    

    // Ensure proper touch handling

    icon.style.touchAction = 'manipulation';

    icon.style.webkitTouchCallout = 'none';

    icon.style.webkitUserSelect = 'none';

    icon.style.userSelect = 'none';

  });

} }



function handleVideoIconTouch(e) {

e.stopPropagation();

e.preventDefault();

console.log('[SpinningTool] 🎥 Video icon touch start');

}



function handleVideoIconTouchEnd(e) {

e.stopPropagation();

e.preventDefault();

console.log('[SpinningTool] 🎥 Video icon touch end');

// Trigger the video modal

if (window.showVideoModal) {

  window.showVideoModal(e);

}

}



function handlePanelTouchEnd(e) {

// This is a dedicated handler for panel touches to better detect taps

const clickDuration = Date.now() - clickStartTime;

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);



// Check if this was a tap (not a swipe)

const isTap = !isSwiping && deltaX <= 20 && deltaY <= 20 && clickDuration <= 600;



if (isTap) {

  console.log('[SpinningTool] 📱 Panel tap detected, opening overlay');

  e.preventDefault();

  e.stopPropagation();

  

  let currentProduct = getCurrentDisplayedProduct();

  if (currentProduct) {

    showProductOverlay(currentProduct);

  }

}

}

function handlePanelClick(e) {

const clickDuration = Date.now() - clickStartTime;

const deltaX = Math.abs(touchEndX - clickStartX);

const deltaY = Math.abs(touchEndY - clickStartY);



// More lenient thresholds for mobile taps

const isTap = !isSwiping && deltaX <= 20 && deltaY <= 20 && clickDuration <= 600;



if (!isTap) {

  return; }



e.preventDefault();

e.stopPropagation();

let currentProduct = getCurrentDisplayedProduct();

console.log('[SpinningTool] 🔍 Panel clicked, currentProduct:', currentProduct);

if (currentProduct) {

  showProductOverlay(currentProduct);

} }

function getCurrentDisplayedProduct() {

let currentProduct = null;

if (products && products.length > 0) {

  const totalProducts = products.length;

  const normalizedHorizontalIndex = ((horizontalIndex % totalProducts) + totalProducts) % totalProducts;

  currentProduct = products[normalizedHorizontalIndex];

  

  if (currentProduct) { 

    console.log('[SpinningTool] 🔍 Found product from main products array:', currentProduct);

    return currentProduct;

  } }

if (xAxisCollections.length > 0) {

  const totalXAxisCollections = xAxisCollections.length;

  const normalizedHorizontalIndex = ((horizontalIndex % totalXAxisCollections) + totalXAxisCollections) % totalXAxisCollections;

  currentProduct = xAxisCollections[normalizedHorizontalIndex];

} else if (yAxisProducts.length > 0) {

  const totalYAxisProducts = yAxisProducts.length;

  const normalizedHorizontalIndex = ((horizontalIndex % totalYAxisProducts) + totalYAxisProducts) % totalYAxisProducts;

  currentProduct = yAxisProducts[normalizedHorizontalIndex];

}

if (!currentProduct || !currentProduct.handle) {

  console.log('[SpinningTool] ⚠️ No product with handle found, falling back to hierarchical menu data');

  if (selectedCollections.level3) {

    const level1Collection = hierarchicalMenuData.find(c => c.title === selectedCollections.level1?.title);

    if (level1Collection && level1Collection.items) {

      const level2Collection = level1Collection.items.find(c => c.title === selectedCollections.level2?.title);

      if (level2Collection && level2Collection.items) {

        const level3Collection = level2Collection.items.find(c => c.title === selectedCollections.level3?.title);

        if (level3Collection && level3Collection.resource) {

          const productIndex = Math.abs(horizontalIndex) % level3Collection.resource.length;

          currentProduct = level3Collection.resource[productIndex];

          console.log('[SpinningTool] 🔍 Found product from level3 collection:', currentProduct);

        }  }  }

  } else if (selectedCollections.level2) {

    const level1Collection = hierarchicalMenuData.find(c => c.title === selectedCollections.level1?.title);

    if (level1Collection && level1Collection.items) {

      const level2Collection = level1Collection.items.find(c => c.title === selectedCollections.level2?.title);

      if (level2Collection && level2Collection.resource) {

        const productIndex = Math.abs(verticalIndex) % level2Collection.resource.length;

        currentProduct = level2Collection.resource[productIndex];

        console.log('[SpinningTool] 🔍 Found product from level2 collection:', currentProduct);

      }    }   } }

if (currentProduct && !currentProduct.handle) {

  console.error('[SpinningTool] ❌ Product found but missing handle field:', currentProduct);

}



return currentProduct;

}

function showProductOverlay(product) {

console.log('[SpinningTool] 🎯 Showing product overlay for:', product);

const overlay = document.getElementById('product-overlay');

const productTitle = document.getElementById('overlay-product-title');

if (overlay && productTitle) {

  productTitle.textContent = product.title || product.name || 'Product';

  overlay.style.display = 'flex';

  overlay.dataset.currentProduct = JSON.stringify(product);

} }

function hideProductOverlay() {

const overlay = document.getElementById('product-overlay');

if (overlay) {

  overlay.style.display = 'none';

} }



// Video Modal Functions

window.showVideoModal = function(event) {

event.preventDefault();

event.stopPropagation();



console.log('[SpinningTool] 🎥 Showing video modal');

// Prefer data attribute from the clicked icon to guarantee consistency

let videosFromIcon = null;

try {

  const icon = event.currentTarget || event.target;

  const raw = icon && icon.getAttribute('data-videos');

  if (raw) {

    videosFromIcon = JSON.parse(decodeURIComponent(raw));

    console.log('[SpinningTool] 🎥 Videos from icon:', videosFromIcon);

  } else {

    console.log('[SpinningTool] ⚠️ No video data found in icon data-videos attribute');

  }

} catch (e) {

  console.log('[SpinningTool] ⚠️ Failed to parse video payload from icon:', e);

}



let selectedVideos = Array.isArray(videosFromIcon) ? videosFromIcon : null;



// Fallback to deriving from the currently visible product

if (!selectedVideos) {

  let currentProduct = null;

  if (activeCarousel === 'horizontal') {

    if (xAxisCollections.length > 0) {

      const totalXAxisCollections = xAxisCollections.length;

      const normalizedHorizontalIndex = ((horizontalIndex % totalXAxisCollections) + totalXAxisCollections) % totalXAxisCollections;

      currentProduct = xAxisCollections[normalizedHorizontalIndex];

    } else if (products.length > 0) {

      const totalProducts = products.length;

      const normalizedHorizontalIndex = ((horizontalIndex % totalProducts) + totalProducts) % totalProducts;

      currentProduct = products[normalizedHorizontalIndex];

    }

  } else {

    if (yAxisProducts.length > 0) {

      const totalYAxisProducts = yAxisProducts.length;

      const normalizedVerticalIndex = ((verticalIndex % totalYAxisProducts) + totalYAxisProducts) % totalYAxisProducts;

      currentProduct = yAxisProducts[normalizedVerticalIndex];

    } else if (products.length > 0) {

      const totalProducts = products.length;

      const normalizedVerticalIndex = ((verticalIndex % totalProducts) + totalProducts) % totalProducts;

      currentProduct = products[normalizedVerticalIndex];

    }

  }

  if (currentProduct && currentProduct.videos) {

    selectedVideos = currentProduct.videos;

  }

}



if (!selectedVideos || selectedVideos.length === 0) {

  console.log('[SpinningTool] ⚠️ No videos found for current product');

  return;

}



// Get the first video

const video = selectedVideos[0];

if (!video || !video.sources || video.sources.length === 0) {

  console.log('[SpinningTool] ⚠️ No video sources found');

  return;

}



// Find the best video source (prefer MP4)

let videoSource = video.sources.find(source => source.mimeType === 'video/mp4');

if (!videoSource) {

  videoSource = video.sources[0]; // Fallback to first available source

}



const modal = document.getElementById('video-modal');

const videoElement = document.getElementById('modal-video');



if (modal && videoElement) {

  // Set video source

  videoElement.src = videoSource.url;

  videoElement.type = videoSource.mimeType;

  

  // Show modal

  modal.classList.add('active');

  document.body.style.overflow = 'hidden';

  

  // Play video

  videoElement.play().catch(error => {

    console.log('[SpinningTool] ⚠️ Could not autoplay video:', error);

  });

  

  console.log('[SpinningTool] ✅ Video modal opened with source:', videoSource.url);

}

};



function hideVideoModal() {

console.log('[SpinningTool] 🎥 Hiding video modal');



const modal = document.getElementById('video-modal');

const videoElement = document.getElementById('modal-video');



if (modal && videoElement) {

  // Pause and reset video

  videoElement.pause();

  videoElement.currentTime = 0;

  videoElement.src = '';

  

  // Hide modal

  modal.classList.remove('active');

  document.body.style.overflow = '';

  console.log('[SpinningTool] ✅ Video modal closed');

}

}

function redirectToProductPage(product) {

  // Only use product handle - never fallback to title

  if (!product.handle) {

    console.error('[SpinningTool] ❌ Product handle is missing:', product);

    alert('Product link not available. Please contact support.');

    return;

  }

  

  const currentDomain = window.location.origin;

  const productUrl = `${currentDomain}/products/${product.handle}`;

  console.log('[SpinningTool] 🔗 Redirecting to:', productUrl);

  window.open(productUrl, '_blank');

}



// Debug function to log product structure

function debugProductStructure(product) {

  console.log('[Debug] 🔍 Product structure analysis:');

  console.log('[Debug] Product ID:', product.id);

  console.log('[Debug] Product title:', product.title);

  console.log('[Debug] Product handle:', product.handle);

  console.log('[Debug] Product variants:', product.variants);

  

  if (product.variants && product.variants.length > 0) {

    console.log('[Debug] First variant ID:', product.variants[0].id);

    console.log('[Debug] First variant title:', product.variants[0].title);

  }

  

  // Check if we have the correct Shopify ID format

  if (product.id && typeof product.id === 'string') {

    const isShopifyId = product.id.includes('gid://shopify/');

    console.log('[Debug] Is Shopify ID format:', isShopifyId);

  }

}



// Show success message when product is added to cart

function showAddToCartSuccess(productName) {

  // Create a temporary success message

  const successMessage = document.createElement('div');

  successMessage.style.cssText = `

    position: fixed;

    top: 20px;

    right: 20px;

    background: #4CAF50;

    color: white;
 
    padding: 16px 24px;

    border-radius: 8px;

    box-shadow: 0 4px 12px rgba(0,0,0,0.15);

    z-index: 10000;

    font-weight: 600;

    max-width: 300px;

    animation: slideIn 0.3s ease-out;

  `;

  

  successMessage.innerHTML = `

    <div style="display: flex; align-items: center; gap: 12px;">

      <span style="font-size: 20px;">✅</span>

      <div>

        <div style="font-weight: 700; margin-bottom: 4px;">Added to Cart!</div>

        <div style="font-size: 14px; opacity: 0.9;">${productName}</div>

      </div>

    </div>

  `;

  

  // Add CSS animation

  const style = document.createElement('style');

  style.textContent = `

    @keyframes slideIn {

      from { transform: translateX(100%); opacity: 0; }

      to { transform: translateX(0); opacity: 1; }

    }

  `;

  document.head.appendChild(style);

  

  document.body.appendChild(successMessage);

  

  // Remove after 3 seconds

  setTimeout(() => {

    if (successMessage.parentNode) {

      successMessage.style.animation = 'slideOut 0.3s ease-in';

      successMessage.style.transform = 'translateX(100%)';

      successMessage.style.opacity = '0';

      setTimeout(() => {

        if (successMessage.parentNode) {

          successMessage.remove();

        }

      }, 300);

    }

  }, 3000);

}



// Simple add to cart function using Shopify's existing cart

async function addProductToCart(product) {

  try {

    console.log('[Cart] 🛒 Adding product to cart:', product.title || product.name);

    console.log('[Cart] 🔍 Product data:', product);

    

    // Debug the product structure

    debugProductStructure(product);

    

    // Always fetch the product from Shopify to get the most up-to-date variant information
    let variantId = null;

    console.log('[Cart] 🔍 Fetching product from Shopify to get valid variants...');

    

    if (product.handle) {

      try {

        const productResponse = await fetch(`/products/${product.handle}.js`);

        if (productResponse.ok) {

          const shopifyProduct = await productResponse.json();

          console.log('[Cart] 📦 Fetched product from Shopify:', shopifyProduct);

          

          if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {

            // Find the first available variant (in stock and available)

            const availableVariant = shopifyProduct.variants.find(variant => 

              variant.available && variant.inventory_quantity > 0

            ) || shopifyProduct.variants[0]; // Fallback to first variant if none are in stock

            

            if (availableVariant) {

              variantId = availableVariant.id.toString();

              console.log('[Cart] 🔑 Using Shopify variant ID:', variantId, 'for variant:', availableVariant.title);

              console.log('[Cart] 📊 Variant details:', {

                id: variantId,

                title: availableVariant.title,

                available: availableVariant.available,

                inventory_quantity: availableVariant.inventory_quantity,

                price: availableVariant.price

              });

            } else {

              throw new Error('No available variants found for this product');

            }

          } else {

            throw new Error('Product has no variants');

          }

        } else {

          throw new Error(`Failed to fetch product: ${productResponse.status} ${productResponse.statusText}`);

        }

      } catch (fetchError) {

        console.error('[Cart] ❌ Failed to fetch product from Shopify:', fetchError);

        throw new Error(`Failed to fetch product data: ${fetchError.message}`);

      }

    } else {

      throw new Error('Product handle not found');

    }

    

    if (!variantId) {

      throw new Error('No valid variant ID found for this product');

    }



    // Add to cart using Shopify's existing cart

    const formData = new FormData();

    formData.append('id', variantId);

    formData.append('quantity', '1');



    console.log('[Cart] 📤 Sending request to /cart/add.js with variant ID:', variantId);



    // Try the standard cart endpoint first

    let response = await fetch('/cart/add.js', {

      method: 'POST',

      body: formData

    });



    // If that fails, try the alternative cart endpoint

    if (!response.ok && response.status === 400) {

      console.log('[Cart] 🔄 First attempt failed, trying alternative endpoint...');

      

      // Try with different data format

      const altFormData = new FormData();

      altFormData.append('items[0][id]', variantId);

      altFormData.append('items[0][quantity]', '1');

      

      response = await fetch('/cart/add.js', {

        method: 'POST',

        body: altFormData

      });

      

      console.log('[Cart] 📥 Alternative endpoint response:', response.status, response.statusText);

    }



    console.log('[Cart] 📥 Response status:', response.status, response.statusText);



    if (response.ok) {

      const result = await response.json();

      console.log('[Cart] ✅ Product added to cart successfully:', result);

      

      // Show success message

      showAddToCartSuccess(product.title || product.name);

      

      // Refresh cart count if it exists on page

      const cartCount = document.querySelector('[data-cart-count], .cart-count');

      if (cartCount) {

        // Trigger cart refresh (Shopify will handle this)

        document.documentElement.dispatchEvent(new CustomEvent('cart:refresh'));

      }

      

      return result;

    } else {

      // Get more detailed error information

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {

        const errorData = await response.json();

        if (errorData.description) {

          errorMessage = errorData.description;

        }

      } catch (e) {

        // If we can't parse the error response, use the status text

      }

      

      console.error('[Cart] ❌ Server error:', errorMessage);

      throw new Error(`Failed to add product to cart: ${errorMessage}`);

    }

  } catch (error) {

    console.error('[Cart] ❌ Error adding product to cart:', error);

    alert(`Failed to add product to cart: ${error.message}`);

    throw error;

  }

}

function setupOverlayEventListeners() {

const closeBtn = document.getElementById('close-overlay');

if (closeBtn) {

  closeBtn.addEventListener('click', hideProductOverlay);

}

const addToCartBtn = document.getElementById('add-to-cart-btn');

if (addToCartBtn) {

  addToCartBtn.addEventListener('click', async () => {

    const overlay = document.getElementById('product-overlay');

    if (overlay && overlay.dataset.currentProduct) {

      try {

        const product = JSON.parse(overlay.dataset.currentProduct);

        

        // Track add_to_cart interaction

        trackInteraction(product, 'add_to_cart');

        

        await addProductToCart(product);

        hideProductOverlay();

      } catch (error) {

        console.error('[SpinningTool] ❌ Error adding product to cart:', error);

      }

    }

  });

}

const overlay = document.getElementById('product-overlay');

if (overlay) {

  overlay.addEventListener('click', (e) => {

    if (e.target === overlay) {

      hideProductOverlay();

    }

  });

}



// Video modal event listeners

const videoModalCloseBtn = document.getElementById('video-modal-close');

if (videoModalCloseBtn) {

  videoModalCloseBtn.addEventListener('click', hideVideoModal);

}

const videoModal = document.getElementById('video-modal');

if (videoModal) {

  videoModal.addEventListener('click', (e) => {

    if (e.target === videoModal) {

      hideVideoModal();

    }

  });

}



// Add keyboard support for closing video modal

document.addEventListener('keydown', (e) => {

  if (e.key === 'Escape') {

    const videoModal = document.getElementById('video-modal');

    if (videoModal && videoModal.classList.contains('active')) {

      hideVideoModal();

    }

  }

});

}

async function fetchProducts() {

showLoading();

const query = `{

  products(first: 100) {

    edges {

      node {

        id

        title

        handle

        descriptionHtml

        productType

        tags

        priceRange {

          minVariantPrice { amount currencyCode }

          maxVariantPrice { amount currencyCode }

        }

        featuredImage { url altText }

        media(first: 50) {

          edges {

            node {

              __typename

              ... on MediaImage {

                image { url altText }

              }

              ... on Video {

                sources { url mimeType }

                previewImage { url }

              }

            }

          }

        }

        variants(first: 50) {

          edges {
            node {
              id
              title
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              availableForSale
              sku
              weight
              weightUnit
              barcode
              selectedOptions { name value }
              image { url altText }

            }

          }

        }

      }

    }

  }

}`;

try {

  const res = await fetch(SHOPIFY_STOREFRONT_API, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

    },

    body: JSON.stringify({ query }),

  });

  const data = await res.json();

  console.log('[fetchProducts] 📦 Raw Shopify API Response:', data);
  console.log('[fetchProducts] 📊 Products Data:', data.data?.products);
  console.log('[fetchProducts] 🔢 Total Products Found:', data.data?.products?.edges?.length || 0);

  const productStatusData = await fetchProductStatus();

  let rawProducts = (data.data && data.data.products && data.data.products.edges || []).map(edge => {

    const node = edge.node;

    

    // Process media to separate images and videos

    const media = (node.media?.edges || []).map(mediaEdge => {

      const media = mediaEdge.node;

      if (media.__typename === 'MediaImage') {

        return {

          type: 'image',

          url: media.image.url,

          altText: media.image.altText,

        };

      }

      if (media.__typename === 'Video') {

        return {

          type: 'video',

          sources: media.sources,

          previewImage: media.previewImage?.url,

        };

      }

      return null;

    }).filter(Boolean);

    

    // Extract images and videos

    const images = media.filter(m => m.type === 'image').map(m => m.url);

    const videos = media.filter(m => m.type === 'video');

    

    // Debug logging for video detection

    if (videos.length > 0) {

      console.log(`[SpinningTool] 🎥 Product "${node.title}" has ${videos.length} videos:`, videos);

    }

    

    return {

      id: node.id,

      name: node.title,

      handle: node.handle,

      description: node.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

      productType: node.productType,

      tags: node.tags,

      priceRange: node.priceRange,

      images: [

        ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),

        ...images,

        ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

      ],

      videos: videos,

      variants: (node.variants.edges || []).map(v => ({

        id: v.node.id,

        title: v.node.title,

        price: v.node.price,

        compareAtPrice: v.node.compareAtPrice,

        availableForSale: v.node.availableForSale,

        sku: v.node.sku,

        weight: v.node.weight,

        weightUnit: v.node.weightUnit,

        barcode: v.node.barcode,

        selectedOptions: v.node.selectedOptions,

        image: v.node.image && v.node.image.url ? v.node.image.url : null

      }))

    };

  });

  const filteredProducts = filterProductsByStatus(rawProducts, productStatusData);

  products = filteredProducts;

  console.log('[fetchProducts] ✅ Processed Products:', products);
  console.log('[fetchProducts] 📋 Sample Product Data:', products.slice(0, 2).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    productType: p.productType,
    tags: p.tags,
    priceRange: p.priceRange,
    variants: p.variants?.length || 0,
    media: p.media?.length || 0
  })));

  // Debug logging for all products with videos

  const productsWithVideos = products.filter(p => p.videos && p.videos.length > 0);

  console.log(`[SpinningTool] 🎥 Loaded ${products.length} products, ${productsWithVideos.length} have videos:`, productsWithVideos.map(p => ({ name: p.name, videoCount: p.videos.length })));

  

  afterProductsLoaded();

} catch (err) {

  const isMobile = window.innerWidth < 668;
  const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
  if (carouselVertical) carouselVertical.innerHTML = '<div style="color:red;">Failed to load products</div>';

} }

let menuLevels = { level1: [], level2: [], level3: [] };

let allProductsBackup = [];
window.allProductsBackup = allProductsBackup;

let settingsPanelVisible = false;

let menuLoaded = false;

let currentLevel = 1;

let selectedCollections = { level1: null, level2: null, level3: null };

let hierarchicalMenuData = [];

function setSettingsLoading(isLoading) {

const panel = document.getElementById('settings-panel');

if (!panel) return;

let loadingDiv = document.getElementById('settings-loading');

if (isLoading) {

  if (!loadingDiv) {

    loadingDiv = document.createElement('div');

    loadingDiv.id = 'settings-loading';

    loadingDiv.style = 'text-align:center;padding:1rem;color:#4285f4;font-weight:600;';

    loadingDiv.innerText = 'Loading menu collections...';

    panel.appendChild(loadingDiv);

  }

  panel.querySelectorAll('select, label').forEach(el => el.style.display = 'none');

} else {

  if (loadingDiv) loadingDiv.remove();

  panel.querySelectorAll('select, label').forEach(el => el.style.display = 'block');

} }

function updateLayerDropdowns() {

const xAxisSelect = document.getElementById('x-axis-select');

const yAxisSelect = document.getElementById('y-axis-select');

if (!xAxisSelect || !yAxisSelect) return;

xAxisSelect.innerHTML = '<option value="all">All Products</option>';

yAxisSelect.innerHTML = '<option value="none">None</option>';

['level1', 'level2', 'level3'].forEach((layer) => {

  const items = menuLevels[layer] || [];

  let names = [];

  items.forEach(item => {

    if (item.title) names.push(item.title);

    if (Array.isArray(item.resource) && item.resource.length > 0 && item.resource[0].collections) {

      const colls = item.resource[0].collections;

      if (Array.isArray(colls)) {

        colls.forEach(c => { if (c && c.title) names.push(c.title); });

      } else if (typeof colls === 'object') {

        Object.values(colls).forEach(c => { if (c && c.title) names.push(c.title); });

      }

    }

  });

  names = [...new Set(names)].filter(Boolean);

  if (names.length) {

    xAxisSelect.innerHTML += `<option value="${layer}">${names.join(', ')}</option>`;

    yAxisSelect.innerHTML += `<option value="${layer}">${names.join(', ')}</option>`;

  }

});

}



function afterProductsLoaded() {

allProductsBackup = products.slice();
window.allProductsBackup = allProductsBackup;

renderCarousels(); }

function showSettingsPanel() {

document.getElementById('settings-panel').style.display = 'block';

settingsPanelVisible = true;

setSettingsLoading(!menuLoaded);

}

function hideSettingsPanel() {

document.getElementById('settings-panel').style.display = 'none';

settingsPanelVisible = false; } 

function formatProductForCarousel(productNode) {

let variants = [];

if (productNode.variants && productNode.variants.edges) {

  variants = productNode.variants.edges.map(v => v.node);

} else if (Array.isArray(productNode.variants)) {

  variants = productNode.variants;

}

return {

  name: productNode.title,

  handle: productNode.handle,

  images: [

    ...(productNode.featuredImage && productNode.featuredImage.url ? [productNode.featuredImage.url] : []),

    ...variants.map(v => v.image && v.image.url ? v.image.url : null).filter(Boolean)

  ],

  variants: variants.map(v => ({

    id: v.id,

    title: v.title,

    image: v.image && v.image.url ? v.image.url : null

  }))

}; }

async function updateProductsForLayer(layer) {

if (layer === 'all') {

  products = allProductsBackup.slice();

} else if (menuLevels[layer] && menuLevels[layer].length) {

  let allLayerProducts = [];

  menuLevels[layer].forEach(item => {

    if (Array.isArray(item.resource)) {

      item.resource.forEach(productNode => {

        allLayerProducts.push(formatProductForCarousel(productNode));

      });

    }

  }); 

  const productStatusData = await fetchProductStatus();

  products = filterProductsByStatus(allLayerProducts, productStatusData);

} else {

  products = [];

}

renderCarousels();

} 

function getCollectionChildren(collection) {

if (collection.items && Array.isArray(collection.items)) {

  const children = collection.items

    .filter(item => item.type === 'COLLECTION')

    .map(item => ({

      ...item,

      // Preserve the processed image and resource data
      image: item.image || null,
      resource: item.resource || [],
      items: item.items || []

    }));

  

  return children;

} return []; }

function renderHierarchicalCarousel() {

if (!hierarchicalMenuData.length) {

  return; }

document.getElementById('level-1-carousel').style.display = 'block';

document.getElementById('level-2-carousel').style.display = 'none';

document.getElementById('level-3-carousel').style.display = 'none';

renderCarouselLevel(1, hierarchicalMenuData);



// Ensure spinning tool shows all products when hierarchical carousel is first rendered

if (allProductsBackup && allProductsBackup.length > 0) {

  products = allProductsBackup.slice();

  renderCarousels();

}

}

function renderCarouselLevel(level, collections) {

const container = document.getElementById(`level-${level}-items`);

if (!container) return;

container.innerHTML = '';

if (collections.length === 0) {

  container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No layers found at this level</div>';

  return; }

collections.forEach(collection => {

  const item = createCollectionItem(collection, level);

  container.appendChild(item);

});

document.getElementById(`level-${level}-carousel`).style.display = 'block';

for (let i = level + 1; i <= 3; i++) {

  const deeperLevel = document.getElementById(`level-${i}-carousel`);

  if (deeperLevel) deeperLevel.style.display = 'none';

} }

function getProductCount(collection) {
  // Debug logging
  console.log('[ProductCount] 🔍 Checking collection:', collection.title);
  console.log('[ProductCount] 📊 Collection data:', {
    hasResource: !!collection.resource,
    resourceType: typeof collection.resource,
    resourceLength: collection.resource ? collection.resource.length : 'N/A',
    hasImage: !!collection.image,
    imageUrl: collection.image,
    resource: collection.resource
  });
  
  // Get product count from collection resource
  if (collection.resource && Array.isArray(collection.resource)) {
    const count = collection.resource.length;
    console.log('[ProductCount] ✅ Found', count, 'products for', collection.title);
    return count;
  } 
  
  // If no resource, return 0
  console.log('[ProductCount] ⚠️ No products found for', collection.title);
  return 0;
}

function createCollectionItem(collection, level) {

const item = document.createElement('div');

item.className = 'collection-item';

item.dataset.level = level;

item.dataset.title = collection.title;



const folderIcon = document.createElement('div');

folderIcon.className = 'folder-icon';

folderIcon.textContent = '📁';

item.appendChild(folderIcon);

const img = document.createElement('img');
 
if (collection.image) {

  img.src = collection.image;
  console.log('[CreateCollectionItem] 🖼️ Using collection image for', collection.title, ':', collection.image);

} else {

  // Create a nice placeholder with collection title

  const placeholderColor = getPlaceholderColor(collection.title);

  img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="55"><rect width="160" height="55" fill="${placeholderColor}"/><text x="80" y="27.5" text-anchor="middle" dy=".3em" font-size="10" fill="white" font-weight="bold">${collection.title}</text></svg>`;
  console.log('[CreateCollectionItem] 🎨 Using placeholder for', collection.title);

}

img.alt = collection.title;

// Add explicit inline styles to ensure visibility
img.style.position = 'absolute';
img.style.left = '8px';
img.style.top = '50%';
img.style.transform = 'translateY(-50%)';
img.style.width = '40px';
img.style.height = '40px';
img.style.objectFit = 'cover';
img.style.borderRadius = '50%';
img.style.zIndex = '1';

item.appendChild(img);
console.log('[CreateCollectionItem] 🖼️ Image element added:', img);
console.log('[CreateCollectionItem] 🖼️ Image src:', img.src);

// Check styles after a short delay to see if they're applied
setTimeout(() => {
  console.log('[CreateCollectionItem] 🖼️ Image visibility (after delay):', {
    display: window.getComputedStyle(img).display,
    visibility: window.getComputedStyle(img).visibility,
    opacity: window.getComputedStyle(img).opacity,
    position: window.getComputedStyle(img).position,
    zIndex: window.getComputedStyle(img).zIndex,
    width: window.getComputedStyle(img).width,
    height: window.getComputedStyle(img).height,
    left: window.getComputedStyle(img).left,
    top: window.getComputedStyle(img).top
  });
}, 100);

// Add product count label
const productCount = getProductCount(collection);
console.log('[CreateCollectionItem] 📊 Product count for', collection.title, ':', productCount);
if (productCount > 0) {
  const countLabel = document.createElement('div');
  countLabel.className = 'product-count-label';
  countLabel.textContent = `${productCount} left`;
  
  // Add explicit inline styles to ensure visibility
  countLabel.style.position = 'absolute';
  countLabel.style.top = '45%'; // Moved up slightly
  countLabel.style.left = '65%'; // Moved further right for more gap
  countLabel.style.transform = 'translate(-50%, -50%)';
  countLabel.style.background = 'rgba(218, 175, 55, 1)';
  countLabel.style.color = 'white';
  countLabel.style.padding = '0.2rem 0.4rem'; // Reduced padding
  countLabel.style.borderRadius = '10px'; // Slightly smaller radius
  countLabel.style.fontSize = '0.65rem'; // Reduced font size
  countLabel.style.fontWeight = '600';
  countLabel.style.whiteSpace = 'nowrap';
  countLabel.style.zIndex = '10';
  countLabel.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  countLabel.style.minWidth = '35px'; // Reduced min width
  countLabel.style.textAlign = 'center';
  
  item.appendChild(countLabel);
  console.log('[CreateCollectionItem] ✅ Added product count label:', countLabel.textContent);
  console.log('[CreateCollectionItem] 🎨 Label element:', countLabel);
  
  // Check styles after a short delay to see if they're applied
  setTimeout(() => {
    console.log('[CreateCollectionItem] 🎨 Label styles (after delay):', window.getComputedStyle(countLabel));
    console.log('[CreateCollectionItem] 🎨 Label visibility (after delay):', {
      display: window.getComputedStyle(countLabel).display,
      visibility: window.getComputedStyle(countLabel).visibility,
      opacity: window.getComputedStyle(countLabel).opacity,
      position: window.getComputedStyle(countLabel).position,
      zIndex: window.getComputedStyle(countLabel).zIndex,
      background: window.getComputedStyle(countLabel).background,
      color: window.getComputedStyle(countLabel).color
    });
  }, 100);
} else {
  console.log('[CreateCollectionItem] ⚠️ No product count label added for', collection.title);
}

const title = document.createElement('div');

title.className = 'collection-title';

title.textContent = collection.title;

// Add explicit inline styles to ensure visibility
title.style.position = 'absolute';
title.style.top = '50%';
title.style.left = '65%'; // Moved further right to match label
title.style.transform = 'translate(-50%, calc(-50% + 15px))'; // Adjusted spacing
title.style.background = 'none';
title.style.color = 'white';
title.style.padding = '0.3rem'; // Reduced padding
title.style.fontSize = '0.8rem'; // Reduced font size
title.style.fontWeight = '600';
title.style.textAlign = 'center';
title.style.display = 'flex';
title.style.alignItems = 'center';
title.style.justifyContent = 'center';
title.style.height = 'auto';
title.style.zIndex = '5';
title.style.maxWidth = '80px'; // Added max width for long names
title.style.wordWrap = 'break-word'; // Allow text wrapping
title.style.lineHeight = '1.1'; // Tighter line height

item.appendChild(title);

item.addEventListener('click', () => handleCollectionClick(collection, level));

return item; }

function handleCollectionClick(collection, level) {

const children = getCollectionChildren(collection);

// Check if this collection is already selected at this level (toggle behavior)
const currentSelectedCollection = selectedCollections[`level${level}`];
const isAlreadySelected = currentSelectedCollection && currentSelectedCollection.title === collection.title;

if (isAlreadySelected) {
  // Toggle behavior: if clicking the same collection, collapse its child layers
  console.log('[HierarchicalCarousel] 🔄 Toggling collection:', collection.title, 'at level:', level);
  
  // Use helper function to ensure proper synchronization
  synchronizeLevelVisibility(level);
  
  // Update current level to the clicked level
  currentLevel = level;
  
  // Update breadcrumb to show only up to this level
  updateBreadcrumb(level, collection);
  
  // Update spinning tool for this collection
  updateSpinningToolForCollection(collection);
  
  return; // Exit early for toggle behavior
}

// Normal behavior: select this collection and show its children
selectedCollections[`level${level}`] = collection;

currentLevel = level + 1;

updateBreadcrumb(level + 1, collection);

// Update spinning tool for all levels when clicked
updateSpinningToolForCollection(collection);

if (level < 3 && children.length > 0) {

  console.log('[HierarchicalCarousel] 📂 Rendering next level with', children.length, 'children');

  renderCarouselLevel(level + 1, children);

} else {

  console.log('[HierarchicalCarousel] 🎯 Final level reached, spinning tool updated');

}

}

function updateBreadcrumb(level, collection) {

const breadcrumbNav = document.getElementById('breadcrumb-nav');

if (!breadcrumbNav) return;

breadcrumbNav.innerHTML = '';

for (let i = 1; i <= level; i++) {

  const breadcrumbItem = document.createElement('span');

  breadcrumbItem.className = 'breadcrumb-item';

  breadcrumbItem.dataset.level = i;

  

  if (i === 1) {

    breadcrumbItem.textContent = 'Top Layer';

  } else if (i === 2) {

    breadcrumbItem.textContent = selectedCollections.level1?.title || 'Sub Layer';

  } else if (i === 3) {

    breadcrumbItem.textContent = selectedCollections.level2?.title || 'Sub Sub Layer';  }

  breadcrumbItem.addEventListener('click', () => {
    navigateToLevel(i);
  });

  if (i === level) {

    breadcrumbItem.classList.add('active');

  }

  breadcrumbNav.appendChild(breadcrumbItem);

} }

// Helper function to ensure proper level visibility synchronization
function synchronizeLevelVisibility(targetLevel) {
  // Hide all levels first
  for (let i = 1; i <= 3; i++) {
    const levelElement = document.getElementById(`level-${i}-carousel`);
    if (levelElement) {
      levelElement.style.display = 'none';
    }
  }
  
  // Show only levels up to target level
  for (let i = 1; i <= targetLevel; i++) {
    const levelElement = document.getElementById(`level-${i}-carousel`);
    if (levelElement) {
      levelElement.style.display = 'block';
    }
  }
  
  // Clear deeper level selections
  for (let i = targetLevel + 1; i <= 3; i++) {
    selectedCollections[`level${i}`] = null;
  }
}

function navigateToLevel(targetLevel) {

if (targetLevel === 1) {

  resetHierarchicalCarousel();

  updateBreadcrumb(1);

  // Update spinning tool with all products when going back to top level

  products = allProductsBackup.slice();

  renderCarousels();

} else if (targetLevel === 2 && selectedCollections.level1) {

  currentLevel = 2;

  // Use helper function to ensure proper synchronization
  synchronizeLevelVisibility(2);

  const children = getCollectionChildren(selectedCollections.level1);

  renderCarouselLevel(2, children);

  updateBreadcrumb(2, selectedCollections.level1);

  // Update spinning tool with level 1 collection products

  updateSpinningToolForCollection(selectedCollections.level1);

} else if (targetLevel === 3 && selectedCollections.level2) {

  currentLevel = 3;

  // Use helper function to ensure proper synchronization
  synchronizeLevelVisibility(3);

  const children = getCollectionChildren(selectedCollections.level2);

  renderCarouselLevel(3, children);

  updateBreadcrumb(3, selectedCollections.level2);

  // Update spinning tool with level 2 collection products

  updateSpinningToolForCollection(selectedCollections.level2);

}

}



function updateSpinningToolForCollection(collection) {

console.log('[HierarchicalCarousel] 🎯 Updating spinning tool for collection:', collection.title, 'at level:', currentLevel);



// Handle collections from all levels

if (collection.url && collection.url.includes('/collections/')) {

  // Direct collection URL - fetch products from that collection

  const collectionHandle = collection.url.split('/collections/')[1]; 

  if (collectionHandle) {

    console.log('[HierarchicalCarousel] 📁 Fetching products from collection handle:', collectionHandle);

    fetchProductsForCollection(collectionHandle);

    return;

  }

}



// Handle collections without direct URLs (from level 1 and 2)

if (collection.resource && Array.isArray(collection.resource)) {

  console.log('[HierarchicalCarousel] 📦 Found', collection.resource.length, 'products in collection resource');

  // Extract products from the collection's resource

  const collectionProducts = collection.resource.map(productNode => 

    formatProductForCarousel(productNode)

  );

  

  if (collectionProducts.length > 0) {

    console.log('[HierarchicalCarousel] ✅ Updating spinning tool with', collectionProducts.length, 'products');

    // Filter products by status and update the spinning tool

    fetchProductStatus().then(productStatusData => {

      const filteredProducts = filterProductsByStatus(collectionProducts, productStatusData);

      products = filteredProducts;

      renderCarousels();

      console.log('[HierarchicalCarousel] 🎉 Spinning tool updated with filtered products:', filteredProducts.length);

    });

    return;

  }

}



// Fallback: if no products found, try to fetch from collection handle if available

if (collection.handle) {

  console.log('[HierarchicalCarousel] 🔄 Fallback: trying to fetch from collection handle:', collection.handle);

  fetchProductsForCollection(collection.handle);

} else {

  console.log('[HierarchicalCarousel] ⚠️ No products found for collection:', collection.title);

}

}



async function fetchProductsForCollection(collectionHandle) {

try {

  const query = `query GetCollectionProducts($handle: String!) {

    collection(handle: $handle) {

      id

      title

      handle

      products(first: 100) {

        edges {

          node {

            id

            title

            handle

            featuredImage { url altText }

            media(first: 50) {

              edges {

                node {

                  __typename

                  ... on MediaImage {

                    image { url altText }

                  }

                  ... on Video {

                    sources { url mimeType }

                    previewImage { url }

                  }

                }

              }

            }

            variants(first: 50) {

              edges {

                node {

                  id

                  title

                  image { url altText }

                }

              }

            }

          }

        }

      }

    }

  }`;

  const response = await fetch(SHOPIFY_STOREFRONT_API, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

    },

    body: JSON.stringify({ 

      query, 

      variables: { handle: collectionHandle } 

    }),

  });

  const data = await response.json();

  if (data.data && data.data.collection && data.data.collection.products) {

    const collectionProducts = data.data.collection.products.edges.map(edge => {

      const node = edge.node;

      

      // Process media to separate images and videos

      const media = (node.media?.edges || []).map(mediaEdge => {

        const media = mediaEdge.node;

        if (media.__typename === 'MediaImage') {

          return {

            type: 'image',

            url: media.image.url,

            altText: media.image.altText,

          };

        }

        if (media.__typename === 'Video') {

          return {

            type: 'video',

            sources: media.sources,

            previewImage: media.previewImage?.url,

          };

        }

        return null;

      }).filter(Boolean);

      

      // Extract images and videos

      const images = media.filter(m => m.type === 'image').map(m => m.url);

      const videos = media.filter(m => m.type === 'video');

      

      return {

        id: node.id,

        title: node.title,

        name: node.title,

        handle: node.handle,

        description: node.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

        productType: node.productType,

        tags: node.tags,

        priceRange: node.priceRange,

        images: [

          ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),

          ...images,

          ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

        ],

        videos: videos,

        variants: (node.variants.edges || []).map(v => ({

          id: v.node.id,

          title: v.node.title,

          price: v.node.price,

          compareAtPrice: v.node.compareAtPrice,

          availableForSale: v.node.availableForSale,

          sku: v.node.sku,

          weight: v.node.weight,

          weightUnit: v.node.weightUnit,

          barcode: v.node.barcode,

          selectedOptions: v.node.selectedOptions,

          image: v.node.image && v.node.image.url ? v.node.image.url : null

        }))

      };

    });

    products = collectionProducts;

    renderCarousels();

  } } catch (error) {} }



function resetHierarchicalCarousel() {

currentLevel = 1;

selectedCollections = { level1: null, level2: null, level3: null };

// Use helper function to ensure proper synchronization
synchronizeLevelVisibility(1);

updateBreadcrumb(1);



// Reset spinning tool to show all products

if (allProductsBackup && allProductsBackup.length > 0) {

  products = allProductsBackup.slice();

  renderCarousels();

}



if (hierarchicalMenuData.length > 0) {

  renderCarouselLevel(1, hierarchicalMenuData);

}

}

function getPlaceholderColor(text) {

const colors = [

  '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',

  '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d'

];



let hash = 0;

for (let i = 0; i < text.length; i++) {

  hash = text.charCodeAt(i) + ((hash << 5) - hash); }

return colors[Math.abs(hash) % colors.length];

}



function fetchMenuAndFormat() {

setSettingsLoading(true);

const menuQuery = `{

  menu(handle: "main-menu") {

    title

    items {

      title

      type

      url

      resource {

        ... on Collection {

          id

          title

          handle

          image { url altText }

          products(first: 100) {

            edges {

              node {

                id

                title

                handle

                descriptionHtml

                productType

                tags

                featuredImage { url altText }

                priceRange {

                  minVariantPrice { amount currencyCode }

                  maxVariantPrice { amount currencyCode }

                }

                media(first: 50) {

                  edges {

                    node {

                      __typename

                      ... on MediaImage {

                        image { url altText }

                      }

                      ... on Video {

                        sources { url mimeType }

                        previewImage { url }

                      }

                    }

                  }

                }

                collections(first: 50) {

                  edges { node { id title handle } }

                }

                variants(first: 50) {

                  edges {

                    node {

                      id

                      title

                      price { amount currencyCode }

                      compareAtPrice { amount currencyCode }

                      availableForSale

                      sku

                      weight

                      weightUnit

                      barcode

                      image { url altText }

                      selectedOptions { name value }

                    }

                  }

                }

              }

            }

          }

        }

      }

      items {

        title

        type

        url

        resource {

          ... on Collection {

            id

            title

            handle

            image { url altText }

            products(first: 100) {

              edges {

                node {

                  id

                  title

                  handle

                  descriptionHtml

                  productType

                  tags

                  featuredImage { url altText }

                  priceRange {

                    minVariantPrice { amount currencyCode }

                    maxVariantPrice { amount currencyCode }

                  }

                  media(first: 50) {

                    edges {

                      node {

                        __typename

                        ... on MediaImage {

                          image { url altText }

                        }

                        ... on Video {

                          sources { url mimeType }

                          previewImage { url }

                        }

                      }

                    }

                  }

                  collections(first: 50) {

                    edges { node { id title handle } }

                  }

                  variants(first: 50) {

                    edges {

                      node {

                        id

                        title

                        price { amount currencyCode }

                        compareAtPrice { amount currencyCode }

                        availableForSale

                        sku

                        weight

                        weightUnit

                        barcode

                        image { url altText }

                        selectedOptions { name value }

                      }

                    }

                  }

                }

              }

            }

          }

        }

        items {

          title

          type

          url

          resource {

            ... on Collection {

              id

              title

              handle

              image { url altText }

              products(first: 100) {

                edges {

                  node {

                    id

                    title

                    handle

                    descriptionHtml

                    productType

                    tags

                    featuredImage { url altText }

                    priceRange {

                      minVariantPrice { amount currencyCode }

                      maxVariantPrice { amount currencyCode }

                    }

                    media(first: 50) {

                      edges {

                        node {

                          __typename

                          ... on MediaImage {

                            image { url altText }

                          }

                          ... on Video {

                            sources { url mimeType }

                            previewImage { url }

                          }

                        }

                      }

                    }

                    collections(first: 50) {

                      edges { node { id title handle } }

                    }

                    variants(first: 50) {

                      edges {

                        node {

                          id

                          title

                          price { amount currencyCode }

                          compareAtPrice { amount currencyCode }

                          availableForSale

                          sku

                          weight

                          weightUnit

                          barcode

                          image { url altText }

                          selectedOptions { name value }

                        }

                      }

                    }

                  }

                }

              }

            }

          }

        }

      }

    }

  }

}`;



fetch(SHOPIFY_STOREFRONT_API, {

  method: 'POST',

  headers: {

    'Content-Type': 'application/json',

    'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

  },

  body: JSON.stringify({ query: menuQuery }),

})

  .then(res => res.json())

  .then(data => {

    console.log('[fetchMenuAndFormat] 📦 Raw Shopify API Response:', data);
    console.log('[fetchMenuAndFormat] 📊 Menu Data:', data.data?.menu);
    console.log('[fetchMenuAndFormat] 🔢 Menu Items Found:', data.data?.menu?.items?.length || 0);

    const menu = data.data.menu;

    function formatProduct(productNode) {

      return {

        id: productNode.id,

        handle: productNode.handle,

        title: productNode.title,

        description: productNode.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

        productType: productNode.productType,

        priceRange: {

          amount: productNode.priceRange.minVariantPrice.amount,

          currencyCode: productNode.priceRange.minVariantPrice.currencyCode,

        },

        featuredImage: productNode.featuredImage?.url || 'placeholder.jpg',

        tags: productNode.tags,

        collections: productNode.collections?.edges?.map(

          (collectionEdge) => collectionEdge.node.title,

        ) || [],

        media: productNode.media?.edges?.map((mediaEdge) => {

          const media = mediaEdge.node;

          if (media.__typename === 'MediaImage') {

            return {

              type: 'image',

              url: media.image.url,

              altText: media.image.altText,

            };

          }

          if (media.__typename === 'Video') {

            return {

              type: 'video',

              sources: media.sources,

              previewImage: media.previewImage?.url,

            };

          }

          return null;

        }).filter(Boolean) || [],

        variants: productNode.variants?.edges?.map((variantNode) => ({

          id: variantNode.node.id,

          title: variantNode.node.title,

          price: {

            amount: variantNode.node.price.amount,

            currencyCode: variantNode.node.price.currencyCode,

          },

          compareAtPrice: variantNode.node.compareAtPrice

            ? {

                amount: variantNode.node.compareAtPrice.amount,

                currencyCode: variantNode.node.compareAtPrice.currencyCode,

              }

            : null,

          availableForSale: variantNode.node.availableForSale,

          sku: variantNode.node.sku,

          weight: variantNode.node.weight,

          weightUnit: variantNode.node.weightUnit,

          barcode: variantNode.node.barcode,

          image: variantNode.node.image

            ? {

                url: variantNode.node.image.url,

                altText: variantNode.node.image.altText,

              }

            : null,

          selectedOptions: variantNode.node.selectedOptions.map((option) => ({

            name: option.name,

            value: option.value,

          })),

        })) || [],

      };

    }

    function processMenuItem(item) {

      return {

        title: item.title,

        type: item.type,

        url: item.url,

        resource:

          item.resource && item.resource.products

            ? item.resource.products.edges.map((edge) => formatProduct(edge.node))

            : [],

      };

    }

    if (!menu || !menu.items) {

      console.error('No menu or menu.items found in API response:', menu);

      setSettingsLoading(false);

      return;

    }

    const filtered = menu.items.slice(3);

    const level1 = filtered.map(processMenuItem);

    const level2 = filtered.flatMap((item) =>

      (item.items || []).map(processMenuItem),

    );

    const level3 = filtered.flatMap((item) =>

      (item.items || []).flatMap((sub) =>

        (sub.items || []).map(processMenuItem),

      ),

    );

    menuLevels.level1 = level1;

    menuLevels.level2 = level2;

    menuLevels.level3 = level3;

    const originalMenu = data.data.menu;

    const topLevelLayers = (originalMenu && originalMenu.items) ? originalMenu.items

      .filter(item => item.type === 'COLLECTION')

      .map(item => ({

        ...item,

        items: item.items || []

      })) : [];

    

    // Process the hierarchical menu data to ensure products have proper structure

    const processedTopLevelLayers = topLevelLayers.map(level1Item => ({

      ...level1Item,

      // Add image from resource
      image: level1Item.resource && level1Item.resource.image ? level1Item.resource.image.url : null,

      // Process level 1 resource (products)
      resource: level1Item.resource && level1Item.resource.products ? 

        level1Item.resource.products.edges.map(edge => formatProduct(edge.node)) : [],

      items: (level1Item.items || []).map(level2Item => ({

        ...level2Item,

        // Add image from resource
        image: level2Item.resource && level2Item.resource.image ? level2Item.resource.image.url : null,

        // Process level 2 resource (products)
        resource: level2Item.resource && level2Item.resource.products ? 

          level2Item.resource.products.edges.map(edge => formatProduct(edge.node)) : [],

        items: (level2Item.items || []).map(level3Item => ({

          ...level3Item,

          // Add image from resource
          image: level3Item.resource && level3Item.resource.image ? level3Item.resource.image.url : null,

          // Process level 3 resource (products)
          resource: level3Item.resource && level3Item.resource.products ? 

            level3Item.resource.products.edges.map(edge => formatProduct(edge.node)) : []

        }))

      }))

    }));

    

    hierarchicalMenuData = processedTopLevelLayers;

    renderHierarchicalCarousel();

    

    // Update mobile carousel with the same data

    if (window.innerWidth < 668) {

      console.log('[MobileApp] 🔄 Updating mobile carousel with hierarchical menu data');

      populateMobileCarousel();

    }

    

    menuLoaded = true;

    setSettingsLoading(false);

    updateLayerDropdowns();

    var xAxisSelect = document.getElementById('x-axis-select');

    if (xAxisSelect) {

      updateProductsForLayer(xAxisSelect.value).catch(err => {

        console.error('Error updating products for layer:', err);

      });

    }

  })

  .catch(err => {

    setSettingsLoading(false);

    console.error('Menu API fetch error:', err);

  });

}

async function fetchSpinningSelection() {

try {

  const shop = window.Shopify && window.Shopify.shop ? window.Shopify.shop : window.location.hostname;

  const res = await fetch(`/apps/spinning-tool/selection?shop=${encodeURIComponent(shop)}`);

  const data = await res.json();

  return data.selection || null;

} catch (err) { return null; } }

async function fetchProductsForLayer(collectionIds) {

if (!Array.isArray(collectionIds) || collectionIds.length === 0) {

  fetchProducts();

  return; 

}

const query = `query GetCollectionProducts($ids: [ID!]!) {\n  nodes(ids: $ids) {\n    ... on Collection {\n      products(first: 100) {\n        edges {\n          node {\n            id\n            title\n            handle\n            descriptionHtml\n            productType\n            tags\n            priceRange {\n              minVariantPrice { amount currencyCode }\n              maxVariantPrice { amount currencyCode }\n            }\n            featuredImage { url altText }\n            media(first: 50) {\n              edges {\n                node {\n                  __typename\n                  ... on MediaImage {\n                    image { url altText }\n                  }\n                  ... on Video {\n                    sources { url mimeType }\n                    previewImage { url }\n                  }\n                }\n              }\n            }\n            variants(first: 50) {\n              edges {\n                node {\n                  id\n                  title\n                  price { amount currencyCode }\n                  compareAtPrice { amount currencyCode }\n                  availableForSale\n                  sku\n                  weight\n                  weightUnit\n                  barcode\n                  selectedOptions { name value }\n                  image { url altText }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}`;

const variables = { ids: collectionIds.map(id => `gid://shopify/Collection/${id}`) };

const res = await fetch(SHOPIFY_STOREFRONT_API, {

  method: 'POST',

  headers: {

    'Content-Type': 'application/json',

    'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

  },

  body: JSON.stringify({ query, variables }),

});

const data = await res.json();

console.log('[fetchProductsForLayer] 📦 Raw Shopify API Response:', data);
console.log('[fetchProductsForLayer] 📊 Collections Data:', data.data?.nodes);
console.log('[fetchProductsForLayer] 🔢 Collections Found:', data.data?.nodes?.length || 0);

const productStatusData = await fetchProductStatus();

let rawProducts = [];

if (data.data && data.data.nodes) {

  data.data.nodes.forEach(node => {

    if (node && node.products && node.products.edges) {

      node.products.edges.forEach(edge => {

        const product = edge.node;

        // Process media to separate images and videos

        const media = (product.media?.edges || []).map(mediaEdge => {

          const media = mediaEdge.node;

          if (media.__typename === 'MediaImage') {

            return {

              type: 'image',

              url: media.image.url,

              altText: media.image.altText,

            };

          }

          if (media.__typename === 'Video') {

            return {

              type: 'video',

              sources: media.sources,

              previewImage: media.previewImage?.url,

            };

          }

          return null;

        }).filter(Boolean);

        

        // Extract images and videos

        const images = media.filter(m => m.type === 'image').map(m => m.url);

        const videos = media.filter(m => m.type === 'video');

        

        rawProducts.push({

          id: product.id,

          name: product.title,

          handle: product.handle,

          description: product.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

          productType: product.productType,

          tags: product.tags,

          priceRange: product.priceRange,

          images: [

            ...(product.featuredImage && product.featuredImage.url ? [product.featuredImage.url] : []),

            ...images,

            ...((product.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

          ],

          videos: videos,

          variants: (product.variants.edges || []).map(v => ({

            id: v.node.id,

            title: v.node.title,

            price: v.node.price,

            compareAtPrice: v.node.compareAtPrice,

            availableForSale: v.node.availableForSale,

            sku: v.node.sku,

            weight: v.node.weight,

            weightUnit: v.node.weightUnit,

            barcode: v.node.barcode,

            selectedOptions: v.node.selectedOptions,

            image: v.node.image && v.node.image.url ? v.node.image.url : null

          }))

        });

      });

    }

  });

}

products = filterProductsByStatus(rawProducts, productStatusData);

renderCarousels(); }

async function fetchPublicSettings() {

try {

  const shop = window.Shopify && window.Shopify.shop ? window.Shopify.shop : window.location.hostname;

  const response = await fetch(`https://shopify-management-app.vercel.app/api/public/settings?shop=1cb12f-54.myshopify.com`);

  const data = await response.json();

  return data;

} catch (error) { return null; }

}

async function fetchXAxisCollections(xAxisCollectionIds) {

if (!Array.isArray(xAxisCollectionIds) || xAxisCollectionIds.length === 0) { return []; }

const allCollections = [];

for (const collectionId of xAxisCollectionIds) {

  try {

    // Check if this is a collection ID or handle

    const isCollectionId = /^\d+$/.test(collectionId);

    

    let query, variables;

    if (isCollectionId) {

      // If it's a numeric ID, query by ID

      query = `query GetCollection($id: ID!) {

        collection(id: $id) {

          id

          title

          handle

          image { url altText }

        }

      }`;

      variables = { id: `gid://shopify/Collection/${collectionId}` };

    } else {

      // If it's a handle, query by handle

      query = `query GetCollection($handle: String!) {

        collection(handle: $handle) {

          id

          title

          handle

          image { url altText }

        }

      }`;

      variables = { handle: collectionId };

    }

    

    const response = await fetch(SHOPIFY_STOREFRONT_API, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

      },

      body: JSON.stringify({ 

        query, 

        variables 

      }),

    });

    const data = await response.json();

    console.log(`[SpinningTool] 📥 Collection fetch response for ${isCollectionId ? 'ID' : 'handle'} ${collectionId}:`, data);

    

    if (data.data && data.data.collection) {

      const collection = data.data.collection;

      allCollections.push({

        id: collection.id,

        title: collection.title,

        handle: collection.handle,

        image: collection.image?.url || null,

        displayImage: collection.image?.url || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-size="16" fill="#666">${collection.title}</text></svg>`

      });

      console.log(`[SpinningTool] ✅ Added collection: ${collection.title} with handle: ${collection.handle}`);

    } else {

      console.log(`[SpinningTool] ⚠️ No collection data found for ${isCollectionId ? 'ID' : 'handle'}: ${collectionId}`);

    }

  } catch (error) {

    console.error(`[SpinningTool] ❌ Error fetching collection ${collectionId}:`, error);

  }

}

console.log(`[SpinningTool] 📊 Final collections array:`, allCollections);

return allCollections;

}

async function fetchYAxisCollectionProducts(yAxisCollectionIds) {

if (!Array.isArray(yAxisCollectionIds) || yAxisCollectionIds.length === 0) { return []; }

const allProducts = [];

for (const collectionId of yAxisCollectionIds) {

  try {

    const query = `query GetCollectionProducts($handle: String!) {

      collection(handle: $handle) {

        id

        title

        handle

        products(first: 100) {

          edges {

            node {

              id

              title

              handle

              descriptionHtml

              productType

              tags

              featuredImage { url altText }

              media(first: 50) {

                edges {

                  node {

                    __typename

                    ... on MediaImage {

                      image { url altText }

                    }

                    ... on Video {

                      sources { url mimeType }

                      previewImage { url }

                    }

                  }

                }

              }

              priceRange {

                minVariantPrice { amount currencyCode }

                maxVariantPrice { amount currencyCode }

              }

              variants(first: 50) {

                edges {

                  node {

                    id

                    title

                    price { amount currencyCode }

                    compareAtPrice { amount currencyCode }

                    availableForSale

                    sku

                    image { url altText }

                    selectedOptions { name value }

                  }

                }

              }

            }

          }

        }

      }

    }`;

    const response = await fetch(SHOPIFY_STOREFRONT_API, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

      },

      body: JSON.stringify({ 

        query, 

        variables: { handle: collectionId } 

      }),

    });

    const data = await response.json();

    console.log(`[fetchYAxisCollectionProducts] 📦 Raw Shopify API Response for collection "${collectionId}":`, data);
    console.log(`[fetchYAxisCollectionProducts] 📊 Collection Data:`, data.data?.collection);
    console.log(`[fetchYAxisCollectionProducts] 🔢 Products in Collection:`, data.data?.collection?.products?.edges?.length || 0);

    if (data.data && data.data.collection && data.data.collection.products) {

      const collectionProducts = data.data.collection.products.edges.map(edge => {

        const node = edge.node;

        

        // Process media to separate images and videos

        const media = (node.media?.edges || []).map(mediaEdge => {

          const media = mediaEdge.node;

          if (media.__typename === 'MediaImage') {

            return {

              type: 'image',

              url: media.image.url,

              altText: media.image.altText,

            };

          }

          if (media.__typename === 'Video') {

            return {

              type: 'video',

              sources: media.sources,

              previewImage: media.previewImage?.url,

            };

          }

          return null;

        }).filter(Boolean);

        

        // Extract images and videos

        const images = media.filter(m => m.type === 'image').map(m => m.url);

        const videos = media.filter(m => m.type === 'video');

        

        return {

          id: node.id,

          title: node.title,

          name: node.title,

        handle: node.handle,

        description: node.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

        productType: node.productType,

        tags: node.tags,

        priceRange: node.priceRange,

        collectionId: collectionId,

        collectionTitle: data.data.collection.title,

          images: [

            ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),

            ...images,

            ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

          ],

          videos: videos,

          variants: (node.variants.edges || []).map(v => ({

            id: v.node.id,

            title: v.node.title,

            price: v.node.price,

            compareAtPrice: v.node.compareAtPrice,

            availableForSale: v.node.availableForSale,

            sku: v.node.sku,

            weight: v.node.weight,

            weightUnit: v.node.weightUnit,

            barcode: v.node.barcode,

            selectedOptions: v.node.selectedOptions,

            image: v.node.image && v.node.image.url ? v.node.image.url : null

          }))

        };

      });

      allProducts.push(...collectionProducts);

    }

  } catch (error) {

  } }

const productStatusData = await fetchProductStatus();

const filteredProducts = filterProductsByStatus(allProducts, productStatusData);

return filteredProducts;

}

async function fetchXAxisCollectionProducts(xAxisCollections) {

if (!Array.isArray(xAxisCollections) || xAxisCollections.length === 0) {

  return [];

}

const collectionIds = xAxisCollections.map(collection => {

  if (!collection || !collection.id) {

    return null;

  }

  const idMatch = collection.id.match(/gid:\/\/shopify\/Collection\/(.+)/);

  return idMatch ? idMatch[1] : null;

}).filter(Boolean);

if (collectionIds.length === 0) {

  return [];

}

const allProducts = [];

for (const collectionId of collectionIds) {

  try {

    const query = `query GetCollectionProducts($handle: String!) {

      collection(handle: $handle) {

        id

        title

        handle

        products(first: 100) {

          edges {

            node {

              id

              title

              handle

              descriptionHtml

              productType

              tags

              featuredImage { url altText }

              media(first: 50) {

                edges {

                  node {

                    __typename

                    ... on MediaImage {

                      image { url altText }

                    }

                    ... on Video {

                      sources { url mimeType }

                      previewImage { url }

                    }

                  }

                }

              }

              priceRange {

                minVariantPrice { amount currencyCode }

                maxVariantPrice { amount currencyCode }

              }

              variants(first: 50) {

                edges {

                  node {

                    id

                    title

                    price { amount currencyCode }

                    compareAtPrice { amount currencyCode }

                    availableForSale

                    sku

                    image { url altText }

                    selectedOptions { name value }

                  }

                }

              }

            }

          }

        }

      }

    }`;

    const response = await fetch(SHOPIFY_STOREFRONT_API, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

      },

      body: JSON.stringify({ 

        query, 

        variables: { handle: collectionId } 

      }),

    });

    const data = await response.json();

    console.log(`[fetchXAxisCollectionProducts] 📦 Raw Shopify API Response for collection "${collectionId}":`, data);
    console.log(`[fetchXAxisCollectionProducts] 📊 Collection Data:`, data.data?.collection);
    console.log(`[fetchXAxisCollectionProducts] 🔢 Products in Collection:`, data.data?.collection?.products?.edges?.length || 0);

    if (data.data && data.data.collection && data.data.collection.products) {

      const collectionProducts = data.data.collection.products.edges.map(edge => {

        const node = edge.node;

        

        // Process media to separate images and videos

        const media = (node.media?.edges || []).map(mediaEdge => {

          const media = mediaEdge.node;

          if (media.__typename === 'MediaImage') {

            return {

              type: 'image',

              url: media.image.url,

              altText: media.image.altText,

            };

          }

          if (media.__typename === 'Video') {

            return {

              type: 'video',

              sources: media.sources,

              previewImage: media.previewImage?.url,

            };

          }

          return null;

        }).filter(Boolean);

        

        // Extract images and videos

        const images = media.filter(m => m.type === 'image').map(m => m.url);

        const videos = media.filter(m => m.type === 'video');

        

        return {

          id: node.id,

          title: node.title,

          name: node.title,

        handle: node.handle,

        description: node.descriptionHtml?.replace(/<\/?[^>]+(>|$)/g, ''),

        productType: node.productType,

        tags: node.tags,

        priceRange: node.priceRange,

        collectionId: collectionId,

        collectionTitle: data.data.collection.title,

          images: [

            ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),

            ...images,

            ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

          ],

          videos: videos,

          variants: (node.variants.edges || []).map(v => ({

            id: v.node.id,

            title: v.node.title,

            price: v.node.price,

            compareAtPrice: v.node.compareAtPrice,

            availableForSale: v.node.availableForSale,

            sku: v.node.sku,

            weight: v.node.weight,

            weightUnit: v.node.weightUnit,

            barcode: v.node.barcode,

            selectedOptions: v.node.selectedOptions,

            image: v.node.image && v.node.image.url ? v.node.image.url : null

          }))

        };

      });

      allProducts.push(...collectionProducts);

    }

  } catch (error) {

  }

}

const productStatusData = await fetchProductStatus();

const filteredProducts = filterProductsByStatus(allProducts, productStatusData);

return filteredProducts;

}

function getRelatedYAxisCollections(xAxisCollection, allYAxisCollections) {

const relatedCollections = [];

if (!xAxisCollection || !xAxisCollection.id || !Array.isArray(allYAxisCollections)) {

  return relatedCollections;

}

if (allYAxisCollections.length === 0) {

  return relatedCollections;

}

const xAxisIndex = xAxisCollections.findIndex(collection => 

  collection && collection.id && xAxisCollection && xAxisCollection.id && 

  collection.id === xAxisCollection.id

);

if (xAxisIndex !== -1 && xAxisIndex < allYAxisCollections.length) {

  const relatedYAxisCollection = allYAxisCollections[xAxisIndex];

  if (relatedYAxisCollection && relatedYAxisCollection.title) {

    relatedCollections.push(relatedYAxisCollection);

  } }

return relatedCollections;

}

async function updateYAxisProductsForXAxisCollection(xAxisCollection) {

if (!xAxisCollection) {

  console.log('[SpinningTool] ⚠️ No X-axis collection provided to updateYAxisProductsForXAxisCollection');

  return;

}



console.log(`[SpinningTool] 🔄 Updating Y-axis products for X-axis collection: ${xAxisCollection.title}`);

console.log(`[SpinningTool] 📊 Collection data:`, { 

  id: xAxisCollection.id, 

  handle: xAxisCollection.handle, 

  title: xAxisCollection.title 

});



// Always fetch products from the current X-axis collection for Y-axis display

// Use the collection handle directly, not the ID

const xAxisCollectionHandle = xAxisCollection && xAxisCollection.handle ? xAxisCollection.handle : null;



if (xAxisCollectionHandle) {

  console.log(`[SpinningTool] 📍 Fetching products for collection handle: ${xAxisCollectionHandle}`);

  try {

    const query = `query GetCollectionProducts($handle: String!) {

      collection(handle: $handle) {

        id

        title

        handle

        products(first: 100) {

          edges {

            node {

              id

              title

              handle

              descriptionHtml

              productType

              tags

              priceRange {

                minVariantPrice { amount currencyCode }

                maxVariantPrice { amount currencyCode }

              }

              featuredImage { url altText }

              media(first: 50) {

                edges {

                  node {

                    __typename

                    ... on MediaImage {

                      image { url altText }

                    }

                    ... on Video {

                      sources { url mimeType }

                      previewImage { url }

                    }

                  }

                }

              }

              variants(first: 50) {

                edges {

                  node {

                    id

                    title

                    price { amount currencyCode }

                    compareAtPrice { amount currencyCode }

                    availableForSale

                    sku

                    weight

                    weightUnit

                    barcode

                    selectedOptions { name value }

                    image { url altText }

                  }

                }

              }

            }

          }

        }

      }

    }`;

    const response = await fetch(SHOPIFY_STOREFRONT_API, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,

      },

      body: JSON.stringify({ 

        query, 

        variables: { handle: xAxisCollectionHandle } 

      }),

    });

    const data = await response.json();

    console.log(`[SpinningTool] 📦 Raw Shopify API Response for collection "${xAxisCollectionHandle}":`, data);
    console.log(`[SpinningTool] 📊 Collection Data:`, data.data?.collection);
    console.log(`[SpinningTool] 🔢 Products in Collection:`, data.data?.collection?.products?.edges?.length || 0);

    if (data.data && data.data.collection && data.data.collection.products) {

      const productStatusData = await fetchProductStatus();

      let xAxisProducts = data.data.collection.products.edges.map(edge => {

        const node = edge.node;

        

        // Process media to separate images and videos

        const media = (node.media?.edges || []).map(mediaEdge => {

          const media = mediaEdge.node;

          if (media.__typename === 'MediaImage') {

            return {

              type: 'image',

              url: media.image.url,

              altText: media.image.altText,

            };

          }

          if (media.__typename === 'Video') {

            return {

              type: 'video',

              sources: media.sources,

              previewImage: media.previewImage?.url,

            };

          }

          return null;

        }).filter(Boolean);

        

        // Extract images and videos

        const images = media.filter(m => m.type === 'image').map(m => m.url);

        const videos = media.filter(m => m.type === 'video');

        

        return {

          id: node.id,

          title: node.title,

          name: node.title,

          handle: node.handle,

          collectionId: xAxisCollectionHandle,

          collectionTitle: data.data.collection.title,

          images: [

            ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),

            ...images,

            ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))

          ],

          videos: videos,

          variants: (node.variants.edges || []).map(v => ({

            id: v.node.id,

            title: v.node.title,

            price: v.node.price,

            compareAtPrice: v.node.compareAtPrice,

            availableForSale: v.node.availableForSale,

            sku: v.node.sku,

            weight: v.node.weight,

            weightUnit: v.node.weightUnit,

            barcode: v.node.barcode,

            selectedOptions: v.node.selectedOptions,

            image: v.node.image && v.node.image.url ? v.node.image.url : null

          }))

        };

      });

      const filteredXAxisProducts = filterProductsByStatus(xAxisProducts, productStatusData);

      // Use the products from the current X-axis collection for Y-axis display

      yAxisProducts = filteredXAxisProducts;

      

      console.log(`[SpinningTool] ✅ Updated Y-axis with ${yAxisProducts.length} products from X-axis collection: ${xAxisCollection.title}`);

      console.log(`[SpinningTool] 📊 Y-axis products sample:`, yAxisProducts.slice(0, 3).map(p => ({ title: p.title, handle: p.handle })));

      renderCarousels();

      return;

    } else {

      console.log(`[SpinningTool] ⚠️ No products found in collection: ${xAxisCollection.title}`);

    }

  } catch (error) {

    console.error('[SpinningTool] ❌ Error fetching products for X-axis collection:', error);

  }

} else {

  console.log(`[SpinningTool] ⚠️ Could not extract collection handle from:`, xAxisCollection);

}



// Fallback: if no products found, clear Y-axis

console.log(`[SpinningTool] 🔄 Clearing Y-axis products as fallback`);

yAxisProducts = [];

renderCarousels();

}

async function fetchProductStatus() {

try {

  const shop = window.Shopify && window.Shopify.shop ? window.Shopify.shop : window.location.hostname;

  const response = await fetch(`https://shopify-management-app.vercel.app/api/public/product-status?shop=1cb12f-54.myshopify.com`);

  const data = await response.json();

  return data;

} catch (error) {

  return null;

} }

function filterProductsByStatus(productsToFilter, productStatusData) {

if (!productStatusData || !productStatusData.success || !productStatusData.data || !productStatusData.data.statuses) {

  return productsToFilter;

}

const inactiveProductIds = productStatusData.data.statuses

  .filter(status => !status.isActive)

  .map(status => status.productId);

if (inactiveProductIds.length === 0) {

  return productsToFilter;

}

const filteredProducts = productsToFilter.filter(product => {

  let productId = null;

  if (product.id) {

    const idMatch = product.id.match(/gid:\/\/shopify\/Product\/(\d+)/);

    productId = idMatch ? idMatch[1] : product.id;

  } else if (product.productId) {

    productId = product.productId;

  }

  if (!productId) {

    return true;  }

  const isActive = !inactiveProductIds.includes(productId);

  return isActive;

});



return filteredProducts;

}

async function waitForCarouselAndInit() {

console.log('[SpinningTool] 🚀 Starting initialization... (v2.0)');

showLoading();

if (!STOREFRONT_TOKEN) {

  console.error('[SpinningTool] ❌ Missing Storefront API token');

  const isMobile = window.innerWidth < 668;
  const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
  if (carouselVertical) carouselVertical.innerHTML = '<div style="color:red;">Failed to load products: missing Storefront API token</div>';

  return;

}

isProductPage = checkIfProductPage();

console.log('[SpinningTool] 📍 isProductPage:', isProductPage);

const [publicSettings, productStatusData] = await Promise.all([

  fetchPublicSettings(),

  fetchProductStatus()

]);  



let usedXAxisCollections = null;

let usedYAxisCollections = null;

let yAxisType = null;



if (publicSettings && publicSettings.success && publicSettings.data) {

  console.log('[SpinningTool] 📊 Public settings data:', publicSettings.data);

  if (Array.isArray(publicSettings.data.xAxisCollections) && publicSettings.data.xAxisCollections.length > 0) {

    usedXAxisCollections = publicSettings.data.xAxisCollections;

    console.log('[SpinningTool] xAxisCollections found in publicSettings:', usedXAxisCollections);

    console.log('[SpinningTool] 📋 X-axis collection details:', usedXAxisCollections.map(c => ({ id: c.id, title: c.title, handle: c.handle })));

  }

  if (publicSettings.data.yAxis === 'variation') {

    yAxisType = 'variation';

    console.log('[SpinningTool] Y-axis type is "variation"');

  } else if (Array.isArray(publicSettings.data.yAxisCollections) && publicSettings.data.yAxisCollections.length > 0) {

    usedYAxisCollections = publicSettings.data.yAxisCollections;

    console.log('[SpinningTool] yAxisCollections found in publicSettings:', usedYAxisCollections);

  } }

if (usedXAxisCollections && usedYAxisCollections) {

  console.log('[SpinningTool] Both X-axis and Y-axis collections found, using hierarchical mode.');

  const xAxisCollectionIds = usedXAxisCollections.map(collection => {

    if (!collection || !collection.id) {

      console.warn('Collection missing ID:', collection);

      return null;

    }

    const idMatch = collection.id.match(/gid:\/\/shopify\/Collection\/(.+)/);

    const extractedId = idMatch ? idMatch[1] : null;

    console.log(`[SpinningTool] 🔍 Collection "${collection.title}": ID="${collection.id}" -> extracted="${extractedId}"`);

    return extractedId;

  }).filter(Boolean);

  

  console.log(`[SpinningTool] 📋 Final X-axis collection IDs to fetch:`, xAxisCollectionIds);

  

  const yAxisCollectionIds = usedYAxisCollections.map(collection => {

    if (!collection || !collection.id) {

      console.warn('Collection missing ID:', collection);

      return null;

    }

    const idMatch = collection.id.match(/gid:\/\/shopify\/Collection\/(.+)/);

    return idMatch ? idMatch[1] : null;

  }).filter(Boolean);

  

  xAxisCollections = await fetchXAxisCollections(xAxisCollectionIds);

  console.log('[SpinningTool] X-axis collections loaded:', xAxisCollections);

  yAxisCollections = usedYAxisCollections;

  console.log('[SpinningTool] Y-axis collections stored:', yAxisCollections);

  

  if (xAxisCollections.length > 0) {

    console.log(`[SpinningTool] 🎯 Initializing with ${xAxisCollections.length} X-axis collections`);

    // Initialize Y-axis with products from the first X-axis collection

    if (xAxisCollections[0]) {

      console.log(`[SpinningTool] 🔄 Initializing Y-axis with first X-axis collection: ${xAxisCollections[0].title}`);

      await updateYAxisProductsForXAxisCollection(xAxisCollections[0]);

    }

    afterProductsLoaded();

  } else {

    console.log('[SpinningTool] No X-axis collections loaded, falling back to default logic.');

    fetchProducts();

  }

} else if (usedXAxisCollections && (!usedYAxisCollections || yAxisType === 'variation')) {

  const validXAxisCollections = usedXAxisCollections.filter(collection => {

    if (!collection || !collection.id) {

      console.warn('Filtering out collection without ID:', collection);

      return false;

    }

    return true;

  });

  const xAxisProducts = await fetchXAxisCollectionProducts(validXAxisCollections);

  console.log('[SpinningTool] Products fetched for xAxisCollections:', xAxisProducts);

  if (Array.isArray(xAxisProducts) && xAxisProducts.length > 0) {

    const filteredXAxisProducts = filterProductsByStatus(xAxisProducts, productStatusData);

    products = filteredXAxisProducts;

    console.log('[SpinningTool] Final products array set from xAxisCollections:', products);

    afterProductsLoaded();

  } else {

    console.log('[SpinningTool] No products found for xAxisCollections, falling back to default logic.');

    fetchProducts();

  }

} else {

  const selection = await fetchSpinningSelection();

  if (selection && Array.isArray(selection.collectionIds) && selection.collectionIds.length > 0) {

    await fetchProductsForLayer(selection.collectionIds);

  } else {

    fetchProducts();

  } }

if (isProductPage) {

  console.log('[SpinningTool] 🎯 Product page detected! Applying styling and positioning...');

  setTimeout(() => {

    const carouselContainer = document.getElementById('spinning-tool-carousel');

    const panels = carouselContainer ? carouselContainer.querySelectorAll('.carousel-panel') : [];

    console.log('[SpinningTool] 🔍 Debug - Carousel panels found:', panels.length);

    if (panels.length > 0) {

      console.log('[SpinningTool] 🔍 Debug - First panel content:', panels[0].innerHTML);

    }

    fix3DTransforms();

  }, 1000); }

fetchMenuAndFormat();

attachListenersWhenReady();

setupOverlayEventListeners();

const observer = new MutationObserver(() => {

  attachListenersWhenReady();

});

observer.observe(document.body, { childList: true, subtree: true });

}

if (document.readyState === 'loading') {

document.addEventListener('DOMContentLoaded', waitForCarouselAndInit);

} else {

waitForCarouselAndInit();

}

function handleVariantChanges() {

console.log('[SpinningTool] 🔄 Variant change handling - but spinning tool shows all products');

return; }

function switchToVariant(variantId) {

console.log('[SpinningTool] 🔄 Variant change detected:', variantId, '- but spinning tool shows all products');

return; }

function detectInitialVariant() {

return; }



// Mobile App Functionality

function initMobileApp() {

  console.log('[MobileApp] 📱 Initializing mobile app functionality');

  // Load saved theme
  loadTheme();

  // Initialize gallery functionality
  initGallery();
  
  // Initialize detail modal functionality
  initDetailModal();

  

  // Check if we're on mobile

  const isMobile = window.innerWidth < 668;

  

  if (isMobile) {

    // Show mobile interface, hide desktop

    const mobileContainer = document.getElementById('mobile-app-container');

    const desktopContainer = document.getElementById('hierarchical-carousel');

    

    if (mobileContainer) {

      mobileContainer.style.display = 'flex';

    }

    if (desktopContainer) {

      desktopContainer.style.display = 'none';

    }

    

    // Initialize mobile hierarchical carousel

    initMobileHierarchicalCarousel();

  } else {

    // Show desktop interface, hide mobile

    const mobileContainer = document.getElementById('mobile-app-container');

    const desktopContainer = document.getElementById('hierarchical-carousel');

    

    if (mobileContainer) {

      mobileContainer.style.display = 'none';

    }

    if (desktopContainer) {

      desktopContainer.style.display = 'block';

    }

  }

}

// Enhanced mobile app initialization with state preservation
function initMobileAppWithState(preservedState = null) {
  console.log('[MobileApp] 🔄 Initializing mobile app with state preservation');
  
  // Load saved theme
  loadTheme();
  
  // Initialize gallery functionality
  initGallery();
  
  // Initialize detail modal functionality
  initDetailModal();
  
  // Check if we're on mobile
  const isMobile = window.innerWidth < 668;
  
  if (isMobile) {
    // Show mobile interface, hide desktop
    const mobileContainer = document.getElementById('mobile-app-container');
    const desktopContainer = document.getElementById('hierarchical-carousel');
    
    if (mobileContainer) {
      mobileContainer.style.display = 'flex';
    }
    if (desktopContainer) {
      desktopContainer.style.display = 'none';
    }
    
    // Initialize mobile hierarchical carousel with preserved state
    initMobileHierarchicalCarouselWithState(preservedState);
  } else {
    // Show desktop interface, hide mobile
    const mobileContainer = document.getElementById('mobile-app-container');
    const desktopContainer = document.getElementById('hierarchical-carousel');
    
    if (mobileContainer) {
      mobileContainer.style.display = 'none';
    }
    if (desktopContainer) {
      desktopContainer.style.display = 'block';
    }
    
    // Restore desktop state if available
    if (preservedState) {
      restoreDesktopState(preservedState);
    }
  }
}

// Initialize mobile hierarchical carousel with preserved state
function initMobileHierarchicalCarouselWithState(preservedState = null) {
  console.log('[MobileApp] 🔄 Initializing mobile carousel with preserved state');
  
  // Wait for the mobile carousel container to be available
  setTimeout(() => {
    const mobileCarousel = document.getElementById('mobile-hierarchical-carousel');
    
    if (mobileCarousel) {
      console.log('[MobileApp] 🎨 Mobile carousel found, populating with preserved data...');
      
      // Initialize mobile carousel with proper state - hide level 2 and 3
      document.getElementById('mobile-level-2-carousel').style.display = 'none';
      
      // Hide level 3 completely
      const level3Carousel = document.getElementById('mobile-level-3-carousel');
      if (level3Carousel) {
        level3Carousel.style.display = 'none';
        level3Carousel.style.visibility = 'hidden';
        level3Carousel.style.height = '0';
        level3Carousel.style.overflow = 'hidden';
        level3Carousel.classList.add('hidden');
      }
      
      // Populate mobile carousel with preserved state
      populateMobileCarouselWithState(preservedState);
    }
  }, 100);
}

// Populate mobile carousel with preserved state
function populateMobileCarouselWithState(preservedState = null) {
  const mobileLevel1Items = document.getElementById('mobile-level-1-items');
  
  if (!mobileLevel1Items) {
    console.log('[MobileApp] ❌ Mobile level 1 items container not found');
    return;
  }
  
  console.log('[MobileApp] 📦 Populating mobile carousel with preserved state');
  
  // Clear existing content
  mobileLevel1Items.innerHTML = '';
  
  // Use preserved state data if available
  if (preservedState && preservedState.carouselData && preservedState.carouselData.xAxisCollections.length > 0) {
    console.log('[MobileApp] 🎯 Using preserved carousel data');
    
    preservedState.carouselData.xAxisCollections.forEach((collection, index) => {
      const collectionItem = createCollectionItem(collection, 1);
      collectionItem.onclick = () => selectMobileCollection(collection.title, index);
      mobileLevel1Items.appendChild(collectionItem);
    });
    
    console.log('[MobileApp] 📝 Restored', preservedState.carouselData.xAxisCollections.length, 'collections');
  } else {
    // Fallback to regular population
    populateMobileCarousel();
  }
  
  console.log('[MobileApp] ✅ Mobile carousel populated with preserved state');
}

// Restore desktop state after viewport change
function restoreDesktopState(preservedState) {
  console.log('[Desktop] 🔄 Restoring desktop state after viewport change');
  
  if (!preservedState) return;
  
  // Restore global state variables
  if (preservedState.horizontalIndex !== undefined) {
    window.horizontalIndex = preservedState.horizontalIndex;
  }
  if (preservedState.verticalIndex !== undefined) {
    window.verticalIndex = preservedState.verticalIndex;
  }
  if (preservedState.currentXAxisCollection) {
    window.currentXAxisCollection = preservedState.currentXAxisCollection;
  }
  if (preservedState.currentYAxisCollection) {
    window.currentYAxisCollection = preservedState.currentYAxisCollection;
  }
  
  // Restore carousel data
  if (preservedState.carouselData) {
    if (preservedState.carouselData.xAxisCollections) {
      window.xAxisCollections = preservedState.carouselData.xAxisCollections;
    }
    if (preservedState.carouselData.yAxisCollections) {
      window.yAxisCollections = preservedState.carouselData.yAxisCollections;
    }
    if (preservedState.carouselData.products) {
      window.products = preservedState.carouselData.products;
    }
  }
  
  console.log('[Desktop] ✅ Desktop state restored successfully');
}



// Initialize mobile hierarchical carousel

function initMobileHierarchicalCarousel() {

  console.log('[MobileApp] 🎯 Initializing mobile hierarchical carousel');

  

  // Wait for the mobile carousel container to be available

  setTimeout(() => {

    const mobileCarousel = document.getElementById('mobile-hierarchical-carousel');

    if (mobileCarousel) {

      console.log('[MobileApp] 🎨 Mobile carousel found, populating with data...');

      

      // Initialize mobile carousel with proper state - hide level 2 and 3

      document.getElementById('mobile-level-2-carousel').style.display = 'none';

      

      // Hide level 3 completely

      const level3Carousel = document.getElementById('mobile-level-3-carousel');

      if (level3Carousel) {

        level3Carousel.style.display = 'none';

        level3Carousel.style.visibility = 'hidden';

        level3Carousel.style.height = '0';

        level3Carousel.style.overflow = 'hidden';

        level3Carousel.classList.add('hidden');

      }

      

      // Always populate mobile carousel immediately (will use fallback if no real data)

      populateMobileCarousel();

      

      // If no real data yet, retry to get real data

      if (!hierarchicalMenuData || hierarchicalMenuData.length === 0) {

        console.log('[MobileApp] ⚠️ Hierarchical menu data not loaded yet, will retry...');

        setTimeout(() => {

          if (hierarchicalMenuData && hierarchicalMenuData.length > 0) {

            console.log('[MobileApp] 🔄 Real hierarchical data loaded, updating mobile carousel');

            populateMobileCarousel();

          }

        }, 2000);

      }

    } else {

      console.log('[MobileApp] ⚠️ Mobile carousel not found, retrying...');

      setTimeout(initMobileHierarchicalCarousel, 1000);

    }

  }, 500);

}



// Populate mobile carousel with real data from desktop carousel

function populateMobileCarousel() {

  const mobileLevel1Items = document.getElementById('mobile-level-1-items');

  if (!mobileLevel1Items) {

    console.log('[MobileApp] ❌ Mobile level 1 items container not found');

    return;

  }

  

  console.log('[MobileApp] 📦 Populating mobile carousel with real collections');

  console.log('[MobileApp] 📊 hierarchicalMenuData available:', hierarchicalMenuData ? hierarchicalMenuData.length : 0);

  

  // Clear existing content

  mobileLevel1Items.innerHTML = '';

  

  // Use the same hierarchical menu data as desktop

  if (hierarchicalMenuData && hierarchicalMenuData.length > 0) {

    console.log('[MobileApp] 🎯 Using real hierarchical menu data');

    hierarchicalMenuData.forEach((collection, index) => {

      // Use the same createCollectionItem function as desktop for consistency
      const collectionItem = createCollectionItem(collection, 1);
      
      // Override the click handler for mobile
      collectionItem.onclick = () => selectMobileCollection(collection.title, index);

      mobileLevel1Items.appendChild(collectionItem);

    });

    console.log('[MobileApp] 📝 Added', hierarchicalMenuData.length, 'real collections');

  } else {

    // Fallback if no hierarchical data loaded yet

    console.log('[MobileApp] 🔄 Using fallback collections');

    const fallbackCollections = [

      { name: 'Watches', color: '#000000' },

      { name: 'Bags', color: '#333333' },

      { name: 'T-Shirts', color: '#666666' },

      { name: 'Headphones', color: '#999999' }

    ];

    

    fallbackCollections.forEach((collection, index) => {

      const collectionItem = document.createElement('div');

      collectionItem.className = 'collection-item';

      collectionItem.style.background = collection.color;

      collectionItem.onclick = () => selectMobileCollection(collection.name, index);

      

      collectionItem.innerHTML = `

        <div class="folder-icon">${index + 1}</div>

        <div class="collection-title">${collection.name}</div>

      `;

      

      mobileLevel1Items.appendChild(collectionItem);

    });

    console.log('[MobileApp] 📝 Added', fallbackCollections.length, 'fallback collections');

  }

  

  console.log('[MobileApp] ✅ Mobile carousel populated successfully');

  console.log('[MobileApp] 📊 Total items in mobile carousel:', mobileLevel1Items.children.length);

  

  // Add a visual indicator that the carousel is populated

  const mobileCarousel = document.getElementById('mobile-hierarchical-carousel');

  if (mobileCarousel) {

    mobileCarousel.style.borderColor = mobileLevel1Items.children.length > 0 ? '#28a745' : '#dc3545';

    mobileCarousel.title = `Mobile carousel loaded with ${mobileLevel1Items.children.length} items`;

  }

}



// Update mobile breadcrumb navigation

function updateMobileBreadcrumb(level, collectionName) {

  const mobileBreadcrumbNav = document.getElementById('mobile-breadcrumb-nav');

  if (!mobileBreadcrumbNav) return;

  

  mobileBreadcrumbNav.innerHTML = '';

  

  for (let i = 1; i <= level; i++) {

    const breadcrumbItem = document.createElement('span');

    breadcrumbItem.className = 'breadcrumb-item';

    breadcrumbItem.dataset.level = i;

    

    if (i === 1) {

      breadcrumbItem.textContent = 'Top Layer';

    } else if (i === 2) {

      breadcrumbItem.textContent = collectionName || 'Sub Layer';

    } else if (i === 3) {

      breadcrumbItem.textContent = 'Sub Sub Layer';

    }

    

    breadcrumbItem.addEventListener('click', () => {

      navigateToMobileLevel(i);

    });

    

    if (i === level) {

      breadcrumbItem.classList.add('active');

    }

    

    mobileBreadcrumbNav.appendChild(breadcrumbItem);

  }

}



// Navigate to specific mobile carousel level

function navigateToMobileLevel(targetLevel) {

  if (targetLevel === 1) {

    // Reset to level 1

    document.getElementById('mobile-level-1-carousel').style.display = 'block';

    document.getElementById('mobile-level-2-carousel').style.display = 'none';

    

    // Hide level 3 completely

    const level3Carousel = document.getElementById('mobile-level-3-carousel');

    if (level3Carousel) {

      level3Carousel.style.display = 'none';

      level3Carousel.style.visibility = 'hidden';

      level3Carousel.style.height = '0';

      level3Carousel.style.overflow = 'hidden';

      level3Carousel.classList.add('hidden');

    }

    

    updateMobileBreadcrumb(1);

  } else if (targetLevel === 2) {

    // Show level 2

    document.getElementById('mobile-level-1-carousel').style.display = 'none';

    document.getElementById('mobile-level-2-carousel').style.display = 'block';

    

    // Hide level 3 completely

    const level3Carousel = document.getElementById('mobile-level-3-carousel');

    if (level3Carousel) {

      level3Carousel.style.display = 'none';

      level3Carousel.style.visibility = 'hidden';

      level3Carousel.style.height = '0';

      level3Carousel.style.overflow = 'hidden';

      level3Carousel.classList.add('hidden');

    }

    

    updateMobileBreadcrumb(2, currentXAxisCollection?.title);

  } else if (targetLevel === 3) {

    // Show level 3

    document.getElementById('mobile-level-1-carousel').style.display = 'none';

    document.getElementById('mobile-level-2-carousel').style.display = 'none';

    

    // Show level 3 - remove hidden class and reset styles

    const level3Carousel = document.getElementById('mobile-level-3-carousel');

    if (level3Carousel) {

      level3Carousel.style.display = 'block';

      level3Carousel.style.visibility = 'visible';

      level3Carousel.style.height = 'auto';

      level3Carousel.style.overflow = 'visible';

      level3Carousel.classList.remove('hidden');

    }

    

    updateMobileBreadcrumb(3, 'Product Details');

  }

}



// Handle mobile collection selection

function selectMobileCollection(collectionName, index) {

  console.log('[MobileApp] 📂 Mobile collection selected:', collectionName);

  

  // Get the collection from hierarchical menu data (same as desktop)

  const collection = hierarchicalMenuData[index];

  if (!collection) {

    console.log('[MobileApp] ❌ Collection not found in hierarchicalMenuData');

    return;

  }

  

  // Update mobile breadcrumb

  updateMobileBreadcrumb(2, collectionName);

  

  // Update spinning tool for this collection (same as desktop)

  updateSpinningToolForCollection(collection);

  

  // Hide level 3 carousel when selecting top layer - FORCE HIDE

  const level3Carousel = document.getElementById('mobile-level-3-carousel');

  if (level3Carousel) {

    level3Carousel.style.display = 'none';

    level3Carousel.style.visibility = 'hidden';

    level3Carousel.style.height = '0';

    level3Carousel.style.overflow = 'hidden';

    level3Carousel.classList.add('hidden');

    console.log('[MobileApp] 🔒 Level 3 carousel hidden');

  } else {

    console.log('[MobileApp] ❌ Level 3 carousel element not found');

  }

  

  // Show level 2 carousel

  const level2Carousel = document.getElementById('mobile-level-2-carousel');

  const level2Items = document.getElementById('mobile-level-2-items');

  

  if (level2Carousel && level2Items) {

    // Hide level 1

    document.getElementById('mobile-level-1-carousel').style.display = 'none';

    

    // Show level 2

    level2Carousel.style.display = 'block';

    

    // Populate level 2 with sub-collections from the selected collection

    level2Items.innerHTML = '';

    

    // Get sub-collections for this collection (same logic as desktop)

    const children = getCollectionChildren(collection);

    if (children && children.length > 0) {

      console.log('[MobileApp] 📂 Found', children.length, 'sub-collections');

      children.forEach((subCollection, subIndex) => {

        // Use the same createCollectionItem function as desktop for consistency
        const subItem = createCollectionItem(subCollection, 2);
        
        // Override the click handler for mobile
        subItem.onclick = () => selectMobileSubCollection(subCollection.title, subIndex, collection);

        level2Items.appendChild(subItem);

      });

    } else {

      // If no sub-collections, show products directly

      console.log('[MobileApp] 📦 No sub-collections, showing products directly');

      if (collection.resource && collection.resource.length > 0) {

        collection.resource.forEach((product, productIndex) => {

          const productItem = document.createElement('div');

          productItem.className = 'collection-item';

          productItem.style.background = '#444444';

          productItem.onclick = () => selectMobileProduct(product.title, productIndex, collection);

          

          productItem.innerHTML = `

            <div class="folder-icon">${productIndex + 1}</div>

            <div class="collection-title">${product.title}</div>

          `;

          

          level2Items.appendChild(productItem);

        });

      } else {

        // Fallback products

        const fallbackProducts = [

          { name: `${collectionName} Product 1` },

          { name: `${collectionName} Product 2` },

          { name: `${collectionName} Product 3` },

          { name: `${collectionName} Product 4` }

        ];

        

        fallbackProducts.forEach((product, productIndex) => {

          const productItem = document.createElement('div');

          productItem.className = 'collection-item';

          productItem.style.background = '#444444';

          productItem.onclick = () => selectMobileProduct(product.name, productIndex, collection);

          

          productItem.innerHTML = `

            <div class="folder-icon">${productIndex + 1}</div>

            <div class="collection-title">${product.name}</div>

          `;

          

          level2Items.appendChild(productItem);

        });

      }

    }

  }

}



// Handle mobile sub-collection selection

function selectMobileSubCollection(subCollectionName, subIndex, parentCollection) {

  console.log('[MobileApp] 📂 Mobile sub-collection selected:', subCollectionName);

  

  // Get the sub-collection from the parent collection

  const subCollection = parentCollection.items[subIndex];

  if (!subCollection) {

    console.log('[MobileApp] ❌ Sub-collection not found');

    return;

  }

  

  // Update mobile breadcrumb to level 3

  updateMobileBreadcrumb(3, subCollectionName);

  

  // Update spinning tool for this sub-collection (same as desktop)

  updateSpinningToolForCollection(subCollection);

  

  // Show level 3 carousel

  const level3Carousel = document.getElementById('mobile-level-3-carousel');

  const level3Items = document.getElementById('mobile-level-3-items');

  

  if (level3Carousel && level3Items) {

    // Hide level 2

    document.getElementById('mobile-level-2-carousel').style.display = 'none';

    

    // Show level 3 - remove hidden class and reset styles

    level3Carousel.style.display = 'block';

    level3Carousel.style.visibility = 'visible';

    level3Carousel.style.height = 'auto';

    level3Carousel.style.overflow = 'visible';

    level3Carousel.classList.remove('hidden');

    

    // Populate level 3 with sub-collections from the selected sub-collection (same as desktop)

    level3Items.innerHTML = '';

    

    // Get sub-collections for this sub-collection (same logic as desktop)

    const children = getCollectionChildren(subCollection);

    if (children && children.length > 0) {

      console.log('[MobileApp] 📂 Found', children.length, 'sub-collections for level 3');

      children.forEach((subSubCollection, subSubIndex) => {

        // Use the same createCollectionItem function as desktop for consistency
        const subSubItem = createCollectionItem(subSubCollection, 3);
        
        // Override the click handler for mobile
        subSubItem.onclick = () => selectMobileThirdLevelCollection(subSubCollection.title, subSubIndex, subSubCollection);

        level3Items.appendChild(subSubItem);

      });

    } else {

      // If no sub-collections, show products directly

      console.log('[MobileApp] 📦 No sub-collections in level 3, showing products directly');

    if (subCollection.resource && subCollection.resource.length > 0) {

      subCollection.resource.forEach((product, productIndex) => {

        const productItem = document.createElement('div');

        productItem.className = 'collection-item';

        productItem.style.background = '#444444';

        productItem.onclick = () => selectMobileProduct(product.title, productIndex, subCollection);

        

        productItem.innerHTML = `

          <div class="folder-icon">${productIndex + 1}</div>

          <div class="collection-title">${product.title}</div>

        `;

        

        level3Items.appendChild(productItem);

      });

    } else {

      // Fallback products

      const fallbackProducts = [

        { name: `${subCollectionName} Product 1` },

        { name: `${subCollectionName} Product 2` },

        { name: `${subCollectionName} Product 3` }

      ];

      

      fallbackProducts.forEach((product, productIndex) => {

        const productItem = document.createElement('div');

        productItem.className = 'collection-item';

        productItem.style.background = '#444444';

        productItem.onclick = () => selectMobileProduct(product.name, productIndex, subCollection);

        

        productItem.innerHTML = `

          <div class="folder-icon">${productIndex + 1}</div>

          <div class="collection-title">${product.name}</div>

        `;

        

        level3Items.appendChild(productItem);

      });

      }

    }

  }

}



// Handle mobile third level collection selection

function selectMobileThirdLevelCollection(collectionName, index, collection) {

  console.log('[MobileApp] 📂 Mobile third level collection selected:', collectionName);

  

  // Update spinning tool for this collection (same as desktop)

  updateSpinningToolForCollection(collection);

  

  // Update mobile breadcrumb to show the selected collection

  updateMobileBreadcrumb(3, collectionName);

  

  console.log('[MobileApp] 🎯 Spinning tool updated with third level collection:', collection.title);

}



// Handle mobile product selection

function selectMobileProduct(productName, index, collection) {

  console.log('[MobileApp] 🛍️ Mobile product selected:', productName);

  

  // Update spinning tool for this specific product (same as desktop)

  if (collection && collection.resource && collection.resource[index]) {

    const product = collection.resource[index];

    updateSpinningToolForCollection(product);

    console.log('[MobileApp] 🎯 Spinning tool updated with product:', product.title);

  }

  

  // For now, just show a success message

  console.log('[MobileApp] ✅ Product selected and spinning tool updated');

}



// Mobile navigation functions

function goBack() {

  console.log('[MobileApp] ⬅️ Back button clicked');

  if (window.history.length > 1) {

    window.history.back();

  } else {

    // Fallback to home or previous page

    window.location.href = '/';

  }

}



function showNotifications() {

  console.log('[MobileApp] 🔔 Notifications clicked');

  alert('Notifications feature coming soon!');

}



function selectCategory(category) {

  console.log('[MobileApp] 📂 Category selected:', category);

  

  // Update active category visual

  const categoryCards = document.querySelectorAll('.category-card');

  categoryCards.forEach(card => {

    card.style.border = 'none';

  });

  

  event.target.closest('.category-card').style.border = '3px solid #FFA500';

  

  // Here you would typically filter products or load new content

  // For now, we'll just show an alert

  alert(`Selected category: ${category}`);

}



function setFilter(filter) {

  console.log('[MobileApp] 🔍 Filter selected:', filter);

  

  // Update active filter button

  const filterButtons = document.querySelectorAll('.filter-button');

  filterButtons.forEach(button => {

    button.classList.remove('active');

  });

  

  event.target.classList.add('active');

  

  // Apply gender-based filtering
  filterProductsByGender(filter);

}



function filterProductsByGender(gender) {
  console.log(`[GenderFilter] 🔍 Filtering products by gender: ${gender}`);

  // Reset all index states when switching filters
  horizontalIndex = 0;
  verticalIndex = 0;
  activeCarousel = "horizontal";

  if (gender === 'all') {
    // Show all products
    if (window.allProductsBackup && window.allProductsBackup.length > 0) {
      products = window.allProductsBackup.slice();
      renderCarousels();
      console.log('[GenderFilter] 🔄 Showing all products:', products.length);
    }
    return;
  }

  // Filter products by gender tag
  const searchSource = window.allProductsBackup && window.allProductsBackup.length > 0 
    ? window.allProductsBackup 
    : products;

  const filteredProducts = searchSource.filter(product => {
    if (!product.tags || !Array.isArray(product.tags)) {
      return false;
    }
    
    // Check if any tag contains the gender string (case-insensitive)
    return product.tags.some(tag => 
      tag.toLowerCase().includes(gender.toLowerCase())
    );
  });

  products = filteredProducts;
  
  // Show empty state message if no products found
  if (filteredProducts.length === 0) {
    showEmptyStateMessage(gender);
  } else {
    hideEmptyStateMessage();
    renderCarousels();
  }
  
  console.log(`[GenderFilter] 🔍 Found ${filteredProducts.length} products for ${gender} category`);
}

function showEmptyStateMessage(gender) {
  console.log(`[GenderFilter] 📭 No products found for ${gender} category`);
  
  const isMobile = window.innerWidth < 668;
  const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
  const carouselHorizontal = isMobile ? document.querySelector('.mobile-carousel-horizontal') : document.querySelector('.desktop-carousel-horizontal');
  
  const emptyMessage = `${gender.charAt(0).toUpperCase() + gender.slice(1)} category doesn't have any products`;
  
  if (carouselVertical) {
    carouselVertical.innerHTML = `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.2em;color:#666;text-align:center;padding:20px;">
        <div style="font-size:3em;margin-bottom:20px;">📭</div>
        <div>${emptyMessage}</div>
      </div>
    `;
  }
  
  if (carouselHorizontal) {
    carouselHorizontal.innerHTML = '';
  }
}

function hideEmptyStateMessage() {
  // This function can be used to hide empty state if needed
  // Currently handled by renderCarousels() when products are available
}

function showFilters() {

  console.log('[MobileApp] ⚙️ Advanced filters clicked');

  alert('Advanced filters coming soon!');

}



function showGallery() {
  console.log('[MobileApp] 🖼️ Gallery clicked');
  
  // Get the active product from the spinning tool
  const activeProduct = getCurrentDisplayedProduct();
  console.log('[MobileApp] 🖼️ Active product:', activeProduct);
  
  if (activeProduct && activeProduct.images && activeProduct.images.length > 0) {
    // Update gallery main image
    const galleryMainImg = document.getElementById('gallery-main-img');
    if (galleryMainImg) {
      galleryMainImg.src = activeProduct.images[0];
      galleryMainImg.alt = activeProduct.title || 'Product Image';
    }
    
    // Update gallery thumbnails
    const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
    activeProduct.images.forEach((imageUrl, index) => {
      if (galleryThumbnails[index]) {
        const thumbImg = galleryThumbnails[index].querySelector('.gallery-thumb-img');
        if (thumbImg) {
          thumbImg.src = imageUrl;
          thumbImg.alt = `${activeProduct.title || 'Product'} Image ${index + 1}`;
        }
      }
    });
    
    // Update main product image in detail section
    const mainProductImg = document.getElementById('main-product-img');
    if (mainProductImg) {
      mainProductImg.src = activeProduct.images[0];
      mainProductImg.alt = activeProduct.title || 'Product Image';
    }
    
    // Update variant thumbnails
    const variantThumbnails = document.querySelectorAll('.variant-thumbnail');
    activeProduct.images.forEach((imageUrl, index) => {
      if (variantThumbnails[index]) {
        const variantImg = variantThumbnails[index].querySelector('.variant-img');
        if (variantImg) {
          variantImg.src = imageUrl;
          variantImg.alt = `${activeProduct.title || 'Product'} Variant ${index + 1}`;
        }
      }
    });
  }
  
  // Show the gallery modal
  const galleryModal = document.getElementById('product-gallery-modal');
  if (galleryModal) {
    galleryModal.classList.add('active');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
}



function refreshView() {
  console.log('[MobileApp] 🔄 Refresh clicked');
  
  // Check if we're on mobile or desktop
  const isMobile = window.innerWidth < 668;
  
  if (isMobile) {
    // Mobile: Toggle product detail section
    const productDetailSection = document.getElementById('product-detail-section');
    
    if (productDetailSection) {
      if (productDetailSection.style.display === 'none' || productDetailSection.style.display === '') {
        productDetailSection.style.display = 'block';
        // Hide the main product image when showing details
        const mainProductImg = document.getElementById('main-product-img');
        if (mainProductImg) {
          mainProductImg.style.display = 'none';
        }
        updateProductDetailSection();
        console.log('[MobileApp] 📱 Product detail section shown');
        
        // Update heart icon state when showing product details
        setTimeout(() => {
          console.log('[MobileApp] 🔄 Updating heart icon after refresh');
          updateHeartIconState();
        }, 200);
      } else {
        productDetailSection.style.display = 'none';
        console.log('[MobileApp] 📱 Product detail section hidden');
      }
    }
  } else {
    // Desktop: Toggle desktop product detail section with backdrop
    const desktopProductDetailSection = document.getElementById('desktop-product-detail-section');
    const desktopBackdrop = document.getElementById('desktop-product-detail-backdrop');
    
    if (desktopProductDetailSection) {
      if (desktopProductDetailSection.style.display === 'none' || desktopProductDetailSection.style.display === '') {
        // Show backdrop and section
        desktopBackdrop.classList.add('active');
        desktopProductDetailSection.style.display = 'block';
        updateDesktopProductDetailSection();
        console.log('[Desktop] 🖥️ Desktop product detail section shown');
        
        // Update heart icon state when showing product details
        setTimeout(() => {
          console.log('[Desktop] 🔄 Updating heart icon after refresh');
          updateDesktopHeartIconState();
        }, 200);
      } else {
        // Hide backdrop and section
        desktopBackdrop.classList.remove('active');
        desktopProductDetailSection.style.display = 'none';
        console.log('[Desktop] 🖥️ Desktop product detail section hidden');
      }
    }
  }
}

function updateDesktopProductDetailSection() {
  const currentProduct = getCurrentDisplayedProduct();
  
  if (!currentProduct) {
    console.log('[Desktop] ❌ No current product found for desktop detail section');
    return;
  }
  
  console.log('[Desktop] 📝 Updating desktop product detail section with:', currentProduct.title);
  
  // Update product title
  const desktopProductTitle = document.getElementById('desktop-product-title');
  if (desktopProductTitle) {
    desktopProductTitle.textContent = currentProduct.title;
  }
  
  // Update product description
  const desktopProductDescription = document.getElementById('desktop-product-description');
  if (desktopProductDescription) {
    desktopProductDescription.textContent = currentProduct.description || 'Product description not available.';
  }
  
  // Update pricing with real-time data
  let minPrice = 0;
  let maxPrice = 0;
  let currencyCode = 'USD';
  
  if (currentProduct.priceRange) {
    // Use priceRange if available
    minPrice = parseFloat(currentProduct.priceRange.minVariantPrice?.amount || '0');
    maxPrice = parseFloat(currentProduct.priceRange.maxVariantPrice?.amount || '0');
    currencyCode = currentProduct.priceRange.minVariantPrice?.currencyCode || 'USD';
  } else if (currentProduct.variants && currentProduct.variants.length > 0) {
    // Fallback to variant prices when priceRange is undefined
    const variantPrices = currentProduct.variants
      .filter(variant => variant.price && variant.price.amount)
      .map(variant => parseFloat(variant.price.amount));
    
    if (variantPrices.length > 0) {
      minPrice = Math.min(...variantPrices);
      maxPrice = Math.max(...variantPrices);
      currencyCode = currentProduct.variants[0].price?.currencyCode || 'USD';
    }
  }
  
  if (minPrice > 0) {
    const desktopCurrentPrice = document.getElementById('desktop-current-price');
    const desktopOriginalPrice = document.getElementById('desktop-original-price');
    const desktopSaveBadge = document.getElementById('desktop-save-badge');
    
    if (desktopCurrentPrice) {
      desktopCurrentPrice.textContent = `$${minPrice.toFixed(2)}`;
    }
    
    // Calculate discount if there's a compareAtPrice or price difference
    let originalPrice = 0;
    let discountPercentage = 0;
    
    if (maxPrice > minPrice) {
      originalPrice = maxPrice;
    } else if (currentProduct.variants && currentProduct.variants.length > 0) {
      const variant = currentProduct.variants[0];
      if (variant.compareAtPrice && variant.compareAtPrice.amount) {
        originalPrice = parseFloat(variant.compareAtPrice.amount);
      }
    }
    
    if (originalPrice > minPrice) {
      if (desktopOriginalPrice) {
        desktopOriginalPrice.textContent = `$${originalPrice.toFixed(2)}`;
      }
      
      // Calculate discount percentage
      discountPercentage = Math.round(((originalPrice - minPrice) / originalPrice) * 100);
      
      if (desktopSaveBadge && discountPercentage > 0) {
        desktopSaveBadge.textContent = `Save ${discountPercentage}%`;
      }
    }
    
    console.log('[Desktop] 💰 Real-time pricing updated:', {
      currentPrice: minPrice,
      originalPrice,
      discountPercentage,
      currencyCode,
      priceSource: currentProduct.priceRange ? 'priceRange' : 'variants'
    });
  }
  
  // Update product variants dynamically
  updateDesktopProductVariants(currentProduct);
  
  console.log('[Desktop] ✅ Desktop product detail section updated');
}

function updateDesktopProductVariants(product) {
  const variantsContainer = document.getElementById('desktop-product-variants');
  if (!variantsContainer) return;
  
  // Clear existing variants
  variantsContainer.innerHTML = '';
  
  // Get product variants or create default ones
  const variants = product.variants || [
    { id: 1, title: 'Default', image: product.images && product.images[0] ? product.images[0] : 'cart.png' },
    { id: 2, title: 'Variant 2', image: product.images && product.images[1] ? product.images[1] : 'home.png' },
    { id: 3, title: 'Variant 3', image: product.images && product.images[2] ? product.images[2] : 'profile.png' },
    { id: 4, title: 'Variant 4', image: product.images && product.images[3] ? product.images[3] : 'setting.png' }
  ];
  
  variants.forEach((variant, index) => {
    const variantElement = document.createElement('div');
    variantElement.className = `variant-thumbnail ${index === 0 ? 'active' : ''}`;
    variantElement.onclick = () => selectDesktopVariant(index, variant);
    
    const imgElement = document.createElement('img');
    // Use the actual variant image URL if it's a full URL, otherwise use asset path
    if (variant.image && variant.image.startsWith('http')) {
      imgElement.src = variant.image;
    } else {
      imgElement.src = `/extensions/dummy-table/assets/${variant.image}`;
    }
    imgElement.alt = variant.title;
    imgElement.className = 'variant-img';
    imgElement.width = 60;
    imgElement.height = 60;
    
    variantElement.appendChild(imgElement);
    variantsContainer.appendChild(variantElement);
  });
}

function selectDesktopVariant(index, variant) {
  console.log('[Desktop] 🎯 Selected variant:', variant.title);
  
  // Update active variant
  const variants = document.querySelectorAll('#desktop-product-variants .variant-thumbnail');
  variants.forEach((v, i) => {
    v.classList.toggle('active', i === index);
  });
  
  // Update product information based on variant
  const desktopProductTitle = document.getElementById('desktop-product-title');
  if (desktopProductTitle) {
    desktopProductTitle.textContent = variant.title;
  }
}

function toggleDesktopWishlist() {
  console.log('[Desktop] ❤️ Desktop wishlist toggled');
  const wishlistButton = document.getElementById('desktop-wishlist-button');
  const wishlistIcon = wishlistButton.querySelector('.wishlist-icon');
  
  if (!wishlistButton || !wishlistIcon) {
    console.log('[Desktop] ❤️ Heart button or icon not found');
    return;
  }
  
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  
  let currentProductTitle = '';
  let isCurrentlyInWishlist = false;
  
  // Try to get product title from active product first
  if (activeProduct) {
    currentProductTitle = activeProduct.title || activeProduct.name || '';
    console.log('[Desktop] ❤️ Toggle - Active product found:', {
      title: currentProductTitle,
      fullProduct: activeProduct
    });
  }
  
  // If no title from active product, try DOM fallback
  if (!currentProductTitle) {
    currentProductTitle = document.getElementById('desktop-product-title')?.textContent || '';
    console.log('[Desktop] ❤️ Toggle - Using DOM fallback title:', currentProductTitle);
  }
  
  // Check if current product is in wishlist
  if (currentProductTitle) {
    isCurrentlyInWishlist = wishlist.some(item => item.title === currentProductTitle);
  }
  
  console.log('[Desktop] ❤️ Toggle - Current state:', {
    currentProductTitle,
    isCurrentlyInWishlist,
    wishlistCount: wishlist.length,
    wishlistTitles: wishlist.map(item => item.title)
  });
  
  if (isCurrentlyInWishlist) {
    // Remove from wishlist
    const updatedWishlist = wishlist.filter(item => item.title !== currentProductTitle);
    saveWishlistToStorage(updatedWishlist);
    
    wishlistButton.classList.remove('active');
    wishlistIcon.textContent = '♡';
    
    console.log('[Desktop] ❤️ Product removed from wishlist:', currentProductTitle);
  } else {
    // Add to wishlist
    const currentProduct = getCurrentProductData();
    wishlist.push(currentProduct);
    saveWishlistToStorage(wishlist);
    
    wishlistButton.classList.add('active');
    wishlistIcon.textContent = '♥';
    
    console.log('[Desktop] ❤️ Product added to wishlist:', currentProductTitle);
  }
}

function updateDesktopHeartIconState() {
  console.log('[Desktop] 💖 Updating desktop heart icon state');
  const wishlistButton = document.getElementById('desktop-wishlist-button');
  const wishlistIcon = wishlistButton?.querySelector('.wishlist-icon');
  
  if (!wishlistButton || !wishlistIcon) {
    console.log('[Desktop] 💖 Heart button or icon not found');
    return;
  }
  
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  
  let currentProductTitle = '';
  
  // Try to get product title from active product first
  if (activeProduct) {
    currentProductTitle = activeProduct.title || activeProduct.name || '';
  }
  
  // If no title from active product, try DOM fallback
  if (!currentProductTitle) {
    currentProductTitle = document.getElementById('desktop-product-title')?.textContent || '';
  }
  
  // Check if current product is in wishlist
  const isInWishlist = currentProductTitle ? wishlist.some(item => item.title === currentProductTitle) : false;
  
  // Update button state
  wishlistButton.classList.toggle('active', isInWishlist);
  wishlistIcon.textContent = isInWishlist ? '♥' : '♡';
  
  console.log('[Desktop] 💖 Heart icon state updated:', {
    currentProductTitle,
    isInWishlist: isInWishlist ? 'active' : 'inactive',
    wishlistCount: wishlist.length
  });
}

function decreaseDesktopQuantity() {
  const quantityElement = document.getElementById('desktop-quantity-value');
  if (quantityElement) {
    let quantity = parseInt(quantityElement.textContent) || 1;
    if (quantity > 1) {
      quantity--;
      quantityElement.textContent = quantity;
    }
  }
}

function increaseDesktopQuantity() {
  const quantityElement = document.getElementById('desktop-quantity-value');
  if (quantityElement) {
    let quantity = parseInt(quantityElement.textContent) || 1;
    quantity++;
    quantityElement.textContent = quantity;
  }
}

// Add backdrop click handler to close desktop product detail
document.addEventListener('DOMContentLoaded', function() {
  const desktopBackdrop = document.getElementById('desktop-product-detail-backdrop');
  if (desktopBackdrop) {
    desktopBackdrop.addEventListener('click', function(e) {
      if (e.target === desktopBackdrop) {
        // Close the desktop product detail section
        const desktopProductDetailSection = document.getElementById('desktop-product-detail-section');
        if (desktopProductDetailSection && desktopProductDetailSection.style.display !== 'none') {
          desktopBackdrop.classList.remove('active');
          desktopProductDetailSection.style.display = 'none';
          console.log('[Desktop] 🖥️ Desktop product detail section closed via backdrop click');
        }
      }
    });
  }
});

function updateProductDetailSection() {
  const currentProduct = getCurrentDisplayedProduct();
  
  if (!currentProduct) {
    console.log('[MobileApp] ❌ No current product found for mobile detail section');
    return;
  }
  
  console.log('[MobileApp] 📝 Updating mobile product detail section with:', currentProduct.title);
  
  // Update product title
  const productTitle = document.querySelector('.product-title');
  if (productTitle) {
    productTitle.textContent = currentProduct.title;
  }
  
  // Update product description
  const productDescription = document.querySelector('.product-description p');
  if (productDescription) {
    productDescription.textContent = currentProduct.description || 'Product description not available.';
  }
  
  // Update pricing with real-time data
  let minPrice = 0;
  let maxPrice = 0;
  let currencyCode = 'USD';
  
  if (currentProduct.priceRange) {
    // Use priceRange if available
    minPrice = parseFloat(currentProduct.priceRange.minVariantPrice?.amount || '0');
    maxPrice = parseFloat(currentProduct.priceRange.maxVariantPrice?.amount || '0');
    currencyCode = currentProduct.priceRange.minVariantPrice?.currencyCode || 'USD';
  } else if (currentProduct.variants && currentProduct.variants.length > 0) {
    // Fallback to variant prices when priceRange is undefined
    const variantPrices = currentProduct.variants
      .filter(variant => variant.price && variant.price.amount)
      .map(variant => parseFloat(variant.price.amount));
    
    if (variantPrices.length > 0) {
      minPrice = Math.min(...variantPrices);
      maxPrice = Math.max(...variantPrices);
      currencyCode = currentProduct.variants[0].price?.currencyCode || 'USD';
    }
  }
  
  if (minPrice > 0) {
    const currentPrice = document.querySelector('.current-price');
    const originalPrice = document.querySelector('.original-price');
    const saveBadge = document.querySelector('.save-badge');
    
    if (currentPrice) {
      currentPrice.textContent = `$${minPrice.toFixed(2)}`;
    }
    
    // Calculate discount if there's a compareAtPrice or price difference
    let originalPriceValue = 0;
    let discountPercentage = 0;
    
    if (maxPrice > minPrice) {
      originalPriceValue = maxPrice;
    } else if (currentProduct.variants && currentProduct.variants.length > 0) {
      const variant = currentProduct.variants[0];
      if (variant.compareAtPrice && variant.compareAtPrice.amount) {
        originalPriceValue = parseFloat(variant.compareAtPrice.amount);
      }
    }
    
    if (originalPriceValue > minPrice) {
      if (originalPrice) {
        originalPrice.textContent = `$${originalPriceValue.toFixed(2)}`;
      }
      
      // Calculate discount percentage
      discountPercentage = Math.round(((originalPriceValue - minPrice) / originalPriceValue) * 100);
      
      if (saveBadge && discountPercentage > 0) {
        saveBadge.textContent = `Save ${discountPercentage}%`;
      }
    }
    
    console.log('[MobileApp] 💰 Real-time pricing updated:', {
      currentPrice: minPrice,
      originalPrice: originalPriceValue,
      discountPercentage,
      currencyCode,
      priceSource: currentProduct.priceRange ? 'priceRange' : 'variants'
    });
  }
  
  // Update product variants dynamically
  updateMobileProductVariants(currentProduct);
  
  console.log('[MobileApp] ✅ Mobile product detail section updated');
}

function updateMobileProductVariants(product) {
  const variantsContainer = document.querySelector('.product-variants');
  if (!variantsContainer) return;
  
  // Clear existing variants
  variantsContainer.innerHTML = '';
  
  // Get product variants or create default ones
  const variants = product.variants || [
    { id: 1, title: 'Default', image: product.images && product.images[0] ? product.images[0] : 'cart.png' },
    { id: 2, title: 'Variant 2', image: product.images && product.images[1] ? product.images[1] : 'home.png' },
    { id: 3, title: 'Variant 3', image: product.images && product.images[2] ? product.images[2] : 'profile.png' },
    { id: 4, title: 'Variant 4', image: product.images && product.images[3] ? product.images[3] : 'setting.png' }
  ];
  
  variants.forEach((variant, index) => {
    const variantElement = document.createElement('div');
    variantElement.className = `variant-thumbnail ${index === 0 ? 'active' : ''}`;
    variantElement.onclick = () => selectMobileVariant(index, variant);
    
    const imgElement = document.createElement('img');
    // Use the actual variant image URL if it's a full URL, otherwise use asset path
    if (variant.image && variant.image.startsWith('http')) {
      imgElement.src = variant.image;
    } else {
      imgElement.src = `/extensions/dummy-table/assets/${variant.image}`;
    }
    imgElement.alt = variant.title;
    imgElement.className = 'variant-img';
    imgElement.width = 60;
    imgElement.height = 60;
    
    variantElement.appendChild(imgElement);
    variantsContainer.appendChild(variantElement);
  });
}

function selectMobileVariant(index, variant) {
  console.log('[MobileApp] 🎯 Selected variant:', variant.title);
  
  // Update active variant
  const variants = document.querySelectorAll('.variant-thumbnail');
  variants.forEach((v, i) => {
    v.classList.toggle('active', i === index);
  });
  
  // Update product information based on variant
  const productTitle = document.querySelector('.product-title');
  if (productTitle) {
    productTitle.textContent = variant.title;
  }
  
  // Update pricing based on selected variant
  if (variant.price && variant.price.amount) {
    const currentPrice = document.querySelector('.current-price');
    const originalPrice = document.querySelector('.original-price');
    const saveBadge = document.querySelector('.save-badge');
    
    const variantPrice = parseFloat(variant.price.amount);
    const currencyCode = variant.price.currencyCode || 'USD';
    
    if (currentPrice) {
      currentPrice.textContent = `$${variantPrice.toFixed(2)}`;
    }
    
    // Check for compareAtPrice to show discount
    if (variant.compareAtPrice && variant.compareAtPrice.amount) {
      const comparePrice = parseFloat(variant.compareAtPrice.amount);
      
      if (comparePrice > variantPrice) {
        if (originalPrice) {
          originalPrice.textContent = `$${comparePrice.toFixed(2)}`;
        }
        
        // Calculate discount percentage
        const discountPercentage = Math.round(((comparePrice - variantPrice) / comparePrice) * 100);
        
        if (saveBadge && discountPercentage > 0) {
          saveBadge.textContent = `Save ${discountPercentage}%`;
        }
        
        console.log('[MobileApp] 💰 Variant pricing updated with discount:', {
          currentPrice: variantPrice,
          originalPrice: comparePrice,
          discountPercentage,
          currencyCode
        });
      }
    } else {
      // Clear original price and save badge if no compareAtPrice
      if (originalPrice) {
        originalPrice.textContent = '';
      }
      if (saveBadge) {
        saveBadge.textContent = '';
      }
      
      console.log('[MobileApp] 💰 Variant pricing updated:', {
        currentPrice: variantPrice,
        currencyCode
      });
    }
  }
  
  // Update main product image
  const mainProductImg = document.getElementById('main-product-img');
  if (mainProductImg && variant.image) {
    if (variant.image.startsWith('http')) {
      mainProductImg.src = variant.image;
    } else {
      mainProductImg.src = `/extensions/dummy-table/assets/${variant.image}`;
    }
    mainProductImg.alt = variant.title;
  }
}

function toggleLike() {
  console.log('[MobileApp] ❤️ Like clicked');
  
  // Get the active product from the spinning tool
  const activeProduct = getCurrentDisplayedProduct();
  console.log('[MobileApp] ❤️ Active product for details:', activeProduct);
  
  if (activeProduct && activeProduct.images && activeProduct.images.length > 0) {
    // Update detail modal main image
    const detailMainImg = document.getElementById('detail-main-img');
    if (detailMainImg) {
      detailMainImg.src = activeProduct.images[0];
      detailMainImg.alt = activeProduct.title || 'Product Image';
    }
  }
  
  // Show the detail modal
  const detailModal = document.getElementById('product-detail-modal');
  if (detailModal) {
    detailModal.classList.add('active');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
}



function navigateTo(page) {

  console.log('[MobileApp] 🧭 Navigation to:', page);

  

  // Update active navigation button

  const navButtons = document.querySelectorAll('.nav-button');

  navButtons.forEach(button => {

    button.classList.remove('active');

  });

  

  event.target.classList.add('active');

  

  // Handle navigation

  switch(page) {

    case 'home':

      // Already on home, no action needed

      break;

    case 'cart':

      window.location.href = '/cart';
      break;

    case 'wishlist':

      openWishlistModal();
      break;

    case 'profile':

      alert('Profile page coming soon!');

      break;

    case 'settings':

      alert('Settings page coming soon!');

      break;

  }

}

// Wishlist Storage Functions
function getWishlistFromStorage() {
  try {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('[Wishlist] Error getting wishlist from storage:', error);
    return [];
  }
}

function saveWishlistToStorage(wishlist) {
  try {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    console.log('[Wishlist] Saved to storage:', wishlist);
    // Update wishlist badge count
    updateWishlistBadge();
  } catch (error) {
    console.error('[Wishlist] Error saving wishlist to storage:', error);
  }
}

function updateWishlistBadge() {
  const wishlist = getWishlistFromStorage();
  const badge = document.getElementById('wishlist-badge');
  const desktopBadge = document.getElementById('desktop-wishlist-badge');
  
  if (badge) {
    const count = wishlist.length;
    badge.textContent = count;
    
    if (count === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
    
    console.log('[Wishlist] Mobile badge updated:', count);
  }
  
  // Update desktop badge as well
  if (desktopBadge) {
    const count = wishlist.length;
    desktopBadge.textContent = count;
    
    if (count === 0) {
      desktopBadge.classList.add('hidden');
    } else {
      desktopBadge.classList.remove('hidden');
    }
    
    console.log('[Wishlist] Desktop badge updated:', count);
  }
}

function getCurrentProductData() {
  // First try to get the active product from the spinning tool
  const activeProduct = getCurrentDisplayedProduct();
  
  let productTitle = 'Unknown Product';
  let currentPrice = '$0.00';
  let originalPrice = '';
  let productImage = '';
  
  if (activeProduct) {
    // Use data from the active product
    productTitle = activeProduct.title || activeProduct.name || 'Unknown Product';
    
    // Calculate real-time pricing from priceRange or variants
    let minPrice = 0;
    let maxPrice = 0;
    let currencyCode = 'USD';
    
    if (activeProduct.priceRange) {
      // Use priceRange if available
      minPrice = parseFloat(activeProduct.priceRange.minVariantPrice?.amount || '0');
      maxPrice = parseFloat(activeProduct.priceRange.maxVariantPrice?.amount || '0');
      currencyCode = activeProduct.priceRange.minVariantPrice?.currencyCode || 'USD';
    } else if (activeProduct.variants && activeProduct.variants.length > 0) {
      // Fallback to variant prices when priceRange is undefined
      const variantPrices = activeProduct.variants
        .filter(variant => variant.price && variant.price.amount)
        .map(variant => parseFloat(variant.price.amount));
      
      if (variantPrices.length > 0) {
        minPrice = Math.min(...variantPrices);
        maxPrice = Math.max(...variantPrices);
        currencyCode = activeProduct.variants[0].price?.currencyCode || 'USD';
      }
    }
    
    // Use min price as current price, max price as original price if different
    if (minPrice > 0) {
      currentPrice = `$${minPrice.toFixed(2)}`;
      if (maxPrice > minPrice) {
        originalPrice = `$${maxPrice.toFixed(2)}`;
      } else {
        // Check variants for compareAtPrice to calculate discount
        if (activeProduct.variants && activeProduct.variants.length > 0) {
          const variant = activeProduct.variants[0];
          if (variant.compareAtPrice && variant.compareAtPrice.amount) {
            const comparePrice = parseFloat(variant.compareAtPrice.amount);
            if (comparePrice > minPrice) {
              originalPrice = `$${comparePrice.toFixed(2)}`;
            }
          }
        }
      }
    } else {
      currentPrice = '$0.00';
      originalPrice = '';
    }
    
    productImage = activeProduct.images && activeProduct.images[0] ? activeProduct.images[0] : '';
    
    console.log('[Wishlist] 💰 Real-time pricing calculated:', {
      title: productTitle,
      currentPrice,
      originalPrice,
      minPrice,
      maxPrice,
      currencyCode,
      image: productImage,
      hasImages: activeProduct.images && activeProduct.images.length > 0
    });
  } else {
    // Fallback to DOM elements
    productTitle = document.querySelector('.product-title')?.textContent || 'Unknown Product';
    currentPrice = document.querySelector('.current-price')?.textContent || '$0.00';
    originalPrice = document.querySelector('.original-price')?.textContent || '';
    productImage = document.querySelector('.main-product-img')?.src || '';
    
    console.log('[Wishlist] 📸 Using DOM fallback data:', {
      title: productTitle,
      image: productImage
    });
  }
  
  return {
    id: Date.now().toString(), // Simple ID generation
    title: productTitle,
    price: currentPrice,
    originalPrice: originalPrice,
    image: productImage,
    addedAt: new Date().toISOString()
  };
}

function isProductInWishlist(productId) {
  const wishlist = getWishlistFromStorage();
  return wishlist.some(item => item.id === productId);
}

// Product Detail Section Functions
function toggleWishlist() {
  console.log('[MobileApp] ❤️ Wishlist toggled');
  const wishlistButton = event.target.closest('.wishlist-button');
  const wishlistIcon = wishlistButton.querySelector('.wishlist-icon');
  
  if (!wishlistButton || !wishlistIcon) {
    console.log('[Wishlist] ❤️ Heart button or icon not found');
    return;
  }
  
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  
  let currentProductTitle = '';
  let isCurrentlyInWishlist = false;
  
  // Try to get product title from active product first
  if (activeProduct) {
    currentProductTitle = activeProduct.title || activeProduct.name || '';
    console.log('[Wishlist] ❤️ Toggle - Active product found:', {
      title: currentProductTitle,
      fullProduct: activeProduct
    });
  }
  
  // If no title from active product, try DOM fallback
  if (!currentProductTitle) {
    currentProductTitle = document.querySelector('.product-title')?.textContent || '';
    console.log('[Wishlist] ❤️ Toggle - Using DOM fallback title:', currentProductTitle);
  }
  
  // Check if current product is in wishlist
  if (currentProductTitle) {
    isCurrentlyInWishlist = wishlist.some(item => item.title === currentProductTitle);
  }
  
  console.log('[Wishlist] ❤️ Toggle - Current state:', {
    currentProductTitle,
    isCurrentlyInWishlist,
    wishlistCount: wishlist.length,
    wishlistTitles: wishlist.map(item => item.title)
  });
  
  if (isCurrentlyInWishlist) {
    // Remove from wishlist
    const updatedWishlist = wishlist.filter(item => item.title !== currentProductTitle);
    saveWishlistToStorage(updatedWishlist);
    
    wishlistButton.classList.remove('active');
    wishlistIcon.textContent = '♡';
    
    console.log('[Wishlist] ❤️ Product removed from wishlist:', currentProductTitle);
  } else {
    // Add to wishlist
    const currentProduct = getCurrentProductData();
    wishlist.push(currentProduct);
    saveWishlistToStorage(wishlist);
    
    wishlistButton.classList.add('active');
    wishlistIcon.textContent = '♥';
    
    console.log('[Wishlist] ❤️ Product added to wishlist:', currentProductTitle);
  }
}

function decreaseQuantity() {
  console.log('[MobileApp] ➖ Quantity decreased');
  const quantityValue = document.getElementById('quantity-value');
  let currentQuantity = parseInt(quantityValue.textContent);
  
  if (currentQuantity > 1) {
    currentQuantity--;
    quantityValue.textContent = currentQuantity;
  }
}

function increaseQuantity() {
  console.log('[MobileApp] ➕ Quantity increased');
  const quantityValue = document.getElementById('quantity-value');
  let currentQuantity = parseInt(quantityValue.textContent);
  
  currentQuantity++;
  quantityValue.textContent = currentQuantity;
}

async function addToCart() {
  console.log('[MobileApp] 🛒 Add to cart clicked');
  
  try {
    // Get the current product from the spinning tool
    const currentProduct = getCurrentDisplayedProduct();
    
    if (!currentProduct) {
      console.error('[MobileApp] ❌ No current product found');
      alert('No product selected. Please select a product first.');
      return;
    }
    
    // Get the selected quantity
    const quantityElement = document.getElementById('quantity-value');
    const quantity = quantityElement ? parseInt(quantityElement.textContent) || 1 : 1;
    
    console.log('[MobileApp] 🛒 Adding product to cart:', {
      product: currentProduct.title || currentProduct.name,
      quantity: quantity
    });
    
    // Add quantity to the product object
    const productWithQuantity = {
      ...currentProduct,
      quantity: quantity
    };
    
    // Use the existing addProductToCart function
    await addProductToCart(productWithQuantity);
    
    console.log('[MobileApp] ✅ Product added to cart successfully');
    
  } catch (error) {
    console.error('[MobileApp] ❌ Error adding product to cart:', error);
    alert(`Failed to add product to cart: ${error.message}`);
  }
}

function buyNow() {
  console.log('[MobileApp] 💳 Buy now clicked');
  
  try {
    // Get current product data
    const productData = getCurrentProductData();
    
    // Try to get quantity from mobile first, then desktop
    let quantityElement = document.getElementById('quantity-value');
    if (!quantityElement) {
      quantityElement = document.getElementById('desktop-quantity-value');
    }
    
    const quantity = parseInt(quantityElement?.textContent) || 1;
    
    if (!productData) {
      console.error('[MobileApp] ❌ No product data available for checkout');
      alert('Product information not available. Please try again.');
      return;
    }
    
    console.log('[MobileApp] 📦 Product data for checkout:', productData);
    console.log('[MobileApp] 🔢 Quantity:', quantity);
    
    // Create checkout URL with product data
    const checkoutUrl = createCheckoutUrl(productData, quantity);
    
    if (checkoutUrl) {
      console.log('[MobileApp] 🛒 Redirecting to checkout:', checkoutUrl);
      // Redirect to checkout
      window.location.href = checkoutUrl;
    } else {
      console.error('[MobileApp] ❌ Failed to create checkout URL');
      alert('Unable to proceed to checkout. Please try again.');
    }
    
  } catch (error) {
    console.error('[MobileApp] ❌ Error in buyNow:', error);
    alert(`Checkout error: ${error.message}`);
  }
}

// Helper function to create checkout URL
function createCheckoutUrl(productData, quantity) {
  try {
    // For Shopify, we can use the cart API to add items and then redirect to checkout
    // This is a simplified implementation - in a real scenario, you'd use Shopify's Cart API
    
    // Extract price value (remove $ and convert to cents for Shopify)
    const priceValue = productData.price.replace('$', '').replace(',', '');
    const priceInCents = Math.round(parseFloat(priceValue) * 100);
    
    // Create a simple checkout URL with product information
    // In a real implementation, you would:
    // 1. Add the item to cart via Shopify Cart API
    // 2. Redirect to /cart or /checkout
    
    // For demo purposes, we'll create a URL that could be used with Shopify's checkout
    const checkoutParams = new URLSearchParams({
      'items[0][id]': productData.id || 'demo-product-id', // Use the product ID from getCurrentProductData
      'items[0][quantity]': quantity.toString(),
      'items[0][title]': productData.title,
      'items[0][price]': priceInCents.toString(),
      'items[0][image]': productData.image || '',
      'items[0][original_price]': productData.originalPrice ? productData.originalPrice.replace('$', '').replace(',', '') : ''
    });
    
    // For now, redirect to cart page (you can modify this to go directly to checkout)
    // In a real Shopify implementation, you might use:
    // - `/cart` to go to cart page
    // - `/checkout` to go directly to checkout
    // - Or use Shopify's Cart API to add items and then redirect
    const checkoutUrl = `/cart?${checkoutParams.toString()}`;
    
    console.log('[MobileApp] 🔗 Created checkout URL:', checkoutUrl);
    console.log('[MobileApp] 📋 Checkout parameters:', {
      productId: productData.id,
      quantity: quantity,
      title: productData.title,
      price: productData.price,
      image: productData.image
    });
    
    return checkoutUrl;
    
  } catch (error) {
    console.error('[MobileApp] ❌ Error creating checkout URL:', error);
    return null;
  }
}

// Product variant selection
function selectVariant(variantIndex) {
  console.log('[MobileApp] 🎯 Variant selected:', variantIndex);
  
  // Update active variant thumbnail
  const variantThumbnails = document.querySelectorAll('.variant-thumbnail');
  variantThumbnails.forEach((thumbnail, index) => {
    if (index === variantIndex) {
      thumbnail.classList.add('active');
    } else {
      thumbnail.classList.remove('active');
    }
  });
  
  // Update main product image
  const mainProductImg = document.getElementById('main-product-img');
  if (mainProductImg) {
    const selectedThumbnail = variantThumbnails[variantIndex];
    const thumbnailImg = selectedThumbnail.querySelector('.variant-img');
    if (thumbnailImg) {
      mainProductImg.src = thumbnailImg.src;
      mainProductImg.alt = thumbnailImg.alt;
    }
  }
  
  // Here you could update the spinning tool to show the selected variant
  // For now, just log the selection
  console.log(`[MobileApp] 📱 Selected variant ${variantIndex + 1}`);
}

// Gallery functions
function closeGallery() {
  console.log('[MobileApp] 🖼️ Closing gallery');
  
  const galleryModal = document.getElementById('product-gallery-modal');
  if (galleryModal) {
    galleryModal.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}

// Initialize gallery event listeners
function initGallery() {
  const galleryModal = document.getElementById('product-gallery-modal');
  if (galleryModal) {
    // Close gallery when clicking outside the modal content
    galleryModal.addEventListener('click', function(e) {
      if (e.target === galleryModal) {
        closeGallery();
      }
    });
    
    // Close gallery with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && galleryModal.classList.contains('active')) {
        closeGallery();
      }
    });
  }
}

function selectGalleryImage(imageIndex) {
  console.log('[MobileApp] 🖼️ Gallery image selected:', imageIndex);
  
  // Update active gallery thumbnail
  const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
  galleryThumbnails.forEach((thumbnail, index) => {
    if (index === imageIndex) {
      thumbnail.classList.add('active');
    } else {
      thumbnail.classList.remove('active');
    }
  });
  
  // Update gallery main image
  const galleryMainImg = document.getElementById('gallery-main-img');
  if (galleryMainImg) {
    const selectedThumbnail = galleryThumbnails[imageIndex];
    const thumbnailImg = selectedThumbnail.querySelector('.gallery-thumb-img');
    if (thumbnailImg) {
      galleryMainImg.src = thumbnailImg.src;
      galleryMainImg.alt = thumbnailImg.alt;
    }
  }
  
  // Also update the main product image in the detail section
  const mainProductImg = document.getElementById('main-product-img');
  if (mainProductImg) {
    const selectedThumbnail = galleryThumbnails[imageIndex];
    const thumbnailImg = selectedThumbnail.querySelector('.gallery-thumb-img');
    if (thumbnailImg) {
      mainProductImg.src = thumbnailImg.src;
      mainProductImg.alt = thumbnailImg.alt;
    }
  }
  
  // Update the variant thumbnails to match
  const variantThumbnails = document.querySelectorAll('.variant-thumbnail');
  variantThumbnails.forEach((thumbnail, index) => {
    if (index === imageIndex) {
      thumbnail.classList.add('active');
    } else {
      thumbnail.classList.remove('active');
    }
  });
}



// Detail Modal Functions (Heart Icon)
function closeDetailModal() {
  console.log('[MobileApp] ❤️ Closing detail modal');
  
  const detailModal = document.getElementById('product-detail-modal');
  if (detailModal) {
    detailModal.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}

// Detail Modal Action Functions
function selectActionButton(index, action) {
  console.log('[MobileApp] 🔘 Action button selected:', index, action);
  
  // Remove active class from all buttons
  const actionButtons = document.querySelectorAll('.detail-action-btn');
  actionButtons.forEach(button => {
    button.classList.remove('active');
  });
  
  // Add active class to selected button
  if (actionButtons[index]) {
    actionButtons[index].classList.add('active');
  }
  
  // Handle specific actions
  switch(action) {
    case 'add-to-cart':
      addToCart();
      break;
    case 'bookmark':
      addToWishlist();
      break;
    case 'share':
      shareProduct();
      break;
    case 'shop':
      viewShop();
      break;
  }
}

function addToWishlist() {
  console.log('[MobileApp] ❤️ Add to wishlist clicked');
  alert('Added to wishlist!');
}

function shareProduct() {
  console.log('[MobileApp] 📤 Share product clicked');
  alert('Share functionality coming soon!');
}

// Wishlist Modal Functions
function openWishlistModal() {
  console.log('[MobileApp] ❤️ Opening wishlist modal');
  const wishlistModal = document.getElementById('wishlist-modal');
  if (wishlistModal) {
    wishlistModal.classList.add('active');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    // Load and display wishlist items
    loadWishlistItems();
  }
}

function loadWishlistItems() {
  const wishlist = getWishlistFromStorage();
  const wishlistItemsContainer = document.getElementById('wishlist-items');
  const emptyState = document.querySelector('.wishlist-empty-state');
  
  if (wishlist.length === 0) {
    // Show empty state
    if (emptyState) emptyState.style.display = 'block';
    if (wishlistItemsContainer) wishlistItemsContainer.style.display = 'none';
  } else {
    // Hide empty state and show items
    if (emptyState) emptyState.style.display = 'none';
    if (wishlistItemsContainer) {
      wishlistItemsContainer.style.display = 'block';
      wishlistItemsContainer.innerHTML = '';
      
      wishlist.forEach(item => {
        const wishlistItem = createWishlistItemHTML(item);
        wishlistItemsContainer.appendChild(wishlistItem);
      });
    }
  }
}

function createWishlistItemHTML(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'wishlist-item';
  
  // Generate star rating (5 stars for demo)
  const stars = '★★★★★';
  
  // Generate description based on title
  const description = generateProductDescription(item.title);
  
  itemDiv.innerHTML = `
    <div class="wishlist-item-image">
      <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.parentElement.innerHTML='product-img';">
    </div>
    <div class="wishlist-item-details">
      <h4 class="wishlist-item-title">${item.title}</h4>
      <p class="wishlist-item-description">${description}</p>
      <div class="wishlist-item-rating">
        <div class="wishlist-stars">
          <span class="wishlist-star">${stars}</span>
        </div>
      </div>
      <div class="wishlist-item-price">
        <span>${item.price}${item.originalPrice ? ` <span style="text-decoration: line-through; color: #999; font-size: 1rem; font-weight: 400;">${item.originalPrice}</span>` : ''}</span>
        <div class="wishlist-item-actions">
          <button class="wishlist-add-to-cart-btn" onclick="addWishlistItemToCart('${item.id}')">Cart</button>
          <button class="wishlist-remove-btn" onclick="removeFromWishlist('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `;
  return itemDiv;
}

function generateProductDescription(title) {
  // Generate appropriate description based on product title
  if (title.toLowerCase().includes('watch')) {
    return 'Premium timepiece with elegant design and superior craftsmanship';
  } else if (title.toLowerCase().includes('omega')) {
    return 'Swiss luxury watch with precision engineering and timeless style';
  } else if (title.toLowerCase().includes('diver')) {
    return 'Professional diving watch with water resistance and durability';
  } else if (title.toLowerCase().includes('dress')) {
    return 'Sophisticated dress watch perfect for formal occasions';
  } else {
    return 'High-quality product with premium design and excellent features';
  }
}

function removeFromWishlist(itemId) {
  const wishlist = getWishlistFromStorage();
  const updatedWishlist = wishlist.filter(item => item.id !== itemId);
  saveWishlistToStorage(updatedWishlist);
  
  // Reload the wishlist display
  loadWishlistItems();
  
  // Update the heart icon state if this product is currently displayed
  updateHeartIconState();
  
  console.log('[Wishlist] ❤️ Item removed from wishlist:', itemId);
}

function addWishlistItemToCart(itemId) {
  const wishlist = getWishlistFromStorage();
  const item = wishlist.find(item => item.id === itemId);
  
  if (item) {
    // For now, just show an alert. In a real implementation, this would add to cart
    alert(`Added "${item.title}" to cart!`);
    console.log('[Wishlist] 🛒 Item added to cart from wishlist:', item.title);
  }
}

function updateHeartIconState() {
  const wishlistButton = document.querySelector('.wishlist-button');
  const wishlistIcon = document.querySelector('.wishlist-icon');
  
  if (!wishlistButton || !wishlistIcon) {
    console.log('[Wishlist] ❤️ Heart button or icon not found');
    return;
  }
  
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  
  let isInWishlist = false;
  let currentProductTitle = '';
  
  // Try to get product title from active product first
  if (activeProduct) {
    currentProductTitle = activeProduct.title || activeProduct.name || '';
    console.log('[Wishlist] ❤️ Active product found:', {
      title: currentProductTitle,
      fullProduct: activeProduct
    });
  }
  
  // If no title from active product, try DOM fallback
  if (!currentProductTitle) {
    currentProductTitle = document.querySelector('.product-title')?.textContent || '';
    console.log('[Wishlist] ❤️ Using DOM fallback title:', currentProductTitle);
  }
  
  // Check if current product is in wishlist
  if (currentProductTitle) {
    isInWishlist = wishlist.some(item => item.title === currentProductTitle);
  }
  
  // Update heart icon state
  if (isInWishlist) {
    wishlistButton.classList.add('active');
    wishlistIcon.textContent = '♥';
  } else {
    wishlistButton.classList.remove('active');
    wishlistIcon.textContent = '♡';
  }
  
  console.log('[Wishlist] ❤️ Heart icon state updated:', {
    isInWishlist,
    currentProductTitle,
    activeProduct: activeProduct ? (activeProduct.title || activeProduct.name) : 'none',
    wishlistCount: wishlist.length,
    wishlistTitles: wishlist.map(item => item.title),
    buttonClasses: wishlistButton.className,
    iconText: wishlistIcon.textContent
  });
}

function closeWishlistModal() {
  console.log('[MobileApp] ❤️ Closing wishlist modal');
  const wishlistModal = document.getElementById('wishlist-modal');
  if (wishlistModal) {
    wishlistModal.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const wishlistModal = document.getElementById('wishlist-modal');
  if (wishlistModal && event.target === wishlistModal) {
    closeWishlistModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal && wishlistModal.classList.contains('active')) {
      closeWishlistModal();
    }
  }
});

// Initialize wishlist state when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Update heart icon state on page load
  setTimeout(() => {
    updateHeartIconState();
    updateWishlistBadge();
  }, 100);
});

// Add manual trigger for debugging
window.debugWishlist = function() {
  console.log('[Wishlist] 🔧 Manual debug trigger');
  updateHeartIconState();
  updateWishlistBadge();
};

// Add manual trigger to check current product
window.debugCurrentProduct = function() {
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  const domTitle = document.querySelector('.product-title')?.textContent;
  
  console.log('[Wishlist] 🔧 Current product debug:', {
    activeProduct,
    domTitle,
    wishlist,
    wishlistCount: wishlist.length
  });
};

// Add comprehensive debug function for refresh scenario
window.debugRefreshWishlist = function() {
  console.log('[Wishlist] 🔧 Refresh debug - Starting comprehensive check');
  
  const activeProduct = getCurrentDisplayedProduct();
  const wishlist = getWishlistFromStorage();
  const domTitle = document.querySelector('.product-title')?.textContent;
  const wishlistButton = document.querySelector('.wishlist-button');
  const wishlistIcon = document.querySelector('.wishlist-icon');
  const productDetailSection = document.getElementById('product-detail-section');
  
  console.log('[Wishlist] 🔧 Refresh debug - Current state:', {
    activeProduct: activeProduct ? {
      title: activeProduct.title,
      name: activeProduct.name,
      id: activeProduct.id,
      handle: activeProduct.handle
    } : null,
    domTitle,
    wishlistCount: wishlist.length,
    wishlistItems: wishlist.map(item => ({
      id: item.id,
      title: item.title,
      addedAt: item.addedAt
    })),
    productDetailVisible: productDetailSection ? productDetailSection.style.display : 'not found',
    heartButtonFound: !!wishlistButton,
    heartIconFound: !!wishlistIcon,
    heartButtonClasses: wishlistButton ? wishlistButton.className : 'not found',
    heartIconText: wishlistIcon ? wishlistIcon.textContent : 'not found'
  });
  
  // Check if current product is in wishlist
  const currentTitle = activeProduct ? (activeProduct.title || activeProduct.name) : domTitle;
  const isInWishlist = currentTitle ? wishlist.some(item => item.title === currentTitle) : false;
  
  console.log('[Wishlist] 🔧 Refresh debug - Wishlist check:', {
    currentTitle,
    isInWishlist,
    shouldShowFilled: isInWishlist,
    shouldShowEmpty: !isInWishlist
  });
  
  // Force update heart icon
  console.log('[Wishlist] 🔧 Refresh debug - Forcing heart icon update');
  updateHeartIconState();
};

// Also update heart icon state when product detail section is shown
function showProductDetail() {
  console.log('[MobileApp] 📱 Showing product detail');
  const productDetailSection = document.getElementById('product-detail-section');
  if (productDetailSection) {
    productDetailSection.style.display = 'block';
    
    // Update product details when showing the section
    updateProductDetailSection();
    
    // Update heart icon state when showing product details
    setTimeout(() => {
      updateHeartIconState();
    }, 100);
  }
}

// Update heart icon when spinning tool changes products
function updateHeartIconOnProductChange() {
  setTimeout(() => {
    updateHeartIconState();
  }, 100);
}

// Override the existing updateSpinningTool function to include heart icon update
const originalUpdateSpinningTool = window.updateSpinningTool;
if (originalUpdateSpinningTool) {
  window.updateSpinningTool = function() {
    originalUpdateSpinningTool.apply(this, arguments);
    updateHeartIconOnProductChange();
  };
}

// Override the existing updateMobileSpinningTool function to include heart icon update
const originalUpdateMobileSpinningTool = window.updateMobileSpinningTool;
if (originalUpdateMobileSpinningTool) {
  window.updateMobileSpinningTool = function() {
    originalUpdateMobileSpinningTool.apply(this, arguments);
    updateHeartIconOnProductChange();
  };
}

function viewShop() {
  console.log('[MobileApp] 🏪 View shop clicked');
  alert('Shop functionality coming soon!');
}

// Initialize detail modal event listeners
function initDetailModal() {
  const detailModal = document.getElementById('product-detail-modal');
  if (detailModal) {
    // Close detail modal when clicking outside the modal content
    detailModal.addEventListener('click', function(e) {
      if (e.target === detailModal) {
        closeDetailModal();
      }
    });
    
    // Close detail modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && detailModal.classList.contains('active')) {
        closeDetailModal();
      }
    });
  }
}

// Search functionality

function searchProducts(query) {
  if (!query || query.trim().length === 0) {
    // If query is empty, restore all products based on current filter
    if (window.allProductsBackup && window.allProductsBackup.length > 0) {
      // Check if there's an active gender filter
      const activeFilterButton = document.querySelector('.filter-button.active');
      if (activeFilterButton) {
        const filterText = activeFilterButton.querySelector('.filter-text')?.textContent?.toLowerCase();
        if (filterText && filterText !== 'all') {
          // Apply the current gender filter
          filterProductsByGender(filterText);
        } else {
          // Show all products
          products = window.allProductsBackup.slice();
          renderCarousels();
        }
      } else {
        products = window.allProductsBackup.slice();
        renderCarousels();
      }
      console.log('[Search] 🔄 Restored products based on current filter');
    }
    return;
  }

  const searchTerm = query.toLowerCase().trim();
  
  // Search in all available products (use backup if available, otherwise current products)
  const searchSource = window.allProductsBackup && window.allProductsBackup.length > 0 
    ? window.allProductsBackup 
    : products;

  const filteredProducts = searchSource.filter(product => {
    // Search in product title
    const titleMatch = product.title && product.title.toLowerCase().includes(searchTerm);
    
    // Search in product description
    const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm);
    
    // Search in product tags
    const tagsMatch = product.tags && product.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    );
    
    // Search in product handle
    const handleMatch = product.handle && product.handle.toLowerCase().includes(searchTerm);
    
    return titleMatch || descriptionMatch || tagsMatch || handleMatch;
  });

  products = filteredProducts;
  
  // Show empty state message if no products found
  if (filteredProducts.length === 0) {
    const isMobile = window.innerWidth < 668;
    const carouselVertical = isMobile ? document.querySelector('.mobile-carousel-vertical') : document.querySelector('.desktop-carousel-vertical');
    const carouselHorizontal = isMobile ? document.querySelector('.mobile-carousel-horizontal') : document.querySelector('.desktop-carousel-horizontal');
    
    if (carouselVertical) {
      carouselVertical.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.2em;color:#666;text-align:center;padding:20px;">
          <div style="font-size:3em;margin-bottom:20px;">🔍</div>
          <div>No products found for "${query}"</div>
        </div>
      `;
    }
    
    if (carouselHorizontal) {
      carouselHorizontal.innerHTML = '';
    }
  } else {
    renderCarousels();
  }
  
  console.log(`[Search] 🔍 Found ${filteredProducts.length} products matching "${query}"`);
}

function initSearch() {
  const searchInput = document.getElementById('search-input');

  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value;
      console.log('[MobileApp] 🔍 Search query:', query);
      
      // Perform search immediately as user types
      searchProducts(query);
    });

    // Add clear search functionality on escape key
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchProducts('');
      }
    });
  }
}



// Enhanced viewport detection with debouncing
let resizeTimeout;
let lastViewportWidth = window.innerWidth;
let lastViewportHeight = window.innerHeight;

// Handle window resize to switch between mobile and desktop
function handleResize() {
  // Clear existing timeout
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  
  // Debounce resize events to prevent excessive re-renders
  resizeTimeout = setTimeout(() => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    // Only trigger updates if viewport actually changed significantly
    const widthChanged = Math.abs(currentWidth - lastViewportWidth) > 50;
    const heightChanged = Math.abs(currentHeight - lastViewportHeight) > 50;
    
    if (widthChanged || heightChanged) {
      console.log(`[Viewport] 📐 Viewport changed: ${lastViewportWidth}x${lastViewportHeight} → ${currentWidth}x${currentHeight}`);
      
      // Update stored dimensions
      lastViewportWidth = currentWidth;
      lastViewportHeight = currentHeight;
      
      // Handle viewport change
      handleViewportChange();
    }
  }, 150); // 150ms debounce
}

// Enhanced viewport change handler
function handleViewportChange() {
  const isMobile = window.innerWidth < 668;
  
  console.log(`[Viewport] 🔄 Handling viewport change - Mobile: ${isMobile}`);
  
  // Store current state before switching
  const currentState = {
    horizontalIndex: window.horizontalIndex || 0,
    verticalIndex: window.verticalIndex || 0,
    currentXAxisCollection: window.currentXAxisCollection,
    currentYAxisCollection: window.currentYAxisCollection,
    carouselData: {
      xAxisCollections: window.xAxisCollections || [],
      yAxisCollections: window.yAxisCollections || [],
      products: window.products || []
    }
  };
  
  // Re-initialize mobile app with state preservation
  initMobileAppWithState(currentState);
  
  // Re-render carousels with updated viewport settings
  renderCarousels();
  
  // Re-attach event listeners for the new viewport
  attachListenersWhenReady();
  
  // Force iPhone re-render if needed
  setTimeout(() => {
    forceIPhoneRerender();
  }, 200);
}



// Initialize mobile app when DOM is ready

document.addEventListener('DOMContentLoaded', function() {

  initMobileApp();

  initSearch();

  

  // Add resize listener

  window.addEventListener('resize', handleResize);

});


// Also initialize if script loads after DOM is ready

if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', function() {

    initMobileApp();

    initSearch();

    window.addEventListener('resize', handleResize);

  });

} else {

  initMobileApp();

  initSearch();

  window.addEventListener('resize', handleResize);

}