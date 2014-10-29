'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$translateProvider', '$stateProvider', '$urlRouterProvider',
    function($translateProvider, $stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('login');
      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'modules/core/login/login.tpl.html',
          controller: 'LoginCtrl',
          authenticate: false
        })
        .state('main', {
          templateUrl: 'modules/core/views/main.tpl.html',
          abstract: true
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
          parent: 'main',
          authenticate: false
        })
        .state('downloads', {
          url: '/downloads',
          templateUrl: 'modules/squared/views/downloads.html',
          controller: 'DownloadsCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('invite', {
          url: '/invite',
          templateUrl: 'modules/squared/views/invite.html',
          controller: 'InviteCtrl',
          parent: 'main',
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
          parent: 'main',
          authenticate: false
        })
        .state('appdownload', {
          url: '/appdownload',
          templateUrl: 'modules/squared/views/appdownload.html',
          controller: 'AppdownloadCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('home', {
          url: '/home',
          templateUrl: 'modules/core/landingPage/landingPage.tpl.html',
          controller: 'LandingPageCtrl',
          parent: 'main'
        })
        .state('users', {
          absract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('users.list', {
          url: '/users',
          templateUrl: 'modules/core/users/userList/userList.tpl.html',
          controller: 'ListUsersCtrl',
        })
        .state('users.list.preview', {
          templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
          controller: 'UserPreviewCtrl'
        })
        .state('users.list.preview.conversations', {
          template: '<div user-entitlements current-user="currentUser" entitlements="entitlements" queryuserslist="queryuserslist"></div>'
        })
        .state('users.list.preview.directorynumber', {
          template: '<div directory-number-info></div>'
        })
        .state('users.list.preview.voicemail', {
          template: '<div voicemail-info></div>'
        })
        .state('users.list.preview.snr', {
          template: '<div single-number-reach-info></div>'
        })
        .state('users.add', {
          url: '/users/add',
          templateUrl: 'modules/core/users/userAdd/userAdd.tpl.html',
          controller: 'UsersCtrl'
        })
        .state('orgs', {
          url: '/orgs',
          templateUrl: 'modules/core/views/organizations.html',
          controller: 'OrganizationsCtrl',
          parent: 'main'
        })
        .state('templates', {
          url: '/templates',
          templateUrl: 'modules/squared/views/templates.html',
          controller: 'UsersCtrl',
          parent: 'main'
        })
        .state('reports', {
          url: '/reports',
          templateUrl: 'modules/squared/views/reports.html',
          controller: 'ReportsCtrl',
          parent: 'main'
        })
        .state('userprofile', {
          url: '/userprofile/:uid',
          templateUrl: 'modules/squared/views/userprofile.html',
          controller: 'UserProfileCtrl',
          parent: 'main'
        })
        .state('support', {
          url: '/support',
          templateUrl: 'modules/squared/views/support.html',
          controller: 'SupportCtrl',
          parent: 'main'
        })
        .state('unauthorized', {
          url: '/unauthorized',
          templateUrl: 'modules/squared/views/unauthorized.html',
          parent: 'main'
        })
        .state('spaces', {
          url: '/spaces',
          templateUrl: 'modules/squared/views/spaces.html',
          controller: 'SpacesCtrl',
          parent: 'main'
        })
        .state('initialsetup', {
          url: '/initialsetup',
          templateUrl: 'modules/core/views/initialsetup.html',
          controller: 'InitialSetupCtrl',
          parent: 'main'
        })
        .state('initialsetup.accountreview', {
          url: '/accountreview',
          templateUrl: 'modules/core/views/initialsetup.accountreview.html',
          controller: 'AccountReviewCtrl',
          parent: 'main'
        })
        .state('initialsetup.servicesetup', {
          url: '/servicesetup',
          templateUrl: 'modules/core/views/initialsetup.servicesetup.html',
          controller: 'ServiceSetupCtrl',
          parent: 'main'
        })
        .state('initialsetup.adduser', {
          url: '/adduser',
          templateUrl: 'modules/core/views/initialsetup.adduser.html',
          controller: 'AddUserCtrl',
          parent: 'main'
        })
        .state('initialsetup.getstarted', {
          url: '/getstarted',
          templateUrl: 'modules/core/views/initialsetup.getstarted.html',
          controller: 'GetStartedCtrl',
          parent: 'main'
        })
        .state('partnerhome', {
          url: '/partnerhome',
          templateUrl: 'modules/core/views/partnerlanding.html',
          controller: 'PartnerHomeCtrl',
          parent: 'main'
        })
        .state('partnerreports', {
          url: '/partnerreports',
          templateUrl: 'modules/squared/views/partnerreports.html',
          controller: 'ReportsCtrl',
          parent: 'main'
        })
        .state('customers', {
          url: '/customers',
          templateUrl: 'modules/core/customers/customerList/customerList.tpl.html',
          controller: 'PartnerHomeCtrl',
          parent: 'main'
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
          controller: 'CallRoutingCtrl',
          parent: 'main'
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
          controller: 'ConnectorCtrl',
          parent: 'main'
        });
    }
  ]);
