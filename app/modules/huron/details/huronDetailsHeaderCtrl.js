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
      title: 'huronDetails.linesTitle',
      state: 'huronlines'
    }, {
      //   title: 'huronDetails.featuresTitle',
      //   state: 'huronfeatures'
      // }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];

    init();

    function init() {
      $state.go("huronsettings"); // sets the initial content page to load when this nav controller is loaded
    }
  }
})();
