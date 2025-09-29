/**
 * Sound Factory Facebook Pixel Implementation
 * 
 * This file contains the complete Facebook Pixel implementation for Sound Factory's website.
 * It includes advanced event tracking, custom events, and personalization functions.
 * 
 * IMPLEMENTATION INSTRUCTIONS:
 * 1. Add the base pixel code to all pages in the <head> section
 * 2. Add page-specific event tracking code to respective pages
 * 3. Test all events using the Facebook Pixel Helper browser extension
 */

// =====================================================================
// FACEBOOK PIXEL BASE CODE - Add to all pages in <head> section
// =====================================================================

/**
 * Base Facebook Pixel Code
 * Add this to the <head> section of all website pages
 */
function getSoundFactoryPixelBaseCode() {
  return `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Initialize with Sound Factory's pixel ID
fbq('init', '987654321098765');

// Track pageview on all pages
fbq('track', 'PageView');

// Advanced tracking for Sound Factory experience
window.addEventListener('load', function() {
  // Check for Facebook ad parameters
  const urlParams = new URLSearchParams(window.location.search);
  const adSource = urlParams.get('source');
  const interactionType = urlParams.get('interaction');
  const contentId = urlParams.get('content_id');
  
  if (adSource && adSource.includes('fb_')) {
    // Track that user came from our Facebook ad
    fbq('trackCustom', 'FacebookAdEntry', {
      adSource: adSource,
      interactionType: interactionType || 'direct',
      contentId: contentId || 'none'
    });
    
    // Store ad parameters in localStorage for cross-page tracking
    localStorage.setItem('sf_ad_source', adSource);
    localStorage.setItem('sf_interaction_type', interactionType || 'direct');
    localStorage.setItem('sf_content_id', contentId || 'none');
    
    // Personalize the experience based on their ad interaction
    if (typeof personalizeExperience === 'function') {
      personalizeExperience(interactionType, contentId);
    }
  }
  
  // Track user engagement time
  trackEngagementTime();
  
  // Track scroll depth
  trackScrollDepth();
});

// Track engagement time
function trackEngagementTime() {
  let startTime = new Date();
  let engaged = true;
  let totalEngagedTime = 0;
  let lastUpdateTime = startTime;
  
  // Check engagement every second
  const engagementInterval = setInterval(function() {
    if (engaged) {
      const now = new Date();
      totalEngagedTime += (now - lastUpdateTime) / 1000;
      lastUpdateTime = now;
      
      // Track engagement at specific thresholds
      if (totalEngagedTime >= 30 && !localStorage.getItem('sf_30s_engaged')) {
        fbq('trackCustom', 'EngagementMilestone', { seconds: 30 });
        localStorage.setItem('sf_30s_engaged', 'true');
      }
      
      if (totalEngagedTime >= 60 && !localStorage.getItem('sf_60s_engaged')) {
        fbq('trackCustom', 'EngagementMilestone', { seconds: 60 });
        localStorage.setItem('sf_60s_engaged', 'true');
      }
      
      if (totalEngagedTime >= 180 && !localStorage.getItem('sf_180s_engaged')) {
        fbq('trackCustom', 'EngagementMilestone', { seconds: 180 });
        localStorage.setItem('sf_180s_engaged', 'true');
      }
    }
  }, 1000);
  
  // Track when user leaves the page
  window.addEventListener('beforeunload', function() {
    clearInterval(engagementInterval);
    
    if (totalEngagedTime > 10) {
      fbq('trackCustom', 'TotalEngagementTime', {
        seconds: Math.round(totalEngagedTime)
      });
    }
  });
  
  // Track user engagement state
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      engaged = false;
    } else {
      engaged = true;
      lastUpdateTime = new Date();
    }
  });
}

// Track scroll depth
function trackScrollDepth() {
  let maxScrollDepth = 0;
  let scrollDepthTracked = {
    25: false,
    50: false,
    75: false,
    90: false
  };
  
  window.addEventListener('scroll', function() {
    // Calculate scroll depth as percentage
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    const scrollDepth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    
    // Update max scroll depth
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track at specific thresholds
      if (maxScrollDepth >= 25 && !scrollDepthTracked[25]) {
        fbq('trackCustom', 'ScrollDepth', { depth: 25 });
        scrollDepthTracked[25] = true;
      }
      
      if (maxScrollDepth >= 50 && !scrollDepthTracked[50]) {
        fbq('trackCustom', 'ScrollDepth', { depth: 50 });
        scrollDepthTracked[50] = true;
      }
      
      if (maxScrollDepth >= 75 && !scrollDepthTracked[75]) {
        fbq('trackCustom', 'ScrollDepth', { depth: 75 });
        scrollDepthTracked[75] = true;
      }
      
      if (maxScrollDepth >= 90 && !scrollDepthTracked[90]) {
        fbq('trackCustom', 'ScrollDepth', { depth: 90 });
        scrollDepthTracked[90] = true;
      }
    }
  });
  
  // Track final scroll depth when user leaves
  window.addEventListener('beforeunload', function() {
    fbq('trackCustom', 'MaxScrollDepth', {
      depth: maxScrollDepth
    });
  });
}
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id=987654321098765&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
  `;
}

