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

angular.module('Squared', ['Core',
    'FundooDirectiveTutorial']);

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
    'Squared'
  ]);
  

