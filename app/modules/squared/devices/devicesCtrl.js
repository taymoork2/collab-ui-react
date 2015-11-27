'use strict';

angular.module('Squared')
  .controller('DevicesCtrl',

    /* @ngInject */
    function ($scope, $state, $templateCache, DeviceFilter, CsdmCodeService, CsdmDeviceService, AddDeviceModal, Authinfo, AccountOrgService) {
      var vm = this;

      var checkLicense = function () {
        vm.showLicenseWarning = false;

        AccountOrgService.getAccount(Authinfo.getOrgId()).success(function (data) {
          var showWarning = true;
          vm.licenseError = "no license";
          var d = data;
          angular.forEach(d.accounts, function(account) {
            angular.forEach(account.licenses, function(license) {
              if (license.offerName == "SD") {
                // PENDING, ACTIVE, CANCELLED, SUSPENDED
                if (license.isTrial || license.status == "ACTIVE") {
                  showWarning = false;
                } else {
                  vm.licenseError = license.status.toLowerCase();
                }
              }
            });
          });
          vm.showLicenseWarning = showWarning;
        });
      };
      checkLicense();

      vm.deviceFilter = DeviceFilter;

      vm.codesListSubscription = CsdmCodeService.on('data', angular.noop, {
        scope: $scope
      });

      vm.deviceListSubscription = CsdmDeviceService.on('data', angular.noop, {
        scope: $scope
      });

      vm.updateListAndFilter = function () {
        var filtered = _.chain({})
          .extend(CsdmDeviceService.getDeviceList())
          .extend(CsdmCodeService.getCodeList())
          .values()
          .value();
        return DeviceFilter.getFilteredList(filtered);
      };

      vm.gridOptions = {
        data: 'sc.updateListAndFilter()',
        rowHeight: 75,
        showFilter: false,
        multiSelect: false,
        headerRowHeight: 44,
        sortInfo: {
          directions: ['asc'],
          fields: ['displayName']
        },
        rowTemplate: getTemplate('_rowTpl'),

        columnDefs: [{
          field: 'displayName',
          displayName: 'Belongs to',
          cellTemplate: getTemplate('_nameTpl'),
          sortFn: sortFn
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

      vm.showDeviceDetails = function (device) {
        vm.currentDevice = device; // fixme: modals depend on state set here
        $state.go('device-overview', {
          currentDevice: device
        });
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
