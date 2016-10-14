(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgDetailsCtrl', CbgDetailsCtrl);

  /* @ngInject */
  function CbgDetailsCtrl($stateParams) {
    var vm = this;
    vm.info = _.get($stateParams, 'info.currCbg', {});
  }
})();
