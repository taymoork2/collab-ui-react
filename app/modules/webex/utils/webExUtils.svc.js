(function () {
  'use strict';

  angular.module('WebExApp').service('WebExUtilsService', WebExUtilsService);

  /* @ngInject */
  function WebExUtilsService(
    $q,
    $log,
    FeatureToggleService
  ) {

    this.checkWebExFeaturToggle = function (toggleId) {
      var funcName = "checkWebExFeaturToggle()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "toggleId=" + toggleId;
      // $log.log(logMsg);

      var deferredGetToggle = $q.defer();

      // TODO - uncomment the following code to enable csv for all the admin users
      // if (toggleId == FeatureToggleService.features.webexCSV) {
      //   deferredGetToggle.resolve(true);
      // }

      FeatureToggleService.supports(toggleId).then(
        function getToggleSuccess(toggleValue) {
          deferredGetToggle.resolve(toggleValue);
        },

        function getToggleError(response) {
          deferredGetToggle.resolve(false);
        }
      );

      return deferredGetToggle.promise;
    }; // checkWebExFeaturToggle()

    this.utf8ToUtf16le = function (data) {
      var intBytes = [];

      var utf16leHeader = '%ff%fe';

      utf16leHeader.replace(/([0-9a-f]{2})/gi, function (byte) {
        intBytes.push(parseInt(byte, 16));
      });

      for (var i = 0; i < data.length; ++i) {
        var hexChar = data[i].charCodeAt(0);

        var hexByte1 = hexChar & 0xff;
        var hexByte2 = (hexChar >> 8) & 0xff;

        var intByte1 = parseInt(hexByte1.toString(16), 16);
        var intByte2 = parseInt(hexByte2.toString(16), 16);

        /*
        if ( (6100 < i) && (6500 > i) ) {
          logMsg = funcName + "\n" +
            "hexChar=" + hexChar + "\n" +
            "hexByte1=" + hexByte1 + "\n" +
            "hexByte2=" + hexByte2 + "\n" +
            "intByte1=" + intByte1 + "\n" +
            "intByte2=" + intByte2 + "\n" +
            "data[" + i + "]=" + data[i];
          $log.log(logMsg);
        }
        */

        intBytes.push(intByte1);
        intBytes.push(intByte2);
      }

      return intBytes;
    }; // utf8ToUtf16le()
  } // end top level function
})();
