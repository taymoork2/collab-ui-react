(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderNumbersCtrl', AABuilderNumbersCtrl); /* was AutoAttendantGeneralCtrl */

  /* @ngInject */
  function AABuilderNumbersCtrl($scope, $q, $stateParams, AAUiModelService, AutoAttendantCeInfoModelService,
    AAModelService, ExternalNumberPoolService, InternalNumberPoolService, Authinfo, Notification, $translate, telephoneNumberFilter) {
    var vm = this;

    vm.addNumber = addNumber;
    vm.removeNumber = removeNumber;
    vm.addAAResource = addAAResource;
    vm.deleteAAResource = deleteAAResource;
    vm.getExternalNumbers = getExternalNumbers;
    vm.getInternalNumbers = getInternalNumbers;
    vm.getDupeNumberAnyAA = getDupeNumberAnyAA;
    vm.addToAvailableNumberList = addToAvailableNumberList;

    vm.externalNumberList = [];
    vm.internalNumberList = [];
    vm.availablePhoneNums = [];

    vm.selectPlaceHolder = $translate.instant('autoAttendant.selectPlaceHolder');

    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    // needed for cs-select's model, aaBuilderNumbers.tpl.html
    // but right now at least, we don't want to pre-select any number, so it's blank
    vm.selected = {
      "label": "",
      "value": ""
    };

    /////////////////////

    // Add Number, top-level method called by UI
    function addNumber(number) {

      if (angular.isUndefined(number) || number === '') {
        return;
      }

      // check to see if it's in the available list
      var numobj = vm.availablePhoneNums.filter(function (obj) {
        return obj.value == number;
      });

      // if it's in the available list, take it out, and add to CE resources
      if (!angular.isUndefined(numobj) && numobj.length > 0) {

        vm.availablePhoneNums = vm.availablePhoneNums.filter(function (obj) {
          return obj.value != number;
        });

        // add to the CE resources
        addAAResource(number);

        // clear selection
        vm.selected = {
          "label": "",
          "value": ""
        };

      }

    }

    // Remove number, top-level method called by UI
    function removeNumber(number) {

      if (angular.isUndefined(number) || number === '') {
        return;
      }

      addToAvailableNumberList(telephoneNumberFilter(number), number);

      vm.availablePhoneNums.sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });

      deleteAAResource(number);

      // clear selection
      vm.selected = {
        "label": "",
        "value": ""
      };

    }

    // Add the number to the CE Info resource list
    function addAAResource(number) {

      var resource = AutoAttendantCeInfoModelService.newResource();
      // both internal and external triggers are incomingCall
      resource.setTrigger('incomingCall');
      // default to externalNumber
      resource.setType('externalNumber');

      // the server POST schema specifies an id and number field but the number is actually not used; the id is used as the number
      // So just set them both to the number
      resource.setNumber(number);
      resource.setId(number);

      if (isExternalNumber(number)) {
        resource.setType('externalNumber');
      } else if (isInternalNumber(number)) {
        resource.setType('directoryNumber');
      }

      // add to the resource list
      var resources = vm.ui.ceInfo.getResources();
      resources.push(resource);

    }

    // Delete the number to the CE Info resource list
    function deleteAAResource(number) {
      var i = 0;

      var resources = vm.ui.ceInfo.getResources();
      for (i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === number.replace(/\D/g, '')) {
          resources.splice(i, 1);
        }
      }

    }

    function getDupeNumberAnyAA(testNum) {

      var isNumberInUseOtherAA = vm.aaModel.aaRecords.some(function (record) {
        return record.assignedResources.some(function (resource) {
          return resource.number === testNum;
        });
      });
      return isNumberInUseOtherAA;

    }

    function addToAvailableNumberList(label, number) {
      var opt = {
        label: label,
        value: number
      };
      vm.availablePhoneNums.push(opt);
    }

    function isExternalNumber(number) {
      for (var i = 0; i < vm.externalNumberList.length; i++) {
        if (vm.externalNumberList[i].number.replace(/\D/g, '') === number.replace(/\D/g, '')) {
          return true;
        }
      }
      return false;
    }

    function isInternalNumber(number) {
      for (var i = 0; i < vm.internalNumberList.length; i++) {
        if (vm.internalNumberList[i].number.replace(/\D/g, '') === number.replace(/\D/g, '')) {
          return true;
        }
      }
      return false;
    }

    function getInternalNumbers() {
      return InternalNumberPoolService.query({
        customerId: Authinfo.getOrgId(),
        directorynumber: '',
        order: 'pattern'
      }).$promise.then(function (intPool) {
        for (var i = 0; i < intPool.length; i++) {
          var dn = {
            id: intPool[i].uuid,
            number: intPool[i].pattern
          };

          // the internalNumberList will contain the info as it came from CMI
          vm.internalNumberList.push(dn);

          var num = dn.number.replace(/\D/g, '');
          // Add to the available phone number list if not already used
          if (!getDupeNumberAnyAA(num)) {
            // Internal extensions don't need formatting
            addToAvailableNumberList(num, num);
          }
        }
      });
    }

    function getExternalNumbers() {

      ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          order: 'pattern'
        }).$promise
        .then(function (extPool) {
          for (var i = 0; i < extPool.length; i++) {

            var dn = {
              id: extPool[i].uuid,
              number: extPool[i].pattern
            };

            // the externalNumberList will contain the info as it came from CMI
            vm.externalNumberList.push(dn);

            var num = dn.number.replace(/\D/g, '');
            // Add to the available phone number list if not already used
            if (!getDupeNumberAnyAA(num)) {
              // For the option list, format the number for the label,
              // and return the value as just the number
              addToAvailableNumberList(telephoneNumberFilter(num), num);
            }

          }
        });
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.ui = AAUiModelService.getUiModel();

      getExternalNumbers();

      getInternalNumbers();
    }

    activate();

  }
})();
