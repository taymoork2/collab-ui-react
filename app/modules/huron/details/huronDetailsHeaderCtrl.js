(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsHeaderCtrl', HuronDetailsHeaderCtrl);

  /* @ngInject */
  function HuronDetailsHeaderCtrl($scope, $state, $q, Config, FeatureToggleService) {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    vm.tabs = [{
      title: 'huronDetails.linesTitle',
      state: 'huronlines'
    }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];

    var aaPromise = FeatureToggleService.supports(FeatureToggleService.features.huronAutoAttendant);
    var hgPromise = FeatureToggleService.supports(FeatureToggleService.features.huronHuntGroup);

    $q.all([aaPromise, hgPromise]).then(function (toggle) {
      if (toggle[0] || toggle[1]) {
        vm.tabs.splice(0, 0, {
          title: 'huronDetails.featuresTitle',
          state: 'huronfeatures'
        });
      }
    });
  }
})();
