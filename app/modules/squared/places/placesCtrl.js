require('./_places.scss');
require('../devices/_devices.scss');

(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($q, $scope, $state, $templateCache, $translate, CsdmFilteredViewFactory, CsdmDataModelService, Userservice, Authinfo, WizardFactory, RemPlaceModal, FeatureToggleService, ServiceDescriptorService) {
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
        }

        function fetchAsyncSettings() {
          var ataPromise = FeatureToggleService.csdmATAGetStatus().then(function (result) {
            vm.showATA = result;
          });
          var hybridPromise = FeatureToggleService.csdmHybridCallGetStatus().then(function (feature) {
            vm.csdmHybridCallFeature = feature;
          });
          var placeCalendarPromise = FeatureToggleService.csdmPlaceCalendarGetStatus().then(function (feature) {
            vm.csdmHybridCalendarFeature = feature;
          });
          var anyCalendarEnabledPromise = ServiceDescriptorService.getServices().then(function (services) {
            vm.hybridCalendarEnabledOnOrg = _.chain(ServiceDescriptorService.filterEnabledServices(services)).filter(function (service) {
              return service.id === 'squared-fusion-gcal' || service.id === 'squared-fusion-cal';
            }).some().value();
            vm.hybridCallEnabledOnOrg = _.chain(ServiceDescriptorService.filterEnabledServices(services)).filter(function (service) {
              return service.id === 'squared-fusion-uc';
            }).some().value();
          });
          $q.all([ataPromise, hybridPromise, placeCalendarPromise, anyCalendarEnabledPromise, fetchDisplayNameForLoggedInUser()]).finally(function () {
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

        vm.numDevices = function (place) {
          return _.size(place.devices);
        };

        vm.showPlaceDetails = function (place) {
          vm.currentPlace = place; // fixme: modals depend on state set here
          $state.go('place-overview', {
            currentPlace: place,
          });
        };

        vm.gridOptions = {
          rowHeight: 45,
          onRegisterApi: function (gridApi) {
            vm.gridApi = gridApi;
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              vm.showPlaceDetails(row.entity);
            });
          },
          columnDefs: [{
            field: 'photos',
            displayName: '',
            cellTemplate: getTemplate('_imageTpl'),
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
          }, {
            field: 'readableType',
            displayName: $translate.instant('placesPage.typeHeader'),
            sortable: true,
          }, {
            field: 'devices',
            displayName: $translate.instant('placesPage.deviceHeader'),
            cellTemplate: getTemplate('_devicesTpl'),
            sortable: true,
            sortingAlgorithm: sortNoDevicesFn,
          }, {
            field: 'action',
            displayName: $translate.instant('placesPage.actionHeader'),
            cellTemplate: getTemplate('_actionsTpl'),
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
              csdmHybridCalendarFeature: vm.csdmHybridCalendarFeature,
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
                  sparkOnlyAndCalendar: 'addDeviceFlow.editCalendarService',
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

        vm.deletePlace = function ($event, place) {
          $event.stopPropagation();
          RemPlaceModal
            .open(place);
        };

        function getTemplate(name) {
          return $templateCache.get('modules/squared/places/templates/' + name + '.html');
        }

        function sortFn(a, b) {
          if (a && a.localeCompare) {
            return a.localeCompare(b);
          }
          return 1;
        }

        function sortNoDevicesFn(a, b) {
          return _.size(a) - _.size(b);
        }

        init();
      }
    );
})();
