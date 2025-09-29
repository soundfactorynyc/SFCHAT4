// Character System JavaScript for Astro
document.addEventListener('DOMContentLoaded', function() {
    const character = document.getElementById('character');
    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('knob');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const genderModal = document.getElementById('genderModal');
    const genderButtons = document.querySelectorAll('.gender-btn');
    const boundaryIndicator = document.getElementById('boundaryIndicator');
    
    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;
    let velocityX = 0;
    let velocityY = 0;
    let currentMode = 'walking';
    let isDragging = false;
    let joystickX = 0;
    let joystickY = 0;
    let userGender = null;
    let isAtBoundary = false;
    
    // Gender selection
    genderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            userGender = btn.dataset.gender;
            applyGenderStyles(userGender);
            genderModal.style.display = 'none';
        });
    });
    
    function applyGenderStyles(gender) {
        const head = character.querySelector('.head');
        const torso = character.querySelector('.torso');
        const arms = character.querySelectorAll('.arm-left-upper, .arm-right-upper');
        const legs = character.querySelectorAll('.leg-left-upper, .leg-right-upper');
        
        if (gender === 'female') {
            head.style.background = 'radial-gradient(circle at 40% 40%, #fce4ec, #e91e63)';
            torso.style.background = 'linear-gradient(180deg, #e91e63, #c2185b)';
            arms.forEach(a => a.style.background = 'linear-gradient(180deg, #e91e63, #c2185b)');
            legs.forEach(l => l.style.background = 'linear-gradient(180deg, #c2185b, #880e4f)');
        } else if (gender === 'transgender') {
            head.style.background = 'radial-gradient(circle at 40% 40%, #bbdefb, #2196f3)';
            torso.style.background = 'linear-gradient(180deg, #9c27b0, #673ab7)';
            arms.forEach(a => a.style.background = 'linear-gradient(180deg, #9c27b0, #673ab7)');
            legs.forEach(l => l.style.background = 'linear-gradient(180deg, #673ab7, #3f51b5)');
        } else { // Male (default)
            head.style.background = 'radial-gradient(circle at 40% 40%, #f4d1ae, #c4936d)';
            torso.style.background = 'linear-gradient(180deg, #333, #222)';
            arms.forEach(a => a.style.background = 'linear-gradient(180deg, #333, #2a2a2a)');
            legs.forEach(l => l.style.background = 'linear-gradient(180deg, #222, #1a1a1a)');
        }
    }
    
    // Mode switching
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            character.classList.remove('walking', 'runway', 'breakdance');
            currentMode = btn.dataset.mode;
            
            if (velocityX !== 0 || velocityY !== 0) {
                character.classList.add(currentMode);
            }
        });
    });
    
    // Joystick controls
    function handleJoystickStart(e) {
        isDragging = true;
        handleJoystickMove(e);
    }
    
    function handleJoystickMove(e) {
        if (!isDragging) return;
        
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2 - 20;
        
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        
        joystickX = deltaX / maxDistance;
        joystickY = deltaY / maxDistance;
        
        if (Math.abs(joystickX) > 0.1 || Math.abs(joystickY) > 0.1) {
            if (!character.classList.contains(currentMode)) {
                character.classList.add(currentMode);
            }
        } else {
            character.classList.remove('walking', 'runway', 'breakdance');
        }
    }
    
    function handleJoystickEnd() {
        isDragging = false;
        knob.style.transform = 'translate(-50%, -50%)';
        joystickX = 0;
        joystickY = 0;
        character.classList.remove('walking', 'runway', 'breakdance');
    }
    
    // Touch events
    joystick.addEventListener('touchstart', handleJoystickStart);
    joystick.addEventListener('touchmove', handleJoystickMove);
    joystick.addEventListener('touchend', handleJoystickEnd);
    
    // Mouse events
    joystick.addEventListener('mousedown', handleJoystickStart);
    document.addEventListener('mousemove', handleJoystickMove);
    document.addEventListener('mouseup', handleJoystickEnd);
    
    // Character animation loop
    function animateCharacter() {
        // Update velocity based on joystick - SLOWER
        const speed = currentMode === 'runway' ? 1 : currentMode === 'breakdance' ? 0.8 : 1.5;
        velocityX = joystickX * speed;
        velocityY = joystickY * speed;
        
        // Calculate new position
        let newX = posX + velocityX;
        let newY = posY + velocityY;
        
        // Boundary detection
        const currentFloor = document.querySelector('.floor.active');
        let hitBoundary = false;
        
        if (currentFloor) {
            const svg = currentFloor.querySelector('svg');
            if (svg) {
                const svgRect = svg.getBoundingClientRect();
                const minX = svgRect.left + 20;
                const maxX = svgRect.right - 20;
                const minY = svgRect.top + 20;
                const maxY = svgRect.bottom - 20;
                
                if (newX < minX || newX > maxX || newY < minY || newY > maxY) {
                    hitBoundary = true;
                }
                
                newX = Math.max(minX, Math.min(maxX, newX));
                newY = Math.max(minY, Math.min(maxY, newY));
            }
        } else {
            newX = Math.max(20, Math.min(window.innerWidth - 20, newX));
            newY = Math.max(60, Math.min(window.innerHeight - 30, newY));
        }
        
        posX = newX;
        posY = newY;
        
        // Update character position
        character.style.left = posX + 'px';
        character.style.top = posY + 'px';
        
        // Rotate character based on movement direction
        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
            const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI) + 90;
            if (currentMode !== 'breakdance') {
                character.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            }
        }
        
        // Boundary indicator
        if (hitBoundary && !isAtBoundary) {
            isAtBoundary = true;
            boundaryIndicator.classList.add('active');
            setTimeout(() => {
                boundaryIndicator.classList.remove('active');
                isAtBoundary = false;
            }, 1000);
        }
        
        requestAnimationFrame(animateCharacter);
    }
    
    // Start character animation
    animateCharacter();
    
    // Show gender modal on load
    window.addEventListener('load', () => {
        genderModal.style.display = 'flex';
    });
});