// =====================================================================
// PAGE-SPECIFIC EVENT TRACKING - Add to respective pages
// =====================================================================

/**
 * Tables Page Event Tracking
 * Add this to the tables_enhanced.html page
 */
function getTablesPageEventTracking() {
  return `
<script>
// Track table page interactions
document.addEventListener('DOMContentLoaded', function() {
  // Track page view with content type
  fbq('track', 'ViewContent', {
    content_type: 'product_group',
    content_name: 'VIP Tables',
    content_category: 'Tables',
    content_ids: ['premium_table', 'standard_table'],
    contents: [
      {
        id: 'premium_table',
        quantity: 1,
        item_price: 1500.00
      },
      {
        id: 'standard_table',
        quantity: 1,
        item_price: 1000.00
      }
    ]
  });
  
  // Track table views
  const tableElements = document.querySelectorAll('.table-item');
  tableElements.forEach(function(tableElement) {
    const tableId = tableElement.getAttribute('data-table-id');
    const tableName = tableElement.getAttribute('data-table-name');
    const tablePrice = parseFloat(tableElement.getAttribute('data-table-price'));
    
    // Track when table comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fbq('trackCustom', 'TableView', {
            tableId: tableId,
            tableName: tableName,
            tablePrice: tablePrice
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    
    observer.observe(tableElement);
    
    // Track table selection
    tableElement.addEventListener('click', function() {
      fbq('trackCustom', 'TableSelect', {
        tableId: tableId,
        tableName: tableName,
        tablePrice: tablePrice
      });
    });
  });
  
  // Track table reservation initiation
  const reserveButtons = document.querySelectorAll('.reserve-table-button');
  reserveButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const tableContainer = button.closest('.table-item');
      const tableId = tableContainer.getAttribute('data-table-id');
      const tableName = tableContainer.getAttribute('data-table-name');
      const tablePrice = parseFloat(tableContainer.getAttribute('data-table-price'));
      
      fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_name: tableName,
        content_category: 'Tables',
        value: tablePrice,
        currency: 'USD',
        contents: [
          {
            id: tableId,
            quantity: 1,
            item_price: tablePrice
          }
        ]
      });
    });
  });
  
  // Track table reservation completion
  // This should be called after successful reservation
  window.trackTableReservationComplete = function(tableId, tableName, tablePrice, reservationId) {
    fbq('track', 'Purchase', {
      content_type: 'product',
      content_name: tableName,
      content_category: 'Tables',
      value: tablePrice,
      currency: 'USD',
      contents: [
        {
          id: tableId,
          quantity: 1,
          item_price: tablePrice
        }
      ],
      transaction_id: reservationId
    });
    
    // Track ad source if available
    const adSource = localStorage.getItem('sf_ad_source');
    const interactionType = localStorage.getItem('sf_interaction_type');
    const contentId = localStorage.getItem('sf_content_id');
    
    if (adSource && adSource.includes('fb_')) {
      fbq('trackCustom', 'FacebookAdConversion', {
        adSource: adSource,
        interactionType: interactionType || 'direct',
        contentId: contentId || 'none',
        conversionType: 'table_reservation',
        conversionValue: tablePrice
      });
    }
  };
});
</script>
  `;
}

