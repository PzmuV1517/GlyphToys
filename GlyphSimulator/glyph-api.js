// Glyph Matrix API Simulator
// This mimics the actual Nothing Phone Glyph Matrix API

// Constants from the real API
const Glyph = {
    DEVICE_23112: "Glyph.DEVICE_23112" // Phone 3 identifier
};

// Event constants from GlyphToy
const GlyphToy = {
    MSG_GLYPH_TOY: 1,
    MSG_GLYPH_TOY_DATA: "glyph_toy_data",
    EVENT_CHANGE: "change",
    EVENT_AOD: "aod",
    EVENT_ACTION_DOWN: "action_down",
    EVENT_ACTION_UP: "action_up"
};

// Global simulator state
let simulatorState = {
    matrix: new Array(625).fill(0), // 25x25 = 625 LEDs
    activeToys: [],
    currentToy: null,
    isRegistered: false,
    callbacks: {},
    eventHandlers: []
};

// Utility class for matrix operations
class GlyphMatrixUtils {
    static drawableToBitmap(drawable) {
        // Simulate converting drawable to bitmap
        // For web simulation, we'll create a simple pattern
        if (typeof drawable === 'string') {
            return this.createTextBitmap(drawable);
        }
        return this.createSampleBitmap();
    }
    
    static createSampleBitmap(pattern = 'circle') {
        const size = 25;
        const bitmap = new Array(size * size).fill(0);
        
        switch (pattern) {
            case 'circle':
                const center = Math.floor(size / 2);
                const radius = 8;
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
                        if (distance <= radius) {
                            bitmap[y * size + x] = 255;
                        }
                    }
                }
                break;
                
            case 'cross':
                const centerX = Math.floor(size / 2);
                const centerY = Math.floor(size / 2);
                for (let i = 0; i < size; i++) {
                    bitmap[centerY * size + i] = 255; // Horizontal line
                    bitmap[i * size + centerX] = 255; // Vertical line
                }
                break;
                
            case 'diamond':
                const centerD = Math.floor(size / 2);
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const distance = Math.abs(x - centerD) + Math.abs(y - centerD);
                        if (distance <= 8) {
                            bitmap[y * size + x] = 255;
                        }
                    }
                }
                break;
        }
        
        return bitmap;
    }
    
    static createTextBitmap(text) {
        // Simple text rendering for 5x7 characters
        const charWidth = 5;
        const charHeight = 7;
        const size = 25;
        const bitmap = new Array(size * size).fill(0);
        
        // Simple font patterns for basic characters
        const fontPatterns = {
            'A': [
                [0,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,1],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [0,0,0,0,0]
            ],
            'B': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [0,0,0,0,0]
            ],
            // Add more characters as needed
            ' ': [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ]
        };
        
        const startX = Math.floor((size - text.length * charWidth) / 2);
        const startY = Math.floor((size - charHeight) / 2);
        
        for (let i = 0; i < text.length && i * charWidth < size; i++) {
            const char = text[i].toUpperCase();
            const pattern = fontPatterns[char] || fontPatterns[' '];
            
            for (let y = 0; y < charHeight && startY + y < size; y++) {
                for (let x = 0; x < charWidth && startX + i * charWidth + x < size; x++) {
                    if (pattern[y][x]) {
                        bitmap[(startY + y) * size + (startX + i * charWidth + x)] = 255;
                    }
                }
            }
        }
        
        return bitmap;
    }
}

// Main GlyphMatrixManager class
class GlyphMatrixManager {
    constructor() {
        this.callback = null;
        this.isInitialized = false;
        this.registeredTarget = null;
    }
    
    init(callback) {
        this.callback = callback;
        this.isInitialized = true;
        simulatorState.callbacks.manager = callback;
        
        // Simulate async initialization
        setTimeout(() => {
            if (callback) callback();
            console.log('GlyphMatrixManager initialized');
        }, 100);
    }
    
    unInit() {
        this.isInitialized = false;
        this.callback = null;
        this.registeredTarget = null;
        simulatorState.isRegistered = false;
        simulatorState.matrix.fill(0);
        this.updateDisplay();
        console.log('GlyphMatrixManager uninitialized');
    }
    
    register(target) {
        if (!this.isInitialized) {
            console.error('GlyphMatrixManager not initialized');
            return;
        }
        
        this.registeredTarget = target;
        simulatorState.isRegistered = true;
        console.log(`Registered for target: ${target}`);
    }
    
