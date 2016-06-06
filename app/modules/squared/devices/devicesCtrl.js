(function () {
  'use strict';

  angular.module('Squared')
    .controller('DevicesCtrl',

      /* @ngInject */
      function ($scope, $state, $translate, $templateCache, DeviceFilter, CsdmCodeService, CsdmUnusedAccountsService, CsdmHuronOrgDeviceService, CsdmDeviceService, AddDeviceModal, Authinfo, AccountOrgService) {
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

        // Reset to defaults on pageload to wipe out any lingering settings from previous page visits
        vm.deviceFilter = DeviceFilter;
        vm.deviceFilter.setCurrentSearch('');
        vm.deviceFilter.setCurrentFilter('');

        vm.codesListSubscription = CsdmCodeService.on('data', angular.noop, {
          scope: $scope
        });

        vm.deviceListSubscription = CsdmDeviceService.on('data', angular.noop, {
          scope: $scope
        });

        var csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

        vm.existsDevices = function () {
          return (vm.shouldShowList() && (
            Object.keys(CsdmCodeService.getCodeList()).length > 0 ||
            Object.keys(CsdmDeviceService.getDeviceList()).length > 0 ||
            Object.keys(csdmHuronOrgDeviceService.getDeviceList()).length > 0));
        };

        vm.shouldShowList = function () {
          return vm.codesListSubscription.eventCount !== 0 &&
            (vm.deviceListSubscription.eventCount !== 0 || CsdmDeviceService.getDeviceList().length > 0) &&
            (csdmHuronOrgDeviceService.dataLoaded() || csdmHuronOrgDeviceService.getDeviceList().length > 0);
        };

        vm.isEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isEntitledToHuron = function () {
          return Authinfo.isSquaredUC();
        };

        vm.updateListAndFilter = function () {
          var filtered = _.chain({})
            .extend(CsdmDeviceService.getDeviceList())
            .extend(csdmHuronOrgDeviceService.getDeviceList())
            .extend(CsdmCodeService.getCodeList())
            .extend(CsdmUnusedAccountsService.getAccountList())
            .values()
            .value();
          return vm.deviceFilter.getFilteredList(filtered);
        };

        vm.showDeviceDetails = function (device) {
          vm.currentDevice = device; // fixme: modals depend on state set here
          $state.go('device-overview', {
            currentDevice: device,
            huronDeviceService: csdmHuronOrgDeviceService
          });
        };

        vm.clickUsers = function () {
          $state.go('users.list');
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
})();
