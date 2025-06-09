const bufferSize = 10;
let alphaBuffer = [];
let betaBuffer = [];

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

onmessage = function (e) {
  if (e.data.action === "load") {
    postMessage({ action: "loaded" });
    return;
  }
  if (typeof e.data.alpha === "number" && typeof e.data.beta === "number") {
    alphaBuffer.push(e.data.alpha);
    betaBuffer.push(e.data.beta);
    if (alphaBuffer.length > bufferSize) alphaBuffer.shift();
    if (betaBuffer.length > bufferSize) betaBuffer.shift();

    const smoothAlpha = mean(alphaBuffer);
    const smoothBeta = mean(betaBuffer);

    postMessage({ smoothAlpha, smoothBeta });
  }
};
