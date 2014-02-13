'use strict';

angular.module('wx2AdminWebClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/entitlement', {
        templateUrl: 'views/entitlement.html',
        controller: 'EntitlementCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
