'use strict';
/* global $ */

angular.module('Mediafusion')
  .controller('ListVtsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'vtslistservice', 'Notification',
    function ($scope, $rootScope, $filter, $state, vtslistservice, Notification) {

      $scope.vtsPreviewActive = false;
      $scope.currentVts = null;
	  $scope.totalResults = 0;

      var getVtsList = function () {
        $scope.vtsPreview = false;
        console.log("Calling service ");
        vtslistservice.listVts(function (data, status) {
          $scope.queryvtslist = data;
		  $scope.totalResults = data.length;
          /*if (data.success) {
			console.log("callback listMFC data " +data);
			$scope.querymfclist = data.devices;
			} else {
			console.log("Query existing MFC failed. Status: " + status);
			}*/
        });
      };

      $scope.changeOpState = function () {
        console.log("inside changeOpState");
        if ($scope.currentVts.status === 'Active') {
          $scope.currentVts.status = 'Down';
        } else {
          $scope.currentVts.status = 'Active';
        }
      };

      $scope.closePreview = function () {
        $state.go('vts.list');
      };

      $scope.remove = function () {
        vtslistservice.remove($scope.currentVts.id, function (data, status) {
          console.log("callback remove");
          if (data) {
            console.log("callback remove data " + data);
            var success = [$filter('translate')('Enterprse resource, ' + $scope.currentVts.name + ' removed successfully.')];
            Notification.notify(success, 'success');
            $state.go('vts.list');
            //$window.location.reload()
          } else {
            var error = [$filter('translate')('Error while removing enterprise resource, ' + $scope.currentVts.name)];
            Notification.notify(error, 'error');
          }
        });

      };

      var setState = function () {

        vtslistservice.changeState($scope.currentVts, function (data, status) {
          console.log("callback remove");
          if (data) {
            console.log("callback remove data " + data);
            var success = [$filter('translate')('Enterprse resource, ' + $scope.currentVts.name + ' removed successfully.')];
            Notification.notify(success, 'success');
            $state.go('vts.list');
            //$window.location.reload()
          } else {
            var error = [$filter('translate')('Error while removing enterprise resource, ' + $scope.currentVts.name)];
            Notification.notify(error, 'error');
          }
        });

      };

	  $scope.setDeleteDevice = function (deviceId) {
		  console.log("inside setDeleteDevice");

      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showVtsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
        '<button id="actionlink" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click=""><span translate="spacesPage.delete"></span></a></li>' +
        '</ul>' +
        '</span>';

	  var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'ENABLED\', \'device-status-red\': row.getProperty(col.field) !== \'ENABLED\'}"></i>' +
        '<div ng-class="\'device-status-nocode\'"><p>{{row.getProperty(col.field)|statusFilter}}</p></div>';

      $scope.gridOptions = {
        data: 'queryvtslist',
        multiSelect: false,
        showFilter: true,
        rowHeight: 75,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,

        columnDefs: [{
          field: 'name',
          displayName: $filter('translate')('vtsPage.name')
        },{
          field: 'opState',
		  cellTemplate: statusTemplate,
		  cellFilter: 'statusFilter',
          displayName: $filter('translate')('vtsPage.status')
        }/*, {
          field: 'action',
          displayName: $filter('translate')('spacesPage.actionsHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
		  width: 90
        }*/]
      };
      getVtsList();

      $scope.showVtsDetails = function (vts) {
        console.log("Inside showVtsDetails");
        $scope.currentVts = vts;
        $state.go('vts.list.preview');
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('vts.list.preview')) {
          $scope.vtsPreviewActive = true;
        } else {
          $scope.vtsPreviewActive = false;
        }
      });
    }
  ]);
