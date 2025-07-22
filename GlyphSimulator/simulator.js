// Simulator UI and interaction handling

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGlyphMatrix();
    setupEventHandlers();
    setupButtonInteractions();
    loadWelcomeMessage();
});

// Initialize the 25x25 LED matrix display
function initializeGlyphMatrix() {
    const matrixElement = document.getElementById('glyphMatrix');
    
    // Clear any existing LEDs
    matrixElement.innerHTML = '';
    
    // Create 625 LED elements (25x25)
    for (let i = 0; i < 625; i++) {
        const led = document.createElement('div');
        led.className = 'led';
        led.dataset.index = i;
        led.style.backgroundColor = '#0a0a0a';
        led.style.opacity = '1';
        matrixElement.appendChild(led);
    }
    
    console.log('Glyph Matrix initialized with 625 LEDs');
    
    // Initialize the display
    updateGlyphDisplay();
}

// Setup event handlers for the simulator controls
function setupEventHandlers() {
    // Code execution
    document.getElementById('runCode').addEventListener('click', executeCode);
    
    const stopButton = document.getElementById('stopCode');
    stopButton.addEventListener('click', stopCode);
    // Emergency stop on double-click
    stopButton.addEventListener('dblclick', emergencyStop);
    
    document.getElementById('clearMatrix').addEventListener('click', clearMatrix);
    document.getElementById('clearConsole').addEventListener('click', clearConsole);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            executeCode();
        }
        if (e.ctrlKey && e.key === 'Delete') {
            clearMatrix();
        }
        if (e.key === 'Escape') {
            stopCode();
        }
        // Emergency stop with Ctrl + Escape
        if (e.ctrlKey && e.key === 'Escape') {
            e.preventDefault();
            emergencyStop();
        }
    });
}

// Setup Glyph Button interactions
function setupButtonInteractions() {
    const shortPressBtn = document.getElementById('shortPress');
    const longPressBtn = document.getElementById('longPress');
    
    shortPressBtn.addEventListener('click', () => {
        triggerGlyphEvent('short_press');
    });
    
    longPressBtn.addEventListener('click', () => {
        triggerGlyphEvent(GlyphToy.EVENT_CHANGE);
    });
}

// Handle touch and hold for action down/up
let touchHoldTimeout;

function handleActionDown() {
    triggerGlyphEvent(GlyphToy.EVENT_ACTION_DOWN);
    
    // Keep button pressed visually while held
    const button = document.getElementById('glyphButton');
    const indicator = document.getElementById('buttonIndicator');
    
    if (button && indicator) {
        button.classList.add('pressed');
        indicator.classList.add('active');
    }
    
    // Clear any existing timeout
    if (touchHoldTimeout) {
        clearTimeout(touchHoldTimeout);
    }
}

function handleActionUp() {
    triggerGlyphEvent(GlyphToy.EVENT_ACTION_UP);
    
    // Release button visual state
    const button = document.getElementById('glyphButton');
    const indicator = document.getElementById('buttonIndicator');
    
    // Small delay before releasing to show the up event
    touchHoldTimeout = setTimeout(() => {
        if (button && indicator) {
            button.classList.remove('pressed');
            indicator.classList.remove('active');
        }
    }, 100);
}

// Global variables for code execution control
let runningAnimations = new Set();
let runningTimeouts = new Set();
let runningIntervals = new Set();
let isCodeRunning = false;
let codeExecutionContext = null;

// Store original functions
const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalClearTimeout = window.clearTimeout;
const originalClearInterval = window.clearInterval;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

