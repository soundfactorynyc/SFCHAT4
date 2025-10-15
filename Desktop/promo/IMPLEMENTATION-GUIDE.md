# 🎯 SOUND FACTORY PROMOTER PROGRAM - IMPLEMENTATION GUIDE

## 📦 Files Created

1. **promoter-program-info.html** - Standalone full page (for testing/preview)
2. **promoter-program-modal.html** - Drop-in modal component (READY TO USE)

---

## 🚀 QUICK SETUP (Copy & Paste)

### Step 1: Add Modal to Your Site
Copy the ENTIRE contents of `promoter-program-modal.html` and paste it **right before the closing `</body>` tag** of your main HTML file.

```html
    <!-- Your existing content -->
    
    <!-- PASTE PROMOTER MODAL HERE -->
    <div id="promoterProgramModal">...</div>
    
</body>
</html>
```

### Step 2: Add Trigger Button
Add this button **anywhere** you want (nav bar, hero section, signup form, etc.):

```html
<button onclick="openPromoterModal()" class="learn-more-btn">
    Learn More
</button>
```

### Step 3: Style the Button (Optional)
Match your existing design or use this minimal style:

```css
.learn-more-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
}

.learn-more-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}
```

---

## 💡 USAGE EXAMPLES

### Example 1: Simple Text Link
```html
<a href="#" onclick="openPromoterModal(); return false;" style="color: white; text-decoration: underline;">
    How does this work?
</a>
```

### Example 2: Info Icon Button
```html
<button onclick="openPromoterModal()" style="
    background: none;
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
">
    ?
</button>
```

### Example 3: Auto-Open on Page Load (Optional)
```html
<script>
// Show modal automatically after 3 seconds
setTimeout(() => {
    openPromoterModal();
}, 3000);
</script>
```

### Example 4: Show Only for New Visitors
```html
<script>
// Only show once per visitor
if (!localStorage.getItem('seenPromoterModal')) {
    setTimeout(() => {
        openPromoterModal();
        localStorage.setItem('seenPromoterModal', 'true');
    }, 5000);
}
</script>
```

---

## 🎨 CUSTOMIZATION

### Change Colors
Find this line in the modal HTML:
```css
background: rgba(255, 255, 255, 0.02);
```

### Change Close Button Position
Find `.sf-modal-close` and adjust:
```css
.sf-modal-close {
    position: sticky;
    top: 20px;  /* Change this value */
}
```

### Remove Sections
Simply delete any `<div class="sf-section">...</div>` block you don't need.

---

## ✅ WHAT THIS MATCHES

Your existing design with:
- ✅ Pure black background (#000000)
- ✅ Minimal borders (1px, subtle)
- ✅ No rounded corners (border-radius: 0)
- ✅ Uppercase section headers
- ✅ System font stack
- ✅ Subtle hover states
- ✅ Clean table design
- ✅ Professional spacing

---

## 🔧 FUNCTIONS

### Open Modal
```javascript
openPromoterModal()
```

### Close Modal
```javascript
closePromoterModal()
```

### Check if Open
```javascript
document.getElementById('promoterProgramModal').style.display === 'block'
```

---

## 📱 MOBILE RESPONSIVE

The modal automatically adjusts for mobile:
- Smaller padding on mobile
- Reduced font sizes
- Optimized table layout
- Full-screen takeover on small screens

---

## 🎯 BEST PLACEMENT IDEAS

1. **Next to signup form** - "Learn about the program"
2. **In navigation** - "Program Details"
3. **After form submission** - Show automatically
4. **FAQ section** - "How it works"
5. **Email confirmation** - Link to open modal

---

## 🚀 READY TO GO

Everything is self-contained. No external dependencies. No jQuery. No frameworks. Just pure HTML/CSS/JS that works everywhere.

**Test it**: Open `promoter-program-info.html` in a browser to see the full page version first!