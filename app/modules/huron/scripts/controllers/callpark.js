'use strict';

angular.module('Huron')
  .controller('CallParkCtrl', ['$scope', '$modalInstance', 'CallPark',
    function($scope, $modalInstance, CallPark) {

      $scope.callPark = {
        'retrievalPrefix': '*'
      };
      $scope.options = {
        pattern: 'range',
        reversionPattern: 'owner'
      };

      $scope.addCallParkByRange = function(callPark, rangeMin, rangeMax) {
        CallPark.createByRange(callPark, rangeMin, rangeMax)
          .then(function(){
            $modalInstance.close();
          })
          .catch(function(){
            $modalInstance.dismiss();
          });
      };

      $scope.addCallPark = function(callPark) {
        CallPark.create(callPark)
          .then(function(){
            $modalInstance.close();
          })
          .catch(function(){
            $modalInstance.dismiss();
          });
      };
    }

]);