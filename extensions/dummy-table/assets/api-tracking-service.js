/**
 * API Tracking Service
 * Handles sending interaction data to the API endpoint every 3 minutes
 * Runs in background without affecting app performance
 */

class APITrackingService {
  constructor() {
    this.apiEndpoint = 'https://shopify-management-app.vercel.app/api/track-interactions';
    this.shopDomain = null;
    this.cronInterval = null;
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds between retries
    
    this.init();
  }

  /**
   * Initialize the service
   */
  init() {
    console.log('[APITrackingService] 🚀 Initializing API tracking service...');
    
    // Get shop domain (from localStorage or extract from URL)
    this.getShopDomain();
    
    // Start the cron job
    this.startCronJob();
    
    console.log('[APITrackingService] ✅ Service initialized successfully');
  }

  /**
   * Get shop domain from localStorage or extract from current URL
   */
  getShopDomain() {
    // Try to get from localStorage first
    const storedShop = localStorage.getItem('spinning_tool_shop_domain');
    
    if (storedShop) {
      this.shopDomain = storedShop;
      console.log('[APITrackingService] 🏪 Shop domain loaded from localStorage:', this.shopDomain);
      return;
    }

    // Extract from current URL
    const currentUrl = window.location.href;
    const shopMatch = currentUrl.match(/https?:\/\/([^\.]+)\.myshopify\.com/);
    
    if (shopMatch) {
      this.shopDomain = shopMatch[1] + '.myshopify.com';
      // Save to localStorage for future use
      localStorage.setItem('spinning_tool_shop_domain', this.shopDomain);
      console.log('[APITrackingService] 🏪 Shop domain extracted from URL:', this.shopDomain);
    } else {
      console.warn('[APITrackingService] ⚠️ Could not extract shop domain from URL');
      this.shopDomain = 'unknown-shop.myshopify.com'; // Fallback
    }
  }

  /**
   * Start the 3-minute cron job
   */
  startCronJob() {
    // Clear any existing interval
    if (this.cronInterval) {
      clearInterval(this.cronInterval);
    }

    // Set interval for 3 minutes (180000 ms)
    this.cronInterval = setInterval(() => {
      this.processInteractions();
    }, 180000);

    console.log('[APITrackingService] ⏰ Cron job started - checking every 3 minutes');
  }

  /**
   * Process interactions and send to API if data exists
   */
  async processInteractions() {
    try {
      console.log('[APITrackingService] 🔍 Checking for interactions to send...');
      
      // Get interactions from localStorage
      const interactions = this.getInteractionsFromStorage();
      
      if (!interactions || interactions.length === 0) {
        console.log('[APITrackingService] 📭 No interactions to send, skipping API call');
        return;
      }

      console.log(`[APITrackingService] 📊 Found ${interactions.length} interactions to send`);

      // Prepare API payload
      const payload = {
        shop: this.shopDomain,
        interactions: interactions
      };

      // Send to API with retry logic
      const success = await this.sendToAPIWithRetry(payload);
      
      if (success) {
        console.log('[APITrackingService] ✅ Successfully sent interactions to API, clearing local data');
        this.clearInteractionsFromStorage();
      } else {
        console.error('[APITrackingService] ❌ Failed to send interactions after all retry attempts');
      }

    } catch (error) {
      console.error('[APITrackingService] ❌ Error processing interactions:', error);
    }
  }

  /**
   * Get interactions from localStorage
   */
  getInteractionsFromStorage() {
    try {
      const stored = localStorage.getItem('spinning_tool_interactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[APITrackingService] ❌ Error loading interactions from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear interactions from localStorage
   */
  clearInteractionsFromStorage() {
    try {
      localStorage.removeItem('spinning_tool_interactions');
      console.log('[APITrackingService] 🗑️ Cleared interactions from localStorage');
    } catch (error) {
      console.error('[APITrackingService] ❌ Error clearing interactions from localStorage:', error);
    }
  }

  /**
   * Send data to API with retry logic
   */
  async sendToAPIWithRetry(payload) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`[APITrackingService] 📤 Attempt ${attempt}/${this.retryAttempts} - Sending data to API...`);
        
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`[APITrackingService] ✅ API call successful on attempt ${attempt}:`, result);
          return true;
        } else {
          console.warn(`[APITrackingService] ⚠️ API call failed on attempt ${attempt}: ${response.status} ${response.statusText}`);
          
          if (attempt < this.retryAttempts) {
            console.log(`[APITrackingService] ⏳ Waiting ${this.retryDelay}ms before retry...`);
            await this.delay(this.retryDelay);
          }
        }
      } catch (error) {
        console.error(`[APITrackingService] ❌ API call error on attempt ${attempt}:`, error);
        
        if (attempt < this.retryAttempts) {
          console.log(`[APITrackingService] ⏳ Waiting ${this.retryDelay}ms before retry...`);
          await this.delay(this.retryDelay);
        }
      }
    }
    
    return false;
  }

  /**
   * Utility function to create delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manually trigger API call (for testing)
   */
  async triggerManualSync() {
    console.log('[APITrackingService] 🔄 Manual sync triggered');
    await this.processInteractions();
  }

  /**
   * Stop the cron job
   */
  stopCronJob() {
    if (this.cronInterval) {
      clearInterval(this.cronInterval);
      this.cronInterval = null;
      console.log('[APITrackingService] ⏹️ Cron job stopped');
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.cronInterval !== null,
      shopDomain: this.shopDomain,
      apiEndpoint: this.apiEndpoint,
      retryAttempts: this.retryAttempts
    };
  }
}

// Create global instance
window.apiTrackingService = new APITrackingService();

// Make utility functions available globally for testing
window.triggerManualSync = () => window.apiTrackingService.triggerManualSync();
window.getTrackingStatus = () => window.apiTrackingService.getStatus();
window.stopTracking = () => window.apiTrackingService.stopCronJob();

console.log('[APITrackingService] 🌟 API Tracking Service loaded and ready!');
