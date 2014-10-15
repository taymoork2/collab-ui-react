'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$translateProvider', '$stateProvider', '$urlRouterProvider',
    function($translateProvider, $stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('login');
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'modules/core/views/login.html',
          controller: 'LoginCtrl',
          authenticate: false
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
      $urlRouterProvider.when('/initialsetup', '/initialsetup/accountreview');

      $stateProvider
        .state('activate', {
          url: '/activate',
          templateUrl: 'modules/squared/views/activate.html',
          controller: 'ActivateCtrl',
          authenticate: false
        })
        .state('downloads', {
          url: '/downloads',
          templateUrl: 'modules/squared/views/downloads.html',
          controller: 'DownloadsCtrl',
          authenticate: false
        })
        .state('invite', {
          url: '/invite',
          templateUrl: 'modules/squared/views/invite.html',
          controller: 'InviteCtrl',
          authenticate: false
        })
        .state('invitelauncher', {
          url: '/invitelauncher',
          templateUrl: 'modules/squared/views/invitelauncher.html',
          controller: 'InvitelauncherCtrl',
          authenticate: false
        })
        .state('applauncher', {
          url: '/applauncher',
          templateUrl: 'modules/squared/views/applauncher.html',
          controller: 'ApplauncherCtrl',
          authenticate: false
        })
        .state('home', {
          url: '/home',
          templateUrl: 'modules/core/views/landingPage.html',
          controller: 'HomeCtrl'
        })
        .state('users', {
          url: '/users',
          templateUrl: 'modules/core/views/users.html',
          controller: 'UsersCtrl'
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
        .state('unauthorized', {
          url: '/unauthorized',
          templateUrl: 'modules/squared/views/unauthorized.html'
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
        })
        .state('partnerhome', {
          url: '/partnerhome',
          templateUrl: 'modules/core/views/partnerlanding.html',
          controller: 'PartnerHomeCtrl'
        });
    }
  ]);

angular
  .module('Huron')
  .config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('callrouting', {
          url: '/callrouting',
          templateUrl: 'modules/huron/views/callrouting.html',
          controller: 'CallRoutingCtrl'
        });
    }
  ]);

angular
  .module('Hercules')
  .config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('fusion', {
          url: '/fusion',
          templateUrl: 'modules/hercules/views/connectors.html',
          controller: 'ConnectorCtrl'
        });
    }
  ]);
