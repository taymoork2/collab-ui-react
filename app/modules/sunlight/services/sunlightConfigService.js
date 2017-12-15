/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  /* @ngInject */
  function sunlightConfigService($http, UrlConfig, Authinfo) {
    var sunlightUserConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/user';
    var sunlightChatTemplateUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/template';
    var sunlightChatConfigBase = UrlConfig.getSunlightConfigServiceUrl() + '/organization';
    var service = {
      getUserInfo: getUserInfo,
      updateUserInfo: updateUserInfo,
      createChatTemplate: createChatTemplate,
      editChatTemplate: editChatTemplate,
      createUserInfo: createUserInfo,
      getChatConfig: getChatConfig,
      deleteUser: deleteUser,
      onBoardCare: onBoardCare,
      updateChatConfig: updateChatConfig,
      aaOnboard: aaOnboard,
      onboardCareBot: onboardCareBot,
      onboardJwtApp: onboardJwtApp,
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

    function updateChatConfig(chatConfig) {
      var sunlightChatConfigUrl = sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/chat';
      return $http.put(sunlightChatConfigUrl, chatConfig);
    }

    function onBoardCare() {
      var onboardPayload = {
        orgDisplayName: Authinfo.getOrgName(),
        csDiscoveryUrl: 'discovery.produs1.ciscoccservice.com',
      };
      return $http.put(sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/csonboard', onboardPayload);
    }

    function aaOnboard() {
      var onboardPayload = {};
      return $http.post(sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/aaonboard', onboardPayload);
    }

    function onboardCareBot() {
      var onboardPayload = {};
      return $http.post(sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/apponboard', onboardPayload);
    }

    function onboardJwtApp() {
      var onboardPayload = {};
      return $http.post(sunlightChatConfigBase + '/' + Authinfo.getOrgId() + '/jwtAppOnboard', onboardPayload);
    }
  }

  module.exports = sunlightConfigService;
})();
