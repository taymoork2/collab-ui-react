'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Huron')
  .controller('TelephonyInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberService', 'Log', 'Config', 'Notification',
    function($scope, $q, $http, UserDirectoryNumberService, Log, Config, Notification) {

      $scope.userDnList = [];

      $scope.getUserDnInfo = function(user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;
        UserDirectoryNumberService.get({customerId: user.meta.organizationID, userId: user.id},
          function(data) {
            deferred.resolve(data);
          },function(error) {
            Log.debug('getUserDnInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      /**
        Function to inspect dnUsage from Huron and change the display
        value to what UX team wants.
      **/
      var getDnType = function(dnUsage) {
        return (dnUsage === 'Primary') ? 'Main' : '';
      };

      $scope.processUserDnInfo = function(userDnInfo) {
        if (userDnInfo) {
          $scope.userDnList = [];
          for (var i = 0; i < userDnInfo.length; i++) {
            var userLine = {
              'dnUsage': getDnType(userDnInfo[i].dnUsage),
              'uuid': userDnInfo[i].directoryNumber.uuid,
              'pattern': userDnInfo[i].directoryNumber.pattern.replace(/\\/g,'')
            };
            $scope.userDnList.push(userLine);
          }
        }
        else {
          $scope.userDnList = [];
        }
      };

      $scope.$watch('currentUser', function(newVal, oldVal) {
        if (newVal) {
          if ($scope.isHuronEnabled()) {
            $scope.getUserDnInfo(newVal)
              .then(function (response) { $scope.processUserDnInfo(response); })
              .catch(function(response) { $scope.processUserDnInfo(null); });
          }
        }
      });

      $scope.isHuronEnabled = function() {
        return isEntitled(Config.entitlements.huron);
      };

      var isEntitled = function(ent) {
        if ($scope.currentUser && $scope.currentUser.entitlements) {
          for (var i=0;i<$scope.currentUser.entitlements.length;i++) {
            var svc = $scope.currentUser.entitlements[i];

            if (svc === ent) {
              return true;
            }
          }
        }
        return false;
      };

    }
  ])
  .directive('telephonyInfo', function() {
    return {
      controller: 'TelephonyInfoCtrl',
      restrict: 'A',
      scope:{
        currentUser: '='
      },
      templateUrl: 'modules/huron/scripts/directives/views/telephony-info.html'
    };
  });
