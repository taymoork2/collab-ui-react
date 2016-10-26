(function () {
  'use strict';

  /* @ngInject  */
  function KemService($translate) {
    var kemConfig = {
      'Cisco 8851': {},
      'Cisco 8851NR': {},
      'Cisco 8861': {},
      'Cisco 8865': {}
    };

    function getLabel() {
      return [$translate.instant('deviceOverviewPage.kemOptions.none'),
        $translate.instant('deviceOverviewPage.kemOptions.one'),
        $translate.instant('deviceOverviewPage.kemOptions.two'),
        $translate.instant('deviceOverviewPage.kemOptions.three')];
    }

    function isKEMAvailable(phoneModel) {
      return kemConfig && _.has(kemConfig, phoneModel);
    }

    function getKemOption(kemNumber) {
      var labels = getLabel();
      if (kemNumber >= 0 && kemNumber < labels.length) {
        return labels[kemNumber];
      } else {
        return labels[0];
      }
    }

    return {
      isKEMAvailable: isKEMAvailable,
      getKemOption: getKemOption
    };
  }

  angular
    .module('Squared')
    .service('KemService', KemService);

})();
