'use strict';

angular.module('wx2AdminWebClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'dialogs'
])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/users', {
          templateUrl: 'views/users.html',
          controller: 'UsersCtrl'
        })
        .when('/downloads', {
          templateUrl: 'views/downloads.html',
          controller: 'DownloadsCtrl'
        })
        .when('/orgs', {
          templateUrl: 'views/organizations.html',
          controller: 'UsersCtrl'
        })
        .when('/templates', {
          templateUrl: 'views/templates.html',
          controller: 'UsersCtrl'
        })
        .when('/policies', {
          templateUrl: 'views/policies.html',
          controller: 'UsersCtrl'
        })
        .when('/reports', {
          templateUrl: 'views/reports.html',
          controller: 'UsersCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ])
  .run(['$cookies', '$rootScope', 'Auth', 'Storage', 'Localize', 'Utils',
    function($cookies, $rootScope, Auth, Storage, Localize, Utils) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;

      //Enable logging
      $rootScope.debug = true;

      var data = null;

      if (document.URL.indexOf('access_token') !== -1) {
        data = Auth.getFromGetParams(document.URL);
        console.log(data);
        Storage.put('accessToken', data.access_token);

      } else if (document.URL.indexOf('code') !== -1) {
        data = Auth.getFromStandardGetParams(document.URL);
        console.log(data);
      } else {
        console.log('No access code data.');
      }

    }
  ]);
