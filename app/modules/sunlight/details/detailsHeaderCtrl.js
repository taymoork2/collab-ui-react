(function () {
  'use strict';

  angular
    .module('CareDetails')
    .controller('DetailsHeaderCtrl', DetailsHeaderCtrl);

  function DetailsHeaderCtrl($translate) {
    var vm = this;
    vm.back = false;

    vm.tabs = [{
      title: $translate.instant('sunlightDetails.featuresTitle'),
      state: 'care.Features',
    },
    {
      title: $translate.instant('sunlightDetails.settingsTitle'),
      state: 'care.Settings',
    },
    ];
  }
})();
