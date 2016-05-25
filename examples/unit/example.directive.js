(function () {
  'use strict';

  angular.module('AtlasExample')
    .directive('atlasExample', AtlasExample);

  function AtlasExample() {
    var directive = {
      restrict: 'E',
      controller: 'ExampleController',
      controllerAs: 'example',
      templateUrl: 'examples/unit/example.tpl.html'
    };

    return directive;
  }
})();