/**
 * Tickets Page Event Tracking
 * Add this to the find_my_ticket.html page
 */
function getTicketsPageEventTracking() {
  return `
<script>
// Track ticket page interactions
document.addEventListener('DOMContentLoaded', function() {
  // Track page view with content type
  fbq('track', 'ViewContent', {
    content_type: 'product_group',
    content_name: 'Event Tickets',
    content_category: 'Tickets',
    content_ids: ['general_admission', 'vip_ticket'],
    contents: [
      {
        id: 'general_admission',
        quantity: 1,
        item_price: 75.00
      },
      {
        id: 'vip_ticket',
        quantity: 1,
        item_price: 150.00
      }
    ]
  });
  
  // Track ticket type selection
  const ticketTypeSelect = document.querySelector('#ticket-type');
  if (ticketTypeSelect) {
    ticketTypeSelect.addEventListener('change', function() {
      const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
      const ticketType = selectedOption.text;
      const ticketPrice = parseFloat(selectedOption.getAttribute('data-price'));
      
      fbq('trackCustom', 'TicketTypeSelect', {
        ticketType: ticketType,
        ticketPrice: ticketPrice
      });
    });
  }
  
  // Track ticket quantity changes
  const quantityInput = document.querySelector('#ticket-quantity');
  if (quantityInput) {
    quantityInput.addEventListener('change', function() {
      const quantity = parseInt(quantityInput.value);
      const ticketTypeSelect = document.querySelector('#ticket-type');
      const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
      const ticketType = selectedOption.text;
      const ticketPrice = parseFloat(selectedOption.getAttribute('data-price'));
      
      fbq('trackCustom', 'TicketQuantityChange', {
        ticketType: ticketType,
        ticketPrice: ticketPrice,
        quantity: quantity,
        totalValue: ticketPrice * quantity
      });
    });
  }
  
  // Track add to cart
  const addToCartButton = document.querySelector('#add-to-cart-button');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', function() {
      const ticketTypeSelect = document.querySelector('#ticket-type');
      const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
      const ticketType = selectedOption.text;
      const ticketPrice = parseFloat(selectedOption.getAttribute('data-price'));
      const quantity = parseInt(document.querySelector('#ticket-quantity').value);
      
      fbq('track', 'AddToCart', {
        content_type: 'product',
        content_name: ticketType,
        content_category: 'Tickets',
        value: ticketPrice * quantity,
        currency: 'USD',
        contents: [
          {
            id: ticketType.replace(/\\s+/g, '_').toLowerCase(),
            quantity: quantity,
            item_price: ticketPrice
          }
        ]
      });
    });
  }
  
  // Track checkout initiation
  const checkoutButton = document.querySelector('#checkout-button');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', function() {
      // Get cart items from your cart system
      // This is a placeholder - replace with your actual cart data
      const cartItems = getCartItems();
      const cartTotal = calculateCartTotal(cartItems);
      
      fbq('track', 'InitiateCheckout', {
        value: cartTotal,
        currency: 'USD',
        content_type: 'product',
        contents: cartItems,
        num_items: cartItems.length
      });
    });
  }
  
  // Track purchase completion
  // This should be called after successful purchase
  window.trackTicketPurchaseComplete = function(orderTotal, items, orderID) {
    fbq('track', 'Purchase', {
      value: orderTotal,
      currency: 'USD',
      content_type: 'product',
      contents: items,
      num_items: items.length,
      transaction_id: orderID
    });
    
    // Track ad source if available
    const adSource = localStorage.getItem('sf_ad_source');
    const interactionType = localStorage.getItem('sf_interaction_type');
    const contentId = localStorage.getItem('sf_content_id');
    
    if (adSource && adSource.includes('fb_')) {
      fbq('trackCustom', 'FacebookAdConversion', {
        adSource: adSource,
        interactionType: interactionType || 'direct',
        contentId: contentId || 'none',
        conversionType: 'ticket_purchase',
        conversionValue: orderTotal
      });
    }
  };
  
  // Helper functions - replace with your actual implementation
  function getCartItems() {
    // Placeholder - replace with your cart system
    return [
      {
        id: 'general_admission',
        quantity: 2,
        item_price: 75.00
      }
    ];
  }
  
  function calculateCartTotal(items) {
    // Placeholder - replace with your cart system
    return items.reduce((total, item) => total + (item.quantity * item.item_price), 0);
  }
});
</script>
  `;
}

