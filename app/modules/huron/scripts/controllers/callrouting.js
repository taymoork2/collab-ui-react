'use strict';

angular.module('Huron')
  .controller('CallRoutingCtrl', ['$scope', 'Notification', 'CallPark', '$modal',
    function($scope, Notification, CallPark, $modal) {
      Notification.init($scope);
      $scope.popup = Notification.popup;
      $scope.callParks = [];

      var listCallParks = function() {
        CallPark.list().then(function(){
          $scope.callParks = CallPark.callParks;
        });
      };

      $scope.addCallPark = function() {
        $modal.open({
          templateUrl:'modules/huron/views/callpark_dialog.html',
          controller: 'CallParkCtrl'
        }).result.finally(listCallParks);
      };

      $scope.deleteCallPark = function(callParkId) {
        CallPark.remove(callParkId)
          .finally(listCallParks);
      };

      listCallParks();
    }

]);