// Execute user code
function executeCode() {
    const codeEditor = document.getElementById('codeEditor');
    const code = codeEditor.value;
    
    if (!code.trim()) {
        console.warn('No code to execute');
        return;
    }
    
    // Stop any existing code first
    stopCode();
    
    // Clear any cached managers or global state
    clearCodeCache();
    
    try {
        console.info('Executing code...');
        isCodeRunning = true;
        
        // Create a new execution context
        codeExecutionContext = {
            timeouts: new Set(),
            intervals: new Set(),
            animations: new Set()
        };
        
        // Override timing functions to track them
        window.setTimeout = function(callback, delay, ...args) {
            const wrappedCallback = function() {
                try {
                    if (isCodeRunning) {
                        callback.apply(this, args);
                    }
                } catch (error) {
                    console.error('Error in timeout callback:', error.message);
                }
                // Remove from tracking when done
                if (codeExecutionContext) {
                    codeExecutionContext.timeouts.delete(id);
                }
                runningTimeouts.delete(id);
            };
            
            const id = originalSetTimeout(wrappedCallback, delay);
            runningTimeouts.add(id);
            if (codeExecutionContext) {
                codeExecutionContext.timeouts.add(id);
            }
            return id;
        };
        
        window.setInterval = function(callback, delay, ...args) {
            const wrappedCallback = function() {
                try {
                    if (isCodeRunning) {
                        callback.apply(this, args);
                    } else {
                        // Stop interval if code is no longer running
                        window.clearInterval(id);
                    }
                } catch (error) {
                    console.error('Error in interval callback:', error.message);
                }
            };
            
            const id = originalSetInterval(wrappedCallback, delay);
            runningIntervals.add(id);
            if (codeExecutionContext) {
                codeExecutionContext.intervals.add(id);
            }
            return id;
        };
        
        window.requestAnimationFrame = function(callback) {
            const wrappedCallback = function(timestamp) {
                try {
                    if (isCodeRunning) {
                        callback(timestamp);
                    }
                } catch (error) {
                    console.error('Error in animation callback:', error.message);
                }
                // Remove from tracking when done
                if (codeExecutionContext) {
                    codeExecutionContext.animations.delete(id);
                }
                runningAnimations.delete(id);
            };
            
            const id = originalRequestAnimationFrame(wrappedCallback);
            runningAnimations.add(id);
            if (codeExecutionContext) {
                codeExecutionContext.animations.add(id);
            }
            return id;
        };
        
        // Override clear functions to update our tracking
        window.clearTimeout = function(id) {
            originalClearTimeout(id);
            runningTimeouts.delete(id);
            if (codeExecutionContext) {
                codeExecutionContext.timeouts.delete(id);
            }
        };
        
        window.clearInterval = function(id) {
            originalClearInterval(id);
            runningIntervals.delete(id);
            if (codeExecutionContext) {
                codeExecutionContext.intervals.delete(id);
            }
        };
        
        window.cancelAnimationFrame = function(id) {
            originalCancelAnimationFrame(id);
            runningAnimations.delete(id);
            if (codeExecutionContext) {
                codeExecutionContext.animations.delete(id);
            }
        };
        
        // Execute the code in the global scope with fresh context
        eval(code);
        console.log('Code executed successfully');
        
    } catch (error) {
        console.error(`Execution error: ${error.message}`);
        stopCode(); // Stop on error
    }
}

// Clear any cached code state
function clearCodeCache() {
    // Reset simulator state
    simulatorState.matrix.fill(0);
    simulatorState.activeToys = [];
    simulatorState.currentToy = null;
    simulatorState.isRegistered = false;
    simulatorState.callbacks = {};
    simulatorState.eventHandlers = [];
    
    // Clear any global variables that might be created by user code
    // Remove common variable names that user code might create
    const commonVars = ['manager', 'frame', 'circle', 'cross', 'diamond', 'object', 'toy', 'animation'];
    commonVars.forEach(varName => {
        try {
            if (window.hasOwnProperty(varName)) {
                delete window[varName];
            }
        } catch (e) {
            // Ignore errors for non-deletable properties
        }
    });
    
    // Clear matrix display
    updateGlyphDisplay();
    
    console.info('Code cache cleared, ready for fresh execution');
}

