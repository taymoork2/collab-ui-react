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

angular.module('Squared', ['Core'
    ]);

angular.module('Huron', ['Core']);

angular
  .module('wx2AdminWebClientApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'dialogs',
    'pascalprecht.translate',
    'ngCsv',
    'ipCookie',
    'Core',
    'Squared',
    'Huron',
    'ngGrid',
    'mgo-angular-wizard'
  ]);


