// Function to apply Stellar class
function applyStellarClasses() {
  const captions = document.querySelectorAll('.product-info__caption');
  //console.log(`Found ${captions.length} .product-info__caption elements at ${new Date().toISOString()}`);

  captions.forEach(caption => {
    const captionHTML = caption.innerHTML.toLowerCase();
    const hasStellar = captionHTML.includes('stellar');
    //console.log('Caption HTML:', caption.innerHTML);
    //console.log('Has Stellar:', hasStellar);

    if (hasStellar) {
      caption.classList.add('stellar');
      //console.log('Added stellar class to .product-info__caption');
    }
  });
}

// Run initially after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  applyStellarClasses();

  // Poll for Boost grid updates
  let attempts = 0;
  const maxAttempts = 10;
  const interval = setInterval(() => {
    const productGrid = document.querySelector('.boost-pfs-filter-products');
    if (productGrid && document.querySelectorAll('.product-info__caption').length > 0) {
      //console.log('Product grid detected, applying Stellar classes');
      applyStellarClasses();
      clearInterval(interval); // Stop polling
    } else if (attempts >= maxAttempts) {
      //console.log('Max attempts reached, stopping poll');
      clearInterval(interval);
    }
    attempts++;
  }, 500); // Check every 500ms

  // MutationObserver for dynamic updates
  const observer = new MutationObserver(() => {
    //console.log('DOM change detected, reapplying classes');
    applyStellarClasses();
  });

  // Target Boost's product grid or body
  const productGrid = document.querySelector('.boost-pfs-filter-products') || document.body;
  observer.observe(productGrid, { childList: true, subtree: true });
});