(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsHeaderCtrl', HuronDetailsHeaderCtrl);

  /* @ngInject */
  function HuronDetailsHeaderCtrl() {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    vm.tabs = [{
      title: 'huronDetails.linesTitle',
      state: 'huronlines'
    }, {
      title: 'huronDetails.featuresTitle',
      state: 'huronfeatures'
    }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];
  }
})();
