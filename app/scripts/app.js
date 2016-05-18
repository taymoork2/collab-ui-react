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

  (function (l, y, t, i, c, s) {
    l['LocalyticsGlobal'] = i;
    l[i] = function () {
      (l[i].q = l[i].q || []).push(arguments);
    };
    l[i].t = +new Date();
    (s = y.createElement(t)).type = 'text/javascript';
    s.src = '//web.localytics.com/v3/localytics.min.js';
    (c = y.getElementsByTagName(t)[0]).parentNode.insertBefore(s, c);
    window.ll('init', 'f725f885fe2646751d3c8a3-075b0c4e-a82c-11e5-c7e0-00d0fea82624', {});
  }(window, document, 'script', 'll'));

  angular.module('Core', [
    'core.trial',
    'core.onboard',
    'pascalprecht.translate',
    'templates-app',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngMessages',
    'ngFileUpload',
    'dialogs',
    'ngCsv',
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.future',
    'ct.ui.router.extras.previous',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.saveState',
    'ui.grid.infiniteScroll',
    'mgo-angular-wizard',
    'ngClipboard',
    'csDonut',
    'cisco.ui',
    'cisco.formly',
    'timer',
    'angular-nicescroll',
    'cwill747.phonenumber',
    'toaster',
    'angular-cache',
  ]).constant('pako', window.pako);

  angular.module('Squared', ['Core']);

  angular.module('DigitalRiver', ['Core']);

  angular.module('Huron', [
    'Core',
    'uc.moh',
    'uc.device',
    'uc.callrouting',
    'uc.didadd',
    'uc.overview',
    'uc.hurondetails',
    'uc.cdrlogsupport',
    'ngIcal'
  ]);

  angular.module('Hercules', ['Core', 'core.onboard', 'ngTagsInput']);

  angular.module('Ediscovery', ['Core']);

  angular.module('Mediafusion', ['Core']);

  angular.module('WebExApp', ['Core']);

  angular.module('Messenger', ['Core']);

  angular.module('Sunlight', [
    'Core',
    'CareDetails'
  ]);

  angular.module('wx2AdminWebClientApp', [
    'Core',
    'Squared',
    'DigitalRiver',
    'Huron',
    'Hercules',
    'Ediscovery',
    'Mediafusion',
    'WebExApp',
    'Messenger',
    'Sunlight'
  ]);
}());
