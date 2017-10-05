(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseSharedSpaceCtrl', ChooseSharedSpaceCtrl);
  /* @ngInject */
  function ChooseSharedSpaceCtrl(CsdmFilteredViewFactory, $stateParams, $translate, $window) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.initialDeviceType = vm.deviceType = wizardData.account.deviceType;
    vm.showPersonal = wizardData.showPersonal;
    vm.multipleRoomDevices = wizardData.multipleRoomDevices;
    var minlength = 3;
    var maxlength = 64;

    vm.onlyNew = function () {
      return wizardData.function === 'addPlace';
    };

    vm.isNewCollapsed = !vm.onlyNew();
    vm.isExistingCollapsed = true;
    vm.selected = null;
    vm.radioSelect = null;
    vm.filteredView = null;

    function init() {
      loadList();
    }

    function loadList() {
      var filterFunction;
      if (vm.showPersonal && vm.multipleRoomDevices) {
        filterFunction = function () {
          return true;
        };
      } else if (vm.showPersonal && !vm.multipleRoomDevices) {
        filterFunction = function (place) {
          return (_.isEmpty(place.devices) && place.type === 'cloudberry')
            || place.type === 'huron';
        };
      } else {
        if (vm.deviceType === 'cloudberry' && vm.multipleRoomDevices) {
          filterFunction = function (place) {
            return place.type === 'cloudberry';
          };
        } else if (vm.deviceType === 'cloudberry' && !vm.multipleRoomDevices) {
          filterFunction = function (place) {
            return _.isEmpty(place.devices) && place.type === 'cloudberry';
          };
        } else {
          filterFunction = function (place) {
            return place.type === 'huron';
          };
        }
      }

      vm.filteredView = CsdmFilteredViewFactory.createFilteredPlaceView();

      var filterVal = 'all';
      vm.filteredView.setFilters([{
        count: 0,
        filterValue: filterVal,
        passes: filterFunction,
      }]);

      vm.filteredView.setSearchTimeout(0);
      vm.filteredView.setCurrentFilterValue(filterVal);
    }

    vm.getRooms = function (searchStr, maxResCount) {
      vm.deviceName = undefined;
      vm.place = undefined;

      return vm.filteredView.setCurrentSearch(searchStr).then(function (promiseValue) {
        return _.map(promiseValue.slice(0, maxResCount), function (place) {
          place.readablePlaceType = (
            place.type === 'huron' ?
              $translate.instant('machineTypes.room') :
              $translate.instant('machineTypes.lyra_space'));
          return place;
        });
      });
    };

    vm.selectPlace = function ($item) {
      vm.place = $item;
      vm.deviceName = $item.displayName;
      vm.selected = $item.displayName;
      vm.deviceType = $item.type;
    };

    vm.existing = function () {
      vm.radioSelect = 'existing';
      vm.toggle();
      $stateParams.wizard.scrollToBottom($window);
    };

    vm.create = function () {
      vm.radioSelect = 'create';
      vm.toggle();
      $stateParams.wizard.scrollToBottom($window);
    };

    vm.toggle = function () {
      vm.isNewCollapsed = vm.radioSelect === 'existing';
      vm.isExistingCollapsed = vm.radioSelect === 'create';
      vm.deviceName = undefined;
      vm.selected = undefined;
      vm.place = undefined;
    };

    vm.message = {
      required: $translate.instant('common.invalidRequired'),
      min: $translate.instant('common.invalidMinLength', {
        min: minlength,
      }),
      max: $translate.instant('common.invalidMaxLength', {
        max: maxlength,
      }),
    };

    vm.isNameValid = function () {
      if (vm.place) {
        return true;
      } // hack;
      return vm.deviceName && vm.deviceName.length >= minlength && vm.deviceName.length < maxlength;
    };

    vm.next = function () {
      if (!vm.isNameValid()) {
        return;
      }
      var nextOption = vm.showPersonal ? '' : (vm.deviceType + '_');
      if (wizardData.function === 'addPlace') {
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
          deviceType: vm.deviceType,
        },
      }, nextOption);
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    init();
  }
})();
