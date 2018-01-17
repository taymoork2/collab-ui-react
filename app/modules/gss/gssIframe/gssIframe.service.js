(function () {
  'use strict';

  angular.module('GSS')
    .factory('GSSIframeService', GSSIframeService);

  function GSSIframeService($http) {
    var url;
    var service = {
      getGssUrl: getGssUrl,
      setGssUrl: setGssUrl,
      syncCheck: syncCheck,
      syncUp: syncUp,
    };
    return service;

    function getGssUrl() {
      return url;
    }

    function setGssUrl(_url_) {
      url = _url_;
    }

    function syncCheck() {
      var compareVersionUrl = url + '/compareVersion';
      return $http.get(compareVersionUrl)
        .then(extractData);
    }

    function syncUp() {
      var syncUpUrl = url + '/syncUpFromAWS';
      return $http.get(syncUpUrl)
        .then(extractData);
    }

    function extractData(response) {
      return response.data;
    }
  }
}());
