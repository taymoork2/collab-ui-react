(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($scope, $state, $templateCache, $translate, CsdmPlaceService, CsdmHuronPlaceService, PlaceFilter, Authinfo, WizardFactory, RemPlaceModal) {
        var vm = this;

        vm.data = [];
        vm.csdmLoaded = false;
        vm.huronLoaded = false;
        vm.placeFilter = PlaceFilter;
        var csdmPlacesList;
        var huronPlacesList;

        function init() {
          loadLists();
        }

        function loadLists() {
          CsdmPlaceService.getPlacesList().then(function (list) {
            csdmPlacesList = list;
            vm.csdmLoaded = true;
          });
          CsdmHuronPlaceService.getPlacesList().then(function (list) {
            huronPlacesList = list;
            vm.huronLoaded = true;
          });
        }

        init();

        vm.existsDevices = function () {
          return (vm.shouldShowList()
          && (Object.keys(csdmPlacesList).length > 0 || Object.keys(huronPlacesList).length > 0));
        };

        vm.shouldShowList = function () {
          return vm.csdmLoaded && vm.huronLoaded;
        };

        vm.isEntitledToRoomSystem = function () {
          return Authinfo.isDeviceMgmt();
        };

        vm.isEntitledToHuron = function () {
          return Authinfo.isSquaredUC();
        };

        vm.updateListAndFilter = function () {
          var filtered = _.chain({})
            .extend(csdmPlacesList)
            .extend(huronPlacesList)
            .values()
            .value();
          return PlaceFilter.getFilteredList(filtered);
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

        function sortStateFn(a, b) {
          return a.priority - b.priority;
        }
      }
    );
})();
