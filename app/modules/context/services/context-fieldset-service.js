(function () {
  'use strict';

  angular.module('Context')
    .service('ContextFieldsetsService', contextFieldsetsService);

  var dictionaryPath = '/dictionary/fieldset/v1/search';

  /* @ngInject */
  function contextFieldsetsService($http, Discovery) {
    var service = {
      getFieldsets: getFieldsets,
    };

    return service;

    //get fieldsets based on dictionary URL returned from discovery
    function getFieldsets() {
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
