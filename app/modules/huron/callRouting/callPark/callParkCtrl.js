'use strict';

angular.module('Huron')
  .controller('CallParkCtrl', ['$scope', 'CallPark', '$modal',
    function ($scope, CallPark, $modal) {
      $scope.callParks = [];
      $scope.showInformation = true;

      var listCallParks = function () {
        CallPark.list().then(function () {
          $scope.callParks = CallPark.callParks;
          $scope.showInformation = $scope.callParks.length == 0 ? true : false;
        });
      };

      $scope.addCallPark = function () {
        $modal.open({
          templateUrl: 'modules/huron/callRouting/callPark/callParkDetail.tpl.html',
          controller: 'CallParkDetailCtrl'
        }).result.finally(listCallParks);
      };

      $scope.deleteCallPark = function (callPark) {
        $modal.open({
          templateUrl: 'modules/huron/callRouting/callPark/confirmation-dialog.tpl.html',
          controller: 'CallParkCtrl'
        }).result.then(function () {
          CallPark.remove(callPark)
            .finally(listCallParks);
        });
      };

      $scope.toggleInformation = function () {
        $scope.showInformation = !$scope.showInformation;
      };

      listCallParks();
    }

  ]);
