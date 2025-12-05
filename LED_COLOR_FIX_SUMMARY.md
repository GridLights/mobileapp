# LED Color Display Fix Summary

## Problem
LED colors were not displaying correctly due to incorrect binary data parsing from the WLED live stream.

## Root Cause
The binary protocol has a **2-byte header** that was not being skipped:
- Byte 0: `0x4C` ('L' - live stream marker)
- Byte 1: `0x01` (frame counter/flags)
- Bytes 2+: RGB triplet data (0 = OFF, non-zero = ON)

The old code was either skipping 0 bytes, 1 byte, or 2 bytes randomly based on a scoring algorithm, which resulted in misaligned color parsing.

## Minimum Fix Required

In `src/webservices.js`, in the `processArrayBuffer()` function:

**Before:**
```javascript
const ledData = byteArray.slice(2);  // or slice(0) - was trying different offsets
// Then used offset-guessing with 3 candidates
```

**After:**
```javascript
const ledData = byteArray.slice(2);  // Skip exactly 2 bytes: 'L' + frame byte
```

Replace the offset-guessing logic (3 candidates with scoring) with direct RGB triplet parsing:

```javascript
const buildColors = () => {
  const out = [];
  for (let i = 0; i + 2 < ledData.length; i += 3) {
    const r = ledData[i] === 0 ? 0 : 255;
    const g = ledData[i + 1] === 0 ? 0 : 255;
    const b = ledData[i + 2] === 0 ? 0 : 255;
    const hexColor = ((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)
      .toUpperCase();
    out.push(hexColor);
  }
  return out;
};
```

## Key Changes
1. **Fixed header skip**: Changed from guessing to hardcoded `slice(2)` (skip 2 bytes)
2. **Removed offset candidates**: Removed the 3-candidate offset-guessing algorithm
3. **Simplified parsing**: Direct RGB triplet iteration without scoring logic

**Result**: Colors now display perfectly with 37 LEDs in the diamond pattern.

