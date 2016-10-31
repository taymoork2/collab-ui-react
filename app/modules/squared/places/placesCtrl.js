(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($rootScope, $scope, $state, $templateCache, $translate, CsdmDataModelService, PlaceFilter, Authinfo, WizardFactory, RemPlaceModal) {
        var vm = this;

        vm.data = [];
        vm.placesLoaded = false;
        vm.placeFilter = PlaceFilter;
        vm.placeFilter.resetFilters();
        var filteredPlaces;
        var placesList;

        function init() {
          loadList();
        }

        function loadList() {
          CsdmDataModelService.getPlacesMap().then(function (list) {
            placesList = list;
            vm.placesLoaded = true;
            vm.updateListAndFilter();
          });
        }

        init();

        $rootScope.$on('PLACE_LIST_UPDATED', function () {
          vm.updateListAndFilter();
        });

        vm.existsDevices = function () {
          return (vm.shouldShowList() && (Object.keys(placesList).length > 0));
        };

        vm.shouldShowList = function () {
          return vm.placesLoaded;
        };

        vm.isEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isEntitledToHuron = function () {
          return Authinfo.isSquaredUC();
        };

        vm.setCurrentSearch = function (searchStr) {
          vm.placeFilter.setCurrentSearch(searchStr);
          vm.updateListAndFilter();
        };

        vm.setCurrentFilter = function (filterValue) {
          vm.placeFilter.setCurrentFilter(filterValue);
          vm.updateListAndFilter();
        };

        vm.placeList = function () {
          return filteredPlaces;
        };

        vm.updateListAndFilter = function () {
          filteredPlaces = PlaceFilter.getFilteredList(_.values(placesList));
          return filteredPlaces;
        };

        vm.numDevices = function (place) {
          return _.size(place.devices);
        };

        vm.showPlaceDetails = function (place) {
          vm.currentPlace = place; // fixme: modals depend on state set here
          $state.go('place-overview', {
            currentPlace: place
          });
        };

        vm.gridOptions = {
          data: 'sc.placeList()',
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
            field: 'readableType',
            displayName: $translate.instant('placesPage.typeHeader'),
            sortable: true
          }, {
            field: 'devices',
            displayName: $translate.instant('placesPage.deviceHeader'),
            cellTemplate: getTemplate('_devicesTpl'),
            sortable: true,
            sortingAlgorithm: sortNoDevicesFn
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
          RemPlaceModal
            .open(place)
            .then(vm.updateListAndFilter());
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
      }
    );
})();
