'use strict';

angular.module('Mediafusion')
  .controller('ListVtsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'vtslistservice', 'Notification',
    function ($scope, $rootScope, $filter, $state, vtslistservice, Notification) {

      $scope.vtsPreviewActive = false;
      $scope.currentVts = null;
      $scope.totalResults = 0;
      $scope.deleteResourceId = null;
      $scope.showPreview = true;

      /*getVtsList function to populate list of enterprise resource*/
      var getVtsList = function () {
        $scope.vtsPreview = false;
        //console.log("Calling service ");
        vtslistservice.listVts(function (data) {
          $scope.queryvtslist = data || {};
          $scope.totalResults = data.length || 0;
          /*if (data.success) {
			//console.log("callback listMFC data " +data);
			$scope.querymfclist = data.devices;
			} else {
			//console.log("Query existing MFC failed. Status: " + status);
			}*/
        });
      };

      $scope.changeOpState = function () {
        //console.log("inside changeOpState");
        if ($scope.currentVts.status === 'Active') {
          $scope.currentVts.status = 'Down';
        } else {
          $scope.currentVts.status = 'Active';
        }
      };

      $scope.closePreview = function () {
        $state.go('vts.list');
      };

      /*setState used for suspend/resume operation*/
      $scope.setState = function (resourceId, currentState) {
        //console.log("inside setState resourceId = " + resourceId + " currentState = " + currentState);
        $scope.showPreview = false;
        vtslistservice.changeState(resourceId, currentState, function (data, status) {
          //console.log("callback changeState data.success = " + data.success);
          if (status == 204) {
            //console.log("callback changeState data " + data);
            //console.log("callback changeState status " + status);
            var success = [$filter('translate')('Enterprse resource state changed successfully.')];
            Notification.notify(success, 'success');
            setTimeout(function () {
              getVtsList();
            }, 1000);
          } else {
            //console.log("callback changeState data " + data);
            //console.log("callback changeState status " + status);
            var error = [$filter('translate')('Error while changing state.')];
            Notification.notify(error, 'error');
            setTimeout(function () {
              getVtsList();
            }, 1000);
          }
        });
      };

      $scope.setDeleteResource = function (resourceId) {
        //console.log("inside setDeleteResource resourceId = " + resourceId);
        $scope.deleteResourceId = resourceId;
        $scope.showPreview = false;

      };

      $scope.cancelDelete = function () {
        $scope.deleteResourceId = null;
        //$scope.showPreview = true;
        $state.go('vts.list');
      };

      /*deleteResource is to decomission a resource*/
      $scope.deleteResource = function (deleteResourceId) {
        //console.log("inside deleteResource deleteResourceId = " + deleteResourceId);
        vtslistservice.remove($scope.deleteResourceId, function (data, status) {
          //console.log("callback remove");
          if (status == 204) {
            //console.log("callback remove data " + data);
            var success = [$filter('translate')('Enterprse resource decomissioned successfully.')];
            Notification.notify(success, 'success');
            setTimeout(function () {
              getVtsList();
            }, 1000);
            //$window.location.reload()
          } else {
            var error = [$filter('translate')('Error while decomissioning enterprise resource.')];
            Notification.notify(error, 'error');
            setTimeout(function () {
              getVtsList();
            }, 1000);
          }
        });

      };

      $scope.setDeleteDevice = function () {
        //console.log("inside setDeleteDevice");

      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showVtsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var nameTemplate = '<div class="ngCellText"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'MANAGED\', \'device-status-red\': row.getProperty(col.field) !== \'MANAGED\'}"></i>' +
        '<div ng-class="\'device-status-nocode\'"><p>{{row.getProperty(col.field)|status}}</p></div>';

      var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
        '<button id="actionlink" class="btn--icon btn--actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="setStateAction"><a ng-click="setState(row.entity.id,row.entity.mgmtStatus)"><span translate="{{row.entity.mgmtStatus|suspendResume}}"></span></a></li>' +
        '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click="setDeleteResource(row.entity.id)"><span translate="vtsPage.delete"></span></a></li>' +
        '</ul>' +
        '</span>';

      statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'MANAGED\', \'device-status-red\': row.getProperty(col.field) !== \'MANAGED\'}"></i>' +
        '<div ng-class="\'device-status-nocode\'"><p>{{row.getProperty(col.field)|status}}</p></div>';

      $scope.gridOptions = {
        data: 'queryvtslist',
        multiSelect: false,
        showFilter: true,
        rowHeight: 75,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,

        columnDefs: [{
          field: 'ipAddress',
          displayName: $filter('translate')('vtsPage.name'),
          cellTemplate: nameTemplate
        }, {
          field: 'mgmtStatus',
          cellTemplate: statusTemplate,
          cellFilter: 'status',
          displayName: $filter('translate')('vtsPage.status')
        }, {
          field: 'action',
          displayName: $filter('translate')('vtsPage.actionsHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
          width: 90
        }]
      };
      getVtsList();

      /*show preview by setting the current vts object*/
      $scope.showVtsDetails = function (vts) {
        //console.log("Inside showVtsDetails");
        $scope.currentVts = vts;
        if ($scope.showPreview) {
          $state.go('vts.list.preview');
        }
        $scope.showPreview = true;
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        //console.log("Inside $stateChangeSuccess");
        if ($state.includes('vts.list.preview')) {
          $scope.vtsPreviewActive = true;
        } else {
          $scope.vtsPreviewActive = false;
        }
      });
    }
  ]);
