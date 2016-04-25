'use strict';

angular.module('Squared')
  .service('CsdmConfigService', CsdmConfigService);

/* @ngInject */
function CsdmConfigService(UrlConfig) {

  var getUrl = function () {
    return UrlConfig.getCsdmServiceUrl();
  };

  var getEnrollmentServiceUrl = function () {
    return UrlConfig.getEnrollmentServiceUrl();
  };

  return {
    getUrl: getUrl,
    getEnrollmentServiceUrl: getEnrollmentServiceUrl
  };
}