    setMatrixFrame(data) {
        if (!simulatorState.isRegistered) {
            console.error('GlyphMatrixManager not registered');
            return;
        }
        
        let colorArray;
        
        // Handle both frame objects and direct arrays
        if (data && typeof data.render === 'function') {
            colorArray = data.render();
        } else if (Array.isArray(data)) {
            colorArray = data;
        } else {
            console.error('Invalid matrix data. Expected array or GlyphMatrixFrame');
            return;
        }
        
        if (!Array.isArray(colorArray) || colorArray.length !== 625) {
            console.error('Invalid color array. Expected 625 elements (25x25)');
            return;
        }
        
        simulatorState.matrix = [...colorArray];
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update the visual matrix in the simulator
        const matrixElement = document.getElementById('glyphMatrix');
        if (!matrixElement) {
            console.warn('Matrix element not found - display not ready yet');
            return;
        }
        
        // Ensure we have the right number of LED elements
        if (matrixElement.children.length !== 625) {
            console.warn('Matrix not properly initialized - wrong number of LEDs');
            return;
        }
        
        const leds = matrixElement.children;
        let activeLeds = 0;
        let totalBrightness = 0;
        
        for (let i = 0; i < Math.min(simulatorState.matrix.length, leds.length); i++) {
            const brightness = simulatorState.matrix[i];
            const led = leds[i];
            
            if (brightness > 0) {
                led.classList.add('active');
                led.style.backgroundColor = '#ffffff';
                led.style.opacity = '1';
                led.style.border = 'none';
                activeLeds++;
                totalBrightness += brightness;
            } else {
                led.classList.remove('active');
                led.style.backgroundColor = '#0a0a0a';
                led.style.opacity = '1';
                led.style.border = 'none';
            }
        }
        
        // Update info display
        const activeLedsElement = document.getElementById('activeLeds');
        const avgBrightnessElement = document.getElementById('avgBrightness');
        
        if (activeLedsElement) {
            activeLedsElement.textContent = activeLeds;
        }
        if (avgBrightnessElement) {
            avgBrightnessElement.textContent = activeLeds > 0 ? Math.round(totalBrightness / activeLeds) : 0;
        }
        
        console.log(`Matrix updated: ${activeLeds} active LEDs`);
    }
}

// GlyphMatrixObject class
class GlyphMatrixObject {
    constructor(builder) {
        this.imageSource = builder.imageSource;
        this.text = builder.text;
        this.positionX = builder.positionX;
        this.positionY = builder.positionY;
        this.orientation = builder.orientation;
        this.scale = builder.scale;
        this.brightness = builder.brightness;
    }
    
    getImageSource() { return this.imageSource; }
    getPositionX() { return this.positionX; }
    getPositionY() { return this.positionY; }
    getOrientation() { return this.orientation; }
    getScale() { return this.scale; }
    getBrightness() { return this.brightness; }
}

// GlyphMatrixObject.Builder class
GlyphMatrixObject.Builder = class {
    constructor() {
        this.imageSource = null;
        this.text = null;
        this.positionX = 0;
        this.positionY = 0;
        this.orientation = 0;
        this.scale = 100;
        this.brightness = 255;
    }
    
    setImageSource(imageSource) {
        this.imageSource = imageSource;
        return this;
    }
    
    setText(text) {
        this.text = text;
        return this;
    }
    
    setPosition(x, y) {
        this.positionX = x;
        this.positionY = y;
        return this;
    }
    
    setOrientation(orientation) {
        this.orientation = orientation % 360;
        return this;
    }
    
    setBrightness(brightness) {
        this.brightness = Math.max(0, Math.min(255, brightness));
        return this;
    }
    
    setScale(scale) {
        this.scale = Math.max(0, Math.min(200, scale));
        return this;
    }
    
    setReverse(reverse) {
        // For compatibility with examples
        return this;
    }
    
    build() {
        return new GlyphMatrixObject(this);
    }
};

// GlyphMatrixFrame class
class GlyphMatrixFrame {
    constructor(builder) {
        this.topLayer = builder.topLayer;
        this.midLayer = builder.midLayer;
        this.lowLayer = builder.lowLayer;
        this.size = 25;
    }
    
    render() {
        const matrix = new Array(this.size * this.size).fill(0);
        
        // Render layers in order: low, mid, top
        this.renderLayer(matrix, this.lowLayer);
        this.renderLayer(matrix, this.midLayer);
        this.renderLayer(matrix, this.topLayer);
        
        return matrix;
    }
    
    renderLayer(matrix, object) {
        if (!object) return;
        
        let bitmap;
        if (object.text) {
            bitmap = GlyphMatrixUtils.createTextBitmap(object.text);
        } else if (object.imageSource) {
            bitmap = object.imageSource;
        } else {
            return;
        }
        
        // Apply transformations
        bitmap = this.applyScale(bitmap, object.scale);
        bitmap = this.applyRotation(bitmap, object.orientation);
        
        // Render to matrix with position offset
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const sourceX = x - object.positionX;
                const sourceY = y - object.positionY;
                
                if (sourceX >= 0 && sourceX < this.size && sourceY >= 0 && sourceY < this.size) {
                    const sourceIndex = sourceY * this.size + sourceX;
                    const targetIndex = y * this.size + x;
                    
                    if (bitmap[sourceIndex] > 0) {
                        const brightness = Math.round((bitmap[sourceIndex] / 255) * object.brightness);
                        matrix[targetIndex] = Math.max(matrix[targetIndex], brightness);
                    }
                }
            }
        }
    }
    
    applyScale(bitmap, scale) {
        if (scale === 100) return bitmap;
        
        const scaleFactor = scale / 100;
        const newBitmap = new Array(this.size * this.size).fill(0);
        const center = Math.floor(this.size / 2);
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const scaledX = Math.round((x - center) / scaleFactor + center);
                const scaledY = Math.round((y - center) / scaleFactor + center);
                
                if (scaledX >= 0 && scaledX < this.size && scaledY >= 0 && scaledY < this.size) {
                    newBitmap[y * this.size + x] = bitmap[scaledY * this.size + scaledX];
                }
            }
        }
        
        return newBitmap;
    }
    
    applyRotation(bitmap, degrees) {
        if (degrees === 0) return bitmap;
        
        const radians = (degrees * Math.PI) / 180;
        const newBitmap = new Array(this.size * this.size).fill(0);
        const center = Math.floor(this.size / 2);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const centerX = x - center;
                const centerY = y - center;
                
                const rotatedX = Math.round(centerX * cos - centerY * sin + center);
                const rotatedY = Math.round(centerX * sin + centerY * cos + center);
                
                if (rotatedX >= 0 && rotatedX < this.size && rotatedY >= 0 && rotatedY < this.size) {
                    newBitmap[y * this.size + x] = bitmap[rotatedY * this.size + rotatedX];
                }
            }
        }
        
        return newBitmap;
    }
}

