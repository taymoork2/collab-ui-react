require('./_resources.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextResourcesSubHeader', {
      controller: ContextResourcesSubHeaderCtrl,
      templateUrl: 'modules/context/resources/hybrid-context-resources-header.html',
    });

    /* @ngInject */
  function ContextResourcesSubHeaderCtrl($state) {
    var vm = this;

    vm.addResourceModal = function () {
      $state.go('add-resource.context');
    };
  }
})();
