(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $templateCache, $timeout, $translate, LineListService, Log, Config, Notification) {

    var vm = this;

    vm.tooltipTemplate = $templateCache.get('modules/huron/lines/tooltipTemplate.tpl.html');
    vm.currentDataPosition = 0;
    vm.gridRefresh = true; // triggers the spinner over the grid
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.timer = 0;
    vm.activeFilter = 'all';
    vm.userPreviewActive = false;
    vm.userDetailsActive = false;
    vm.load = false;
    vm.sortColumn = sortColumn;
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
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter, $scope.gridData)
        .then(function (response) {

          $timeout(function () {
            vm.load = true;
          });

          if (startIndex === 0) {
            $scope.gridData = response;
          } else {
            $scope.gridData = $scope.gridData.concat(response);
          }

          //function for sorting based on which piece of data the row has
          angular.forEach($scope.gridData, function (row) {
            row.displayField = function () {
              return this.userId || this.status;
            };
          });
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
        gridApi.core.on.sortChanged($scope, function (sortColumns) {
          sortColumn(sortColumns);
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
        field: 'displayField()',
        displayName: $translate.instant('linesPage.assignedTo'),
        cellTemplate: vm.tooltipTemplate,
        sortable: true,
        sort: {
          direction: 'asc',
          priority: 0
        },
        sortCellFiltered: true,
        sortingAlgoithmn: function (a, b, $scope) {
          var aSort = a === null ? a : a.toLowerCase();
          var bSort = b === null ? b : b.toLowerCase();

          if (aSort > bSort) {
            return 1;
          } else if (aSort < bSort) {
            return -1;
          } else {
            return 0;
          }
        }
      }]
    };

    function sortColumn(sortColumns) {
      if (_.isUndefined(_.get(sortColumns, '[0]'))) {
        return;
      }

      if (vm.load) {
        vm.load = false;
        var sortBy = sortColumns[0].name === 'displayField()' ? 'userId' : sortColumns[0].name;
        var sortOrder = '-' + sortColumns[0].sort.direction;
        if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
          vm.sort.by = sortBy.toLowerCase();
          vm.sort.order = sortOrder.toLowerCase();
        }
        getLineList();
      }
    }

    getLineList();
  }
})();
