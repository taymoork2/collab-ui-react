(function () {
  'use strict';

  /* @ngInject  */
  function KemService($translate) {

    var label = [$translate.instant('deviceOverviewPage.kemOptions.none'),
      $translate.instant('deviceOverviewPage.kemOptions.one'),
      $translate.instant('deviceOverviewPage.kemOptions.two'),
      $translate.instant('deviceOverviewPage.kemOptions.three')
    ];
    var kemConfig = {
      'Cisco 7811': {
        kemMax: 0,
        speedDialMax: 7
      },
      'Cisco 7821': {
        kemMax: 0,
        speedDialMax: 8
      },
      'Cisco 7841': {
        kemMax: 0,
        speedDialMax: 10
      },
      'Cisco 7861': {
        kemMax: 0,
        speedDialMax: 22
      },
      'Cisco 8811': {
        kemMax: 0,
        speedDialMax: 5
      },
      'Cisco 8841': {
        kemMax: 0,
        speedDialMax: 0
      },
      'Cisco 8845': {
        kemMax: 0,
        speedDialMax: 5
      },
      'Cisco 8851': {
        kemMax: 2,
        speedDialMax: 5
      },
      'Cisco 8851NR': {
        kemMax: 2,
        speedDialMax: 5
      },
      'Cisco 8861': {
        kemMax: 3,
        speedDialMax: 5
      },
      'Cisco 8865': {
        kemMax: 3,
        speedDialMax: 5
      }
    };

    function isKEMAvailable(phoneModel) {
      if (kemConfig && _.has(kemConfig, phoneModel) && _.has(kemConfig[phoneModel], 'kemMax')) {
        return kemConfig[phoneModel].kemMax > 0;
      }
      return false;
    }

    function getOptionList(phoneModel) {
      var kemMax = 0;
      if (kemConfig && _.has(kemConfig, phoneModel) && _.has(kemConfig[phoneModel], 'kemMax')) {
        kemMax = kemConfig[phoneModel].kemMax;
      }
      var options = [];
      var i = 0;
      while (i < label.length && i <= kemMax) {
        options[i] = {
          label: label[i],
          value: i
        };
        i++;
      }
      return options;
    }

    function getKemOption(kemNumber) {
      if (kemNumber > 0 && kemNumber < label.length) {
        return {
          label: label[kemNumber],
          value: kemNumber
        };
      } else {
        return {
          label: label[0],
          value: 0
        };
      }
    }

    return {
      isKEMAvailable: isKEMAvailable,
      getOptionList: getOptionList,
      getKemOption: getKemOption
    };
  }

  angular
    .module('Squared')
    .service('KemService', KemService);

})();
