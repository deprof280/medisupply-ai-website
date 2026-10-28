const launcher = document.getElementById('chat-launcher');
const chatPanel = document.getElementById('chat-panel');
const chatFrame = document.getElementById('chat-frame');
const chatClose = document.getElementById('chat-close');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primary-nav');
let chatFrameReady = false;
let pendingProductEnquiry = null;
let chatOpener = null;

function setChatOpen(open) {
  launcher.setAttribute('aria-expanded', String(open));
  launcher.setAttribute('aria-label', open ? 'Close chat with MediSupply AI' : 'Open chat with MediSupply AI');
  chatPanel.setAttribute('aria-hidden', String(!open));
  chatPanel.inert = !open;
  chatPanel.classList.toggle('is-open', open);
  document.body.classList.toggle('chat-open', open);
  if (open) {
    window.setTimeout(() => chatFrame.focus({ preventScroll: true }), 180);
  } else {
    const opener = chatOpener;
    chatOpener = null;
    (opener && opener.isConnected ? opener : launcher).focus({ preventScroll: true });
  }
}

function flushPendingProductEnquiry() {
  chatFrameReady = true;
  if (pendingProductEnquiry) {
    const product = pendingProductEnquiry;
    pendingProductEnquiry = null;
    sendProductEnquiry(product);
  }
}

function sendProductEnquiry(product) {
  if (!chatFrameReady) {
    pendingProductEnquiry = product;
    return;
  }
  chatFrame.contentWindow.postMessage({
    type: 'medisupply:product-enquiry',
    productId: product.productId,
    productName: product.productName
  }, window.location.origin);
}

chatFrame.addEventListener('load', flushPendingProductEnquiry);
if (chatFrame.contentDocument && chatFrame.contentDocument.readyState === 'complete') {
  flushPendingProductEnquiry();
}

launcher.addEventListener('click', () => {
  setChatOpen(launcher.getAttribute('aria-expanded') !== 'true');
});
chatClose.addEventListener('click', () => setChatOpen(false));

document.querySelectorAll('[data-open-chat]').forEach((button) => {
  button.addEventListener('click', () => {
    chatOpener = button;
    setChatOpen(true);
  });
});

document.querySelectorAll('[data-product-id]').forEach((button) => {
  button.addEventListener('click', () => {
    chatOpener = button;
    setChatOpen(true);
    sendProductEnquiry({
      productId: button.dataset.productId,
      productName: button.dataset.productName
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && launcher.getAttribute('aria-expanded') === 'true') {
    setChatOpen(false);
  }
});
chatPanel.addEventListener('click', (event) => {
  if (event.target === chatPanel.querySelector('[data-chat-backdrop]')) {
    setChatOpen(false);
  }
});

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  primaryNav.classList.toggle('is-open', !expanded);
});

primaryNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  });
});

document.getElementById('year').textContent = String(new Date().getFullYear());
