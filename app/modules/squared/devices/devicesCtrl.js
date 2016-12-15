require('./_devices.scss');

(function () {
  'use strict';

  angular.module('Squared')
    .controller('DevicesCtrl',

      /* @ngInject */
      function ($log, $q, $scope, $state, $translate, $templateCache, Userservice, DeviceFilter, CsdmHuronOrgDeviceService, CsdmDataModelService, Authinfo, AccountOrgService, WizardFactory, FeatureToggleService, $modal, Notification, DeviceExportService) {
        var vm = this;
        var filteredDevices = [];
        vm.addDeviceIsDisabled = true;
        vm.exportProgressDialog = undefined;

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
          fetchAsyncSettings();
        }

        function fetchAsyncSettings() {
          var darlingPromise = FeatureToggleService.atlasDarlingGetStatus().then(function (result) {
            vm.showDarling = result;
          });
          var ataPromise = FeatureToggleService.csdmATAGetStatus().then(function (result) {
            vm.showATA = result;
          });
          var pstnPromise = FeatureToggleService.csdmPstnGetStatus().then(function (result) {
            vm.showPstn = result && Authinfo.isSquaredUC();
          });
          var hybridPromise = FeatureToggleService.csdmHybridCallGetStatus().then(function (feature) {
            vm.csdmHybridCallFeature = feature;
          });
          var deviceExportPromise = FeatureToggleService.atlasDeviceExportGetStatus().then(function (result) {
            vm.deviceExportFeature = result;
          });
          $q.all([darlingPromise, ataPromise, pstnPromise, hybridPromise, deviceExportPromise, fetchDetailsForLoggedInUser()]).finally(function () {
            vm.addDeviceIsDisabled = false;
          });
        }

        function fetchDetailsForLoggedInUser() {
          var userDetailsDeferred = $q.defer();
          Userservice.getUser('me', function (data) {
            if (data.success) {
              vm.adminDisplayName = data.displayName;
              if (data.name) {
                vm.adminFirstName = data.name.givenName;
              }
              if (!vm.adminFirstName) {
                vm.adminFirstName = data.displayName;
              }
              vm.adminOrgId = data.meta.organizationID;
            }
            userDetailsDeferred.resolve();
          });
          return userDetailsDeferred.promise;
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
          if (!vm._existsDevices) {
            vm._existsDevices = (vm.shouldShowList() && CsdmDataModelService.hasDevices());
          }
          return vm._existsDevices;
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

        vm.wizardWithPlaces = function () {
          return {
            data: {
              function: "addDevice",
              showATA: vm.showATA,
              showDarling: vm.showDarling,
              adminOrganizationId: vm.adminOrgId,
              csdmHybridCallFeature: vm.csdmHybridCallFeature,
              title: "addDeviceWizard.newDevice",
              isEntitledToHuron: vm.isEntitledToHuron(),
              isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
              account: {
                organizationId: Authinfo.getOrgId()
              },
              recipient: {
                cisUuid: Authinfo.getUserId(),
                displayName: vm.adminDisplayName,
                email: Authinfo.getPrimaryEmail(),
                organizationId: vm.adminOrgId,
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
                  cloudberry_create: vm.showPstn ? 'addDeviceFlow.editServices' : 'addDeviceFlow.showActivationCode',
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
          var wizard = WizardFactory.create(vm.wizardWithPlaces());
          $state.go(wizard.state().currentStateName, {
            wizard: wizard
          });
        };

        vm.startDeviceExport = function () {
          $modal.open({
            templateUrl: "modules/squared/devices/export/devices-export.html",
            type: 'dialog'
          }).result.then(function () {
            DeviceExportService.exportDevices(vm.exportStatus);
          }, function () {
            $log.info("Export cancelled");
          });
        };

        vm.exportStatus = function (percent) {
          if (percent == 0) {
            vm.exporting = true;
            vm.exportProgressDialog = $modal.open({
              templateUrl: "modules/squared/devices/export/devices-export-progress.html",
              type: 'dialog',
              controller: function () {
                $scope.cancelExport = function () {
                  DeviceExportService.cancelExport();
                };
              },
              scope: $scope
            });
            vm.exportProgressDialog.result.then(function () {
            }, function (err) {
              $log.warn("Export stopped while in progress, reason:", err);
              //Notification.notify('spacesPage.export.deviceExportCancelled', 'error');
              //vm.exporting = false;
            });
          } else if (percent > 0 && percent < 100) {
            // progress percentage not implemented
          } else if (percent == 100) {
            vm.exporting = false;
            vm.exportProgressDialog.close("success");
            var title = $translate.instant('spacesPage.export.exportCompleted');
            var text = $translate.instant('spacesPage.export.deviceListReadyForDownload');
            Notification.notify(text, 'success', title);
          } else if (percent == -1) {
            vm.exporting = false;
            var text2 = $translate.instant('spacesPage.export.deviceExportCancelled');
            Notification.notify(text2, 'warn');
            vm.exportProgressDialog.close();
          } else {
            vm.exporting = false;
            $log.warn("Unexpected export state!");
          }
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
