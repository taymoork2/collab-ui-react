'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$translateProvider','$stateProvider', '$urlRouterProvider',
    function($translateProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('login');
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'modules/core/views/login.html',
        controller: 'LoginCtrl'
      });

    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.json'
    });

     //Tell the module what language to use by default
    $translateProvider.preferredLanguage('en_US');
  }
]);

angular
  .module('Squared')
  .config(['$urlRouterProvider', '$stateProvider',
    function($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.when('/initialsetup','/initialsetup/accountreview');

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'modules/squared/views/home.html',
        controller: 'HomeCtrl'
      })
      .state('users', {
        url: '/users',
        templateUrl: 'modules/core/views/users.html',
        controller: 'UsersCtrl'
      })
      .state('downloads', {
        url: '/downloads',
        templateUrl: 'modules/squared/views/downloads.html',
        controller: 'DownloadsCtrl'
      })
      .state('orgs', {
        url: '/orgs',
        templateUrl: 'modules/core/views/organizations.html',
        controller: 'OrganizationsCtrl'
      })
      .state('templates', {
        url: '/templates',
        templateUrl: 'modules/squared/views/templates.html',
        controller: 'UsersCtrl'
      })
      .state('reports', {
        url: '/reports',
        templateUrl: 'modules/squared/views/reports.html',
        controller: 'ReportsCtrl'
      })
      .state('activate', {
        url: '/activate',
        templateUrl: 'modules/squared/views/activate.html',
        controller: 'ActivateCtrl'
      })
      .state('userprofile', {
        url: '/userprofile/:uid',
        templateUrl: 'modules/squared/views/userprofile.html',
        controller: 'UserProfileCtrl'
      })
      .state('support', {
        url: '/support',
        templateUrl: 'modules/squared/views/support.html',
        controller: 'SupportCtrl'
      })
      .state('invite', {
        url: '/invite',
        templateUrl: 'modules/squared/views/invite.html',
        controller: 'InviteCtrl'
      })
      .state('unauthorized', {
        url: '/unauthorized',
        templateUrl: 'modules/squared/views/unauthorized.html'
      })
      .state('invitelauncher', {
        url: '/invitelauncher',
        templateUrl: 'modules/squared/views/invitelauncher.html?'+new Date().getTime(),
        controller: 'InvitelauncherCtrl'
      })
      .state('applauncher', {
        url: '/applauncher',
        templateUrl: 'modules/squared/views/applauncher.html',
        controller: 'ApplauncherCtrl'
      })
      .state('spaces', {
        url: '/spaces',
        templateUrl: 'modules/squared/views/spaces.html',
        controller: 'SpacesCtrl'
      })
      .state('initialsetup', {
        url: '/initialsetup',
        templateUrl: 'modules/core/views/initialsetup.html',
        controller: 'InitialSetupCtrl'
      })
      .state('initialsetup.accountreview', {
        url: '/accountreview',
        templateUrl: 'modules/core/views/initialsetup.accountreview.html',
        controller: 'AccountReviewCtrl'
      })
      .state('initialsetup.servicesetup', {
        url: '/servicesetup',
        templateUrl: 'modules/core/views/initialsetup.servicesetup.html',
        controller: 'ServiceSetupCtrl'
      })
      .state('initialsetup.adduser', {
        url: '/adduser',
        templateUrl: 'modules/core/views/initialsetup.adduser.html',
        controller: 'AddUserCtrl'
      })
      .state('initialsetup.getstarted', {
        url: '/getstarted',
        templateUrl: 'modules/core/views/initialsetup.getstarted.html',
        controller: 'GetStartedCtrl'
      });
  }
]);

angular
  .module('Hercules')
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/fusion', {
      templateUrl: 'modules/hercules/views/connectors.html',
      controller: 'ConnectorCtrl'
    });
  }]);
