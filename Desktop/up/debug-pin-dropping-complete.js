// Complete Pin Dropping Debug Script
// Run this in browser console to debug pin dropping issues

console.log('🔍 Starting comprehensive pin dropping debug...');

// 1. Check if click event listeners are attached to floor element
function checkClickListeners() {
    console.log('\n1️⃣ Checking click event listeners...');
    
    // Check for pinCanvas
    const pinCanvas = document.querySelector('.pin-canvas');
    if (pinCanvas) {
        console.log('✅ Found pinCanvas element');
        
        // Check if it has click listeners
        const hasClickListeners = pinCanvas.onclick !== null || 
                                 pinCanvas.addEventListener.toString().includes('click');
        console.log('📌 Has click listeners:', hasClickListeners);
        
        // Test click manually
        pinCanvas.style.border = '2px solid red';
        console.log('🎯 PinCanvas element highlighted with red border');
    } else {
        console.log('❌ pinCanvas element not found');
    }
    
    // Check for floor elements
    const floorElements = document.querySelectorAll('[id*="floor"], [class*="floor"]');
    console.log('🏢 Found floor elements:', floorElements.length);
    floorElements.forEach((el, i) => {
        console.log(`   ${i + 1}. ${el.tagName}#${el.id}.${el.className}`);
    });
}

// 2. Verify Supabase connection is initialized
function checkSupabaseConnection() {
    console.log('\n2️⃣ Checking Supabase connection...');
    
    if (typeof window.supabase !== 'undefined') {
        console.log('✅ Supabase client exists');
        
        // Check if it's properly initialized
        if (window.supabase && typeof window.supabase.from === 'function') {
            console.log('✅ Supabase client is functional');
            
            // Test connection
            window.supabase.from('pins').select('*').limit(1).then(result => {
                if (result.error) {
                    console.log('❌ Supabase connection error:', result.error);
                } else {
                    console.log('✅ Supabase connection working');
                }
            }).catch(err => {
                console.log('❌ Supabase connection failed:', err);
            });
        } else {
            console.log('❌ Supabase client not properly initialized');
        }
    } else {
        console.log('❌ Supabase client not found');
        console.log('💡 Make sure Supabase script is loaded and configured');
    }
}

// 3. Check console for any errors
function checkConsoleErrors() {
    console.log('\n3️⃣ Checking for console errors...');
    
    // Override console.error to catch errors
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Check for common error patterns
    const errorPatterns = [
        'CORS',
        'Network',
        'Failed to fetch',
        'Supabase',
        'pinCanvas',
        'addEventListener',
        'undefined',
        'null'
    ];
    
    console.log('🔍 Looking for error patterns:', errorPatterns);
    console.log('📊 Current errors captured:', errors.length);
    
    if (errors.length > 0) {
        console.log('❌ Errors found:', errors);
    } else {
        console.log('✅ No errors captured yet');
    }
}

// 4. Make sure the floor div exists and is clickable
function checkFloorElements() {
    console.log('\n4️⃣ Checking floor elements...');
    
    const floorSelectors = [
        '.pin-canvas',
        '#pinCanvas', 
        '.floor',
        '#floor',
        '.floor-container',
        '#floorContainer',
        '.dancefloor',
        '#dancefloor'
    ];
    
    floorSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`✅ Found: ${selector}`);
            console.log(`   - Clickable: ${element.style.pointerEvents !== 'none'}`);
            console.log(`   - Visible: ${element.offsetWidth > 0 && element.offsetHeight > 0}`);
            console.log(`   - Position: ${element.offsetLeft}, ${element.offsetTop}`);
            console.log(`   - Size: ${element.offsetWidth}x${element.offsetHeight}`);
        } else {
            console.log(`❌ Not found: ${selector}`);
        }
    });
}

