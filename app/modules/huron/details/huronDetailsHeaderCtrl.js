(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsHeaderCtrl', HuronDetailsHeaderCtrl);

  /* @ngInject */
  function HuronDetailsHeaderCtrl(Authinfo, FeatureToggleService, Config) {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    function showFeatureTab(pstnEnabled) {
      return Authinfo.getLicenses().filter(function (license) {
        return !pstnEnabled || (license.licenseType === Config.licenseTypes.COMMUNICATION);
      }).length > 0;
    }

    vm.tabs = [{
      title: 'huronDetails.linesTitle',
      state: 'huronlines'
    }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];
    FeatureToggleService.supports(FeatureToggleService.features.csdmPstn).then(function (pstnEnabled) {
      if (showFeatureTab(pstnEnabled)) {
        vm.tabs.splice(1, 0, {
          title: 'huronDetails.featuresTitle',
          state: 'huronfeatures'
        });
      }
    });
  }
})();