// Stop running code
function stopCode() {
    const hadRunningCode = isCodeRunning || runningTimeouts.size > 0 || runningIntervals.size > 0 || runningAnimations.size > 0;
    
    if (!hadRunningCode) {
        console.info('No code currently running');
        return;
    }
    
    console.info('Stopping running code...');
    
    // Mark as stopped first to prevent new operations
    isCodeRunning = false;
    
    // Clear all timeouts
    runningTimeouts.forEach(id => {
        try {
            originalClearTimeout(id);
        } catch (e) {
            // Ignore errors for already cleared timeouts
        }
    });
    runningTimeouts.clear();
    
    // Clear all intervals
    runningIntervals.forEach(id => {
        try {
            originalClearInterval(id);
        } catch (e) {
            // Ignore errors for already cleared intervals
        }
    });
    runningIntervals.clear();
    
    // Cancel all animation frames
    runningAnimations.forEach(id => {
        try {
            originalCancelAnimationFrame(id);
        } catch (e) {
            // Ignore errors for already cancelled frames
        }
    });
    runningAnimations.clear();
    
    // Clear execution context
    if (codeExecutionContext) {
        codeExecutionContext.timeouts.clear();
        codeExecutionContext.intervals.clear();
        codeExecutionContext.animations.clear();
        codeExecutionContext = null;
    }
    
    // Restore original functions
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.clearTimeout = originalClearTimeout;
    window.clearInterval = originalClearInterval;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    
    console.log('All running code stopped');
    
    // Force update display to show current state
    setTimeout(() => {
        updateGlyphDisplay();
    }, 100);
}

// Emergency stop function for cases where normal stop doesn't work
function emergencyStop() {
    console.warn('Emergency stop activated');
    
    // Force stop everything
    isCodeRunning = false;
    
    // Clear all possible timer IDs (brute force approach)
    for (let i = 1; i < 10000; i++) {
        try {
            originalClearTimeout(i);
            originalClearInterval(i);
            originalCancelAnimationFrame(i);
        } catch (e) {
            // Ignore errors
        }
    }
    
    // Reset all tracking
    runningTimeouts.clear();
    runningIntervals.clear();
    runningAnimations.clear();
    codeExecutionContext = null;
    
    // Restore original functions
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.clearTimeout = originalClearTimeout;
    window.clearInterval = originalClearInterval;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    
    // Clear code cache and reset state
    clearCodeCache();
    
    console.log('Emergency stop completed');
}

// Periodic cleanup function
function periodicCleanup() {
    if (!isCodeRunning) {
        // Clean up any stale references
        runningTimeouts.forEach(id => {
            try {
                originalClearTimeout(id);
            } catch (e) {}
        });
        runningIntervals.forEach(id => {
            try {
                originalClearInterval(id);
            } catch (e) {}
        });
        runningAnimations.forEach(id => {
            try {
                originalCancelAnimationFrame(id);
            } catch (e) {}
        });
        
        if (runningTimeouts.size > 0 || runningIntervals.size > 0 || runningAnimations.size > 0) {
            console.info('Cleaned up stale timer references');
            runningTimeouts.clear();
            runningIntervals.clear();
            runningAnimations.clear();
        }
    }
}

// Run cleanup every 5 seconds
setInterval(periodicCleanup, 5000);

// Clear the matrix display
function clearMatrix() {
    // Stop any running code first
    if (isCodeRunning) {
        stopCode();
    }
    
    // Clear the matrix and cache
    clearCodeCache();
    console.log('Matrix and cache cleared');
}

// Clear console output
function clearConsole() {
    const consoleElement = document.getElementById('console');
    consoleElement.innerHTML = '';
}

// Load welcome message
function loadWelcomeMessage() {
    setTimeout(() => {
        console.info('🔆 Glyph Matrix Simulator Ready');
        console.info('Use the example cards below or write your own code!');
        console.info('Shortcuts: Ctrl+Enter (run), Esc (stop), Ctrl+Esc (emergency stop)');
        console.info('Tip: Double-click Stop button for emergency stop');
        console.info('Try: testMatrix() to verify the display is working');
    }, 500);
}