/**
 * Video Gallery Event Tracking
 * Add this to the video_gallery.html page
 */
function getVideoGalleryEventTracking() {
  return `
<script>
// Track video gallery interactions
document.addEventListener('DOMContentLoaded', function() {
  // Track page view with content type
  fbq('track', 'ViewContent', {
    content_type: 'videos',
    content_name: 'Sound Factory Video Gallery'
  });
  
  // Track video views
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(function(video) {
    const videoId = video.getAttribute('data-video-id');
    const videoName = video.getAttribute('data-video-name');
    
    // Track video play
    video.addEventListener('play', function() {
      fbq('trackCustom', 'VideoPlay', {
        videoId: videoId,
        videoName: videoName
      });
    });
    
    // Track video progress
    let progress = {
      25: false,
      50: false,
      75: false,
      95: false
    };
    
    video.addEventListener('timeupdate', function() {
      const percent = (video.currentTime / video.duration) * 100;
      
      if (percent >= 25 && !progress[25]) {
        fbq('trackCustom', 'VideoProgress', {
          videoId: videoId,
          videoName: videoName,
          percent: 25
        });
        progress[25] = true;
      }
      
      if (percent >= 50 && !progress[50]) {
        fbq('trackCustom', 'VideoProgress', {
          videoId: videoId,
          videoName: videoName,
          percent: 50
        });
        progress[50] = true;
      }
      
      if (percent >= 75 && !progress[75]) {
        fbq('trackCustom', 'VideoProgress', {
          videoId: videoId,
          videoName: videoName,
          percent: 75
        });
        progress[75] = true;
      }
      
      if (percent >= 95 && !progress[95]) {
        fbq('trackCustom', 'VideoComplete', {
          videoId: videoId,
          videoName: videoName
        });
        progress[95] = true;
      }
    });
  });
  
  // Track video category selection
  const categoryButtons = document.querySelectorAll('.video-category-button');
  categoryButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const category = button.getAttribute('data-category');
      
      fbq('trackCustom', 'VideoCategorySelect', {
        category: category
      });
    });
  });
  
  // Track video sharing
  const shareButtons = document.querySelectorAll('.video-share-button');
  shareButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const videoContainer = button.closest('.video-container');
      const videoId = videoContainer.querySelector('video').getAttribute('data-video-id');
      const videoName = videoContainer.querySelector('video').getAttribute('data-video-name');
      const platform = button.getAttribute('data-platform');
      
      fbq('trackCustom', 'VideoShare', {
        videoId: videoId,
        videoName: videoName,
        platform: platform
      });
    });
  });
});
</script>
  `;
}

/**
 * Blueprint Page Event Tracking
 * Add this to the index.html page with blueprints
 */
function getBlueprintEventTracking() {
  return `
<script>
// Track blueprint interactions
document.addEventListener('DOMContentLoaded', function() {
  // Track floor changes
  const floorButtons = document.querySelectorAll('.floor-button');
  floorButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const floor = button.getAttribute('data-floor');
      
      fbq('trackCustom', 'FloorChange', {
        floor: floor
      });
    });
  });
  
  // Track pin placements
  window.trackPinPlacement = function(pinType, floor, coordinates) {
    fbq('trackCustom', 'PinPlacement', {
      pinType: pinType,
      floor: floor,
      coordinates: coordinates
    });
  };
  
  // Track character movement
  let lastMovementTracked = 0;
  window.trackCharacterMovement = function(floor, coordinates) {
    const now = Date.now();
    
    // Only track every 30 seconds to avoid excessive events
    if (now - lastMovementTracked > 30000) {
      fbq('trackCustom', 'CharacterMovement', {
        floor: floor,
        coordinates: coordinates
      });
      lastMovementTracked = now;
    }
  };
  
  // Track chat interactions
  window.trackChatInteraction = function(messageLength) {
    fbq('trackCustom', 'ChatInteraction', {
      messageLength: messageLength
    });
  };
  
  // Track AR filter usage
  window.trackARFilterUsage = function(filterType) {
    fbq('trackCustom', 'ARFilterUsage', {
      filterType: filterType
    });
  };
});
</script>
  `;
}

