(function() {
  'use strict';

  //Defining a controller for Utilization with required dependencies.
  angular.module('Mediafusion')
    .controller('UtilizationCtrl', UtilizationCtrl);

  /* @ngInject */
  function UtilizationCtrl($scope, Log, utilizationService) {

    /**
     * getOverallUtilization function will fetch and populate utilization graph with overall utilization.
     *
     */
    var getOverallUtilization = function () {

      //console.log("inside getOverallUtilization ");
      utilizationService.overallUtilization(function (data, status) {
        //console.log(data);
        //console.log("overall utilization is" + data.overallutilization.utilization);

        if (data.success) {
          $scope.average = data.overallutilization.utilization;
          $scope.overallUtilization = data.overallUtilization;
        } else {
          Log.debug('Query overallUtilization failed. Status: ' + status);
        }

      });
    };

    //console.log("Getting Overall Utilization through Rest Call");
    getOverallUtilization();

    /**
     * getRealTimeBridgeUtilization function will fetch and populate utilization graph for all the resources.
     */
    var getRealTimeBridgeUtilization = function () {

      //console.log("inside getRealTimeBridgeUtilization ");

      //$scope.utilizations='[{"resource":"Resource 1","utilization":"13.46"},{"resource":"Resource 2","utilization":"26.92"},{"resource":"Resource 3","utilization":"40.38"},{"resource":"Resource 4","utilization":"53.84"}]';
      utilizationService.realTimeBridgeUtilization(function (data, status) {
        //console.log(data);
        //console.log("overall utilization is" + data.utilizations);

        if (data.success) {

          $scope.utilizations = data.utilizations;
          //data will be in below format. For testing purpose if rest call is not working, uncomment below line
          //$scope.utilizations=[{"resource":"Resource 1","utilization":"13.46"},{"resource":"Resource 2","utilization":"26.92"},{"resource":"Resource 3","utilization":"40.38"},{"resource":"Resource 4","utilization":"80.0"}];
        } else {
          Log.debug('Query overallUtilization failed. Status: ' + status);
        }

      });

    };

    //console.log("Getting Real Time bridge by bridge utilization through rest call");
    getRealTimeBridgeUtilization();

  }
})();