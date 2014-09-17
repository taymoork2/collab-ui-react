'use strict';

angular.module('Squared')
  .controller('SpacesCtrl', ['$scope', '$location', 'Auth', 'Storage', 'Log', 'Utils', '$filter', 'SpacesService', 'Authinfo', 'Notification', 'Config',
    function($scope, $location, Auth, Storage, Log, Utils, $filter, SpacesService, Authinfo, Notification, Config) {

      //Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorized($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      $scope.myData = SpacesService.listRooms();
      $scope.newRoomName = null;
      $scope.gridOptions = { data: 'myData',
                             multiSelect: false };
      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.clearRoom = function() {
        angular.element('#newRoom').val('');
        $scope.newRoomName = null;
      };

      $scope.addRoom = function(){
        SpacesService.addRoom($scope.newRoomName, function(data, status){
          if(data.success === true ){
            var successMessage = [$scope.newRoomName + ' added successfully.'];
            Notification.notify(successMessage, 'success');
            $scope.myData = SpacesService.listRooms();
            $scope.clearRoom();
          }
          else{
            var errorMessage = ['Error adding ' + $scope.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
]);
