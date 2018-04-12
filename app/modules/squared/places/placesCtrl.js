require('./_places.scss');
require('../devices/_devices.scss');

(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($q, $scope, $state, $translate, CsdmFilteredViewFactory, CsdmDataModelService, Userservice, Authinfo, WizardFactory, RemPlaceModal, FeatureToggleService, ServiceDescriptorService, GridCellService, CloudConnectorService) {
        var vm = this;

        vm.data = [];
        vm.addPlaceIsDisabled = true;

        function init() {
          fetchAsyncSettings();

          vm.filteredView = CsdmFilteredViewFactory.createFilteredPlaceView();

          vm.filteredView.setFilters([{
            count: 0,
            name: $translate.instant('common.all'),
            filterValue: 'all',
            passes: function () {
              return true;
            },
          }, {
            count: 0,
            name: $translate.instant('CsdmStatus.WithDevices'),
            filterValue: 'devices',
            passes: function (place) {
              return _.size(place.devices) > 0;
            },
          }]);

          vm.filteredView.isSearchOnly.then(function () {
            CsdmDataModelService.subscribeToChanges($scope, vm.filteredView.refresh.bind(vm.filteredView));
            vm.gridOptions.data = vm.filteredView.getResult();
          });

          vm.gridOptions.data = vm.filteredView.getResult();

          if ($state.params.preSelectedPlaceId) {
            CsdmDataModelService.reloadPlace($state.params.preSelectedPlaceId).then(function (place) {
              vm.showPlaceDetails(place);
            });
          }
        }

        function fetchAsyncSettings() {
          var ataPromise = FeatureToggleService.csdmATAGetStatus().then(function (result) {
            vm.showATA = result;
          });
          var hybridPromise = FeatureToggleService.csdmHybridCallGetStatus().then(function (feature) {
            vm.csdmHybridCallFeature = feature;
          });
          var anyCalendarEnabledPromise = ServiceDescriptorService.getServices().then(function (services) {
            vm.hybridCalendarEnabledOnOrg = vm.hybridCalendarEnabledOnOrg || _.chain(ServiceDescriptorService.filterEnabledServices(services)).filter(function (service) {
              return service.id === 'squared-fusion-gcal' || service.id === 'squared-fusion-cal';
            }).some().value();
            vm.hybridCallEnabledOnOrg = _.chain(ServiceDescriptorService.filterEnabledServices(services)).filter(function (service) {
              return service.id === 'squared-fusion-uc';
            }).some().value();
          });
          var office365Promise = FeatureToggleService.atlasOffice365SupportGetStatus().then(function (feature) {
            if (feature) {
              return CloudConnectorService.getService('squared-fusion-o365').then(function (service) {
                vm.hybridCalendarEnabledOnOrg = vm.hybridCalendarEnabledOnOrg || service.provisioned;
              });
            }
          });
          var googleCalendarPromise = CloudConnectorService.getService('squared-fusion-gcal').then(function (service) {
            vm.hybridCalendarEnabledOnOrg = vm.hybridCalendarEnabledOnOrg || service.provisioned;
          });
          $q.all([ataPromise, hybridPromise, anyCalendarEnabledPromise, office365Promise, googleCalendarPromise, fetchDisplayNameForLoggedInUser()]).finally(function () {
            vm.addPlaceIsDisabled = false;
          });
        }

        function fetchDisplayNameForLoggedInUser() {
          var userDetailsDeferred = $q.defer();
          Userservice.getUser('me', function (data) {
            if (data.success) {
              vm.adminUserDetails = {
                firstName: data.name && data.name.givenName,
                lastName: data.name && data.name.familyName,
                displayName: data.displayName,
                userName: data.userName,
                cisUuid: data.id,
                organizationId: data.meta.organizationID,
              };
            }
            userDetailsDeferred.resolve();
          });
          return userDetailsDeferred.promise;
        }

        vm.isOrgEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isOrgEntitledToHuron = function () {
          return _.filter(
            Authinfo.getLicenses(),
            function (l) {
              return l.licenseType === 'COMMUNICATION';
            }).length > 0;
        };

        vm.deviceTypes = function (devices) {
          return _.chain(devices)
            .values()
            .map('product')
            .join(', ')
            .value();
        };

        vm.showPlaceDetails = function (place) {
          vm.currentPlace = place; // fixme: modals depend on state set here
          $state.go('place-overview', {
            currentPlace: place,
          });
        };

        vm.selectRow = function (grid, row) {
          GridCellService.selectRow(grid, row);
          vm.showPlaceDetails(row.entity);
        };

        vm.gridOptions = {
          appScopeProvider: vm,
          rowHeight: 45,
          columnDefs: [{
            field: 'photos',
            displayName: '',
            cellTemplate: require('./templates/image.tpl.html'),
            sortable: false,
            width: 70,
          }, {
            field: 'displayName',
            displayName: $translate.instant('placesPage.nameHeader'),
            sortingAlgorithm: sortFn,
            sort: {
              direction: 'asc',
              priority: 1,
            },
            sortCellFiltered: true,
            cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showPlaceDetails(row.entity)" cell-value="row.entity.displayName"></cs-grid-cell>',
          }, {
            field: 'devices',
            displayName: $translate.instant('placesPage.deviceHeader'),
            sortable: true,
            sortingAlgorithm: sortDeviceTypes,
            cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showPlaceDetails(row.entity)" cell-value="grid.appScope.deviceTypes(row.entity.devices)"></cs-grid-cell>',
          }, {
            field: 'action',
            displayName: $translate.instant('placesPage.actionHeader'),
            cellTemplate: require('./templates/actions.tpl.html'),
            sortable: false,
          }],
        };

        vm.startAddPlaceFlow = function () {
          var wizardState = {
            data: {
              function: 'addPlace',
              showATA: vm.showATA,
              admin: vm.adminUserDetails,
              csdmHybridCallFeature: vm.csdmHybridCallFeature,
              hybridCalendarEnabledOnOrg: vm.hybridCalendarEnabledOnOrg,
              hybridCallEnabledOnOrg: vm.hybridCallEnabledOnOrg,
              title: 'addDeviceWizard.newSharedSpace.title',
              isEntitledToHuron: vm.isOrgEntitledToHuron(),
              isEntitledToRoomSystem: vm.isOrgEntitledToRoomSystem(),
              account: {
                type: 'shared',
                organizationId: Authinfo.getOrgId(),
              },
              recipient: {
                cisUuid: Authinfo.getUserId(),
                displayName: vm.adminUserDetails.displayName,
                email: Authinfo.getPrimaryEmail(),
                organizationId: vm.adminUserDetails.organizationId,
              },
            },
            history: [],
            currentStateName: 'addDeviceFlow.newSharedSpace',
            wizardState: {
              'addDeviceFlow.newSharedSpace': {
                next: 'addDeviceFlow.chooseDeviceType',
              },
              'addDeviceFlow.chooseDeviceType': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.editServices',
                  huron: 'addDeviceFlow.addLines',
                },
              },
              'addDeviceFlow.editServices': {
                nextOptions: {
                  sparkCall: 'addDeviceFlow.addLines',
                  sparkCallConnect: 'addDeviceFlow.callConnectOptions',
                  sparkOnly: 'addDeviceFlow.showActivationCode',
                  calendar: 'addDeviceFlow.editCalendarService',
                },
              },
              'addDeviceFlow.callConnectOptions': {
                nextOptions: {
                  next: 'addDeviceFlow.showActivationCode',
                  calendar: 'addDeviceFlow.editCalendarService',
                },
              },
              'addDeviceFlow.addLines': {
                nextOptions: {
                  next: 'addDeviceFlow.showActivationCode',
                  calendar: 'addDeviceFlow.editCalendarService',
                },
              },
              'addDeviceFlow.editCalendarService': {
                next: 'addDeviceFlow.showActivationCode',
              },
            },
          };

          var wizard = WizardFactory.create(wizardState);
          $state.go(wizardState.currentStateName, {
            wizard: wizard,
          });
        };

        vm.keyboardDeletePlace = function ($event, place) {
          if ($event.keyCode === GridCellService.ENTER || $event.keyCode === GridCellService.SPACE) {
            vm.deletePlace($event, place);
          } else {
            $event.stopPropagation();
          }
        };

        vm.deletePlace = function ($event, place) {
          $event.stopPropagation();
          RemPlaceModal.open(place);
        };

        function sortFn(a, b) {
          if (a && a.localeCompare) {
            return a.localeCompare(b);
          }
          return 1;
        }

        function sortDeviceTypes(a, b) {
          if (a) {
            var typesA = vm.deviceTypes(a);
            if (typesA && typesA.localeCompare) {
              return typesA.localeCompare(vm.deviceTypes(b));
            }
          }
          return -1;
        }

        init();
      }
    );
})();
