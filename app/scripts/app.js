(function () {
  'use strict';

  /* global window, document */

  /**
   * @ngdoc overview
   * @name adminPortalPocApp
   * @description
   * # adminPortalPocApp
   *
   * Main module of the application.
   */

  /* eslint-disable */
  // segment bootstrap (w/o doing init)
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(n,o);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.1.0";
  }}();
  /* eslint-enable */

  require('./app.dependencies');

  angular.module('wx2AdminWebClientApp', [
    require('modules/core/scripts/controllers/bodyCtrl'),
    require('modules/core/account').default,
    require('modules/core/analytics'),
    require('modules/core/auth/auth'),
    require('modules/core/auth/tos').default,
    require('modules/core/auth/user').default,
    require('modules/core/auth/token.service'),
    require('modules/core/security').default,
    require('modules/core/auth/idle').default,
    require('modules/core/config/config').default,

    // TODO: eventually a larger component encapsulating customer-overview should supercede this
    require('modules/core/customers/customerSubscriptions/adminList').default,

    require('modules/core/featureToggle').default,
    require('modules/core/users').default,
    require('modules/core/csvDownload').default,
    require('modules/core/l10n').default,
    require('modules/core/metrics').default,
    require('modules/core/modal').default,
    require('modules/core/notifications').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/health-monitor').default,
    require('modules/core/users').default,
    require('modules/core/rate-limit').default,
    require('modules/core/scripts/services/localize'),
    require('modules/core/scripts/services/utils'),
    require('modules/core/scripts/services/log'),
    require('modules/core/storage').default,
    require('modules/core/proPack').default,
    require('modules/core/scripts/services/logmetricsservice'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
    require('modules/core/scripts/services/responseinterceptor'),
    require('modules/core/interceptors/readonly').default,
    require('modules/core/scripts/services/timingInterceptor'),
    require('modules/core/scripts/services/serverErrorInterceptor'),
    require('modules/core/state-redirect/shared').default,
    require('modules/core/trackingId/trackingId.module'),
    require('modules/core/window').default,
    require('modules/online/upgrade').default,
    require('@collabui/collab-ui-ng').default,
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.previous',
    'ngAnimate',
    require('angular-aria'),
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'oc.lazyLoad',
    require('angular-translate'),
    'ui.router',
  ]).run(require('./apprun'))
    .config(require('./app.exceptions.config').default);
  require('./appconfig');
}());
