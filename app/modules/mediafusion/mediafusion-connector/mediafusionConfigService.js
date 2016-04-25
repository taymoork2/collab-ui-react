'use strict';

angular.module('Mediafusion')
  .service('MediafusionConfigService', MediafusionConfigService);

/* @ngInject */
function MediafusionConfigService($location, UrlConfig) {

  var baseHerculesUrl = UrlConfig.getHerculesUrl();
  var baseUssUrl = UrlConfig.getUssUrl();
  var baseCalliopeUrl = UrlConfig.getCalliopeUrl();

  var getUrl = function () {
    return baseHerculesUrl;
  };
  var getUSSUrl = function () {
    return baseUssUrl + 'uss/api/v1';
  };
  var getCalliopeUrl = function () {
    return baseCalliopeUrl;
  };

  return {
    getUrl: getUrl,
    getUSSUrl: getUSSUrl,
    getCalliopeUrl: getCalliopeUrl
  };
}
