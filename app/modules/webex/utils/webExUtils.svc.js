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
} // end top level function
