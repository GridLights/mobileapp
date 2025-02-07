export const setEffect = (effectId, freqValue, webservices) => {
  const scaledFreqValue = Math.round((freqValue / 50) * 255);
  const data = { seg: { fx: effectId, ix: scaledFreqValue } };
  webservices.sendCommandToWebSocket(data);
};

export default setEffect;
