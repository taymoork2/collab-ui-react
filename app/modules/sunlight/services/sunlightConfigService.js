/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightConfigService', sunlightConfigService);

  /* @ngInject */
  function sunlightConfigService($http, $rootScope, $q, Log, UrlConfig) {
    var sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + "/user/";
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo
    };

    return service;

    function getUserInfo(userId) {
      return $http.get(sunlightUserConfigUrl + userId);
    }

    function updateUserInfo(userData, userId) {
      return $http.put(sunlightUserConfigUrl + userId, userData);
    }

  }
})();
