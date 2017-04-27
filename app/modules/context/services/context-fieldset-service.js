(function () {
  'use strict';

  angular.module('Context')
    .service('ContextFieldsetsService', contextFieldsetsService);

  var searchPath = '/dictionary/fieldset/v1/search';
  var createPath = '/dictionary/fieldset/v1';
  var getPath = '/dictionary/fieldset/v1/id/';
  var statusPath = '/dictionary/fieldset/v1/status/';

  /* @ngInject */
  function contextFieldsetsService($http, Discovery) {
    var service = {
      getFieldsets: getFieldsets,
      getFieldMembership: getFieldMembership,
      getFieldset: getFieldset,
      createFieldset: createFieldset,
      createAndGetFieldset: createAndGetFieldset,
      getInUse: getInUse,
      updateAndGetFieldset: updateAndGetFieldset,
    };

    return service;

    //get fieldsets based on dictionary URL returned from discovery
    function getFieldsets() {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'id:*';
          return $http.get(dictionaryUrl + searchPath, {
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

    function getFieldMembership(fieldId) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          var searchQuery = 'fieldId:';
          return $http.get(dictionaryUrl + searchPath, {
            params: {
              q: searchQuery + fieldId,
              maxEntries: 200,
            },
          });
        }).then(function (response) {
          return _.map(response.data, function (fieldset) {
            return fieldset.id;
          });
        });
    }

    function getFieldset(id) {
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + getPath + id);
        }).then(function (response) {
          return response.data;
        });
    }

    function createFieldset(data) {
      return Discovery.getEndpointForService('dictionary')
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
      return Discovery.getEndpointForService('dictionary')
        .then(function (dictionaryUrl) {
          return $http.get(dictionaryUrl + statusPath + id)
            .then(function (response) {
              return _.get(response, 'data.status.inUse', false);
            });
        });
    }

    function updateFieldset(data) {
      return Discovery.getEndpointForService('dictionary')
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
  }
})();
