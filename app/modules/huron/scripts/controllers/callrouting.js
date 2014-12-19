'use strict';

angular.module('Huron')
  .controller('CallRoutingCtrl', ['$scope', 'CallPark', '$modal',
    function ($scope, CallPark, $modal) {
      $scope.callParks = [];

      var listCallParks = function () {
        CallPark.list().then(function () {
          $scope.callParks = CallPark.callParks;
        });
      };

      $scope.addCallPark = function () {
        $modal.open({
          templateUrl: 'modules/huron/views/callpark_dialog.html',
          controller: 'CallParkCtrl'
        }).result.finally(listCallParks);
      };

      $scope.deleteCallPark = function (callParkId) {
        CallPark.remove(callParkId)
          .finally(listCallParks);
      };

      listCallParks();
    }

  ]);