// 5. Test with a simple console.log on click first
function addTestClickListeners() {
    console.log('\n5️⃣ Adding test click listeners...');
    
    const testElements = [
        document.querySelector('.pin-canvas'),
        document.querySelector('#pinCanvas'),
        document.querySelector('.floor'),
        document.querySelector('#floor'),
        document.body
    ].filter(Boolean);
    
    testElements.forEach((element, i) => {
        const testHandler = (e) => {
            console.log(`🎯 Test click ${i + 1} detected on:`, element);
            console.log('   - Event target:', e.target);
            console.log('   - Event coordinates:', e.clientX, e.clientY);
            console.log('   - App mode:', window.appMode);
            console.log('   - SMS verified:', window.smsGate?.isVerified);
            console.log('   - Current user:', window.currentUser);
        };
        
        element.addEventListener('click', testHandler);
        console.log(`✅ Added test listener to:`, element);
    });
}

// 6. Check CORS settings
function checkCORSSettings() {
    console.log('\n6️⃣ Checking CORS settings...');
    
    // Test a simple fetch to see if CORS is working
    fetch('https://your-project.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
            'apikey': 'your-anon-key-here'
        }
    }).then(response => {
        console.log('✅ CORS test successful:', response.status);
    }).catch(error => {
        console.log('❌ CORS test failed:', error.message);
        console.log('💡 Check your Supabase CORS settings');
    });
}

// 7. Check app mode and user state
function checkAppState() {
    console.log('\n7️⃣ Checking app state...');
    
    console.log('📱 App mode:', window.appMode);
    console.log('🔐 SMS verified:', window.smsGate?.isVerified);
    console.log('👤 Current user:', window.currentUser);
    console.log('📍 Has dropped pin:', window.currentUser?.hasDroppedPin);
    console.log('🎯 Pin system:', window.pinSystem);
    console.log('🌐 WebSocket:', window.soundFactoryWS?.isConnected());
}

// 8. Test pin creation manually
function testPinCreation() {
    console.log('\n8️⃣ Testing pin creation manually...');
    
    if (window.pinSystem && typeof window.pinSystem.createPin === 'function') {
        console.log('✅ Pin system found, testing creation...');
        
        // Try to create a test pin
        try {
            window.pinSystem.createPin('test', {
                color: '#ff6b00',
                emoji: '🧪'
            });
            console.log('✅ Test pin creation successful');
        } catch (error) {
            console.log('❌ Test pin creation failed:', error);
        }
    } else {
        console.log('❌ Pin system not found or createPin method missing');
    }
}

// 9. Fix common issues
function fixCommonIssues() {
    console.log('\n9️⃣ Attempting to fix common issues...');
    
    // Fix 1: Ensure app mode is set
    if (!window.appMode) {
        window.appMode = 'drop';
        console.log('🔧 Set app mode to "drop"');
    }
    
    // Fix 2: Create mock user if needed
    if (!window.currentUser) {
        window.currentUser = {
            id: 'test_user_' + Date.now(),
            name: 'Test User',
            hasDroppedPin: false
        };
        console.log('🔧 Created test user');
    }
    
    // Fix 3: Create mock SMS gate if needed
    if (!window.smsGate) {
        window.smsGate = {
            isVerified: true,
            phoneNumber: '+1234567890'
        };
        console.log('🔧 Created mock SMS gate');
    }
    
    // Fix 4: Ensure pin system is initialized
    if (!window.pinSystem) {
        console.log('🔧 Pin system not found, attempting to initialize...');
        // This would need to be implemented based on your pin system
    }
}

// Run all checks
function runCompleteDebug() {
    console.log('🚀 Running complete pin dropping debug...');
    
    checkClickListeners();
    checkSupabaseConnection();
    checkConsoleErrors();
    checkFloorElements();
    addTestClickListeners();
    checkCORSSettings();
    checkAppState();
    testPinCreation();
    fixCommonIssues();
    
    console.log('\n✅ Debug complete! Check the results above.');
    console.log('💡 If issues persist, check:');
    console.log('   1. Supabase configuration');
    console.log('   2. Network connectivity');
    console.log('   3. Browser console for errors');
    console.log('   4. Element visibility and positioning');
}

// Auto-run debug
runCompleteDebug();

// Export for manual use
window.debugPinDropping = {
    runCompleteDebug,
    checkClickListeners,
    checkSupabaseConnection,
    checkConsoleErrors,
    checkFloorElements,
    addTestClickListeners,
    checkCORSSettings,
    checkAppState,
    testPinCreation,
    fixCommonIssues
};


