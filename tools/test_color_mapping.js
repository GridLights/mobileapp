// Small test to validate live-stream color byte mapping (device -> UI)
// The device sends bytes in G,B,R order; the code maps them to R,G,B.

function parseLedData(ledData) {
  const leds = [];
  for (let i = 0; i + 2 < ledData.length; i += 3) {
    const g = ledData[i];
    const b = ledData[i + 1];
    const r = ledData[i + 2];
    const hexColor = (((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff))
      .toString(16)
      .padStart(6, '0')
      .toUpperCase();
    leds.push(hexColor);
  }
  return leds;
}

// Test cases: construct ledData as device-ordered (G,B,R)
// 1) Actual green (R=0,G=255,B=0) -> device: [G=255,B=0,R=0]
// 2) Actual blue  (R=0,G=0,B=255) -> device: [G=0,B=255,R=0]
// 3) Actual red   (R=255,G=0,B=0) -> device: [G=0,B=0,R=255]

const ledData = Uint8Array.from([
  255, 0, 0, // green
  0, 255, 0, // blue
  0, 0, 255, // red
]);

const result = parseLedData(ledData);
console.log('Parsed hex colors:', result);

const expected = ['00FF00', '0000FF', 'FF0000'];
let pass = true;
for (let i = 0; i < expected.length; i++) {
  if (result[i] !== expected[i]) {
    pass = false;
    console.error(`Mismatch at index ${i}: expected ${expected[i]}, got ${result[i]}`);
  }
}

if (pass) {
  console.log('PASS: color mapping is correct');
  process.exit(0);
} else {
  console.error('FAIL: color mapping incorrect');
  process.exit(2);
}

