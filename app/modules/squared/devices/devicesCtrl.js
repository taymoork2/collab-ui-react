'use strict';

angular.module('Squared')
  .controller('DevicesCtrl',

    /* @ngInject */
    function ($scope, $state, $translate, $templateCache, DeviceFilter, CsdmCodeService, CsdmUnusedAccountsService, CsdmHuronDeviceService, CsdmDeviceService, AddDeviceModal, Authinfo, AccountOrgService) {
      var vm = this;

      AccountOrgService.getAccount(Authinfo.getOrgId()).success(function (data) {
        vm.showLicenseWarning = !!_.find(data.accounts, {
          licenses: [{
            offerName: "SD",
            status: "SUSPENDED"
          }]
        });
        vm.licenseError = vm.showLicenseWarning ? $translate.instant('spacesPage.licenseSuspendedWarning') : "";
      });

      vm.deviceFilter = DeviceFilter;

      vm.codesListSubscription = CsdmCodeService.on('data', angular.noop, {
        scope: $scope
      });

      vm.deviceListSubscription = CsdmDeviceService.on('data', angular.noop, {
        scope: $scope
      });

      vm.huronDeviceListSubscription = CsdmHuronDeviceService.on('data', angular.noop, {
        scope: $scope
      });

      vm.shouldShowList = function () {
        return vm.codesListSubscription.eventCount !== 0 &&
          (vm.deviceListSubscription.eventCount !== 0 || CsdmDeviceService.getDeviceList().length > 0);
      };

      vm.updateListAndFilter = function () {
        var filtered = _.chain({})
          .extend(CsdmDeviceService.getDeviceList())
          .extend(CsdmHuronDeviceService.getDeviceList())
          .extend(CsdmCodeService.getCodeList())
          .extend(CsdmUnusedAccountsService.getAccountList())
          .values()
          .value();
        return DeviceFilter.getFilteredList(filtered);
      };

      vm.showDeviceDetails = function (device) {
        vm.currentDevice = device; // fixme: modals depend on state set here
        $state.go('device-overview', {
          currentDevice: device
        });
      };

      vm.gridOptions = {
        data: 'sc.updateListAndFilter()',
        rowHeight: 75,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            vm.showDeviceDetails(row.entity);
          });
        },
        columnDefs: [{
          field: 'displayName',
          displayName: 'Belongs to',
          cellTemplate: getTemplate('_nameTpl'),
          sortingAlgorithm: sortFn,
          sort: {
            direction: 'asc',
            priority: 0
          },
          sortCellFiltered: true
        }, {
          field: 'readableState',
          displayName: 'Status',
          cellTemplate: getTemplate('_statusTpl'),
          sortFn: sortFn
        }, {
          field: 'product',
          displayName: 'Type',
          cellTemplate: getTemplate('_productTpl'),
          sortFn: sortFn
        }]
      };

      vm.showAddDeviceDialog = function () {
        AddDeviceModal.open();
      };

      function getTemplate(name) {
        return $templateCache.get('modules/squared/devices/templates/' + name + '.html');
      }

      function sortFn(a, b) {
        if (a && a.localeCompare) {
          return a.localeCompare(b);
        }
        return 1;
      }

    }
  );
