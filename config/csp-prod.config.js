module.exports = {
  // serves as a fallback for the other CSP fetch directives
  // for each of the directives that are absent,
  // the user agent will look for the default-src directive and will use this value for it
  // TODO: get rid of it to be more strict
  defaultSrc: [
    '\'self\'',
    'blob:',
    'https://*.ciscospark.com',
    'https://*.localytics.com',
    'https://*.statuspage.io',
    'https://*.wbx2.com',
    'https://*.webex.com',
    'https://*.webexconnect.com',
  ],
  // valid sources for web workers and nested browsing contexts loaded using elements such as <frame> and <iframe>
  frameSrc: [
    'https://*.cisco.com',
    'https://*.ciscospark.com', // Digital River
    'https://*.webex.com', // Qlik sense sites used for Spark/WebEx Metrics
    'https://ds2-qlikdemo',
    'https://ds2-win2012-01',
    'https://qlik-engine2',
    'https://qlik-loader',
  ],
  // valid sources for the <object>, <embed>, and <applet> elements
  objectSrc: [
    'http://www.cisco.com', // Terms of Service
  ],
  // valid URLs which can be loaded using script interfaces (Fetch, XMLHttpRequest, WebSocket, etc.)
  connectSrc: [
    '\'self\'',
    'https://ciscowebex.d1.sc.omtrdc.net', // Adobe DTM Omniture
    'https://dpm.demdex.net', // Adobe DTM Omniture
    'http://rpbtqlkhsn002.webex.com:8080',
    'https://*.amazonaws.com', // MOH Media
    'https://*.cisco.com',
    'https://*.ciscoccservice.com',
    'https://*.ciscospark.com',
    'https://*.clouddrive.com', // CSV download
    'https://*.huron-dev.com',
    'https://*.huron-int.com',
    'https://*.huron.uno',
    'https://*.sparkc-eu.com',
    'https://*.statuspage.io',
    'https://*.wbx2.com',
    'https://*.webex.com',
    'https://*.webexconnect.com',
    'https://api.dialogflow.com', // Virtual Assistant testing dialogflow token
    'https://api.mixpanel.com',
    'https://bam.nr-data.net', // New Relic Browser
    'https://cdn.mxpnl.com',
    'https://rpbtqlkhsn006.webex.com',
    'wss://mercury-connection-a.wbx2.com',
  ],
  // valid sources for fonts loaded using @font-face
  fontSrc: [
    '\'self\'',
  ],
  // valid sources of images and favicons
  imgSrc: [
    '\'self\'',
    'data:',
    'https://*.clouddrive.com',
    'https://*.localytics.com',
    'https://*.rackcdn.com',
    'https://webexglobal.112.2o7.net', // Adobe DTM Omniture
    'https://*.d1.sc.omtrdc.net', // Adobe DTM Omniture
    'https://bam.nr-data.net', // New Relic Browser
  ],
  // valid sources for sources for JavaScript
  scriptSrc: [
    '\'self\'',
    '\'unsafe-eval\'',
    '\'sha256-emX0qxoI3deAq+WOnuOPZ/DF/m2igVM5Nd3ezjSl3Js=\'', // TODO: Remove when Adobe DTM is removed
    '\'sha256-YllLHRtar0IQ3QT7XKv04yy985FgoG331hfzTbkk2Z4=\'', // Devices page advanced settings launch: ATLAS-2913
    'https://*.localytics.com',
    'https://*.webex.com',
    'https://api.mixpanel.com', // Mixpanel
    'https://cdn.mxpnl.com', // Mixpanel
    'https://assets.adobedtm.com', // Adobe DTM Omniture
    'https://dpm.demdex.net', // Adobe DTM Omniture
    'https://*.omtrdc.net', // Adobe DTM Ominture
    'https://buy.ciscospark.com', // Digital River
    'https://js-agent.newrelic.com', // New Relic Browser
    'https://bam.nr-data.net', // New Relic Browser
  ],
  // valid sources for sources for stylesheets
  styleSrc: [
    '\'self\'',
    '\'unsafe-inline\'',
  ],
  workerSrc: [
    'blob:',
    '\'self\'',
  ],
};
