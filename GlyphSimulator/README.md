# Glyph Matrix Simulator

A web-based simulator for testing Nothing Phone Glyph Matrix functionality without requiring the actual device. This simulator implements the same API as the real Nothing Phone Glyph Matrix SDK.

## 🎯 Features

- **100% API Compatibility**: Exactly matches the official Nothing Phone Glyph Matrix SDK
- **Complete Text Support**: Full alphabet, numbers, and symbols (A-Z, 0-9, punctuation)
- **Visual 25x25 LED Matrix**: Real-time visual feedback of your glyph patterns
- **Interactive Controls**: Simulate Glyph Button interactions (short press, long press, touch & hold)
- **Live Code Editor**: Write and test your glyph code instantly
- **Official Examples**: Includes butterfly example matching Nothing's documentation
- **Multi-layer Support**: Test complex compositions with up to 3 layers
- **Advanced Effects**: Built-in effects like spiral, fade, pulse, and rotation
- **Pattern Library**: Pre-built patterns including butterfly, heart, star, diamond, and more

## 🚀 Quick Start

1. Open `index.html` in any modern web browser
2. Try the "Official API" example to see the butterfly pattern from Nothing's docs
3. Click "▶ Run Code" to execute and see results on the matrix
4. Use the button controls to test interactions

## 💻 API Reference

The simulator implements the complete Nothing Phone SDK with 100% compatibility:

### GlyphMatrixManager
```javascript
const manager = new GlyphMatrixManager();
manager.init(callback);                    // Initialize with callback
manager.register(Glyph.DEVICE_23112);      // Register for Phone 3
manager.setMatrixFrame(frame);             // Display frame or raw array
manager.unInit();                          // Clean shutdown
```

### GlyphMatrixObject.Builder  
```javascript
const object = new GlyphMatrixObject.Builder()
    .setImageSource(GlyphMatrixUtils.drawableToBitmap('butterfly'))
    .setText("HELLO")                       // Text rendering support
    .setPosition(x, y)                      // Top-left position
    .setBrightness(255)                     // 0-255 brightness
    .setScale(100)                          // 0-200 scale (100 = normal)
    .setOrientation(0)                      // Rotation in degrees
    .setReverse(false)                      // Color inversion
    .build();
```

### GlyphMatrixFrame.Builder
```javascript
const frame = new GlyphMatrixFrame.Builder()
    .addLow(backgroundObject)               // Bottom layer
    .addMid(middleObject)                   // Middle layer  
    .addTop(foregroundObject)               // Top layer
    .build(context);                        // Build with context
```

### GlyphMatrixUtils
```javascript
// Convert drawable to bitmap (like Android)
const bitmap = GlyphMatrixUtils.drawableToBitmap('butterfly');

// Create text bitmap from string
const textBitmap = GlyphMatrixUtils.createTextBitmap("HELLO");

// Create sample patterns
const pattern = GlyphMatrixUtils.createSampleBitmap('heart');
```
    .build();
```

## 🎮 Button Interactions

The simulator supports all Glyph Button interaction types:

- **Short Press**: Cycles through toys
- **Long Press**: Triggers `EVENT_CHANGE`
- **Touch & Hold**: Triggers `EVENT_ACTION_DOWN` and `EVENT_ACTION_UP`

Register event handlers like this:
```javascript
registerGlyphEventHandler((eventType) => {
    switch (eventType) {
        case GlyphToy.EVENT_CHANGE:
            // Handle long press
            break;
        case GlyphToy.EVENT_ACTION_DOWN:
            // Handle touch down
            break;
        case GlyphToy.EVENT_ACTION_UP:
            // Handle touch up
            break;
    }
});
```

## 📖 Examples Included

1. **Basic Circle**: Simple static display
2. **Pulse Effect**: Breathing animation
3. **Rotation**: Spinning objects
4. **Text Display**: Show text on the matrix
5. **Multi-Layer**: Complex layered animations
6. **Interactive Toy**: Button-responsive behavior
7. **Spiral Effect**: Advanced particle animation

## 🛠 Utilities

### GlyphMatrixUtils
- `createSampleBitmap(pattern)`: Generate test patterns ('circle', 'cross', 'diamond')
- `createTextBitmap(text)`: Convert text to bitmap
- `drawableToBitmap(drawable)`: Convert resources to bitmap

### Built-in Effects
```javascript
// Fade in effect
GlyphEffects.fadeIn(manager, object, duration);

// Spiral animation
GlyphEffects.spiral(manager, duration);
```

## ⌨️ Keyboard Shortcuts

- `Ctrl + Enter`: Run code
- `Ctrl + Delete`: Clear matrix

## 🎨 Customization

The simulator is fully customizable:

- Modify LED appearance in `styles.css`
- Add new effects in `simulator.js`
- Extend the API in `glyph-api.js`

## 🔧 Technical Details

- **Matrix Size**: 25x25 LEDs (625 total)
- **Brightness Range**: 0-255
- **Scale Range**: 0-200%
- **Rotation**: 0-360 degrees
- **Layers**: Up to 3 per frame

## 📱 Real Device Compatibility

Code written in this simulator should work directly on Nothing Phone devices with minimal changes:

1. Replace web utilities with Android equivalents
2. Add proper Android service lifecycle
3. Include necessary permissions in AndroidManifest.xml

## 🐛 Troubleshooting

- **Matrix not updating**: Check console for errors
- **Code not running**: Verify syntax in the console output
- **Poor performance**: Reduce animation frequency or complexity

## 📚 Resources

- [Nothing Phone Glyph Matrix SDK Documentation](../nothingdocs.md)
- [Original Nothing Developer Repository](https://github.com/Nothing-Developer-Programme)
- [Example Project](https://github.com/KenFeng04/GlyphMatrix-Example-Project)

## 🤝 Contributing

This simulator is designed for development and testing. Feel free to enhance it with:

- More built-in patterns
- Additional effects
- Better debugging tools
- Performance optimizations

---

**Note**: This simulator is for development purposes only and is not officially affiliated with Nothing Technology Limited.
