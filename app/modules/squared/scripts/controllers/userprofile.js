'use strict';

angular.module('Squared')
  .controller('UserProfileCtrl', ['$scope', '$location', '$route', '$stateParams', 'Log', 'Utils', '$filter', 'Userservice', 'Authinfo', 'Notification', 'Config', 'Auth',
    function($scope, $location, $route, $stateParams, Log, Utils, $filter, Userservice, Authinfo, Notification, Config, Auth) {

      var userid = $stateParams.uid;
      $scope.orgName = Authinfo.getOrgName();

      if (Auth.isAuthorizedFtwPath($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      Userservice.getUser(userid, function(data, status) {
        if (data.success) {
          $scope.user = data;
          if ($scope.user.photos) {
            for (var i in $scope.user.photos) {
              if ($scope.user.photos[i].type === 'thumbnail') {

                $scope.photoPath = $scope.user.photos[i].value;
              }
            } //end for
          } //endif
        } else {
          Log.debug('Get existing user failed. Status: ' + status);
        }
      });

      $scope.gotoPath = function(path) {
        $location.path(path);
      };

      $scope.updateUser = function() {
        var userData = {
          'schemas': Config.scimSchemas,
          'title': $scope.user.title,
          'name': {
            'givenName': $scope.user.name.givenName,
            'familyName': $scope.user.name.familyName
          },
        };

        Log.debug('Updating user: ' + userid + ' with data: ');
        Log.debug(userData);

        Userservice.updateUserProfile(userid, userData, function(data, status) {
          if (data.success) {
            var successMessage = [];
            successMessage.push($filter('translate')('profilePage.success'));
            Notification.notify(successMessage, 'success');
            $scope.user = data;
          } else {
            Log.debug('Update existing user failed. Status: ' + status);
            var errorMessage = [];
            errorMessage.push($filter('translate')('profilePage.error'));
            Notification.notify(errorMessage, 'error');
          }
        });
      };

    }
  ]);
