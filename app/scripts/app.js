'use strict';

angular.module('wx2AdminWebClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
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
        .otherwise({
          redirectTo: '/'
        });
    }
  ])
  .run(['$cookies', '$rootScope', 'Auth', 'Storage', 'Localize',
    function($cookies, $rootScope, Auth, Storage, Localize) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;

      //Enable logging
      $rootScope.debug = true;

      console.log('run() started.');

      var data = null;

      if (document.URL.indexOf('access_token') !== -1) {
        data = Auth.getFromGetParams(document.URL);
        console.log(data);
        Storage.put('accessToken', data.access_token);

      } else if (document.URL.indexOf('code') !== -1) {
        data = Auth.getFromStandardGetParams(document.URL);
        console.log(data);
      } else {
        console.log('no data');
      }

    }
  ]);
