// Test script for LED color order mapping (replicates logic in webservices.js)

function mapLedData(ledData, rawOrder) {
  const order = (rawOrder || 'RGB').toUpperCase();
  const isValidOrder = order.length === 3 && ['R','G','B'].every(c => order.includes(c));
  const usedOrder = isValidOrder ? order : 'RGB';
  const leds = [];
  for (let i = 0; i + 2 < ledData.length; i += 3) {
    const b0 = ledData[i];
    const b1 = ledData[i+1];
    const b2 = ledData[i+2];
    const map = [b0,b1,b2];
    const r = map[usedOrder.indexOf('R')];
    const g = map[usedOrder.indexOf('G')];
    const b = map[usedOrder.indexOf('B')];
    const hex = (((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)).toString(16).padStart(6,'0').toUpperCase();
    leds.push(hex);
  }
  return leds;
}

function runTests() {
  const expected = ['00FF00','0000FF','FF0000'];
  const orders = ['RGB','BRG'];
  let allPass = true;

  for (const order of orders) {
    // Build ledData in incoming order for each LED: for each color (green, blue, red)
    // actual colors: green(R0,G255,B0), blue(R0,G0,B255), red(R255,G0,B0)
    const ledsIncoming = [];
    const colors = [ {r:0,g:255,b:0}, {r:0,g:0,b:255}, {r:255,g:0,b:0} ];
    for (const c of colors) {
      // incoming order means bytes correspond to order[0], order[1], order[2]
      const bytes = [];
      for (let k=0;k<3;k++) {
        const ch = order[k];
        if (ch === 'R') bytes.push(c.r);
        else if (ch === 'G') bytes.push(c.g);
        else if (ch === 'B') bytes.push(c.b);
      }
      ledsIncoming.push(...bytes);
    }

    const result = mapLedData(ledsIncoming, order);
    console.log(`Order ${order} -> parsed:`, result);
    for (let i=0;i<expected.length;i++) {
      if (result[i] !== expected[i]) {
        console.error(`FAIL for order ${order} at index ${i}: expected ${expected[i]}, got ${result[i]}`);
        allPass = false;
      }
    }
  }

  if (allPass) {
    console.log('ALL PASS: mapping works for tested orders');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED');
    process.exit(2);
  }
}

runTests();

