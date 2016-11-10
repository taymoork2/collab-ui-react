(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseSharedSpaceCtrl', ChooseSharedSpaceCtrl);
  /* @ngInject */
  function ChooseSharedSpaceCtrl(CsdmDataModelService, $stateParams, $translate) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.deviceType = wizardData.account.deviceType;
    vm.showPlaces = wizardData.showPlaces;
    var minlength = 3;
    var maxlength = 64;

    vm.onlyNew = function () {
      return wizardData.function == 'addPlace' || (!wizardData.showPlaces && vm.deviceType == 'cloudberry');
    };

    vm.isNewCollapsed = !vm.onlyNew();
    vm.isExistingCollapsed = true;
    vm.selected = null;
    vm.radioSelect = null;
    vm.placesLoaded = false;
    vm.rooms = undefined;
    vm.hasRooms = undefined;

    function init() {
      loadList();
    }

    init();

    vm.localizedCreateInstructions = function () {
      if (!vm.showPlaces) {
        return $translate.instant('addDeviceWizard.chooseSharedSpace.deviceInstalledInstructions');
      }
      if (vm.deviceType === 'huron') {
        return $translate.instant('placesPage.placesDefinition');
      }
      return $translate.instant('addDeviceWizard.chooseSharedSpace.newPlaceInstructions');
    };

    function loadList() {
      if (vm.showPlaces) {
        if (vm.deviceType == 'cloudberry') {
          CsdmDataModelService.getPlacesMap().then(function (placesList) {
            vm.rooms = _(placesList).filter(function (place) {
              return _.isEmpty(place.devices) && place.type == 'cloudberry';
            }).sortBy('displayName').value();
            vm.hasRooms = vm.rooms.length > 0;
            vm.placesLoaded = true;
          });
        } else {
          CsdmDataModelService.getPlacesMap().then(function (placesList) {
            vm.rooms = _(placesList).filter(function (place) {
              return place.type == 'huron';
            }).sortBy('displayName').value();
            vm.hasRooms = vm.rooms.length > 0;
            vm.placesLoaded = true;
          });
        }
      }
    }

    vm.selectPlace = function ($item) {
      vm.place = $item;
      vm.deviceName = $item.displayName;
      vm.selected = $item.displayName;
    };

    vm.existing = function () {
      vm.radioSelect = "existing";
      vm.toggle();
    };

    vm.create = function () {
      vm.radioSelect = "create";
      vm.toggle();
    };

    vm.toggle = function () {
      vm.isNewCollapsed = vm.radioSelect == "existing";
      vm.isExistingCollapsed = vm.radioSelect == "create";
    };

    vm.message = {
      required: $translate.instant('common.invalidRequired'),
      min: $translate.instant('common.invalidMinLength', {
        'min': minlength
      }),
      max: $translate.instant('common.invalidMaxLength', {
        'max': maxlength
      })
    };

    vm.isNameValid = function () {
      if (vm.place) {
        return true;
      } // hack;
      return vm.deviceName && vm.deviceName.length >= minlength && vm.deviceName.length < maxlength;
    };

    vm.next = function () {
      var nextOption = vm.deviceType;
      if (nextOption == 'huron') {
        if (wizardData.function == 'addPlace') {
          nextOption += '_' + 'create';
        } else {
          nextOption += '_' + vm.radioSelect;
        }
      }
      var cisUuid;
      if (vm.place) {
        cisUuid = vm.place.cisUuid;
      }

      $stateParams.wizard.next({
        account: {
          name: vm.deviceName,
          cisUuid: cisUuid,
          type: 'shared'
        }
      }, nextOption);
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
