(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService($http, UrlConfig) {
    var spDataUrl = UrlConfig.getGeminiUrl() + 'servicepartner';
    var service = {
      getSpData: getSpData
    };
    return service;

    function getSpData() {
      return $http.get(spDataUrl).then(function (response) {
        return response.data;
      });
    }
  }
})();
