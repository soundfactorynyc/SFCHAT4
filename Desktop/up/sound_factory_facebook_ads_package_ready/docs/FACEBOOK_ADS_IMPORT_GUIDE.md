# Sound Factory Facebook Ads Import Guide

This guide provides step-by-step instructions for importing and setting up the Sound Factory Facebook ad creatives in Facebook Ads Manager.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [File Preparation](#file-preparation)
3. [Facebook Business Manager Setup](#facebook-business-manager-setup)
4. [Importing Ad Creatives](#importing-ad-creatives)
5. [Setting Up Campaign Structure](#setting-up-campaign-structure)
6. [Implementing Dynamic Content](#implementing-dynamic-content)
7. [Tracking & Conversion Setup](#tracking--conversion-setup)
8. [Testing & Launching](#testing--launching)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- Admin access to Sound Factory's Facebook Business Manager
- Admin access to Sound Factory's Facebook Page
- Facebook Ads Manager access with ad creation permissions
- Sound Factory's Facebook Pixel ID
- Image and video assets for the ads
- Sound Factory logo and brand assets

## File Preparation

### 1. Prepare Image Assets

1. **Resize all images to Facebook's recommended dimensions:**
   - Feed Ad Images: 1080 x 1080 pixels (1:1 ratio)
   - Carousel Ad Images: 1080 x 1080 pixels (1:1 ratio)
   - Collection Ad Hero: 1080 x 1080 pixels (1:1 ratio)
   - Collection Ad Items: 1080 x 1080 pixels (1:1 ratio)

2. **Optimize all images:**
   - Keep file sizes under 30MB
   - Use .jpg or .png format
   - Ensure images are high quality but optimized for web

3. **Prepare video assets:**
   - Format: MP4 or MOV
   - Resolution: 1080p minimum
   - Aspect ratio: 16:9 or 1:1
   - Length: 15-60 seconds
   - File size: Under 4GB

### 2. Organize Creative Files

Create a folder structure as follows:

```
sound_factory_facebook_ads/
├── images/
│   ├── feed_ads/
│   ├── carousel_ads/
│   ├── collection_ads/
│   └── dynamic_ads/
├── videos/
├── html/
└── css/
```

Copy all HTML and CSS files from this package to the respective folders.

## Facebook Business Manager Setup

### 1. Access Business Manager

1. Go to [business.facebook.com](https://business.facebook.com)
2. Log in with your Facebook credentials
3. Select Sound Factory's Business Manager account

### 2. Set Up Facebook Pixel

1. Navigate to **Business Settings** > **Data Sources** > **Pixels**
2. If you don't have a pixel yet, click **Add** to create one
3. Follow the setup wizard to install the pixel on Sound Factory's website
4. Implement the advanced event tracking code from `sound_factory_tracking_conversion_setup.js`

### 3. Create a Catalog (for Dynamic Ads)

1. Go to **Business Settings** > **Data Sources** > **Catalogs**
2. Click **Add** and select **Create a New Catalog**
3. Choose **Events** as the catalog type
4. Name it "Sound Factory Events and Tables"
5. Follow the setup wizard to create your catalog
6. Use the data feed template to upload event and table information

## Importing Ad Creatives

### 1. Access Creative Hub

1. In Business Manager, click on **Creative Hub** in the left menu
2. Click **Create** to start a new creative

### 2. Import Feed Ad

1. Select **Facebook Feed** as the placement
2. Click **Create** > **Upload HTML**
3. Upload the `canvas_ad_html.html` file
4. Upload the `facebook_ad_styles.css` file when prompted for CSS
5. Replace placeholder images with your actual image assets
6. Update all URLs to point to your actual website pages
7. Save the creative with a descriptive name (e.g., "Sound Factory Main Feed Ad")

### 3. Import Carousel Ad

1. Select **Facebook Carousel** as the placement
2. Click **Create** > **Upload HTML**
3. Upload each item from `carousel_ad_items.html` as separate cards
4. Upload the `facebook_ad_styles.css` file when prompted for CSS
5. Replace placeholder images with your actual image assets
6. Update all URLs to point to your actual website pages
7. Save the creative with a descriptive name (e.g., "Sound Factory Venue Carousel")

### 4. Import Collection Ad

1. Select **Facebook Collection** as the placement
2. Click **Create** > **Upload HTML**
3. Upload the `collection_ad.html` file
4. Upload the `facebook_ad_styles.css` file when prompted for CSS
5. Replace placeholder images with your actual image assets
6. Update all URLs to point to your actual website pages
7. Save the creative with a descriptive name (e.g., "Sound Factory Experience Collection")

### 5. Import Dynamic Ad

1. Select **Facebook Feed** as the placement
2. Click **Create** > **Upload HTML**
3. Upload the `dynamic_ad.html` file
4. Upload the `facebook_ad_styles.css` file when prompted for CSS
5. Replace placeholder images with your actual image assets
6. Update all URLs to point to your actual website pages
7. Save the creative with a descriptive name (e.g., "Sound Factory Dynamic Social Proof Ad")

## Setting Up Campaign Structure

Follow the campaign structure outlined in `sound_factory_facebook_campaign_structure.js`:

### 1. Create Campaigns

1. In Ads Manager, click **Create** to start a new campaign
2. Set up the following campaigns:
   - **Awareness & Brand Building Campaign** (Brand Awareness objective)
   - **Immersive Experience Campaign** (Engagement objective)
   - **Event Promotion Campaign** (Conversions objective)
   - **AR Experience Campaign** (App Installs objective for AR effects)

### 2. Set Up Ad Sets

For each campaign, create the ad sets as specified in the campaign structure:

1. **Awareness & Brand Building Ad Sets:**
   - NYC Nightlife Enthusiasts
   - Electronic Music Fans
   - Nostalgic Audience

2. **Immersive Experience Ad Sets:**
   - Engaged Audiences
   - Lookalike Audiences

3. **Event Promotion Ad Sets:**
   - Website Visitors
   - VIP Table Prospects
   - Abandoned Cart

4. **AR Experience Ad Sets:**
   - AR Target Audience

### 3. Create Audiences

Use the audience targeting strategy from `sound_factory_audience_targeting_strategy.md` to create:

1. **Custom Audiences:**
   - Website visitors (all, high-intent, abandoned cart)
   - Engagement audiences (page, video, lead form)
   - Customer list audiences (past purchasers, email subscribers)

2. **Lookalike Audiences:**
   - Based on purchasers
   - Based on high-value customers
   - Based on engaged users

## Implementing Dynamic Content

### 1. Set Up Dynamic Parameters

For the dynamic ad, you need to set up parameters that will be dynamically populated:

1. Go to your ad in Ads Manager
2. In the ad creation interface, find the **Customize Text** option
3. Add the following parameters:
   - `{{active_visitors}}` - Connect to your real-time website visitor API
   - `{{tables_remaining}}` - Connect to your inventory management system
   - `{{tickets_remaining}}` - Connect to your ticketing system
   - `{{recent_purchase}}` - Connect to your purchase activity feed
   - `{{days}}`, `{{hours}}`, `{{minutes}}`, `{{seconds}}` - Set up countdown to event date

### 2. Create a Product Feed (for Dynamic Ads)

1. Prepare a CSV file with your table packages and ticket types
2. Include columns for: id, title, description, image_url, price, url, availability
3. Go to **Catalog Manager** > **Data Sources** > **Add Data Source**
4. Upload your CSV file and set up a schedule for regular updates

### 3. Connect Dynamic Creative to Catalog

1. In your ad set, enable **Dynamic Creative**
2. Connect the ad to your "Sound Factory Events and Tables" catalog
3. Set up rules for which products to show based on user behavior

## Tracking & Conversion Setup

Implement the tracking code from `sound_factory_tracking_conversion_setup.js`:

### 1. Base Pixel Implementation

Add the Facebook Pixel base code to all pages of the Sound Factory website:

```html
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

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none" 
     src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
```

### 2. Event Tracking Implementation

Add specific event tracking code to key pages:

1. **Tables Page:**
   - ViewContent event when viewing table packages
   - AddToCart event when selecting a table
   - InitiateCheckout event when beginning reservation process
   - Purchase event when completing a table reservation

2. **Tickets Page:**
   - ViewContent event when viewing ticket types
   - AddToCart event when adding tickets to cart
   - InitiateCheckout event when proceeding to checkout
   - Purchase event when completing ticket purchase

### 3. Conversion API Setup

For server-side tracking, implement the Conversion API:

1. Set up a server endpoint to receive purchase events
2. Implement the server-side code from `sound_factory_tracking_conversion_setup.js`
3. Test server-side events using the Facebook Events Manager Test Events tool

## Testing & Launching

### 1. Preview Ads

1. In Creative Hub, preview all ad creatives on different devices
2. Check that all links work correctly
3. Verify that dynamic elements display properly
4. Test the user journey from ad to website

### 2. Set Up A/B Testing

Follow the A/B testing plan from `sound_factory_facebook_ab_testing_plan.md`:

1. Create A/B tests for key variables:
   - Video length
   - Creative format
   - Ad copy length
   - Call-to-action text
   - Visual style

2. Set up proper test parameters:
   - Equal budget allocation
   - Sufficient test duration (7-14 days)
   - Statistical significance thresholds

### 3. Launch Campaigns

1. Start with a small budget to test performance
2. Monitor initial results closely
3. Make adjustments based on early performance data
4. Scale successful campaigns gradually

## Troubleshooting

### Common Issues and Solutions

1. **HTML/CSS Not Importing Correctly:**
   - Ensure HTML is valid and properly formatted
   - Check that all referenced images have valid URLs
   - Verify CSS syntax is correct

2. **Dynamic Parameters Not Working:**
   - Check API connections for dynamic content
   - Verify parameter syntax in ad creative
   - Test with static values first, then implement dynamic values

3. **Tracking Not Recording Events:**
   - Verify pixel is installed correctly
   - Use Facebook Pixel Helper Chrome extension to debug
   - Check for JavaScript errors in browser console
   - Verify event parameters match expected format

4. **Ad Rejection Issues:**
   - Review Facebook's advertising policies
   - Check text-to-image ratio (must be less than 20% text)
   - Ensure all claims are substantiated
   - Remove any prohibited content

For additional assistance, contact Facebook Business Support or the NinjaTech AI team.