(function () {
  'use strict';

  /* @ngInject */
  function MenuCtrl(Authinfo, $rootScope, $state) {
    var vm = this;

    vm.tabs = Authinfo.getTabs();
    vm.show = {};

    vm.$state = $state;

    // This could be a listener on Authinfo instead
    $rootScope.$on('TABS_UPDATED', function () {
      vm.tabs = Authinfo.getTabs();
    });
  }

  angular.module('Squared')
    .controller('MenuCtrl', MenuCtrl);
}());
