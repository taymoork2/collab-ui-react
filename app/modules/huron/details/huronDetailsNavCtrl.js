(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsNavCtrl', HuronDetailsNavCtrl);

  /* @ngInject */
  function HuronDetailsNavCtrl($scope, $state, Config) {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    vm.tabs = [
    //  {
    //  title: 'huronDetails.featuresTitle',
    //  state: 'huronfeatures'
    //}, 
      {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];

    init();

    function init() {
      $state.go("huronsettings"); // sets the initial content page to load when this nav controller is loaded
    }
  }
})();
