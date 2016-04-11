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

      var nameTemplate = '<div class="ui-grid-cell-contents"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      var statusTemplate = '<i class="fa fa-circle device-status-icon ui-grid-cell-contents" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'MANAGED\', \'device-status-red\': row.getProperty(col.field) !== \'MANAGED\'}"></i>' +
        '<div ng-class="\'device-status-nocode\'"><p>{{row.getProperty(col.field)|status}}</p></div>';

      var actionsTemplate = '<span cs-dropdown class="actions-menu device-align-ellipses">' +
        '<button cs-dropdown-toggle id="actionlink" class="btn--none dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul cs-dropdown-menu class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="setStateAction"><a ng-click="setState(row.entity.id,row.entity.mgmtStatus)"><span translate="{{row.entity.mgmtStatus|suspendResume}}"></span></a></li>' +
        '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click="setDeleteResource(row.entity.id)"><span translate="vtsPage.delete"></span></a></li>' +
        '</ul>' +
        '</span>';

      statusTemplate = '<i class="fa fa-circle device-status-icon ui-grid-cell-contents" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'MANAGED\', \'device-status-red\': row.getProperty(col.field) !== \'MANAGED\'}"></i>' +
        '<div ng-class="\'device-status-nocode\'"><p>{{row.getProperty(col.field)|status}}</p></div>';

      $scope.gridOptions = {
        data: 'queryvtslist',
        multiSelect: false,
        rowHeight: 44,
        enableSelectAll: false,
        enableFullRowSelection: true,
        enableColumnMenus: false,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.showVtsDetails(row.entity);
          });
        },

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
