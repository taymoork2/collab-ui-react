(function() {
  'use strict';

  angular.module('Core')
    .controller('UserInfoController', UserInfoController);

  /* @ngInject */
  function UserInfoController($scope, Authinfo, Auth, Log, Config, $window, $location, $state, Userservice, $modal, Notification, $filter, FeedbackService, Utils, $translate, WebExUtilsFact, $timeout) {
    var getAuthinfoData = function () {
      $scope.username = Authinfo.getUserName();
      $scope.orgname = Authinfo.getOrgName();
      var roles = Authinfo.getRoles();
      if (!roles || roles.length === 0) {
        roles = ['User'];
      }
      $scope.roles = roles;
      $scope.orgId = Authinfo.getOrgId();
      $scope.isPartner = Authinfo.isPartnerAdmin();
      $scope.isPartnerSales = Authinfo.isPartnerSalesAdmin();
      $scope.roleList = _.map(roles, function (role) {
        return $translate.instant('atlasRoles.' + role);
      }).sort().join(', ');
    };
    getAuthinfoData();
    //update the scope when Authinfo data has been populated.
    $scope.$on('AuthinfoUpdated', function () {
      getAuthinfoData();
    });

    Userservice.getUser('me', function (data, status) {
      if (data.success) {
        if (data.id) {
          Authinfo.setUserId(data.id);
        }
        if (data.emails) {
          Authinfo.setEmails(data.emails);
        }
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
      var logoutPromise = WebExUtilsFact.logoutSite();

      var timeoutPromise = $timeout(function () {
        Auth.logout();
      }, 300);

      logoutPromise.then(function () {
        $timeout.cancel(timeoutPromise);
        Auth.logout();
      }, function () {
        $timeout.cancel(timeoutPromise);
        Auth.logout();
      });
      $scope.loggedIn = false;
    };

    $scope.openVideo = function () {
      $state.go('video');
    };

    $scope.sendFeedback = function () {
      var appType = 'Atlas_' + $window.navigator.userAgent;
      var feedbackId = Utils.getUUID();

      FeedbackService.getFeedbackUrl(appType, feedbackId).then(function (res) {
        $window.open(res.data.url, '_blank');
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

    $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
      if (Auth.isLoggedIn()) {
        $scope.loggedIn = true;
      }
    });

    $scope.supportUrl = (Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin()) ? Config.partnerSupportUrl : Config.supportUrl;
  }
})();