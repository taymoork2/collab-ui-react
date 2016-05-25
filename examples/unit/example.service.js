(function () {
  'use strict';

  angular.module('AtlasExample')
    .factory('ExampleService', ExampleService);

  /* @ngInject */
  function ExampleService($resource) {
    var exampleResource = $resource('/example/:id');
    var service = {
      getAndAddSomething: getAndAddSomething
    };

    return service;

    function getAndAddSomething(id) {
      return exampleResource.get({
        id: id
      }).$promise
        .then(addSomething)
        .catch(handleError);
    }

    function addSomething(obj) {
      obj.something = 'mySomething';
      return obj;
    }

    function handleError() {
      // Handle error
      return {};
    }
  }
})();
