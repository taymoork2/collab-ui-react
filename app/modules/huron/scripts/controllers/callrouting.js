'use strict';

angular.module('Huron')
  .controller('CallRoutingCtrl', ['$scope', '$dialogs', 'Notification', 'CallPark',
    function($scope, $dialogs, Notification, CallPark) {
      Notification.init($scope);
      $scope.popup = Notification.popup;
      $scope.callParks = [];

      var listCallParks = function() {
        CallPark.list().then(function(){
          $scope.callParks = CallPark.callParks;
        });
      };

      $scope.addCallPark = function() {
        $dialogs.create('modules/huron/views/callpark_dialog.html', 'CallParkCtrl')
          .result.finally(listCallParks);
      };

      listCallParks();
    }

]);