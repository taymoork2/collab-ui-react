(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($scope, $state, $templateCache, $translate, CsdmPlaceService, PlaceFilter, Authinfo, WizardFactory, RemPlaceModal) {
        var vm = this;

        vm.data = [];
        vm.dataLoading = false;
        vm.placeFilter = PlaceFilter;

        vm.existsDevices = function () {
          return (vm.shouldShowList() && (
            Object.keys(CsdmPlaceService.getPlacesList()).length > 0));
        };

        vm.shouldShowList = function () {
          return CsdmPlaceService.dataLoaded();
        };

        vm.isEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isEntitledToHuron = function () {
          return Authinfo.isSquaredUC();
        };

        vm.updateListAndFilter = function () {
          var filtered = _.chain({})
            .extend(CsdmPlaceService.getPlacesList())
            .values()
            .value();
          return PlaceFilter.getFilteredList(filtered);
        };

        vm.updateListAndFilter();

        vm.numDevices = function (place) {
          return _.size(place.devices);
        };

        vm.showPlaceDetails = function (place) {
          vm.currentPlace = place; // fixme: modals depend on state set here
          $state.go('place-overview', {
            currentPlace: place
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
              vm.showPlaceDetails(row.entity);
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
            displayName: $translate.instant('placesPage.nameHeader'),
            sortingAlgorithm: sortFn,
            sort: {
              direction: 'asc',
              priority: 1
            },
            sortCellFiltered: true
          }, {
            field: 'type',
            displayName: $translate.instant('placesPage.typeHeader'),
            cellTemplate: getTemplate('_typeTpl'),
            sortable: true
          }, {
            field: 'devices',
            displayName: $translate.instant('placesPage.deviceHeader'),
            cellTemplate: getTemplate('_devicesTpl'),
            sortable: true,
            sortingAlgorithm: sortStateFn
          }, {
            field: 'action',
            displayName: $translate.instant('placesPage.actionHeader'),
            cellTemplate: getTemplate('_actionsTpl'),
            sortable: false
          }]
        };

        vm.startAddPlaceFlow = function () {
          var wizardState = {
            data: {
              function: "addPlace",
              accountType: 'shared',
              showPlaces: true,
              title: 'addDeviceWizard.newSharedSpace.title',
              isEntitledToHuron: vm.isEntitledToHuron(),
              isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
              allowUserCreation: false
            },
            history: [],
            currentStateName: 'addDeviceFlow.newSharedSpace',
            wizardState: {
              'addDeviceFlow.newSharedSpace': {
                next: 'addDeviceFlow.chooseDeviceType',
                cloudberry: 'addDeviceFlow.showActivationCode',
                huron_create: 'addDeviceFlow.addLines'
              },
              'addDeviceFlow.chooseDeviceType': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.showActivationCode',
                  huron: 'addDeviceFlow.addLines'
                }
              },
              'addDeviceFlow.addLines': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.generateAuthCode': {}
            }
          };

          var wizard = WizardFactory.create(wizardState);
          $state.go(wizardState.currentStateName, {
            wizard: wizard
          });
        };

        vm.deletePlace = function ($event, place) {
          $event.stopPropagation();
          RemPlaceModal.open(place);
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

        function sortStateFn(a, b) {
          return a.priority - b.priority;
        }
      }
    );
})();
