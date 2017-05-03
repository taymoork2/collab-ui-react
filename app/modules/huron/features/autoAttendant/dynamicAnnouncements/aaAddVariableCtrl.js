(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAAddVariableCtrl', AAAddVariableCtrl);

  /* @ngInject */
  function AAAddVariableCtrl($scope) {

    var vm = this;

    var CONSTANTS = {};
    CONSTANTS.idSelectorPrefix = '#';

    vm.dynamicAdd = dynamicAdd;

    /////////////////////

    function dynamicAdd(id, dynamicElement) {
      if (id && dynamicElement) {
        dispatchElementInsertion(id, dynamicElement);
      }
    }

    function dispatchElementInsertion(id, dynamicElement) {
      var accessElement = id.concat ? angular.element(CONSTANTS.idSelectorPrefix.concat(id)) : undefined;
      if (accessElement) {
        var eleScope = accessElement.scope();
        if (eleScope) {
          eleScope.insertElement(dynamicElement);
        }
      }
    }

    function ensureScope() {
      if (!$scope.dynamicElement || !$scope.elementId) {
        vm.dynamicAdd = undefined;
      }
    }

    function activate() {
      ensureScope();
    }

    activate();

  }
})();
