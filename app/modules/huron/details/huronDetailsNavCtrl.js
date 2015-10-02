(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsNavCtrl', HuronDetailsNavCtrl);

  /* @ngInject */
  function HuronDetailsNavCtrl($scope, $state, Config) {
    var vm = this;
    vm.tabs = [{
      //   title: 'huronDetails.linesTitle',
      //   state: 'huronlines'
      // }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
        // Temporarily commented out until "Features" tab is needed
        // }, {
        //   title: 'huronDetails.featuresTitle',
        //   state: 'huronfeatures'
    }];

    init();

    function init() {
      $state.go("huronsettings"); // sets the initial content page to load when this nav controller is loaded
    }
  }
})();
