(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('AtaDeviceController', AtaDeviceController)
    .service('AtaDeviceModal', AtaDeviceModal);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function AtaDeviceController($modalInstance, $scope, Notification, $stateParams, device) {
    var ata = this;
    var huronDeviceService = $stateParams.huronDeviceService;

    ata.device = device;
    ata.isLoading = false;

    function init() {
      $scope.$$postDigest(function () {
        $scope.$broadcast('rzSliderForceRender');
      });
    }

    init();

    /*
      * Default variables.
      * - this is what the sliders will jump to when clicking "reset to default"
      * - coming from the wiki page: https://wiki.cisco.com/display/IPCBU/F6584
      */
    ata.defaultInput = 3;
    ata.defaultOutput = 11;

    /*
      * Settings, minimum, maximum and value.
      * - coming from the wiki page: https://wiki.cisco.com/display/IPCBU/F6584
      */
    ata.inputMin = -6;
    ata.inputMax = 14;
    ata.inputOptions = {
      value: ata.defaultInput,
      options: {
        showSelectionBar: true,
        floor: ata.inputMin,
        ceil: ata.inputMax,
      },
    };

    ata.outputMin = -14;
    ata.outputMax = 6;
    ata.outputOptions = {
      value: ata.defaultOutput,
      options: {
        showSelectionBar: true,
        floor: ata.outputMin,
        ceil: ata.outputMax,
      },
    };

    huronDeviceService.getAtaInfo(ata.device).then(function (result) {
      ata.inputOptions.value = result.inputAudioLevel || ata.defaultInput;
      ata.outputOptions.value = result.outputAudioLevel || ata.defaultOutput;
    });

    /*
      * Color from the gradient.
      */
    ata.selectedColor = ChartColors.primaryBase;
    ata.unselectedColor = ChartColors.grayLightThree;

    /*
      * Reset values.
      */
    ata.resetValues = function () {
      ata.inputModel = ata.defaultInput;
      ata.outputModel = ata.defaultOutput;
    };

    /*
      * Save settings.
      */
    ata.saveSettings = function () {
      ata.isLoading = true;
      var settings = {
        inputAudioLevel: ata.inputOptions.value,
        outputAudioLevel: ata.outputOptions.value,
      };

      huronDeviceService.setSettingsForAta(ata.device, settings).then(function () {
        ata.isLoading = false;
        $modalInstance.close();
        Notification.success('ataSettings.savedReboot');
      });
    };
  }

  /* @ngInject */
  function AtaDeviceModal($modal) {
    function open(device) {
      return $modal.open({
        resolve: {
          device: _.constant(device),
        },
        controllerAs: 'ata',
        controller: 'AtaDeviceController',
        template: require('modules/squared/devices/ataDevices/ataDevice.html'),
        type: 'modal',
      }).result;
    }

    return {
      open: open,
    };
  }
})();
