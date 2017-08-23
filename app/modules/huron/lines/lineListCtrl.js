(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LinesListCtrl', LinesListCtrl);

  /* @ngInject */
  function LinesListCtrl($scope, $templateCache, $timeout, $translate, LineListService, Log, Config, Notification, $state, FeatureToggleService, Authinfo) {
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
    vm.sortColumn = sortColumn;
    vm.getLineList = getLineList;
    vm.showProviderDetails = showProviderDetails;
    vm.isBYOPSTNCarrier = isBYOPSTNCarrier;
    vm.exportCsv = exportCsv;

    $scope.gridData = [];
    $scope.canShowActionsMenu = canShowActionsMenu;
    $scope.canShowExternalNumberDelete = canShowExternalNumberDelete;
    $scope.deleteExternalNumber = deleteExternalNumber;
    $scope.initToggles = initToggles;

    function initToggles() {
      return FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supported) {
          vm.ishI1484 = supported;
          if (!supported) {
            vm.gridOptions.columnDefs.splice(2, 1);
          }
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

    vm.isCallTrial = Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc') && Authinfo.getLicenseIsTrial('SHARED_DEVICES', false);

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
      LineListService.getLineList(startIndex, Config.usersperpage, vm.sort.by, vm.sort.order, vm.searchStr, vm.activeFilter, $scope.gridData, vm.ishI1484)
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
          _.forEach($scope.gridData, function (row) {
            row.displayField = function () {
              var displayName = formatUserName(this.firstName, this.lastName, this.userId);
              return (!_.isEmpty(displayName) ? displayName : $translate.instant('linesPage.unassignedLines')) + (this.status ? ' - ' + this.status : '');
            };
          });
          vm.gridRefresh = false;
          vm.vendor = LineListService.getVendor();
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
            getLineList((vm.currentDataPosition * Config.usersperpage) + 1);
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
        gridApi.core.on.sortChanged($scope, sortColumn);
      },
      columnDefs: [{
        field: 'internalNumber',
        displayName: $translate.instant('linesPage.internalNumberHeader'),
        width: '20%',
        cellClass: 'internalNumberColumn',
        headerCellClass: 'internalNumberHeader',
        sortable: true,
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('linesPage.phoneNumbers'),
        sortable: true,
        cellClass: 'externalNumberColumn',
        headerCellClass: 'externalNumberHeader',
        width: '20%',
      }, {
        //TODO: (egandhi): replace with Lcation column once API is available
        field: 'firstName',
        displayName: $translate.instant('usersPreview.location'),
        sortable: true,
        cellClass: 'anyColumn',
        headerCellClass: 'anyHeader',
        width: '*',
      }, {
        field: 'displayField()',
        displayName: $translate.instant('linesPage.assignedTo'),
        cellTemplate: getTemplate('_tooltipTpl'),
        sortable: true,
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
        enableSorting: false,
        cellTemplate: getTemplate('_actionsTpl'),
        width: '20%',
        cellClass: 'actionsColumn',
        headerCellClass: 'actionsHeader',
      }],
    };

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

    function getTemplate(name) {
      return $templateCache.get('modules/huron/lines/templates/' + name + '.html');
    }

    FeatureToggleService.supports(FeatureToggleService.features.huronPstn)
      .then(function (supported) {
        vm.hPstn = supported;
      });

    function showProviderDetails() {
      var state = vm.hPstn ? 'pstnWizard' : 'pstnSetup';
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
