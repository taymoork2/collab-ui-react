(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextResourcesCtrl', HybridContextResourcesCtrl);

  /* @ngInject */
  function HybridContextResourcesCtrl() {

    var vm = this;

    vm.addResourceModal = {
      type: 'small',
      templateUrl: 'modules/hercules/fusion-pages/add-resource/context/context.html',

    };

  }
}());

