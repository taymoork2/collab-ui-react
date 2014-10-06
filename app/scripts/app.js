'use strict';

/**
 * @ngdoc overview
 * @name adminPortalPocApp
 * @description
 * # adminPortalPocApp
 *
 * Main module of the application.
 */

angular.module('Core', []);

angular.module('Squared', ['Core']);

angular.module('Huron', ['Core']);

angular.module('Hercules', ['Core']);

angular
  .module('wx2AdminWebClientApp', [
    'templates-app',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'dialogs',
    'pascalprecht.translate',
    'ngCsv',
    'ipCookie',
    'ui.router',
    'ngGrid',
    'mgo-angular-wizard',
    'cisco.ui',
    'Hercules',
    'Core',
    'Squared',
    'Huron'
  ]);
