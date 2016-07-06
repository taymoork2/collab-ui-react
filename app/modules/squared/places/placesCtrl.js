(function () {
  'use strict';

  angular.module('Squared')
    .controller('PlacesCtrl',

      /* @ngInject */
      function ($scope, $state, $templateCache, CsdmPlaceService, PlaceFilter, Authinfo, WizardFactory) {
        var vm = this;

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
            displayName: 'Name',
            sortingAlgorithm: sortFn,
            sort: {
              direction: 'asc',
              priority: 1
            },
            sortCellFiltered: true
          }, {
            field: 'devices',
            displayName: 'Devices',
            cellTemplate: getTemplate('_devicesTpl'),
            sortable: true,
            sortingAlgorithm: sortStateFn,
            sort: {
              direction: 'asc',
              priority: 0
            }
          }]
        };

        vm.startAddPlaceFlow = function () {

          var wizardState = {
            data: {
              function: "addPlace",
              accountType: 'shared',
              title: "New Place",
              isEntitledToHuron: vm.isEntitledToHuron(),
              isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
              allowUserCreation: false
            },
            history: [],
            currentStateName: 'addDeviceFlow.chooseDeviceType',
            wizardState: {
              'addDeviceFlow.chooseDeviceType': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.chooseSharedSpace',
                  huron: 'addDeviceFlow.chooseSharedSpace'
                }
              },
              'addDeviceFlow.chooseSharedSpace': {
                nextOptions: {
                  cloudberry: 'addDeviceFlow.showActivationCode',
                  huron_create: 'addDeviceFlow.addLines'
                }
              },
              'addDeviceFlow.addLines': {
                next: 'addDeviceFlow.showActivationCode'
              },
              'addDeviceFlow.showActivationCode': {}
            }
          };

          var wizard = WizardFactory.create(wizardState);
          $state.go('addDeviceFlow.chooseDeviceType', {
            wizard: wizard
          });
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