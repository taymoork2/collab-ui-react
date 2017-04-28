(function () {
  'use strict';

  angular.module('Context')
    .service('ContextFieldsService', contextFieldsService);

  var searchPath = '/dictionary/field/v1/search';
  var createPath = '/dictionary/field/v1';
  var idPath = '/dictionary/field/v1/id/';

  /* @ngInject */
  function contextFieldsService($http, Discovery) {
    var service = {
      getFields: getFields,
      createField: createField,
      getField: getField,
      createAndGetField: createAndGetField,
      updateField: updateField,
      updateAndGetField: updateAndGetField,
      deleteField: deleteField,
    };

    return service;

    //get fields based on dictionary URL returned from discovery
    function getFields() {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'id:*';
          return $http.get(dictionaryUrl + searchPath, {
            params: {
              q: searchQuery,
              maxEntries: 200,
            },
          });
        })
        .then(function (response) {
          return response.data;
        });
    }

    function getField(id) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + idPath + id);
        })
        .then(function (response) {
          return response.data;
        });
    }

    function createField(data) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.post(dictionaryUrl + createPath, data);
        });
    }

    function createAndGetField(data) {
      return createField(data)
        .then(function () {
          return getField(data.id);
        });
    }

    function updateField(data) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.put(dictionaryUrl + idPath + data.id, data);
        });
    }

    function updateAndGetField(data) {
      return updateField(data)
        .then(function () {
          return getField(data.id);
        });
    }

    function deleteField(id) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.delete(dictionaryUrl + idPath + id);
        });
    }

  }
})();
