(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $timeout, $translate, LineListService, Log, Config, Notification, $state, FeatureToggleService, Authinfo) {
    var vm = this;

    vm.currentDataPosition = 0;
    vm.gridRefresh = true; // triggers the spinner over the grid
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.timer = 0;
    vm.activeFilter = 'all';
    vm.load = false;
    vm.sortColumn = sortColumn;
    vm.getLineList = getLineList;
    vm.showProviderDetails = showProviderDetails;
    vm.isBYOPSTNCarrier = isBYOPSTNCarrier;
    vm.exportCsv = exportCsv;

    vm.canShowActionsMenu = canShowActionsMenu;
    vm.canShowExternalNumberDelete = canShowExternalNumberDelete;
    vm.deleteExternalNumber = deleteExternalNumber;
    vm.clearRows = clearRows;
    vm.initToggles = initToggles;

    function initToggles() {
      return FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supported) {
          vm.ishI1484 = supported;
          if (!supported) {
            columnDefs.splice(0, 1);
            columnDefs.splice(2, 1);
          } else {
            columnDefs.splice(1, 1);
          }

          initGridOptions();
        });
    }

    vm.sort = {
      by: 'userid',
      order: '-asc',
    };
    vm.currentCustomer = {
      customerOrgId: Authinfo.getOrgId(),
    };

    // Defines Grid Filter "All"
    vm.placeholder = {
      name: $translate.instant('linesPage.allLines'),
      filterValue: 'all',
    };

    vm.isCallTrial = (_.isUndefined(Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc')) ||
                       Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc')) &&
                       (_.isUndefined(Authinfo.getLicenseIsTrial('SHARED_DEVICES', false)) ||
                       Authinfo.getLicenseIsTrial('SHARED_DEVICES', false));
    // Defines Grid Filters "Unassigned" and "Assigned"
    vm.filters = [{
      name: $translate.instant('linesPage.unassignedLines'),
      filterValue: 'unassignedLines',
    }, {
      name: $translate.instant('linesPage.assignedLines'),
      filterValue: 'assignedLines',
    }, {
      name: $translate.instant('linesPage.pending'),
      filterValue: 'pending',
    }];

    // Set data filter
    vm.setFilter = function (filter) {
      if (vm.activeFilter !== filter) {
        vm.activeFilter = filter;
        getLineList();
        vm.currentDataPosition = 0;
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
          vm.currentDataPosition = 0;
        }
      }, vm.timeoutVal);
    };

    function exportCsv() {
      return LineListService.exportCSV($scope)
        .catch(function (response) {
          Notification.errorResponse(response, 'linesPage.lineListError');
        });
    }

    function deleteExternalNumber($event, number) {
      $event.stopPropagation();

      $state.go('externalNumberDelete', {
        numberInfo: {
          orgId: Authinfo.getOrgId(),
          externalNumber: number,
          apiImplementation: LineListService.getApiImplementation(),
        },
        refreshFn: vm.getLineList,
      });
    }

    function canShowActionsMenu(line) {
      return canShowExternalNumberDelete(line);
    }

    function isBYOPSTNCarrier() {
      return LineListService.getCarrierName() === 'BYO-PSTN';
    }

    function canShowExternalNumberDelete(line) {
      return line.externalNumber && (_.startsWith(line.displayField(), $translate.instant('linesPage.unassignedLines')));
    }

    // Get line association data to populate the grid
    function getLineList(startAt) {
      vm.gridRefresh = true;

      // Clear currentLine if a new search begins
      var startIndex = startAt || 0;
      vm.currentLine = null;

      // Get "unassigned" internal and external lines
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter, vm.gridOptions.data, vm.ishI1484)
        .then(function (response) {
          $timeout(function () {
            vm.load = true;
          });

          if (startIndex === 0) {
            vm.gridOptions.data = response;
          } else {
            vm.gridOptions.data = vm.gridOptions.data.concat(response);
          }

          //function for sorting based on which piece of data the row has
          _.forEach(vm.gridOptions.data, function (row) {
            row.displayField = function () {
              var displayName = formatUserName(this.firstName, this.lastName, this.userId);
              return (!_.isEmpty(displayName) ? displayName : $translate.instant('linesPage.unassignedLines')) + (this.status ? ' - ' + this.status : '');
            };
          });
          vm.gridRefresh = false;
          vm.vendor = LineListService.getVendor();

          if (response.length === 0) {
            //stop firing any more infinite scroll events
            $scope.gridApi.infiniteScroll.dataLoaded(false, false);
          } else {
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        })
        .catch(function (response) {
          Log.debug('Query for line associations failed.');
          Notification.errorResponse(response, 'linesPage.lineListError');
          vm.gridRefresh = false;
        });
    } // End of function getLineList

    function formatUserName(first, last, userId) {
      var userName = userId;
      var firstName = first || '';
      var lastName = last || '';
      if ((firstName.length > 0) || (lastName.length > 0)) {
        userName = _.trim(firstName + ' ' + lastName);
      }
      return userName;
    }

    function clearRows() {
      $scope.gridApi.selection.clearSelectedRows();
    }

    var columnDefs = [{
      field: 'siteToSiteNumber',
      displayName: $translate.instant('linesPage.internalNumberHeader'),
      width: '20%',
      cellClass: 'internalNumberColumn',
      headerCellClass: 'internalNumberHeader',
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.siteToSiteNumber"></cs-grid-cell>',
    }, {
      field: 'internalNumber',
      displayName: $translate.instant('linesPage.internalNumberHeader'),
      width: '20%',
      cellClass: 'internalNumberColumn',
      headerCellClass: 'internalNumberHeader',
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.internalNumber"></cs-grid-cell>',
    }, {
      field: 'externalNumber',
      displayName: $translate.instant('linesPage.phoneNumbers'),
      cellClass: 'externalNumberColumn',
      headerCellClass: 'externalNumberHeader',
      width: '20%',
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.externalNumber"></cs-grid-cell>',
    }, {
      field: 'locationName',
      displayName: $translate.instant('usersPreview.location'),
      cellClass: 'anyColumn',
      headerCellClass: 'anyHeader',
      width: '*',
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.locationName"></cs-grid-cell>',
    }, {
      field: 'displayField()',
      displayName: $translate.instant('linesPage.assignedTo'),
      cellTemplate: require('./templates/_tooltipTpl.html'),
      sort: {
        direction: 'asc',
        priority: 0,
      },
      sortCellFiltered: true,
      cellClass: 'assignedToColumn',
      headerCellClass: 'assignedToHeader',
    }, {
      field: 'actions',
      displayName: $translate.instant('linesPage.actionHeader'),
      cellTemplate: require('./templates/_actionsTpl.html'),
      enableSorting: false,
      width: '20%',
      cellClass: 'actionsColumn',
      headerCellClass: 'actionsHeader',
    }];

    function initGridOptions() {
      vm.gridOptions = {
        data: [],
        appScopeProvider: vm,
        showFilter: false,
        rowHeight: 44,
        useExternalSorting: false,
        noUnselect: true,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
            if (vm.load) {
              vm.currentDataPosition++;
              vm.load = false;
              getLineList((vm.currentDataPosition * Config.usersperpage) + 1);
            }
          });
          gridApi.core.on.sortChanged($scope, sortColumn);
        },
        columnDefs: columnDefs,
      };
    }

    function sortColumn(scope, sortColumns) {
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

    function showProviderDetails() {
      var state = 'pstnWizard';
      return $state.go(state, {
        customerId: Authinfo.getOrgId(),
        customerName: Authinfo.getOrgName(),
        customerEmail: Authinfo.getCustomerAdminEmail(),
        customerCommunicationLicenseIsTrial: Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc'),
        customerRoomSystemsLicenseIsTrial: Authinfo.getLicenseIsTrial('SHARED_DEVICES', false),
        refreshFn: vm.getLineList,
      });
    }

    initToggles().finally(getLineList);
  }
})();
