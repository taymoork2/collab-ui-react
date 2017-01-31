(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronDetailsHeaderCtrl', HuronDetailsHeaderCtrl);

  /* @ngInject */
  function HuronDetailsHeaderCtrl(Authinfo, Config) {
    var vm = this;
    vm.title = 'huronDetails.title';
    vm.back = false;

    function showFeatureTab() {
      return Authinfo.getLicenses().filter(function (license) {
        return license.licenseType === Config.licenseTypes.COMMUNICATION;
      }).length > 0;
    }

    vm.tabs = [{
      title: 'huronDetails.linesTitle',
      state: 'huronlines'
    }, {
      title: 'huronDetails.settingsTitle',
      state: 'huronsettings'
    }];
    if (showFeatureTab()) {
      vm.tabs.splice(1, 0, {
        title: 'huronDetails.featuresTitle',
        state: 'huronfeatures'
      });
    }
  }
})();
