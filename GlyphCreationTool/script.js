// Glyph Creation Tool JavaScript
class GlyphCreationTool {
    constructor() {
        this.canvas = document.getElementById('glyphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // Grid properties
        this.gridSize = 25;
        this.pixelSize = 20; // 500px / 25 = 20px per pixel
        this.glyphData = new Array(this.gridSize * this.gridSize).fill(0);
        
        // Tool properties
        this.brushSize = 1;
        this.brushType = 'square';
        this.brightness = 255;
        this.drawMode = 'paint';
        this.isDrawing = false;
        
        // Circle boundary (Nothing Phone 3 glyph matrix - 25px diameter circle touching all edges)
        this.centerX = 12;
        this.centerY = 12;
        this.radius = 12.5; // 25px diameter = 12.5px radius, centered at (12,12)
        
        this.initializeEventListeners();
        this.drawGrid();
        this.updatePreview();
        this.updateActivePixelCount();
    }
    
    initializeEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent right-click menu
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // Control events
        document.getElementById('brushType').addEventListener('change', (e) => {
            this.brushType = e.target.value;
        });
        
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize;
        });
        
        document.getElementById('brightness').addEventListener('input', (e) => {
            this.brightness = parseInt(e.target.value);
            document.getElementById('brightnessValue').textContent = this.brightness;
        });
        
        document.getElementById('drawMode').addEventListener('change', (e) => {
            this.drawMode = e.target.value;
        });
        
        // Tool buttons
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('fillCanvas').addEventListener('click', () => this.fillCanvas());
        document.getElementById('invertCanvas').addEventListener('click', () => this.invertCanvas());
        
        // Export buttons
        document.getElementById('exportJson').addEventListener('click', () => this.exportJson());
        document.getElementById('exportJava').addEventListener('click', () => this.exportJava());
        document.getElementById('exportPng').addEventListener('click', () => this.exportPng());
        
        // Import
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importFile(e));
        
        // Modal events
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('copyToClipboard').addEventListener('click', () => this.copyToClipboard());
        
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('exportModal')) {
                this.closeModal();
            }
        });
    }
    
    getCanvasPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.pixelSize);
        const y = Math.floor((e.clientY - rect.top) / this.pixelSize);
        return { x: Math.max(0, Math.min(x, this.gridSize - 1)), 
                 y: Math.max(0, Math.min(y, this.gridSize - 1)) };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        // Store the original draw mode and set temporary mode based on mouse button
        this.originalDrawMode = this.drawMode;
        if (e.button === 2) { // Right mouse button
            this.drawMode = 'erase';
        } else { // Left mouse button or touch
            this.drawMode = this.originalDrawMode;
        }
        this.draw(e);
    }
    
    stopDrawing() {
        this.isDrawing = false;
        // Restore original draw mode
        if (this.originalDrawMode) {
            this.drawMode = this.originalDrawMode;
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getCanvasPosition(e);
        this.paintPixels(pos.x, pos.y);
    }
    
    paintPixels(centerX, centerY) {
        if (this.brushType === 'square') {
            this.paintSquareBrush(centerX, centerY);
        } else if (this.brushType === 'circle') {
            this.paintCircleBrush(centerX, centerY);
        }
        
        this.drawGrid();
        this.updatePreview();
        this.updateActivePixelCount();
    }
    
    paintSquareBrush(centerX, centerY) {
        const halfBrush = Math.floor(this.brushSize / 2);
        
        for (let x = centerX - halfBrush; x <= centerX + halfBrush; x++) {
            for (let y = centerY - halfBrush; y <= centerY + halfBrush; y++) {
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    const index = y * this.gridSize + x;
                    
                    if (this.drawMode === 'paint') {
                        this.glyphData[index] = this.brightness;
                    } else if (this.drawMode === 'erase') {
                        this.glyphData[index] = 0;
                    }
                }
            }
        }
    }
    
    paintCircleBrush(centerX, centerY) {
        const radius = this.brushSize / 2;
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                
                if (distance <= radius) {
                    const index = y * this.gridSize + x;
                    
                    if (this.drawMode === 'paint') {
                        this.glyphData[index] = this.brightness;
                    } else if (this.drawMode === 'erase') {
                        this.glyphData[index] = 0;
                    }
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pixels
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const index = y * this.gridSize + x;
                const brightness = this.glyphData[index];
                
                // Check if pixel is within circular boundary
                const distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
                const isInBounds = distance <= this.radius;
                
                // Draw pixel
                if (brightness > 0) {
                    const intensity = brightness / 255;
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
                } else {
                    this.ctx.fillStyle = isInBounds ? '#222' : '#111';
                }
                
                this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize - 1, this.pixelSize - 1);
                
                // Draw boundary indicator for out-of-bounds pixels
                if (!isInBounds && brightness === 0) {
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize - 1, this.pixelSize - 1);
                }
            }
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.pixelSize, 0);
            this.ctx.lineTo(i * this.pixelSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.pixelSize);
            this.ctx.lineTo(this.canvas.width, i * this.pixelSize);
            this.ctx.stroke();
        }
    }
    
    updatePreview() {
        const previewSize = 8; // 200px / 25 = 8px per pixel
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // Draw black background
        this.previewCtx.fillStyle = '#000';
        this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // Draw pixels
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const index = y * this.gridSize + x;
                const brightness = this.glyphData[index];
                
                if (brightness > 0) {
                    const distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
                    if (distance <= this.radius) {
                        const intensity = brightness / 255;
                        this.previewCtx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
                        this.previewCtx.fillRect(x * previewSize, y * previewSize, previewSize, previewSize);
                    }
                }
            }
        }
    }
    
    updateActivePixelCount() {
        const activeCount = this.glyphData.filter(pixel => pixel > 0).length;
        document.getElementById('activePixels').textContent = `Active pixels: ${activeCount}`;
    }
    
    clearCanvas() {
        this.glyphData.fill(0);
        this.drawGrid();
        this.updatePreview();
        this.updateActivePixelCount();
    }
    
    fillCanvas() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
                if (distance <= this.radius) {
                    const index = y * this.gridSize + x;
                    this.glyphData[index] = this.brightness;
                }
            }
        }
        this.drawGrid();
        this.updatePreview();
        this.updateActivePixelCount();
    }
    
    invertCanvas() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
                if (distance <= this.radius) {
                    const index = y * this.gridSize + x;
                    this.glyphData[index] = this.glyphData[index] > 0 ? 0 : this.brightness;
                }
            }
        }
        this.drawGrid();
        this.updatePreview();
        this.updateActivePixelCount();
    }
    
    exportJson() {
        const exportData = {
            name: "Custom Glyph Design",
            size: this.gridSize,
            timestamp: new Date().toISOString(),
            data: this.glyphData,
            metadata: {
                activePixels: this.glyphData.filter(p => p > 0).length,
                maxBrightness: Math.max(...this.glyphData),
                avgBrightness: this.glyphData.reduce((a, b) => a + b, 0) / this.glyphData.length
            }
        };
        
        this.showExportModal(JSON.stringify(exportData, null, 2));
    }
    
    exportJava() {
        // Convert to ARGB format for Android
        const argbArray = this.glyphData.map(brightness => {
            if (brightness === 0) return 0; // Transparent
            const alpha = Math.round((brightness / 255) * 255);
            return (alpha << 24) | (255 << 16) | (107 << 8) | 53; // ARGB with Nothing orange
        });
        
        let javaCode = `// Generated Glyph Matrix Data for Nothing Phone 3
// Grid Size: ${this.gridSize}x${this.gridSize}
// Generated: ${new Date().toLocaleString()}

public static final int[] GLYPH_MATRIX_DATA = {
`;
        
        for (let i = 0; i < argbArray.length; i++) {
            if (i % this.gridSize === 0) javaCode += '    ';
            javaCode += `0x${argbArray[i].toString(16).padStart(8, '0').toUpperCase()}`;
            if (i < argbArray.length - 1) javaCode += ', ';
            if ((i + 1) % this.gridSize === 0) javaCode += '\n';
        }
        
        javaCode += `};

// Usage example:
// GlyphMatrixManager mGM = new GlyphMatrixManager();
// mGM.setMatrixFrame(GLYPH_MATRIX_DATA);`;
        
        this.showExportModal(javaCode);
    }
    
    exportPng() {
        // Create a high-resolution canvas for export
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        const exportSize = 500; // High resolution export
        const exportPixelSize = exportSize / this.gridSize;
        
        exportCanvas.width = exportSize;
        exportCanvas.height = exportSize;
        
        // Draw black background
        exportCtx.fillStyle = '#000000';
        exportCtx.fillRect(0, 0, exportSize, exportSize);
        
        // Draw pixels
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const index = y * this.gridSize + x;
                const brightness = this.glyphData[index];
                
                if (brightness > 0) {
                    const distance = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2));
                    if (distance <= this.radius) {
                        const intensity = brightness / 255;
                        exportCtx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
                        exportCtx.fillRect(x * exportPixelSize, y * exportPixelSize, exportPixelSize, exportPixelSize);
                    }
                }
            }
        }
        
        // Download the image
        exportCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `glyph-design-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    importFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        if (file.type === 'application/json') {
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.data && Array.isArray(data.data) && data.data.length === this.gridSize * this.gridSize) {
                        this.glyphData = [...data.data];
                        this.drawGrid();
                        this.updatePreview();
                        this.updateActivePixelCount();
                    } else {
                        alert('Invalid JSON format');
                    }
                } catch (error) {
                    alert('Error parsing JSON file');
                }
            };
            reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Convert image to glyph data
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = this.gridSize;
                    tempCanvas.height = this.gridSize;
                    
                    tempCtx.drawImage(img, 0, 0, this.gridSize, this.gridSize);
                    const imageData = tempCtx.getImageData(0, 0, this.gridSize, this.gridSize);
                    
                    for (let i = 0; i < this.glyphData.length; i++) {
                        const pixelIndex = i * 4;
                        const r = imageData.data[pixelIndex];
                        const g = imageData.data[pixelIndex + 1];
                        const b = imageData.data[pixelIndex + 2];
                        const alpha = imageData.data[pixelIndex + 3];
                        
                        // Convert to grayscale and apply alpha
                        const grayscale = (r + g + b) / 3;
                        this.glyphData[i] = Math.round((grayscale * alpha) / 255);
                    }
                    
                    this.drawGrid();
                    this.updatePreview();
                    this.updateActivePixelCount();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        
        // Reset file input
        e.target.value = '';
    }
    
    showExportModal(data) {
        document.getElementById('exportData').value = data;
        document.getElementById('exportModal').style.display = 'block';
    }
    
    closeModal() {
        document.getElementById('exportModal').style.display = 'none';
    }
    
    copyToClipboard() {
        const textarea = document.getElementById('exportData');
        textarea.select();
        document.execCommand('copy');
        
        // Show feedback
        const button = document.getElementById('copyToClipboard');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

// Prevent context menu on canvas (moved to event listener above)
document.addEventListener('DOMContentLoaded', () => {
    new GlyphCreationTool();
});
