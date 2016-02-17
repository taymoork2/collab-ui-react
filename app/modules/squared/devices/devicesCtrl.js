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
          (vm.deviceListSubscription.eventCount !== 0 || CsdmDeviceService.getDeviceList().length > 0) &&
          (vm.huronDeviceListSubscription.eventCount !== 0 || CsdmHuronDeviceService.getDeviceList().length > 0);
      };

      vm.haveDevices = function() {
        var devices = CsdmDeviceService.getDeviceList();
        var devkeys = Object.keys(devices);
        var numdevs = devkeys.length;
        var huronDevices = CsdmHuronDeviceService.getDeviceList();
        var huronkeys = Object.keys(huronDevices);
        var numhuron = huronkeys.length;
        return (numdevs > 0 || numhuron > 0);
      }

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
        rowHeight: 45,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        multiSelect: false,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            vm.showDeviceDetails(row.entity);
          });
        },

        columnDefs: [{
          field: 'photos',
          displayName: '',
          cellTemplate: getTemplate('_imageTpl'),
          sortable: false,
          width: 70
        }, {
          field: 'displayName',
          displayName: $translate.instant('spacesPage.nameHeader'),
          sortingAlgorithm: sortFn,
          sort: {
            direction: 'asc',
            priority: 1
          },
          sortCellFiltered: true
        }, {
          field: 'state',
          displayName: $translate.instant('spacesPage.statusHeader'),
          cellTemplate: getTemplate('_statusTpl'),
          sortable: true,
          sortingAlgorithm: sortStateFn,
          sort: {
            direction: 'asc',
            priority: 0
          }
        }, {
          field: 'product',
          displayName: $translate.instant('spacesPage.typeHeader'),
          cellTemplate: getTemplate('_productTpl'),
          sortingAlgorithm: sortFn
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

      function sortStateFn(a, b) {
        return a.priority - b.priority;
      }
    }
  );
