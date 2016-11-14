(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService($http, UrlConfig) {
    var URL = {
      spData: UrlConfig.getGeminiUrl() + 'servicepartner'
    };
    var service = {
      getSpData: getSpData
    };
    return service;

    function getSpData() {
      return $http.get(URL.spData).then(function (response) {
        return response.data;
      });
    }
  }
})();
