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
    vm.showPersonal = wizardData.showPersonal;
    var minlength = 3;
    var maxlength = 64;

    vm.onlyNew = function () {
      return wizardData.function == 'addPlace';
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

    function loadList() {
      if (vm.showPersonal) {
        CsdmDataModelService.getPlacesMap().then(function (placesList) {
          vm.rooms = _(placesList).filter(function (place) {
            return (_.isEmpty(place.devices) && place.type == 'cloudberry')
              || place.type == 'huron';
          }).sortBy('displayName').value();
          vm.hasRooms = vm.rooms.length > 0;
          vm.placesLoaded = true;
        });
      } else {
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
      vm.deviceType = $item.type;
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
      vm.isNewCollapsed = vm.radioSelect == 'existing';
      vm.isExistingCollapsed = vm.radioSelect == 'create';
      vm.deviceName = undefined;
      vm.selected = undefined;
      vm.place = undefined;
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
      var nextOption = vm.showPersonal ? '' : (vm.deviceType + '_');
      if (wizardData.function == 'addPlace') {
        nextOption += 'create';
      } else {
        nextOption += (vm.radioSelect || 'existing');
      }
      var cisUuid;
      if (vm.place) {
        cisUuid = vm.place.cisUuid;
      }

      $stateParams.wizard.next({
        account: {
          name: vm.deviceName,
          cisUuid: cisUuid,
          type: 'shared',
          deviceType: vm.deviceType
        }
      }, nextOption);
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
