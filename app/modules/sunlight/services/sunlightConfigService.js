/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightConfigService', sunlightConfigService);

  function sunlightConfigService($http, $rootScope, Config) {
    var sunlightUserConfigUrl = Config.getSunlightConfigServuiceUrl() + "user/";
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo
    };

    return service;

    function getUserInfo(userId, callback) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

      $http.get(sunlightUserConfigUrl + userId)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          callback(data, status);
        });
    }

    function updateUserInfo(userData, userId, callback) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
      $http.put(sunlightUserConfigUrl + userId, userData)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          callback(data, status);
        });
    }
  }
})();
