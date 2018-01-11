(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantHybridCareService', AutoAttendantHybridCareService);

  /* @ngInject */
  function AutoAttendantHybridCareService($q, Authinfo, ServiceDescriptorService, PrivateTrunkService) {
    var service = {
      isHybridCallConfigured: isHybridCallConfigured,
      isEPTConfigured: isEPTConfigured,
      isHybridAndEPTConfigured: isHybridAndEPTConfigured,
      isSparkCallConfigured: isSparkCallConfigured,
    };

    return service;

    /////////////////////

    function isHybridCallConfigured() {
      if (Authinfo.isCare() || Authinfo.isCareVoice()) {
        return ServiceDescriptorService.getServices().then(function (data) {
          if (data.length != 0) {
            var items = _.filter(data, {
              enabled: true,
            });
            var ucServices = _.filter(items, { id: 'squared-fusion-uc' });
            var ecServices = _.filter(items, { id: 'squared-fusion-ec' });
            if (ucServices.length > 0 && ecServices.length > 0) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        }).catch(function () {
          return false;
        });
      } else {
        return false;
      }
    }

    function isEPTConfigured() {
      if (Authinfo.isCare() || Authinfo.isCareVoice()) {
        return PrivateTrunkService.getPrivateTrunk().then(function (data) {
          if (data.resources.length != 0) {
            return true;
          } else {
            return false;
          }
        }).catch(function () {
          return false;
        });
      } else {
        return false;
      }
    }

    function isHybridAndEPTConfigured() {
      if (Authinfo.isCare() || Authinfo.isCareVoice()) {
        return $q.all({
          isHybridConfigured: isHybridCallConfigured(),
          isEPTConfigured: isEPTConfigured(),
        }).then(function (configuredStatus) {
          return configuredStatus.isHybridConfigured && configuredStatus.isEPTConfigured;
        }).catch(function () {
          return false;
        });
      } else {
        return false;
      }
    }

    function isSparkCallConfigured() {
      return Authinfo.isSquaredUC();
    }
  }
})();
