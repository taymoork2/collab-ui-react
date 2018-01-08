var merge = require('webpack-merge');

var cspProdConfig = require('./csp-prod.config');

var cspIntConfig = {
  defaultSrc: [],
  // valid sources for web workers and nested browsing contexts loaded using elements such as <frame> and <iframe>
  frameSrc: [],
  // valid sources for the <object>, <embed>, and <applet> elements
  objectSrc: [],
  // valid URLs which can be loaded using script interfaces (Fetch, XMLHttpRequest, WebSocket, etc.)
  connectSrc: [
   'https://rcdn6-vm81-32.cisco.com:8082', // Test as a service DEMO
  ],
  // valid sources for fonts loaded using @font-face
  fontSrc: [],
  // valid sources of images and favicons
  imgSrc: [],
  // valid sources for sources for JavaScript
  scriptSrc: [],
  // valid sources for sources for stylesheets
  styleSrc: [],
};

// smart merging production environemnt CSP dependencies with integration environment CSP dependencies
cspIntConfig = merge.smart(cspProdConfig, cspIntConfig);

module.exports = cspIntConfig;
