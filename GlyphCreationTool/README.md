# Glyph Creation Tool

A comprehensive web-based tool for designing custom glyph patterns for Nothing Phone 3's 25x25 LED matrix display.

## Features

### 🎨 Design Tools
- **25x25 Pixel Grid**: Accurate representation of the Nothing Phone 3 glyph matrix
- **Circular Boundary**: Visual guide showing the actual circular display area
- **Brush Tools**: Adjustable brush size (1-5 pixels) for precise or broad strokes
- **Brightness Control**: Full brightness range (0-255) matching the GlyphMatrixSDK
- **Paint/Erase Modes**: Switch between painting and erasing pixels

### 🔧 Utility Functions
- **Clear All**: Reset the entire canvas
- **Fill All**: Fill the circular display area with current brightness
- **Invert**: Invert all pixels within the display boundary
- **Real-time Preview**: Live circular preview of your design

### 💾 Export Options
- **JSON Export**: Complete project data with metadata
- **Java Array Export**: Ready-to-use ARGB arrays for Android development
- **PNG Export**: High-resolution image export
- **Import Support**: Load existing JSON projects or convert images

### 📱 Responsive Design
- Touch-friendly interface for mobile devices
- Responsive layout that adapts to different screen sizes
- Optimized for both desktop and tablet use

## Usage

### Basic Operation
1. **Open** `index.html` in your web browser
2. **Select** brush size and brightness level
3. **Click and drag** on the grid to paint pixels
4. **Use tools** to clear, fill, or invert your design
5. **Export** your creation in your preferred format

### Integration with GlyphMatrixSDK

#### Using JSON Export
```javascript
// Load your exported JSON
const glyphData = /* your exported JSON */;
const matrixData = glyphData.data; // Array of brightness values (0-255)
```

#### Using Java Array Export
```java
// Copy the exported Java code directly into your Android project
public static final int[] GLYPH_MATRIX_DATA = {
    // Your exported ARGB values
};

// Use with GlyphMatrixManager
GlyphMatrixManager mGM = new GlyphMatrixManager();
mGM.setMatrixFrame(GLYPH_MATRIX_DATA);
```

#### Converting to GlyphMatrixObject
```java
// Convert brightness array to bitmap for GlyphMatrixObject
Bitmap glyphBitmap = createBitmapFromBrightnessArray(brightnessArray);

GlyphMatrixObject.Builder builder = new GlyphMatrixObject.Builder();
GlyphMatrixObject glyphObject = builder
    .setImageSource(glyphBitmap)
    .setBrightness(255)
    .setPosition(0, 0)
    .build();
```

## File Structure
```
GlyphCreationTool/
├── index.html          # Main HTML interface
├── styles.css          # Styling and responsive design
├── script.js           # Core functionality and canvas management
└── README.md           # This documentation
```

## Technical Details

### Grid System
- **Size**: 25x25 pixels (625 total pixels)
- **Circular Display**: 25 pixel diameter (12.5 pixel radius from center)
- **Brightness Range**: 0-255 (matching GlyphMatrixSDK)
- **Color Output**: ARGB format with Nothing orange (#FF6B35)

### Export Formats

#### JSON Structure
```json
{
  "name": "Custom Glyph Design",
  "size": 25,
  "timestamp": "2025-07-22T...",
  "data": [0, 0, 255, ...], // 625 brightness values
  "metadata": {
    "activePixels": 42,
    "maxBrightness": 255,
    "avgBrightness": 12.5
  }
}
```

#### Java Array Format
```java
public static final int[] GLYPH_MATRIX_DATA = {
    0x00000000, 0x00000000, 0xFFFF6B35, ... // ARGB values
};
```

## Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Touch-optimized interface

## Tips for Design

### Best Practices
1. **Stay within the circle**: Only pixels within the circular boundary will be visible
2. **Test brightness levels**: Use varying brightness for depth and visual interest
3. **Consider symmetry**: Symmetrical designs often look better on the circular display
4. **Start simple**: Begin with basic shapes and build complexity gradually

### Common Patterns
- **Icons**: Simple, recognizable symbols work best
- **Animations**: Create multiple frames for animated sequences
- **Gradients**: Use brightness variations for smooth transitions
- **Text**: Keep text large and simple for readability

## Troubleshooting

### Common Issues
- **Export not working**: Ensure your browser allows downloads
- **Touch not responsive**: Try using a different browser or device
- **Import fails**: Check that JSON files match the expected format

### Performance Tips
- **Large brush sizes**: May cause lag on slower devices
- **Complex patterns**: Simplify designs if the interface becomes unresponsive

## Integration Examples

### Basic Glyph Toy Service
```java
public class CustomGlyphToy extends Service {
    private GlyphMatrixManager mGM;
    
    @Override
    public IBinder onBind(Intent intent) {
        mGM = new GlyphMatrixManager();
        mGM.init(new Callback() {
            @Override
            public void onServiceConnected() {
                mGM.register(Glyph.DEVICE_23112);
                displayCustomDesign();
            }
        });
        return serviceMessenger.getBinder();
    }
    
    private void displayCustomDesign() {
        // Use your exported array here
        mGM.setMatrixFrame(GLYPH_MATRIX_DATA);
    }
}
```

### Animation Sequence
```java
// Create multiple frames for animation
int[][] animationFrames = {
    GLYPH_FRAME_1, GLYPH_FRAME_2, GLYPH_FRAME_3
};

// Display frames in sequence
for (int[] frame : animationFrames) {
    mGM.setMatrixFrame(frame);
    Thread.sleep(200); // 200ms delay between frames
}
```

## Contributing
This tool is designed to work with the Nothing Phone 3 Glyph Matrix Developer Kit. For updates and improvements, refer to the official Nothing Developer Programme documentation.

## License
This tool is provided as-is for educational and development purposes with the Nothing Phone 3 Glyph Matrix system.
