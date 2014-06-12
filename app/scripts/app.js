'use strict';

angular.module('wx2AdminWebClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'dialogs',
  'pascalprecht.translate',
  'ngCsv'
])
  .config(['$routeProvider', '$translateProvider',
    function($routeProvider, $translateProvider) {
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
          controller: 'OrganizationsCtrl'
        })
        .when('/templates', {
          templateUrl: 'views/templates.html',
          controller: 'UsersCtrl'
        })
        .when('/reports', {
          templateUrl: 'views/reports.html',
          controller: 'ReportsCtrl'
        })
        .when('/activate', {
          templateUrl: 'views/activate.html',
          controller: 'ActivateCtrl'
        })
        .when('/userprofile/:uid', {
          templateUrl: 'views/userprofile.html',
          controller: 'UserProfileCtrl'
        })
        .when('/logs', {
          templateUrl: 'views/logs.html',
          controller: 'LogsCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });

      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      // Tell the module what language to use by default
      $translateProvider.preferredLanguage('en_US');
    }
  ])
  .run(['$cookies', '$rootScope', 'Auth', 'Storage', 'Localize', 'Utils', 'Log',
    function($cookies, $rootScope, Auth, Storage, Localize, Utils, Log) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;
      $rootScope.services = [];
      $rootScope.exporting = false;

      //Enable logging
      $rootScope.debug = true;

      var data = null;

      if (document.URL.indexOf('access_token') !== -1) {
        data = Auth.getFromGetParams(document.URL);
        Log.debug('Retrieving access token...', data);
        Storage.put('accessToken', data.access_token);

      } else if (document.URL.indexOf('code') !== -1) {
        data = Auth.getFromStandardGetParams(document.URL);
        console.log(data);
      } else {
        Log.debug('No access code data.');
      }

    }
  ]);
