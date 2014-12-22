'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope',
    function ($scope) {
      $scope.headerTitle = 'Cisco Collaboration Management';
      $scope.navStyle = 'admin';
    }
  ])

.controller('UserInfoCtrl', ['$scope', 'Authinfo', 'Auth', 'Log', 'Config', '$window', '$location', 'Userservice', '$modal', 'Notification', '$filter', 'FeedbackService', 'Utils',
  function ($scope, Authinfo, Auth, Log, Config, $window, $location, Userservice, $modal, Notification, $filter, FeedbackService, Utils) {
    var getAuthinfoData = function () {
      $scope.username = Authinfo.getUserName();
      $scope.orgname = Authinfo.getOrgName();
      $scope.orgId = Authinfo.getOrgId();
      $scope.isPartner = Authinfo.isPartner();
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
      var appType = 'Atlas_' + navigator.userAgent;
      var feedbackId = Utils.getUUID();

      FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
        Log.debug('feedback status: ' + status);
        if (data.success) {
          //TODO In the future we will integrate the support page into a modal
          // $scope.sendFeedbackModalInstance = $modal.open({
          //   templateUrl: data.url,
          //   windowClass: 'modal-feedback-dialog',
          //   scope: $scope
          // });
          window.open(data.url, '_blank');
        } else {
          Log.debug('Cannot load feedback url: ' + status);
        }
      });
    };

    $scope.saveFeedback = function () {
      var msg = $filter('translate')('directoryNumberPanel.success');
      var type = 'success';
      Notification.notify([msg], type);
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
