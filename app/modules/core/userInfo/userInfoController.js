'use strict';

angular.module('Core')
  .controller('UserInfoController', ['$scope', 'Authinfo', 'Auth', 'Log', '$window', '$location', 'Userservice', '$modal', 'Notification', '$filter', 'FeedbackService', 'Utils',
    function ($scope, Authinfo, Auth, Log, $window, $location, Userservice, $modal, Notification, $filter, FeedbackService, Utils) {
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
        var appType = 'Atlas_' + $window.navigator.userAgent;
        var feedbackId = Utils.getUUID();

        FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
          Log.debug('feedback status: ' + status);
          if (data.success) {
            $window.open(data.url, '_blank');
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

      $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
        if (Auth.isLoggedIn()) {
          $scope.loggedIn = true;
        }
      });
    }
  ]);
