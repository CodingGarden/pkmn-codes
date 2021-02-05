import QrScanner from 'https://cdn.jsdelivr.net/npm/qr-scanner@1.2.0/qr-scanner.min.js';

QrScanner.WORKER_PATH = 'qr-scanner-worker.min.js';

const videoElement = document.querySelector('#video');
const scanAreaElement = document.querySelector('#scanArea');

function decoded(result) {
  console.log('decoded qr code:', result);
}

async function init() {
  try {
    const scanner = new QrScanner(videoElement, decoded);

    scanAreaElement.appendChild(scanner.$canvas);
    scanner.$canvas.style.display = 'block';
    scanner.start();
  } catch(err) {
    /* handle the error */
    console.log(err);
  }
}

init();
