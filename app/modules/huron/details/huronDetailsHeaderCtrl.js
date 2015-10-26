(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsHeaderCtrl', HuronDetailsHeaderCtrl);

  /* @ngInject */
  function HuronDetailsHeaderCtrl($scope, $state, Config) {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    vm.tabs = [{
      title: 'huronDetails.featuresTitle',
      state: 'huronfeatures'
    }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];
  }
})();
