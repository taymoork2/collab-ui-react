'use strict';

/**
 * @ngdoc overview
 * @name adminPortalPocApp
 * @description
 * # adminPortalPocApp
 *
 * Main module of the application.
 */

angular.module('Core', ['pascalprecht.translate']);

angular.module('Squared', ['Core']);

angular.module('Huron', ['Core', 'uc.moh', 'uc.device']);

angular.module('Hercules', ['Core']);

angular
  .module('wx2AdminWebClientApp', [
    'templates-app',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'dialogs',
    'ngCsv',
    'ipCookie',
    'ui.router',
    'ct.ui.router.extras',
    'ngGrid',
    'mgo-angular-wizard',
    'ngClipboard',
    'cisco.ui',
    'Hercules',
    'Core',
    'Squared',
    'Huron'
  ]);
