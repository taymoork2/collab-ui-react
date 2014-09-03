'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$routeProvider', '$translateProvider',
    function($routeProvider, $translateProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'modules/core/views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/login', {
        templateUrl: 'modules/core/views/login.html',
        controller: 'LoginCtrl'
      })
      
      .when('/test', {
        templateUrl: 'modules/core/views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

     //Tell the module what language to use by default
    $translateProvider.preferredLanguage('en_US');
  
  }]);

angular
  .module('Squared')
  .config(['$routeProvider',
    function($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'modules/squared/views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/users', {
        templateUrl: 'modules/core/views/users.html',
        controller: 'UsersCtrl'
      })
      .when('/downloads', {
        templateUrl: 'modules/squared/views/downloads.html',
        controller: 'DownloadsCtrl'
      })
      .when('/orgs', {
        templateUrl: 'modules/squared/views/organizations.html',
        controller: 'OrganizationsCtrl'
      })
      .when('/templates', {
        templateUrl: 'modules/squared/views/templates.html',
        controller: 'UsersCtrl'
      })
      .when('/reports', {
        templateUrl: 'modules/squared/views/reports.html',
        controller: 'ReportsCtrl'
      })
      .when('/activate', {
        templateUrl: 'modules/squared/views/activate.html',
        controller: 'ActivateCtrl'
      })
      .when('/userprofile/:uid', {
        templateUrl: 'modules/squared/views/userprofile.html',
        controller: 'UserProfileCtrl'
      })
      .when('/support', {
        templateUrl: 'modules/squared/views/support.html',
        controller: 'SupportCtrl'
      })
      .when('/invite', {
        templateUrl: 'modules/squared/views/invite.html',
        controller: 'InviteCtrl'
      })
      .when('/unauthorized', {
        templateUrl: 'modules/squared/views/unauthorized.html'
      })
      .when('/invitelauncher', {
        templateUrl: 'modules/squared/views/invitelauncher.html?'+new Date().getTime(),
        controller: 'InvitelauncherCtrl'
      });
  
  }]);
