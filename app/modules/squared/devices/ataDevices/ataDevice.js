(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('AtaDeviceController',

      /* @ngInject */
      function ($modalInstance, $log, $scope, Notification, $stateParams, device) {
        var ata = this;
        var huronDeviceService = $stateParams.huronDeviceService;

        ata.device = device;

        $scope.$$postDigest(function () {
          $scope.$broadcast('rzSliderForceRender');
        });

        /*
         * Default variables.
         * - this is what the sliders will jump to when clicking "reset to default"
         */
        ata.defaultInput = 3;
        ata.defaultOutput = 11;
        ata.defaultImpedance = 0;

        /*
         * Fake variables
         * - at some point we need to get this from the API
         * - the API isn't ready yet right now
         */
        ata.inputMin = -6;
        ata.inputMax = 14;
        ata.inputOptions = {
          value: ata.defaultInput,
          options: {
            showSelectionBar: true,
            floor: ata.inputMin,
            ceil: ata.inputMax
          }
        };

        ata.outputMin = -14;
        ata.outputMax = 6;
        ata.outputOptions = {
          value: ata.defaultOutput,
          options: {
            showSelectionBar: true,
            floor: ata.outputMin,
            ceil: ata.outputMax
          }
        };

        ata.impedanceMin = 0;
        ata.impedanceMax = 7;
        ata.impedanceOptions = {
          value: ata.defaultImpedance,
          options: {
            showSelectionBar: true,
            floor: ata.impedanceMin,
            ceil: ata.impedanceMax
          }
        };

        huronDeviceService.getAtaInfo(ata.device).then(function (result) {
          ata.impedanceOptions.value = result.impedance || ata.defaultImpedance;
          ata.inputOptions.value = result.inputAudioLevel || ata.defaultInput;
          ata.outputOptions.value = result.outputAudioLevel || ata.defaultOutput;
        });

        /*
         * Color from the gradient.
         */
        ata.selectedColor = "#049FD9";
        ata.unselectedColor = "#EBEBEC";

        /*
         * Little hack to get the variable of the gradient colors from SCSS.
         */
        ata.onLoad = function () {
          ata.selectedColor = $('input[type=range]').css('border-color') || ata.selectedColor;
          ata.unselectedColor = $('input[type=range]').css('color') || ata.unselectedColor;
        };

        /*
         * Reset values.
         */
        ata.resetValues = function () {
          ata.impedanceModel = ata.defaultImpedance;
          ata.inputModel = ata.defaultInput;
          ata.outputModel = ata.defaultOutput;
        };

        /*
         * Save settings.
         */
        ata.saveSettings = function () {
          $log.log("Values that should get saved: ", ata.inputOptions.value, ata.outputOptions.value, ata.impedanceOptions.value);
          //$modalInstance.close();
          //Notification.success('ataSettings.saved');
          var settings = {
            inputAudioLevel: ata.inputOptions.value,
            outputAudioLevel: ata.outputOptions.value,
            impedance: ata.impedanceOptions.value
          };

          huronDeviceService.setSettingsForAta(ata.device, settings).then(function () {
            $log.log('saved');
            $modalInstance.close();
            Notification.success('ataSettings.saved');
          });

        };
      }
    )
    .service('AtaDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(device) {
          return $modal.open({
            resolve: {
              device: _.constant(device)
            },
            controllerAs: 'ata',
            controller: 'AtaDeviceController',
            templateUrl: 'modules/squared/devices/ataDevices/ataDevice.html',
            type: 'modal'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
