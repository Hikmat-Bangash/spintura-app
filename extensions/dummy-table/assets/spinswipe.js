
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

function showLoading() {
const carouselVertical = document.querySelector('.carousel-vertical');
const carouselHorizontal = document.querySelector('.carousel-horizontal');
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
  carouselContainer.style.perspective = '1000px';
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
carouselContainer.style.perspective = '1000px';
carouselContainer.style.transformStyle = 'preserve-3d';

if (verticalCarousel) {
  verticalCarousel.style.transformStyle = 'preserve-3d';
  verticalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
  
  const verticalPanels = verticalCarousel.querySelectorAll('.carousel-panel');
  verticalPanels.forEach((panel, index) => {
    const rotateAngle = index * (360 / 5);
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(170px)`;
    panel.style.transformStyle = 'preserve-3d';
    panel.style.backfaceVisibility = 'hidden';
  });
}

if (horizontalCarousel) {
  horizontalCarousel.style.transformStyle = 'preserve-3d';
  horizontalCarousel.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
  
  const horizontalPanels = horizontalCarousel.querySelectorAll('.carousel-panel');
  horizontalPanels.forEach((panel, index) => {
    const rotateAngle = index * (360 / 5);
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(170px)`;
    panel.style.transformStyle = 'preserve-3d';
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
const carouselVertical = document.querySelector('.carousel-vertical');
const carouselHorizontal = document.querySelector('.carousel-horizontal');

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
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(170px)`;
    
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
      panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(170px)`;
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
    panel.style.transform = `rotateX(${rotateAngle}deg) translateZ(170px)`;
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
    panel.style.transform = `rotateY(${rotateAngle}deg) translateZ(170px)`;
    
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
}
const carouselHorizontal = document.querySelector('.carousel-horizontal');
const carouselVertical = document.querySelector('.carousel-vertical');
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
const carouselContainer = document.querySelector('.carousel-container');
const wrapper = document.getElementById('spinning-tool-wrapper');

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
  if (activeCarousel === 'horizontal') {
    const totalProducts = products.length;
    const normalizedHorizontalIndex = ((horizontalIndex % totalProducts) + totalProducts) % totalProducts;
    currentProduct = products[normalizedHorizontalIndex];
  } else {
    const totalProducts = products.length;
    const normalizedVerticalIndex = ((verticalIndex % totalProducts) + totalProducts) % totalProducts;
    currentProduct = products[normalizedVerticalIndex];
  }
  
  if (currentProduct) {
    console.log('[SpinningTool] 🔍 Found product from main products array:', currentProduct);
    return currentProduct;
  } }
if (activeCarousel === 'horizontal') {
  if (xAxisCollections.length > 0) {
    const totalXAxisCollections = xAxisCollections.length;
    const normalizedHorizontalIndex = ((horizontalIndex % totalXAxisCollections) + totalXAxisCollections) % totalXAxisCollections;
    currentProduct = xAxisCollections[normalizedHorizontalIndex];
  }
} else {
  if (yAxisProducts.length > 0) {
    const totalYAxisProducts = yAxisProducts.length;
    const normalizedVerticalIndex = ((verticalIndex % totalYAxisProducts) + totalYAxisProducts) % totalYAxisProducts;
    currentProduct = yAxisProducts[normalizedVerticalIndex];
  } }
if (!currentProduct || !currentProduct.handle) {
  console.log('[SpinningTool] ⚠️ No product with handle found, falling back to hierarchical menu data');
  if (selectedCollections.level3) {
    const level1Collection = hierarchicalMenuData.find(c => c.title === selectedCollections.level1?.title);
    if (level1Collection && level1Collection.items) {
      const level2Collection = level1Collection.items.find(c => c.title === selectedCollections.level2?.title);
      if (level2Collection && level2Collection.items) {
        const level3Collection = level2Collection.items.find(c => c.title === selectedCollections.level3?.title);
        if (level3Collection && level3Collection.resource) {
          const productIndex = Math.abs(verticalIndex) % level3Collection.resource.length;
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
    
    // Get the first available variant with proper ID extraction
    let variantId = null;
    
    if (product.variants && product.variants.length > 0) {
      // Extract numeric ID from Shopify variant ID (e.g., "gid://shopify/ProductVariant/123456" -> "123456")
      const variant = product.variants[0];
      if (variant.id) {
        const idMatch = variant.id.toString().match(/gid:\/\/shopify\/ProductVariant\/(\d+)/);
        variantId = idMatch ? idMatch[1] : variant.id.toString();
      }
    } else if (product.id) {
      // Extract numeric ID from product ID (e.g., "gid://shopify/Product/123456" -> "123456")
      const idMatch = product.id.toString().match(/gid:\/\/shopify\/Product\/(\d+)/);
      variantId = idMatch ? idMatch[1] : product.id.toString();
    }

    console.log('[Cart] 🔑 Extracted variant ID:', variantId);

    if (!variantId) {
      console.log('[Cart] ⚠️ No valid variant ID found, trying to fetch product from Shopify...');
      
      // Try to fetch the product directly from Shopify using the handle
      if (product.handle) {
        try {
          const productResponse = await fetch(`/products/${product.handle}.js`);
          if (productResponse.ok) {
            const shopifyProduct = await productResponse.json();
            console.log('[Cart] 📦 Fetched product from Shopify:', shopifyProduct);
            
            if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
              variantId = shopifyProduct.variants[0].id.toString();
              console.log('[Cart] 🔑 Using Shopify product variant ID:', variantId);
            }
          }
        } catch (fetchError) {
          console.log('[Cart] ⚠️ Failed to fetch product from Shopify:', fetchError);
        }
      }
      
      if (!variantId) {
        throw new Error('No valid variant ID found for this product');
      }
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
      images: [
        ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),
        ...images,
        ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))
      ],
      videos: videos,
      variants: (node.variants.edges || []).map(v => ({
        id: v.node.id,
        title: v.node.title,
        image: v.node.image && v.node.image.url ? v.node.image.url : null
      }))
    };
  });
  const filteredProducts = filterProductsByStatus(rawProducts, productStatusData);
  products = filteredProducts;
  
  // Debug logging for all products with videos
  const productsWithVideos = products.filter(p => p.videos && p.videos.length > 0);
  console.log(`[SpinningTool] 🎥 Loaded ${products.length} products, ${productsWithVideos.length} have videos:`, productsWithVideos.map(p => ({ name: p.name, videoCount: p.videos.length })));
  
  afterProductsLoaded();
} catch (err) {
  const carouselVertical = document.querySelector('.carousel-vertical');
  if (carouselVertical) carouselVertical.innerHTML = '<div style="color:red;">Failed to load products</div>';
} }
let menuLevels = { level1: [], level2: [], level3: [] };
let allProductsBackup = [];
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
} else {
  // Create a nice placeholder with collection title
  const placeholderColor = getPlaceholderColor(collection.title);
  img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="55"><rect width="160" height="55" fill="${placeholderColor}"/><text x="80" y="27.5" text-anchor="middle" dy=".3em" font-size="10" fill="white" font-weight="bold">${collection.title}</text></svg>`;
}
img.alt = collection.title;
item.appendChild(img);

const title = document.createElement('div');
title.className = 'collection-title';
title.textContent = collection.title;
item.appendChild(title);
item.addEventListener('click', () => handleCollectionClick(collection, level));
return item; }
function handleCollectionClick(collection, level) {
const children = getCollectionChildren(collection);
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
    // Ensure spinning tool is updated when navigating via breadcrumb
    if (i === 1) {
      // Going back to top level - show all products
      if (allProductsBackup && allProductsBackup.length > 0) {
        products = allProductsBackup.slice();
        renderCarousels();
      }
    }
  });
  if (i === level) {
    breadcrumbItem.classList.add('active');
  }
  breadcrumbNav.appendChild(breadcrumbItem);
} }
function navigateToLevel(targetLevel) {
if (targetLevel === 1) {
  resetHierarchicalCarousel();
  updateBreadcrumb(1);
  // Update spinning tool with all products when going back to top level
  products = allProductsBackup.slice();
  renderCarousels();
} else if (targetLevel === 2 && selectedCollections.level1) {
  currentLevel = 2;
  document.getElementById('level-2-carousel').style.display = 'block';
  document.getElementById('level-3-carousel').style.display = 'none';
  const children = getCollectionChildren(selectedCollections.level1);
  renderCarouselLevel(2, children);
  updateBreadcrumb(2, selectedCollections.level1);
  // Update spinning tool with level 1 collection products
  updateSpinningToolForCollection(selectedCollections.level1);
} else if (targetLevel === 3 && selectedCollections.level2) {
  currentLevel = 3;
  document.getElementById('level-3-carousel').style.display = 'block';
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
        images: [
          ...(node.featuredImage && node.featuredImage.url ? [node.featuredImage.url] : []),
          ...images,
          ...((node.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))
        ],
        videos: videos,
        variants: (node.variants.edges || []).map(v => ({
          id: v.node.id,
          title: v.node.title,
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
document.getElementById('level-1-carousel').style.display = 'block';
document.getElementById('level-2-carousel').style.display = 'none';
document.getElementById('level-3-carousel').style.display = 'none';
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
      items: (level1Item.items || []).map(level2Item => ({
        ...level2Item,
        items: (level2Item.items || []).map(level3Item => ({
          ...level3Item,
          resource: level3Item.resource && level3Item.resource.products ? 
            level3Item.resource.products.edges.map(edge => formatProduct(edge.node)) : []
        }))
      }))
    }));
    
    hierarchicalMenuData = processedTopLevelLayers;
    renderHierarchicalCarousel();
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
  return; }
const query = `query GetCollectionProducts($ids: [ID!]!) {\n  nodes(ids: $ids) {\n    ... on Collection {\n      products(first: 100) {\n        edges {\n          node {\n            id\n            title\n            handle\n            featuredImage { url altText }\n            media(first: 50) {\n              edges {\n                node {\n                  __typename\n                  ... on MediaImage {\n                    image { url altText }\n                  }\n                  ... on Video {\n                    sources { url mimeType }\n                    previewImage { url }\n                  }\n                }\n              }\n            }\n            variants(first: 50) {\n              edges {\n                node {\n                  id\n                  title\n                  image { url altText }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}`;
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
          images: [
            ...(product.featuredImage && product.featuredImage.url ? [product.featuredImage.url] : []),
            ...images,
            ...((product.variants.edges || []).map(v => v.node.image && v.node.image.url ? v.node.image.url : null).filter(Boolean))
          ],
          videos: videos,
          variants: (product.variants.edges || []).map(v => ({
            id: v.node.id,
            title: v.node.title,
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
        variables: { handle: xAxisCollectionHandle } 
      }),
    });
    const data = await response.json();
    console.log(`[SpinningTool] 📥 API response:`, data);
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
  const carouselVertical = document.querySelector('.carousel-vertical');
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
