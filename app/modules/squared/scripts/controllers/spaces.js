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

      $scope.gridOptions = { data: 'myData',
                             multiSelect: false };

    }
  ]);
