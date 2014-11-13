'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope',
    function ($scope) {
      $scope.headerTitle = 'Cisco Collaboration Management';
      $scope.navStyle = 'admin';
    }
  ])

.controller('UserInfoCtrl', ['$scope', 'Authinfo', 'Auth', 'Log', 'Config', '$window', '$location', 'Userservice',
  function ($scope, Authinfo, Auth, Log, Config, $window, $location, Userservice) {
    var getAuthinfoData = function () {
      $scope.username = Authinfo.getUserName();
      $scope.orgname = Authinfo.getOrgName();
    };
    getAuthinfoData();
    //update the scope when Authinfo data has been populated.
    $scope.$on('AuthinfoUpdated', function () {
      getAuthinfoData();
    });

    Userservice.getUser('me', function (data, status) {
      if (data.success) {
        if (data.photos) {
          for (var i in data.photos) {
            if (data.photos[i].type === 'thumbnail') {
              $scope.image = data.photos[i].value;
            }
          } //end for
        } //endif
      } else {
        Log.debug('Get current user failed. Status: ' + status);
      }
    });

    $scope.logout = function () {
      Auth.logout();
      $scope.loggedIn = false;
    };

    $scope.sendFeedback = function () {
      var userAgent = navigator.userAgent;
      userAgent = encodeURIComponent(userAgent);
      var logHistory = Log.getArchiveUrlencoded();
      var feedbackUrl = 'mailto:' + Config.feedbackNavConfig.mailto + '?subject=' + Config.feedbackNavConfig.subject + '&body=User%20Agent:' + userAgent + '%0D%0A%0D%0APlease%20type%20your%20feedback%20below:%0D%0A%0D%0A%0D%0A%0D%0AUser%20Logs:%0D%0A' + logHistory;
      Log.debug('sending feedback: ' + feedbackUrl);
      $window.location.href = feedbackUrl;
    };

    if (Auth.isLoggedIn()) {
      $scope.loggedIn = true;
    } else {
      $scope.loggedIn = false;
    }

    $scope.$on('ACCESS_TOKEN_REVIEVED', function () {
      if (Auth.isLoggedIn()) {
        $scope.loggedIn = true;
      }
    });
  }
])

.controller('SettingsMenuCtrl', ['$scope', '$location', '$state', 'Authinfo', 'Utils',
  function ($scope, $location, $state, Authinfo, Utils) {

    $scope.menuItems = [];

    var getAuthinfoData = function () {
      var found = false;
      if (Authinfo.isCustomerAdmin()) {
        for (var i = 0, l = $scope.menuItems.length; i < l; i++) {
          if ($scope.menuItems[i].title === 'Initial Setup') {
            found = true;
          }
        }
        if (!found) {
          $scope.menuItems.push({
            link: '/initialsetup',
            title: 'Initial Setup'
          });
        }
      }
    };
    if (Utils.isAdminPage()) {
      getAuthinfoData();
    }
    //update the scope when Authinfo data has been populated.
    $scope.$on('AuthinfoUpdated', function () {
      getAuthinfoData();
    });

    $scope.doAction = function (path) {
      if (path === '/initialsetup') {
        $state.go('setupwizardmodal');
      } else {
        $location.path(path);
      }
    };
  }

]);
