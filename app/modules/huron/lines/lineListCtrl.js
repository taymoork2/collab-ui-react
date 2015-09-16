(function () {
  'use strict';
  /* global $ */

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $timeout, $translate, LineListService, Log, Config, Notification) {

    var vm = this;
    //Initialize variables
    vm.currentDataPosition = 0;
    vm.gridRefresh = true; // triggers the spinner over the grid
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.timer = 0;
    vm.activeFilter = 'all';
    vm.userPreviewActive = false;
    vm.userDetailsActive = false;
    $scope.gridData = [];

    vm.sort = {
      by: 'name',
      order: 'ascending'
    };

    // Defines Grid Filter "All"
    vm.placeholder = {
      name: $translate.instant('linesPage.allLines'),
      filterValue: '',
      count: 0
    };

    // Defines Grid Filters "Unassigned" and "Assigned"
    vm.filters = [{
      name: $translate.instant('linesPage.unassignedLines'),
      filterValue: 'unassignedLines',
      count: 0
    }, {
      name: $translate.instant('linesPage.assignedLines'),
      filterValue: 'assignedLines',
      count: 0
    }];

    // Switches data that populates the grid
    vm.setFilter = function (filter) {
      vm.activeFilter = filter;
      getLineList();
    };

    // On click, filter line list and set active filter
    vm.filterList = function (str) {
      if (vm.timer) {
        $timeout.cancel(vm.timer);
        vm.timer = 0;
      }

      vm.timer = $timeout(function () {

        //CI requires search strings to be at least three characters
        if (str.length >= 3 || str === '') {
          vm.searchStr = str;
          getLineList();
        }
      }, vm.timeoutVal);
    };

    // get line data to populate the grid
    function getLineList(startAt) {

      vm.gridRefresh = true;

      // clear currentLine if a new search begins
      var startIndex = startAt || 0;
      vm.currentLine = null;

      // get "unassigned" internal and external lines
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter)
        .then(function (response) {
          vm.placeholder.count = 14;
          vm.filters[1].count = 6;
          vm.filters[0].count = 8;

          if (startIndex === 0) {
            $scope.gridData = response;
          } else {
            $scope.gridData = $scope.gridData.concat(response);
          }
          vm.gridRefresh = false;
        })
        .catch(function (response) {
          Log.debug('Query for unassigned lines failed.');
          Notification.errorResponse(response, 'linesPage.lineListError');
        });
    } // end of function getLineList

    var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
      '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"></div>' +
      '<div ng-cell></div>' +
      '</div>';

    var gridRowHeight = 44;

    vm.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      showFilter: false,
      rowHeight: gridRowHeight,
      rowTemplate: rowTemplate,
      headerRowHeight: gridRowHeight,
      useExternalSorting: false,
      enableRowSelection: false,
      sortInfo: { // makes the sort arrow appear at grid load time
        fields: ['userName'],
        directions: ['asc']
      },

      columnDefs: [{
        field: 'internalNumber',
        displayName: $translate.instant('linesPage.internalNumberHeader'),
        width: '30%',
        cellClass: 'internalNumberColumn',
        sortable: true
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('linesPage.externalNumberHeader'),
        sortable: true
      }, {
        field: 'userName',
        displayName: $translate.instant('linesPage.userEmailHeader'),
        sortable: true

      }]
    };

    $scope.$on('ngGridEventScroll', function () {
      if (vm.load) {
        vm.currentDataPosition++;
        vm.load = false;
        getLineList(vm.currentDataPosition * Config.usersperpage + 1);
      }
    });

    getLineList();

    // list is updated by adding or entitling a user
    $scope.$on('lineListUpdated', function () {
      getLineList();
    });
  }
})();
