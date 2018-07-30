(function () {
  'use strict';

  module.exports = angular
    .module('huron.config', [
      require('modules/core/config/config').default,
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
        prod: 'https://avrildirmgmt.produs1.ciscoccservice.com/avrildirmgmt/api/v1',
      },

      getBaseDomain: function () {
        return HuronCompassService.getBaseDomain();
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

      getMmsUrl: function () {
        return 'https://mms.' + this.getBaseDomain() + '/api/v1';
      },

      getAvrilUrl: function () {
        if (Config.isDev()) {
          return this.avrilUrl.dev;
        } else if (Config.isIntegration()) {
          return this.avrilUrl.integration;
        } else {
          return this.avrilUrl.prod;
        }
      },

      getToggleUrl: function () {
        return 'https://toggle.' + this.getBaseDomain() + '/toggle/api/v3';
      },

      getRialtoUrl: function () {
        return 'http://172.24.77.211:8000/enterpriseportalapi/v1.0';
      },

      getUpgradeUrl: function () { //TBD-- add the devhost:port for local testing
        return 'http://hcs-upgrade/api/v1';
      },
    };
    return config;
  }
})();
