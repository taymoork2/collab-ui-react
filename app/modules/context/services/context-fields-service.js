(function () {
  'use strict';

  module.exports = contextFieldsService;

  var searchPath = '/dictionary/field/v1/search';
  var createPath = '/dictionary/field/v1';
  var idPath = '/dictionary/field/v1/id/';
  var MAX_ENTRIES_FOR_FIELD_SEARCH = 1500;

  /* @ngInject */
  function contextFieldsService($http, ContextDiscovery) {
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
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'id:*';
          return $http.get(dictionaryUrl + searchPath, {
            params: {
              q: searchQuery,
              maxEntries: MAX_ENTRIES_FOR_FIELD_SEARCH,
            },
          });
        })
        .then(function (response) {
          return response.data;
        })
        // TODO: Remove temporary fix to filter INTERNAL TEST ONLY fields.
        .then(function (fields) {
          return _.filter(fields, function (field) {
            return !(field.description && field.description.includes('*INTERNAL TEST ONLY:') && field.publiclyAccessible);
          });
        });
    }

    function getField(id) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + idPath + id);
        })
        .then(function (response) {
          return response.data;
        });
    }

    function createField(data) {
      return ContextDiscovery.getEndpointForService('dictionary')
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
      return ContextDiscovery.getEndpointForService('dictionary')
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
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.delete(dictionaryUrl + idPath + id);
        });
    }
  }
})();
