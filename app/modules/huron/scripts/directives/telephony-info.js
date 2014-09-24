'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Huron')
  .controller('TelephonyInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberService', 'UserServiceCommon','Log', 'Config', 'Notification',
    function($scope, $q, $http, UserDirectoryNumberService, UserServiceCommon, Log, Config, Notification) {

      $scope.userDnList = [];
      //$scope.directoryNumberPanel = false;
      //$scope.voicemailPanel = false;
      $scope.directoryNumber = null;
      $scope.telephonyUser = null;
      $scope.voicemail = 'Off';
      $scope.singleNumberReach = 'Off';

      $scope.isVoicemailEnabled = function() {
        var isVoicemailEnabled = false;

        if ($scope.telephonyUser.services !== null && $scope.telephonyUser.services.length > 0) {
          for (var j=0; j< $scope.telephonyUser.services.length; j++) {
            if($scope.telephonyUser.services[j] === 'VOICEMAIL') {
              isVoicemailEnabled = true;
            }
          }
        }
        return isVoicemailEnabled;
      };

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

      $scope.getTelephonyUserInfo = function(user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;
        UserServiceCommon.get({customerId: user.meta.organizationID, userId: user.id},
          function(data) {
            deferred.resolve(data);
          },function(error) {
            Log.debug('getTelephonyUserInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processTelephonyUserInfo = function(telephonyUserInfo) {
        if (telephonyUserInfo) {
          $scope.telephonyUser = telephonyUserInfo;
          if ($scope.isVoicemailEnabled()) {
            $scope.voicemail = 'On';
          } else {
            $scope.voicemail = 'Off';
          }
          if ($scope.singleNumberReachEnabled !== undefined && !$scope.singleNumberReachEnabled) {
            $scope.singleNumberReach = 'On';
          } else {
            $scope.singleNumberReach = 'Off';
          }
        } else {
          $scope.telephonyUser = null;
        }
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
            $scope.getTelephonyUserInfo(newVal)
              .then(function(response) {$scope.processTelephonyUserInfo(response);})
              .catch(function(response) {$scope.processTelephonyUserInfo(null);});
            $scope.getUserDnInfo(newVal)
              .then(function (response) { $scope.processUserDnInfo(response); })
              .catch(function(response) { $scope.processUserDnInfo(null); });
          }
        }
      });

      $scope.isHuronEnabled = function() {
        return isEntitled(Config.entitlements.huron);
      };

      $scope.showDirectoryNumberPanel = function (value) {
        $scope.conversationsPanel = false;
        $scope.voicemailPanel = false;
        $scope.singleNumberReachPanel = false;
        $scope.directoryNumberPanel = true;
        $scope.directoryNumber = value;

        $('#entire-slide').animate({
          'left': '0px'
        }, 1000, function() {});
      };

      $scope.showVoicemailPanel = function () {
        $scope.conversationsPanel = false;
        $scope.directoryNumberPanel = false;
        $scope.singleNumberReachPanel = false;
        $scope.voicemailPanel = true;
        
        $('#entire-slide').animate({
          'left': '0px'
        }, 1000, function() {});
      };

      $scope.showSingleNumberReachPanel = function () {
        $scope.conversationsPanel = false;
        $scope.directoryNumberPanel = false;
        $scope.voicemailPanel = false;
        $scope.singleNumberReachPanel = true;
        
        $('#entire-slide').animate({
          'left': '0px'
        }, 1000, function() {});
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
      scope: false,
      templateUrl: 'modules/huron/scripts/directives/views/telephony-info.html'
    };
  });
