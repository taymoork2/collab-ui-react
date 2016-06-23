/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightConfigService', sunlightConfigService);

  /* @ngInject */
  function sunlightConfigService($http, UrlConfig, Authinfo) {
    var sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/user';
    var sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/template';
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo,
      createChatTemplate: createChatTemplate,
      createUserInfo: createUserInfo
    };

    return service;

    function getUserInfo(userId) {
      return $http.get(sunlightUserConfigUrl + '/' + userId);
    }

    function updateUserInfo(userData, userId) {
      return $http.put(sunlightUserConfigUrl + '/' + userId, userData);
    }

    function createChatTemplate(chatTemplate) {
      return $http.post(sunlightChatConfigUrl, chatTemplate);
    }

    function createUserInfo(userData) {
      return $http.post(sunlightUserConfigUrl, userData);
    }

  }
})();
