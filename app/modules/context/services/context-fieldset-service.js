(function () {
  'use strict';

  module.exports = contextFieldsetsService;

  var searchPath = '/dictionary/fieldset/v1/search';
  var createPath = '/dictionary/fieldset/v1';
  var getPath = '/dictionary/fieldset/v1/id/';
  var statusPath = '/dictionary/fieldset/v1/status/';
  var MAX_ENTRIES_FOR_FIELDSET_SEARCH = 1500;

  /* @ngInject */
  function contextFieldsetsService($http, ContextDiscovery) {
    var service = {
      getFieldsets: getFieldsets,
      getFieldMembership: getFieldMembership,
      getFieldset: getFieldset,
      createFieldset: createFieldset,
      createAndGetFieldset: createAndGetFieldset,
      getInUse: getInUse,
      updateAndGetFieldset: updateAndGetFieldset,
      deleteFieldset: deleteFieldset,
    };

    return service;

    //get fieldsets based on dictionary URL returned from ContextDiscovery
    function getFieldsets() {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'id:*';
          return $http.get(dictionaryUrl + searchPath, {
            params: {
              q: searchQuery,
              maxEntries: MAX_ENTRIES_FOR_FIELDSET_SEARCH,
            },
          })
            .then(function (response) {
              return response.data;
            })
            .catch(function (response) {
              return response;
            });
        });
    }

    function getFieldMembership(fieldId) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'fieldId:';
          return $http.get(dictionaryUrl + searchPath, {
            params: {
              q: searchQuery + fieldId,
              maxEntries: MAX_ENTRIES_FOR_FIELDSET_SEARCH,
            },
          });
        }).then(function (response) {
          return _.map(response.data, function (fieldset) {
            return fieldset.id;
          });
        }).catch(function (response) {
          return response;
        });
    }

    function getFieldset(id) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + getPath + id);
        }).then(function (response) {
          return response.data;
        });
    }

    function createFieldset(data) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.post(dictionaryUrl + createPath, data);
        });
    }

    function createAndGetFieldset(data) {
      return createFieldset(data)
        .then(function () {
          return getFieldset(data.id);
        });
    }

    function getInUse(id) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + statusPath + id)
            .then(function (response) {
              return _.get(response, 'data.status.inUse', false);
            });
        });
    }

    function updateFieldset(data) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.put(dictionaryUrl + getPath + data.id, data);
        });
    }

    function updateAndGetFieldset(data) {
      return updateFieldset(data)
        .then(function () {
          return getFieldset(data.id);
        });
    }

    function deleteFieldset(id) {
      return ContextDiscovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.delete(dictionaryUrl + getPath + id);
        });
    }
  }
})();
