/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightConfigService', sunlightConfigService);

  /* @ngInject */
  function sunlightConfigService($http, $rootScope, $q, Log, Config) {
    var sunlightUserConfigUrl = Config.getSunlightConfigServiceUrl() + "/user/";
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo
    };

    return service;

    function getUserInfo(userId) {

      var deferred = $q.defer();

      if (userId) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

        $http.get(sunlightUserConfigUrl + userId)
          .success(function (data, status) {
            data = data || {};
            deferred.resolve(data);
          })
          .error(function (data, status) {
            data = data || {};
            Log.error('Get userInfo call to Sunlight config service failed with status: ' + status);
            deferred.reject('Get UserInfo failed ' + data);
          });
      } else {
        Log.error('usedId cannot be null or undefined');
        deferred.reject('usedId cannot be null or undefined');
      }

      return deferred.promise;
    }

    function updateUserInfo(userData, userId) {

      var deferred = $q.defer();

      if (userId && userData) {

        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        $http.put(sunlightUserConfigUrl + userId, userData)
          .success(function (data, status) {
            data = data || {};
            deferred.resolve(data);
          })
          .error(function (data, status) {
            data = data || {};
            Log.error('Update userInfo call to Sunlight config service failed with status: ' + status);
            deferred.reject('Update UserInfo call failed ' + data);
          });
      } else {
        Log.error('cannot be null or undefined');
        deferred.reject('userId cannot be null');
      }
      return deferred.promise;
    }

  }
})();
