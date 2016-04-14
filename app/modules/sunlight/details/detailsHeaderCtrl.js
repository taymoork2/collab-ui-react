(function () {
  'use strict';

  angular
    .module('CareDetails')
    .controller('DetailsHeaderCtrl', DetailsHeaderCtrl);

  function DetailsHeaderCtrl() {
    var vm = this;
    vm.back = false;

    vm.tabs = [{
      title: 'sunlightDetails.featuresTitle',
      state: 'careFeatures'
    }, {
      title: 'sunlightDetails.settingsTitle',
      state: 'careSettings'
    }];
  }
})();
