(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DomainDetailCtrl', DomainDetailCtrl);

  /* @ngInject */
  function DomainDetailCtrl($stateParams) {
    var vm = this;
    vm.domains = $stateParams.webexDomains;
  }

})();
