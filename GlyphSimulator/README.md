# Glyph Matrix Simulator

A web-based simulator for testing Nothing Phone Glyph Matrix functionality without requiring the actual device. This simulator implements the same API as the real Nothing Phone Glyph Matrix SDK.

## 🎯 Features

- **Exact API Compatibility**: Uses the same classes and methods as the real Glyph Matrix SDK
- **Visual 25x25 LED Matrix**: Real-time visual feedback of your glyph patterns
- **Interactive Controls**: Simulate Glyph Button interactions (short press, long press, touch & hold)
- **Live Code Editor**: Write and test your glyph code instantly
- **Built-in Examples**: Ready-to-use examples for learning and testing
- **Multi-layer Support**: Test complex compositions with up to 3 layers
- **Advanced Effects**: Built-in effects like spiral, fade, pulse, and rotation

## 🚀 Quick Start

1. Open `index.html` in any modern web browser
2. Click "Load Example" to see sample code
3. Click "▶ Run Code" to execute and see results on the matrix
4. Use the button controls to test interactions

## 💻 API Reference

The simulator implements these core classes from the Nothing Phone SDK:

### GlyphMatrixManager
```javascript
const manager = new GlyphMatrixManager();
manager.init(callback);
manager.register(Glyph.DEVICE_23112);
manager.setMatrixFrame(frame);
```

### GlyphMatrixObject
```javascript
const object = new GlyphMatrixObject.Builder()
    .setImageSource(bitmap)
    .setPosition(x, y)
    .setBrightness(255)
    .setScale(100)
    .setOrientation(0)
    .build();
```

### GlyphMatrixFrame
```javascript
const frame = new GlyphMatrixFrame.Builder()
    .addLow(backgroundObject)
    .addMid(middleObject)
    .addTop(foregroundObject)
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