// =====================================================================
// PERSONALIZATION FUNCTIONS - Add to all pages
// =====================================================================

/**
 * Personalization Functions
 * Add this to all pages to enable personalized experiences
 */
function getPersonalizationFunctions() {
  return `
<script>
// Function to personalize the user experience based on ad interaction
function personalizeExperience(interactionType, contentId) {
  // Default implementation - override as needed on specific pages
  console.log('Personalizing experience:', interactionType, contentId);
  
  if (!interactionType) return;
  
  // Track personalization event
  fbq('trackCustom', 'PersonalizedExperience', {
    interactionType: interactionType,
    contentId: contentId
  });
  
  // Handle different interaction types
  switch(interactionType) {
    case 'video_interest':
      // Auto-scroll to video section if it exists
      const videoSection = document.querySelector('#video-gallery');
      if (videoSection) {
        videoSection.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Highlight the video they were interested in
        highlightContent('video-' + contentId);
      }
      break;
      
    case 'table_interest':
      // Auto-scroll to tables section if it exists
      const tablesSection = document.querySelector('#vip-tables');
      if (tablesSection) {
        tablesSection.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Highlight the table they were interested in
        highlightContent('table-' + contentId);
      }
      break;
      
    case 'ticket_interest':
      // Auto-scroll to tickets section if it exists
      const ticketsSection = document.querySelector('#tickets');
      if (ticketsSection) {
        ticketsSection.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Pre-select ticket type if possible
        preSelectTicket(contentId);
      }
      break;
      
    case 'floor_interest':
      // Switch to the floor they were interested in
      const floorButton = document.querySelector(\`[data-floor="\${contentId}"]\`);
      if (floorButton) {
        floorButton.click();
      }
      break;
  }
}

// Helper function to highlight content
function highlightContent(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    // Add highlight class
    element.classList.add('fb-highlighted');
    
    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    // Add pulsing animation
    if (!document.getElementById('highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'highlight-styles';
      style.textContent = \`
        .fb-highlighted {
          position: relative;
          z-index: 10;
          animation: fb-pulse 2s infinite;
        }
        
        @keyframes fb-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 51, 102, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(255, 51, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 51, 102, 0);
          }
        }
      \`;
      document.head.appendChild(style);
    }
  }
}

// Helper function to pre-select ticket type
function preSelectTicket(ticketType) {
  const ticketSelect = document.querySelector('#ticket-type');
  if (ticketSelect) {
    // Find option matching the ticket type
    const options = ticketSelect.options;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const optionValue = option.value.toLowerCase();
      
      if (optionValue === ticketType.toLowerCase() || 
          optionValue.includes(ticketType.toLowerCase())) {
        ticketSelect.selectedIndex = i;
        
        // Trigger change event
        const event = new Event('change');
        ticketSelect.dispatchEvent(event);
        break;
      }
    }
  }
}
</script>
  `;
}

// =====================================================================
// EXPORT ALL COMPONENTS
// =====================================================================

// Export all components for use in the Sound Factory website
module.exports = {
  getSoundFactoryPixelBaseCode,
  getTablesPageEventTracking,
  getTicketsPageEventTracking,
  getVideoGalleryEventTracking,
  getBlueprintEventTracking,
  getPersonalizationFunctions
};

/**
 * IMPLEMENTATION NOTES:
 * 
 * 1. Replace '987654321098765' with Sound Factory's actual Facebook Pixel ID
 * 2. Add the base pixel code to all pages in the <head> section
 * 3. Add page-specific event tracking code to the respective pages
 * 4. Add personalization functions to all pages
 * 5. Test all events using the Facebook Pixel Helper browser extension
 * 6. Verify conversion events in Facebook Events Manager
 * 
 * For implementation assistance, contact the NinjaTech AI team.
 */