// Navigation System JavaScript for Astro
document.addEventListener('DOMContentLoaded', function() {
    const floors = [
        { id: 'floor-b', name: 'Basement' },
        { id: 'floor-mz', name: 'Mezzanine' },
        { id: 'floor-2', name: 'Second Floor' },
        { id: 'floor-mf', name: 'Main Floor' },
        { id: 'floor-3', name: 'Third Floor' }
    ];
    
    let currentFloorIndex = 3; // Start with Main Floor (index 3)
    const floorElements = document.querySelectorAll('.floor');
    const currentFloorIndicator = document.getElementById('currentFloor');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let isAnimating = false;
    
    // Initialize
    updateFloorDisplay();
    
    // Touch/swipe handling
    let startY = 0;
    let startX = 0;
    let isSwipe = false;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isSwipe = false;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isAnimating) return;
        
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = startY - currentY;
        const deltaX = startX - currentX;
        
        // Check if it's a vertical swipe
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
            isSwipe = true;
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (isAnimating || !isSwipe) return;
        
        const endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                nextFloor();
            } else {
                previousFloor();
            }
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            nextFloor();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            previousFloor();
        }
    });
    
    // Mouse wheel navigation
    document.addEventListener('wheel', (e) => {
        if (isAnimating) return;
        
        e.preventDefault();
        if (e.deltaY < 0) {
            nextFloor();
        } else {
            previousFloor();
        }
    });
    
    // Button navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (isAnimating) return;
            previousFloor();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (isAnimating) return;
            nextFloor();
        });
    }
    
    function nextFloor() {
        if (isAnimating) return;
        
        isAnimating = true;
        currentFloorIndex = (currentFloorIndex + 1) % floors.length;
        updateFloorDisplay();
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }
    
    function previousFloor() {
        if (isAnimating) return;
        
        isAnimating = true;
        currentFloorIndex = (currentFloorIndex - 1 + floors.length) % floors.length;
        updateFloorDisplay();
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }
    
    function updateFloorDisplay() {
        // Hide all floors
        floorElements.forEach(floor => {
            floor.classList.remove('active');
        });
        
        // Show current floor
        const currentFloor = document.getElementById(floors[currentFloorIndex].id);
        if (currentFloor) {
            currentFloor.classList.add('active');
        }
        
        // Update indicator
        if (currentFloorIndicator) {
            currentFloorIndicator.textContent = `${floors[currentFloorIndex].name} (${currentFloorIndex + 1}/5)`;
        }
    }
});

