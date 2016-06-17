(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $timeout, $translate, LineListService, Log, Config, Notification) {

    var vm = this;

    vm.currentDataPosition = 0;
    vm.gridRefresh = true; // triggers the spinner over the grid
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.timer = 0;
    vm.activeFilter = 'all';
    vm.userPreviewActive = false;
    vm.userDetailsActive = false;
    vm.load = false;
    $scope.gridData = [];

    vm.sort = {
      by: 'userid',
      order: '-asc'
    };

    // Defines Grid Filter "All"
    vm.placeholder = {
      name: $translate.instant('linesPage.allLines'),
      filterValue: 'all'
    };

    // Defines Grid Filters "Unassigned" and "Assigned"
    vm.filters = [{
      name: $translate.instant('linesPage.unassignedLines'),
      filterValue: 'unassignedLines'
    }, {
      name: $translate.instant('linesPage.assignedLines'),
      filterValue: 'assignedLines'
    }, {
      name: $translate.instant('linesPage.pending'),
      filterValue: 'pending'
    }];

    // Set data filter
    vm.setFilter = function (filter) {
      if (vm.activeFilter !== filter) {
        vm.activeFilter = filter;
        getLineList();
      }
    };

    // On click, filter line list and set active filter
    vm.filterList = function (str) {
      if (vm.timer) {
        $timeout.cancel(vm.timer);
        vm.timer = 0;
      }

      vm.timer = $timeout(function () {

        // Require at least three characters based on user experience with
        // existing Users Page where CI requires three char before
        // making backend request to update data
        if (str.length >= 3 || str === '') {
          vm.searchStr = str;
          getLineList();
        }
      }, vm.timeoutVal);
    };

    // Get line association data to populate the grid
    function getLineList(startAt) {
      vm.gridRefresh = true;

      // Clear currentLine if a new search begins
      var startIndex = startAt || 0;
      vm.currentLine = null;

      // Get "unassigned" internal and external lines
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter)
        .then(function (response) {

          $timeout(function () {
            vm.load = true;
          });

          if (startIndex === 0) {
            $scope.gridData = response;
          } else {
            $scope.gridData = $scope.gridData.concat(response);
          }

          vm.gridRefresh = false;
        })
        .catch(function (response) {
          Log.debug('Query for line associations failed.');
          Notification.errorResponse(response, 'linesPage.lineListError');
          vm.gridRefresh = false;
        });
    } // End of function getLineList

    var gridRowHeight = 44;

    vm.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      showFilter: false,
      rowHeight: gridRowHeight,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      modifierKeysToMultiSelect: false,
      useExternalSorting: false,
      enableColumnMenus: false,
      noUnselect: true,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if (vm.load) {
            vm.currentDataPosition++;
            vm.load = false;
            getLineList(vm.currentDataPosition * Config.usersperpage + 1);
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
      },
      columnDefs: [{
        field: 'internalNumber',
        displayName: $translate.instant('linesPage.internalNumberHeader'),
        width: '20%',
        cellClass: 'internalNumberColumn',
        sortable: true
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('linesPage.phoneNumbers'),
        sortable: true,
        cellClass: 'externalNumberColumn',
        width: '20%'
      }, {
        field: 'userId',
        displayName: $translate.instant('linesPage.assignedTo'),
        sortable: true,
        sort: {
          direction: 'asc',
          priority: 0
        },
        sortCellFiltered: true
      }]
    };

    $scope.$on('ngGridEventSorted', function (event, data) {
      // assume event data will always contain sort fields and directions
      var sortBy = data.fields[0].toLowerCase();
      var sortOrder = '-' + data.directions[0].toLowerCase();

      if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
        vm.sort.by = sortBy;
        vm.sort.order = sortOrder;

        if (vm.load) {
          vm.load = false;
          getLineList();
        }
      }
    });

    getLineList();

    // list is updated by adding or entitling a user
    $scope.$on('lineListUpdated', function () {
      getLineList();
    });
  }
})();
