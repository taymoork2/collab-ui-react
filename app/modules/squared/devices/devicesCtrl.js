(function () {
  'use strict';

  angular.module('Squared')
    .controller('DevicesCtrl',

      /* @ngInject */
      function ($scope, $state, $translate, $templateCache, Userservice, DeviceFilter, CsdmUnusedAccountsService, CsdmHuronOrgDeviceService, CsdmDataModelService, Authinfo, AccountOrgService, WizardFactory, FeatureToggleService) {
        var vm = this;
        var filteredDevices = [];
        AccountOrgService.getAccount(Authinfo.getOrgId()).success(function (data) {
          vm.showLicenseWarning = !!_.find(data.accounts, {
            licenses: [{
              offerName: "SD",
              status: "SUSPENDED"
            }]
          });
          vm.licenseError = vm.showLicenseWarning ? $translate.instant('spacesPage.licenseSuspendedWarning') : "";
        });

        function init() {
          fetchFeatureToggles();
          fetchDetailsForLoggedInUser();
        }

        function fetchFeatureToggles() {
          FeatureToggleService.csdmPlacesGetStatus().then(function (result) {
            vm.showPlaces = result;
          });
          FeatureToggleService.atlasDarlingGetStatus().then(function (result) {
            vm.showDarling = result;
          });
          FeatureToggleService.csdmPstnGetStatus().then(function (result) {
            vm.showPstn = result && Authinfo.isSquaredUC();
          });
        }

        function fetchDetailsForLoggedInUser() {
          Userservice.getUser('me', function (data) {
            if (data.success) {
              vm.adminDisplayName = data.displayName;
              if (data.name) {
                vm.adminFirstName = data.name.givenName;
              }
              if (!vm.adminFirstName) {
                vm.adminFirstName = data.displayName;
              }
            }
          });
        }

        init();

        vm.deviceFilter = DeviceFilter;
        vm.deviceFilter.resetFilters();

        CsdmDataModelService.getDevicesMap().then(function (devicesMap) {
          vm.devicesMap = devicesMap;
          vm.updateListAndFilter();
        });

        CsdmDataModelService.devicePollerOn('data',
          function () {
            vm.updateListAndFilter();
          }, {
            scope: $scope
          }
        );

        var csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

        vm.setCurrentSearch = function (searchStr) {
          vm.deviceFilter.setCurrentSearch(searchStr);
          vm.updateListAndFilter();
        };
        vm.setCurrentFilter = function (filterValue) {
          vm.deviceFilter.setCurrentFilter(filterValue);
          vm.updateListAndFilter();
        };

        vm.existsDevices = function () {
          return (vm.shouldShowList() && CsdmDataModelService.hasDevices());
        };

        vm.shouldShowList = function () {
          return CsdmDataModelService.hasLoadedAllDeviceSources();
        };

        vm.isEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isEntitledToHuron = function () {
          return _.filter(Authinfo.getLicenses(), function (l) {
            return l.licenseType === 'COMMUNICATION';
          }).length > 0;
        };

        vm.isEntitled = function () {
          return vm.isEntitledToRoomSystem() || vm.isEntitledToHuron();
        };

        vm.deviceList = function () {
          return filteredDevices;
        };
        vm.updateListAndFilter = function () {
          var allDevices = _.chain({})
            .extend(vm.devicesMap)
            .extend(CsdmUnusedAccountsService.getAccountList())
            .values()
            .value();
          filteredDevices = vm.deviceFilter.getFilteredList(allDevices);
          return filteredDevices;
        };

        CsdmDataModelService.subscribeToChanges($scope, vm.updateListAndFilter.bind(this));

        vm.showDeviceDetails = function (device) {
          vm.currentDevice = device; // fixme: modals depend on state set here
          $state.go('device-overview', {
            currentDevice: device,
            huronDeviceService: csdmHuronOrgDeviceService
          });
        };

        vm.gridOptions = {
          data: 'sc.deviceList()',
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

        vm.wizardWithoutPlaces = function () {
          return {
            data: {
              function: "addDevice",
              showPlaces: false,
              showDarling: vm.showDarling,
              title: "addDeviceWizard.newDevice",
              isEntitledToHuron: vm.isEntitledToHuron(),
              isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
              recipient: {
                cisUuid: Authinfo.getUserId(),
                displayName: vm.adminDisplayName,
                email: Authinfo.getPrimaryEmail(),
                organizationId: Authinfo.getOrgId(),
                firstName: vm.adminFirstName
              }
            },
            history: [],
            currentStateName: 'addDeviceFlow.chooseDeviceType',
            wizardState: {
              'addDeviceFlow.chooseDeviceType': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.chooseSharedSpace',
                  huron: 'addDeviceFlow.choosePersonal'
                }
              },
              'addDeviceFlow.choosePersonal': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.chooseSharedSpace': {
                nextOptions: {
                  cloudberry_existing: 'addDeviceFlow.showActivationCode'
                }
              },
              'addDeviceFlow.showActivationCode': {}
            }
          };
        };

        vm.wizardWithPlaces = function () {
          return {
            data: {
              function: "addDevice",
              showPlaces: true,
              showDarling: vm.showDarling,
              title: "addDeviceWizard.newDevice",
              isEntitledToHuron: vm.isEntitledToHuron(),
              isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
              recipient: {
                cisUuid: Authinfo.getUserId(),
                displayName: vm.adminDisplayName,
                email: Authinfo.getPrimaryEmail(),
                organizationId: Authinfo.getOrgId(),
                firstName: vm.adminFirstName
              }
            },
            history: [],
            currentStateName: 'addDeviceFlow.chooseDeviceType',
            wizardState: {
              'addDeviceFlow.chooseDeviceType': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.chooseSharedSpace',
                  huron: 'addDeviceFlow.chooseAccountType'
                }
              },
              'addDeviceFlow.chooseAccountType': {
                nextOptions: {
                  shared: 'addDeviceFlow.chooseSharedSpace',
                  personal: 'addDeviceFlow.choosePersonal'
                }
              },
              'addDeviceFlow.choosePersonal': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.chooseSharedSpace': {
                nextOptions: {
                  cloudberry_existing: 'addDeviceFlow.showActivationCode',
                  cloudberry_create: vm.showPstn && vm.showPlaces ? 'addDeviceFlow.editServices' : 'addDeviceFlow.showActivationCode',
                  huron_existing: 'addDeviceFlow.showActivationCode',
                  huron_create: 'addDeviceFlow.addLines'
                }
              },
              'addDeviceFlow.editServices': {
                nextOptions: {
                  sparkCall: 'addDeviceFlow.addLines',
                  sparkCallConnect: 'addDeviceFlow.callConnectOptions',
                  sparkOnly: 'addDeviceFlow.showActivationCode'
                }
              },
              'addDeviceFlow.addLines': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.callConnectOptions': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.showActivationCode': {}
            }
          };
        };

        vm.startAddDeviceFlow = function () {
          var wizardState = undefined;
          if (vm.showPlaces) {
            wizardState = vm.wizardWithPlaces();
          } else {
            wizardState = vm.wizardWithoutPlaces();
          }
          var wizard = WizardFactory.create(wizardState);
          $state.go(wizard.state().currentStateName, {
            wizard: wizard
          });
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
          if (!a) {
            return b.priority;
          }
          return a.priority - b.priority;
        }
      }
    );
})();
