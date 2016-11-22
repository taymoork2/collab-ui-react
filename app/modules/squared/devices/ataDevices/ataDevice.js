(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('AtaDeviceController',

      /* @ngInject */
      function ($modalInstance, $log) {
        var ata = this;

        ata.testData = "Test";

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
        ata.inputMin = 0;
        ata.inputMax = 20;
        ata.inputModel = ata.defaultInput;

        ata.outputMin = 0;
        ata.outputMax = 20;
        ata.outputModel = ata.defaultOutput;

        ata.impedanceMin = 0;
        ata.impedanceMax = 7;
        ata.impedanceModel = ata.defaultImpedance;

        /*
         * Percentage values.
         */
        ata.percInput = ata.inputModel * 5;
        ata.percOutput = ata.outputModel * 5;
        ata.percImpedance = 100 * (ata.impedanceModel / 7);

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
         * Update values.
         */
        ata.sliderUpdate = function (type) {
          $log.log(type);
          if (type == 'output') {
            ata.percOutput = ata.outputModel * 5;
          } else if (type == 'input') {
            ata.percInput = ata.inputModel * 5;
          } else if (type == 'impedance') {
            ata.percImpedance = 100 * (ata.impedanceModel / 7);
          }
        };

        /*
         * Reset values.
         */
        ata.resetValues = function () {
          ata.impedanceModel = ata.defaultImpedance;
          ata.inputModel = ata.defaultInput;
          ata.outputModel = ata.defaultOutput;

          ata.percInput = ata.inputModel * 5;
          ata.percOutput = ata.outputModel * 5;
          ata.percImpedance = 100 * (ata.impedanceModel / 7);
        };

        /*
         * Save settings.
         */
        ata.saveSettings = function () {
          var inputVal = ata.inputModel - 6;
          var outputVal = ata.outputModel - 14;
          var impedanceVal = ata.impedanceModel;

          $log.log("Values that should get saved: ", inputVal, outputVal, impedanceVal);
          $modalInstance.close();
        };
      }
    )
    .service('AtaDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(deviceOrCode) {
          return $modal.open({
            resolve: {
              deviceOrCode: _.constant(deviceOrCode)
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
