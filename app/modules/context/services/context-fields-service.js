(function () {
  'use strict';

  angular.module('Context')
    .service('ContextFieldsService', contextFieldsService);

  var dictionaryPath = '/dictionary/field/v1/search';

  /* @ngInject */
  function contextFieldsService($http, Discovery) {
    var service = {
      getFields: getFields,
    };

    return service;

    //get fields based on dictionary URL returned from discovery
    function getFields() {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'id:*';
          return $http.get(dictionaryUrl + dictionaryPath, {
            params: {
              q: searchQuery,
              maxEntries: 200,
            },
          })
            .then(function (response) {
              return response.data;
            });
        });
    }


  }
})();
