/**
 * CENTRALIZED HEAD CONFIG & ANALYTICS
 * Manage your tracking tags and global meta dynamically.
 */

(function() {
  // Google Analytics (gtag.js)
  const GA_ID = 'G-F9QSTXTB0F';
  
  // Inject script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // DataLayer init
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);

  console.log('Analytics loaded from head-config.js');
})();
