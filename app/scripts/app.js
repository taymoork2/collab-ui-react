'use strict';

/**
 * @ngdoc overview
 * @name adminPortalPocApp
 * @description
 * # adminPortalPocApp
 *
 * Main module of the application.
 */

angular.module('Core', [
  'core.trial',
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
  'ipCookie',
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

angular.module('Huron', [
  'Core',
  'uc.moh',
  'uc.device',
  'uc.callrouting',
  'uc.didadd',
  'uc.overview',
  'uc.hurondetails',
  'uc.cdrlogsupport'
]);

angular.module('Hercules', ['Core', 'ngTagsInput']);

angular.module('Mediafusion', ['Core']);

angular.module('WebExUtils', ['Core']);
angular.module('WebExXmlApi', ['Core']);

angular.module('WebExSiteSettings', ['Core']);
angular.module('WebExSiteSetting', ['Core']);

angular.module('WebExReports', ['Core']);
angular.module('ReportIframe', ['Core']);

angular.module('WebExUserSettings', ['Core']);
angular.module('WebExUserSettings2', ['Core']);

angular.module('Messenger', ['Core']);

angular.module('Sunlight', ['Core']);

angular.module('wx2AdminWebClientApp', [
  'Core',
  'Squared',
  'Huron',
  'Hercules',
  'Mediafusion',
  'WebExUtils',
  'WebExXmlApi',
  'WebExSiteSettings',
  'WebExSiteSetting',
  'WebExUserSettings',
  'WebExUserSettings2',
  'WebExReports',
  'ReportIframe',
  'Messenger',
  'Sunlight'
]);
