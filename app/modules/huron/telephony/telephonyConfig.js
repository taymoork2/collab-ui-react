(function () {
  'use strict';

  module.exports = angular
    .module('huron.config', [
      require('modules/core/config/config'),
      require('modules/huron/compass').default,
    ])
    .factory('HuronConfig', HuronConfig)
    .name;

  /* @ngInject */
  function HuronConfig(Config, HuronCompassService) {
    var config = {

      avrilUrl: {
        dev: 'https://avrildirmgmt.appstaging.ciscoccservice.com/avrildirmgmt/api/v1',
        integration: 'https://avrildirmgmt.appstaging.ciscoccservice.com/avrildirmgmt/api/v1',
        prod: 'https://avrildirmgmt.produs1.ciscoccservice.com/avrildirmgmt/api/v1'
      },

      getBaseDomain: function () {
        return HuronCompassService.getBaseDomain();
      },

      // TODO: Remove this when CMIv2 URl is ready.
      getMockHgUrl: function () {
        return 'https://mock-hg.de-ams.thunderhead.io/api/v2';
      },

      getCmiUrl: function () {
        return 'https://cmi.' + this.getBaseDomain() + '/api/v1';
      },

      getCmiV2Url: function () {
        return 'https://cmi.' + this.getBaseDomain() + '/api/v2';
      },

      getCesUrl: function () {
        return 'https://ces.' + this.getBaseDomain() + '/api/v1';
      },

      getPgUrl: function () {
        return 'https://paging.' + this.getBaseDomain() + '/api/v1';
      },

      getEmailUrl: function () {
        return 'https://hermes.' + this.getBaseDomain() + '/api/v1';
      },

      getTerminusUrl: function () {
        return 'https://terminus.' + this.getBaseDomain() + '/api/v1';
      },

      getTerminusV2Url: function () {
        return 'https://terminus.' + this.getBaseDomain() + '/api/v2';
      },

      getOcelotUrl: function () {
        return 'https://hermes.' + this.getBaseDomain() + '/api/v1';
      },

      getMinervaUrl: function () {
        return 'https://minerva.' + this.getBaseDomain() + '/api/v1';
      },

      getAvrilUrl: function () {
        if (Config.isDev()) {
          return this.avrilUrl.dev;
        } else if (Config.isIntegration()) {
          return this.avrilUrl.integration;
        } else {
          return this.avrilUrl.prod;
        }
      }
    };
    return config;
  }

})();
