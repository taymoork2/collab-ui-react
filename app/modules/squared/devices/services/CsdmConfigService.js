'use strict';

angular.module('Squared')
  .service('CsdmConfigService', ['Config',
    function ConfigService(Config) {

      var getUrl = function () {
        return Config.getCsdmServiceUrl();
      };

      var getEnrollmentServiceUrl = function () {
        return Config.getEnrollmentServiceUrl();
      };

      return {
        getUrl: getUrl,
        getEnrollmentServiceUrl: getEnrollmentServiceUrl
      };
    }
  ]);
