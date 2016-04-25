(function() {
  'use strict';

  angular.module('Squared')
    .controller('UserProfileCtrl', UserProfileCtrl);

  /* @ngInject */
  function UserProfileCtrl($scope, $location, $route, $stateParams, Log, Utils, $filter, Userservice, Authinfo, Notification, Config) {

    var userid = $stateParams.uid;
    $scope.orgName = Authinfo.getOrgName();

    Userservice.getUser(userid, function (data, status) {
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

    $scope.gotoPath = function (path) {
      $location.path(path);
    };

    $scope.updateUser = function () {
      var userData = {
        'schemas': Config.scimSchemas,
        'name': {},
        'meta': {
          'attributes': []
        }
      };
      // Add or delete properties depending on whether or not their value is empty/blank.
      // With property value set to "", the back-end will respond with a 400 error.
      // Guidance from CI team is to not specify any property containing an empty string
      // value. Instead, add the property to meta.attribute to have its value be deleted.
      if ($scope.user.name) {
        if ($scope.user.name.givenName) {
          userData.name["givenName"] = $scope.user.name.givenName;
        } else {
          userData.meta.attributes.push('name.givenName');
        }
        if ($scope.user.name.familyName) {
          userData.name["familyName"] = $scope.user.name.familyName;
        } else {
          userData.meta.attributes.push('name.familyName');
        }
      }
      if ($scope.user.displayName) {
        userData.displayName = $scope.user.displayName;
      } else {
        userData.meta.attributes.push('displayName');
      }
      if ($scope.user.title) {
        userData.title = $scope.user.title;
      } else {
        userData.meta.attributes.push('title');
      }

      Log.debug('Updating user: ' + userid + ' with data: ');
      Log.debug(userData);

      Userservice.updateUserProfile(userid, userData, function (data, status) {
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
})();