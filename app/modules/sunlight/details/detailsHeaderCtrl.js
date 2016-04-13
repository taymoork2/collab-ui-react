/**
 * Created by sjalipar on 4/11/16.
 */
(function () {
  'use strict';

  angular
    .module('CareDetails')
    .controller('DetailsHeaderCtrl', DetailsHeaderCtrl);

  /* @ngInject */
  function DetailsHeaderCtrl() {
    var vm = this;
    vm.title = 'sunlightDetails.title';
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