// Simple test function to verify matrix is working
function testMatrix() {
    console.log('Testing matrix display...');
    
    // Create a simple test pattern
    const testPattern = new Array(625).fill(0);
    
    // Light up the corners
    testPattern[0] = 255;           // Top-left
    testPattern[24] = 255;          // Top-right  
    testPattern[600] = 255;         // Bottom-left
    testPattern[624] = 255;         // Bottom-right
    
    // Light up center
    testPattern[312] = 255;         // Center (12*25 + 12)
    
    // Update matrix state and display
    simulatorState.matrix = testPattern;
    updateGlyphDisplay();
    
    console.log('Test pattern displayed - you should see 5 bright LEDs');
}

// Load basic example code
function loadBasicExample() {
    const exampleCode = `// Basic Glyph Matrix Example
const manager = new GlyphMatrixManager();

// Initialize the manager
manager.init(() => {
    console.log('Manager initialized successfully!');
    
    // Register for Phone 3
    manager.register(Glyph.DEVICE_23112);
    
    // Create a simple circle object
    const circle = new GlyphMatrixObject.Builder()
        .setImageSource(GlyphMatrixUtils.createSampleBitmap('circle'))
        .setPosition(0, 0)
        .setBrightness(200)
        .setScale(100)
        .build();
    
    // Create frame and display
    const frame = new GlyphMatrixFrame.Builder()
        .addTop(circle)
        .build();
    
    manager.setMatrixFrame(frame);
    console.log('Circle displayed on matrix!');
    
    // Test with a simple pattern too
    setTimeout(() => {
        const testPattern = new Array(625).fill(0);
        // Create a cross pattern
        for (let i = 0; i < 25; i++) {
            testPattern[12 * 25 + i] = 150; // Horizontal line
            testPattern[i * 25 + 12] = 150; // Vertical line
        }
        manager.setMatrixFrame(testPattern);
        console.log('Cross pattern displayed!');
    }, 2000);
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Basic example loaded - click Run to execute');
}

// Load basic example code
function loadBasicExample() {
    const exampleCode = `// Basic Glyph Matrix Example
const manager = new GlyphMatrixManager();

// Initialize the manager
manager.init(() => {
    console.log('Manager initialized successfully!');
    
    // Register for Phone 3
    manager.register(Glyph.DEVICE_23112);
    
    // Create a simple circle object
    const circle = new GlyphMatrixObject.Builder()
        .setImageSource(GlyphMatrixUtils.createSampleBitmap('circle'))
        .setPosition(0, 0)
        .setBrightness(200)
        .setScale(100)
        .build();
    
    // Create frame and display
    const frame = new GlyphMatrixFrame.Builder()
        .addTop(circle)
        .build();
    
    manager.setMatrixFrame(frame);
    console.log('Circle displayed on matrix!');
    
    // Test with a simple pattern too
    setTimeout(() => {
        const testPattern = new Array(625).fill(0);
        // Create a cross pattern
        for (let i = 0; i < 25; i++) {
            testPattern[12 * 25 + i] = 150; // Horizontal line
            testPattern[i * 25 + 12] = 150; // Vertical line
        }
        manager.setMatrixFrame(testPattern);
        console.log('Cross pattern displayed!');
    }, 2000);
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Basic example loaded - click Run to execute');
}

// Example: Pulse effect
function loadPulseExample() {
    const exampleCode = `// Pulse Animation Example
const manager = new GlyphMatrixManager();
let pulseDirection = 1;
let currentBrightness = 50;

manager.init(() => {
    manager.register(Glyph.DEVICE_23112);
    
    function pulse() {
        currentBrightness += pulseDirection * 10;
        
        if (currentBrightness >= 255) {
            currentBrightness = 255;
            pulseDirection = -1;
        } else if (currentBrightness <= 50) {
            currentBrightness = 50;
            pulseDirection = 1;
        }
        
        const circle = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap('circle'))
            .setPosition(0, 0)
            .setBrightness(currentBrightness)
            .build();
        
        const frame = new GlyphMatrixFrame.Builder()
            .addTop(circle)
            .build();
        
        manager.setMatrixFrame(frame);
        
        setTimeout(pulse, 100);
    }
    
    pulse();
    console.log('Pulse animation started!');
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Pulse example loaded - click Run to execute');
}

// Example: Rotation effect
function loadRotateExample() {
    const exampleCode = `// Rotation Animation Example
const manager = new GlyphMatrixManager();
let rotation = 0;

manager.init(() => {
    manager.register(Glyph.DEVICE_23112);
    
    function rotate() {
        rotation = (rotation + 15) % 360;
        
        const cross = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap('cross'))
            .setPosition(0, 0)
            .setBrightness(200)
            .setOrientation(rotation)
            .build();
        
        const frame = new GlyphMatrixFrame.Builder()
            .addTop(cross)
            .build();
        
        manager.setMatrixFrame(frame);
        
        setTimeout(rotate, 200);
    }
    
    rotate();
    console.log('Rotation animation started!');
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Rotation example loaded - click Run to execute');
}

// Example: Text display
function loadTextExample() {
    const exampleCode = `// Text Display Example
const manager = new GlyphMatrixManager();

manager.init(() => {
    manager.register(Glyph.DEVICE_23112);
    
    const textObject = new GlyphMatrixObject.Builder()
        .setText("HI")
        .setPosition(0, 0)
        .setBrightness(255)
        .build();
    
    const frame = new GlyphMatrixFrame.Builder()
        .addTop(textObject)
        .build();
    
    manager.setMatrixFrame(frame);
    console.log('Text "HI" displayed on matrix!');
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Text example loaded - click Run to execute');
}

// Example: Multi-layer effects
function loadMultiLayerExample() {
    const exampleCode = `// Multi-Layer Animation Example
const manager = new GlyphMatrixManager();
let frame = 0;

manager.init(() => {
    manager.register(Glyph.DEVICE_23112);
    
    function animate() {
        frame++;
        
        // Background layer - pulsing circle
        const bgBrightness = 100 + Math.sin(frame * 0.1) * 50;
        const background = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap('circle'))
            .setPosition(0, 0)
            .setBrightness(Math.max(50, bgBrightness))
            .setScale(120)
            .build();
        
        // Middle layer - rotating diamond
        const diamond = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap('diamond'))
            .setPosition(0, 0)
            .setBrightness(180)
            .setOrientation(frame * 3)
            .setScale(80)
            .build();
        
        // Top layer - spinning cross
        const cross = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap('cross'))
            .setPosition(0, 0)
            .setBrightness(255)
            .setOrientation(frame * -5)
            .setScale(60)
            .build();
        
        const frameObj = new GlyphMatrixFrame.Builder()
            .addLow(background)
            .addMid(diamond)
            .addTop(cross)
            .build();
        
        manager.setMatrixFrame(frameObj);
        
        setTimeout(animate, 50);
    }
    
    animate();
    console.log('Multi-layer animation started!');
});`;

    document.getElementById('codeEditor').value = exampleCode;
    console.info('Multi-layer example loaded - click Run to execute');
}

// Interactive toy service example
function createInteractiveToy() {
    const manager = new GlyphMatrixManager();
    let state = 'idle';
    let counter = 0;
    
    // Register event handler for button interactions
    registerGlyphEventHandler((eventType) => {
        switch (eventType) {
            case GlyphToy.EVENT_CHANGE:
                counter++;
                state = 'active';
                updateToyDisplay();
                console.log(`Button pressed! Counter: ${counter}`);
                
                // Return to idle after 2 seconds
                setTimeout(() => {
                    state = 'idle';
                    updateToyDisplay();
                }, 2000);
                break;
                
            case GlyphToy.EVENT_ACTION_DOWN:
                state = 'pressed';
                updateToyDisplay();
                break;
                
            case GlyphToy.EVENT_ACTION_UP:
                state = 'idle';
                updateToyDisplay();
                break;
        }
    });
    
    function updateToyDisplay() {
        let brightness = 100;
        let pattern = 'circle';
        
        switch (state) {
            case 'active':
                brightness = 255;
                pattern = 'diamond';
                break;
            case 'pressed':
                brightness = 200;
                pattern = 'cross';
                break;
            default:
                brightness = 100;
                pattern = 'circle';
        }
        
        const object = new GlyphMatrixObject.Builder()
            .setImageSource(GlyphMatrixUtils.createSampleBitmap(pattern))
            .setPosition(0, 0)
            .setBrightness(brightness)
            .build();
        
        const frame = new GlyphMatrixFrame.Builder()
            .addTop(object)
            .build();
        
        manager.setMatrixFrame(frame);
    }
    
    manager.init(() => {
        manager.register(Glyph.DEVICE_23112);
        updateToyDisplay();
        console.log('Interactive toy service started! Try the button controls.');
    });
    
    return manager;
}

// Add interactive toy to examples
window.addEventListener('load', () => {
    // Add interactive example button
    const examplesGrid = document.querySelector('.examples-grid');
    if (examplesGrid) {
        const interactiveCard = document.createElement('button');
        interactiveCard.className = 'example-card';
        interactiveCard.innerHTML = `
            <h4>Interactive Toy</h4>
            <p>Button responsive</p>
        `;
        interactiveCard.onclick = () => {
            document.getElementById('codeEditor').value = `// Interactive Toy Service Example
${createInteractiveToy.toString()}

// Start the interactive toy
createInteractiveToy();`;
            console.info('Interactive toy example loaded - click Run and try the button controls!');
        };
        examplesGrid.appendChild(interactiveCard);
    }
});

// Utility functions for advanced effects
window.GlyphEffects = {
    fadeIn: function(manager, object, duration = 1000) {
        let startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const brightness = Math.round(255 * progress);
            
            const fadedObject = new GlyphMatrixObject.Builder()
                .setImageSource(object.getImageSource())
                .setPosition(object.getPositionX(), object.getPositionY())
                .setBrightness(brightness)
                .setScale(object.getScale())
                .setOrientation(object.getOrientation())
                .build();
            
            const frame = new GlyphMatrixFrame.Builder()
                .addTop(fadedObject)
                .build();
            
            manager.setMatrixFrame(frame);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    },
    
    spiral: function(manager, duration = 3000) {
        const startTime = Date.now();
        const center = 12;
        const maxRadius = 12;
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            const angle = progress * Math.PI * 8; // 4 full rotations
            const radius = progress * maxRadius;
            
            const x = Math.round(center + radius * Math.cos(angle));
            const y = Math.round(center + radius * Math.sin(angle));
            
            // Clear matrix
            manager.setMatrixFrame(new Array(625).fill(0));
            
            // Create single bright pixel
            const matrix = new Array(625).fill(0);
            if (x >= 0 && x < 25 && y >= 0 && y < 25) {
                matrix[y * 25 + x] = 255;
                
                // Add trail effect
                for (let i = 1; i <= 5; i++) {
                    const trailAngle = angle - i * 0.2;
                    const trailRadius = radius - i * 0.5;
                    if (trailRadius > 0) {
                        const trailX = Math.round(center + trailRadius * Math.cos(trailAngle));
                        const trailY = Math.round(center + trailRadius * Math.sin(trailAngle));
                        if (trailX >= 0 && trailX < 25 && trailY >= 0 && trailY < 25) {
                            matrix[trailY * 25 + trailX] = Math.max(matrix[trailY * 25 + trailX], 255 - i * 40);
                        }
                    }
                }
            }
            
            manager.setMatrixFrame(matrix);
            
            if (elapsed < duration) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
};

// Add spiral effect example
setTimeout(() => {
    const examplesGrid = document.querySelector('.examples-grid');
    if (examplesGrid) {
        const spiralCard = document.createElement('button');
        spiralCard.className = 'example-card';
        spiralCard.innerHTML = `
            <h4>Spiral Effect</h4>
            <p>Advanced animation</p>
        `;
        spiralCard.onclick = () => {
            document.getElementById('codeEditor').value = `// Spiral Effect Example
const manager = new GlyphMatrixManager();

manager.init(() => {
    manager.register(Glyph.DEVICE_23112);
    
    // Use the built-in spiral effect
    GlyphEffects.spiral(manager, 3000);
    
    console.log('Spiral effect started!');
});`;
            console.info('Spiral effect example loaded - click Run to execute');
        };
        examplesGrid.appendChild(spiralCard);
    }
}, 1000);
