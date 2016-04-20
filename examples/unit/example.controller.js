(function () {
  'use strict';

  angular.module('AtlasExample')
    .controller('ExampleController', ExampleController);

  /* @ngInject */
  function ExampleController(ExampleService) {
    var vm = this;

    vm.count = 0;
    vm.error = false;
    vm.loading = false;
    vm.doneSomething = false;

    vm.incrementCount = incrementCount;
    vm.doSomething = doSomething;

    function incrementCount() {
      vm.count++;
    }

    function doSomething(something) {
      vm.loading = true;
      return ExampleService.getAndAddSomething(something)
        .then(doSomethingElse)
        .catch(handleError)
        .finally(doneLoading);
    }

    function doSomethingElse() {
      vm.doneSomething = true;
    }

    function handleError() {
      vm.error = true;
    }

    function doneLoading() {
      vm.loading = false;
    }
  }
})();
