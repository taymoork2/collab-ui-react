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
    var sunlightChatTemplateUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/template';
    var sunlightChatConfigBase = UrlConfig.getSunlightConfigServiceUrl() + '/organization';
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo,
      createChatTemplate: createChatTemplate,
      editChatTemplate: editChatTemplate,
      createUserInfo: createUserInfo,
      getChatConfig: getChatConfig,
      deleteUser: deleteUser
    };

    return service;

    function getUserInfo(userId) {
      return $http.get(sunlightUserConfigUrl + '/' + userId);
    }

    function updateUserInfo(userData, userId) {
      return $http.put(sunlightUserConfigUrl + '/' + userId, userData);
    }

    function createChatTemplate(chatTemplate) {
      return $http.post(sunlightChatTemplateUrl, chatTemplate);
    }

    function editChatTemplate(chatTemplate, templateId) {
      return $http.put(sunlightChatTemplateUrl + '/' + templateId, chatTemplate);
    }

    function createUserInfo(userData) {
      return $http.post(sunlightUserConfigUrl, userData);
    }

    function getChatConfig() {
      var sunlightChatConfigUrl = sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/chat';
      return $http.get(sunlightChatConfigUrl);
    }

    function deleteUser(userId) {
      return $http.delete(sunlightUserConfigUrl + '/' + userId);
    }
  }
})();
