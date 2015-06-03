'use strict';

angular.module('Mediafusion')
  .controller('mediafusionConnectorCtrl',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, MediafusionProxy, Authinfo, Log) {
      $scope.loading = true;
      $scope.pollHasFailed = false;
      $scope.showInfoPanel = true;

      var actionsTemplate = '<i style="top:13px" class="icon icon-three-dots"></i>';

      var statusTemplate = '<div><i class="fa fa-circle device-status-icon ngCellText" style="margin-top:0px;" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'true\', \'device-status-red\': row.getProperty(col.field) !== \'true\'}"></i></div>' +
        '<div ng-class="\'device-status-nocode\'" style="top:13px">{{row.getProperty(col.field)|status}}</div>';

      var usageTemplate = '<div style="top:13px" class="col-md-1"><label>0%</label></div><div class="progress page-header col-md-8" style="top:16px"><div class="progress-bar page-header" style="width:0%;"></div></div>';

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showConnectorsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      angular.forEach($scope.clusters, function (cluster) {
        console.log("Printing individual cluster" + cluster);
      });

      

      MediafusionProxy.startPolling(function (err, data) {
        $scope.loading = false;
      });

      $scope.$watch(MediafusionProxy.getClusters, function (data) {
        $scope.clusters = data.clusters || [];
        
        console.log("prinitng cluster length" + data.clusters.length);
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        Log.debug("start cluster length");
        angular.forEach($scope.clusters, function (cluster) {
          Log.debug("Printing individual cluster" + cluster);
        });
        $scope.pollHasFailed = data.error;
      }, true);

      $scope.$on('$destroy', function () {
        MediafusionProxy.stopPolling();
      });

      //Pagination

          $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [5, 10, 20],
        pageSize: 5,
        currentPage: 1
    };  
    $scope.setPagingData = function(data, page, pageSize){  
      console.log("inside setPagingData data length:"+data.length);
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        console.log("mydata "+$scope.mydata);
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
      
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                    var largeLoad=MediafusionProxy.getClusters().clusters;
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                var largeLoad=MediafusionProxy.getClusters().clusters;
                    $scope.setPagingData(largeLoad,page,pageSize);
                
            }
        }, 100);
    };
    
    //console.log("Paginationss");
    
    
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);



      $scope.gridOptions = {
        data: 'myData',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        headerRowHeight: 40,
        rowTemplate: rowTemplate,
        useExternalSorting: false,
        enableVerticalScrollbar: 0,
        enableHorizontalScrollbar: 0,
        enablePaging: true,
        showFooter: true,
        totalServerItems:'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
       

        columnDefs: [{
          field: 'name',
          displayName: 'Name'
        }, {
          field: 'hosts[0].host_name',
          displayName: 'IP Address'
        }, {
          field: 'needs_attention',
          cellTemplate: statusTemplate,
          cellFilter: 'status',
          displayName: 'Status'
        }, {
          field: '',
          displayName: 'Cluster'
        }, {
          field: 'name',
          cellTemplate: usageTemplate,
          displayName: 'Current Usage'
        }, {
          field: 'action',
          cellTemplate: actionsTemplate,
          displayName: 'Actions'
        }]
      };

      $scope.showConnectorsDetails = function (connector) {
        console.log("entering showConnectorsDetails");
        $scope.connector = connector;
        $scope.connectorId = connector.id;
        $state.go('connector-details', {
          connectorId: connector.id
        });
        console.log("exiting showConnectorsDetails");
      };
      
    }
  );