// GlyphMatrixFrame.Builder class
GlyphMatrixFrame.Builder = class {
    constructor() {
        this.topLayer = null;
        this.midLayer = null;
        this.lowLayer = null;
    }
    
    addTop(object) {
        this.topLayer = object;
        return this;
    }
    
    addMid(object) {
        this.midLayer = object;
        return this;
    }
    
    addLow(object) {
        this.lowLayer = object;
        return this;
    }
    
    build(context) {
        // Context parameter for compatibility, not used in web version
        return new GlyphMatrixFrame(this);
    }
};

// Event simulation functions
function triggerGlyphEvent(eventType) {
    console.log(`Glyph Event: ${eventType}`);
    
    // Trigger any registered event handlers
    simulatorState.eventHandlers.forEach(handler => {
        if (typeof handler === 'function') {
            handler(eventType);
        }
    });
    
    // Update UI to show button press with different durations
    const button = document.getElementById('glyphButton');
    const indicator = document.getElementById('buttonIndicator');
    
    if (button && indicator) {
        button.classList.add('pressed');
        indicator.classList.add('active');
        
        let duration;
        switch (eventType) {
            case 'short_press':
                duration = 150;
                break;
            case GlyphToy.EVENT_CHANGE:
                duration = 800;
                break;
            case GlyphToy.EVENT_ACTION_DOWN:
                duration = 100;
                break;
            case GlyphToy.EVENT_ACTION_UP:
                duration = 100;
                break;
            default:
                duration = 200;
        }
        
        setTimeout(() => {
            button.classList.remove('pressed');
            indicator.classList.remove('active');
        }, duration);
    }
}

// Register event handler (for toy services)
function registerGlyphEventHandler(handler) {
    simulatorState.eventHandlers.push(handler);
}

// Console logging override for simulator
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
};

function logToSimulator(message, type = 'log') {
    originalConsole[type](message);
    
    const consoleElement = document.getElementById('console');
    if (consoleElement) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = type;
        logEntry.textContent = `[${timestamp}] ${message}`;
        consoleElement.appendChild(logEntry);
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }
}

// Override console methods
console.log = (message) => logToSimulator(message, 'log');
console.error = (message) => logToSimulator(message, 'error');
console.warn = (message) => logToSimulator(message, 'warning');
console.info = (message) => logToSimulator(message, 'info');

// Global function to update display (for external calls)
function updateGlyphDisplay() {
    const matrixElement = document.getElementById('glyphMatrix');
    if (!matrixElement) {
        console.warn('Matrix element not found - display not ready yet');
        return;
    }
    
    // Ensure we have the right number of LED elements
    if (matrixElement.children.length !== 625) {
        console.warn('Matrix not properly initialized - wrong number of LEDs');
        return;
    }
    
    const leds = matrixElement.children;
    let activeLeds = 0;
    let totalBrightness = 0;
    
    for (let i = 0; i < Math.min(simulatorState.matrix.length, leds.length); i++) {
        const brightness = simulatorState.matrix[i];
        const led = leds[i];
        
        if (brightness > 0) {
            led.classList.add('active');
            led.style.backgroundColor = '#ffffff';
            led.style.opacity = '1';
            led.style.border = 'none';
            activeLeds++;
            totalBrightness += brightness;
        } else {
            led.classList.remove('active');
            led.style.backgroundColor = '#0a0a0a';
            led.style.opacity = '1';
            led.style.border = 'none';
        }
    }
    
    // Update info display
    const activeLedsElement = document.getElementById('activeLeds');
    const avgBrightnessElement = document.getElementById('avgBrightness');
    
    if (activeLedsElement) {
        activeLedsElement.textContent = activeLeds;
    }
    if (avgBrightnessElement) {
        avgBrightnessElement.textContent = activeLeds > 0 ? Math.round(totalBrightness / activeLeds) : 0;
    }
    
    console.log(`Matrix updated: ${activeLeds} active LEDs`);
}
