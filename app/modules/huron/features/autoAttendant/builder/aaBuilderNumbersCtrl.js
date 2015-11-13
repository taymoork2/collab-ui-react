(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderNumbersCtrl', AABuilderNumbersCtrl); /* was AutoAttendantGeneralCtrl */

  /* @ngInject */
  function AABuilderNumbersCtrl($scope, $q, $stateParams, AAUiModelService, AutoAttendantCeInfoModelService,
    AAModelService, ExternalNumberPoolService, Authinfo, Notification, $translate) {
    var vm = this;
    vm.addNumber = addNumber;
    vm.deleteAAResource = deleteAAResource;
    vm.filter = filter;
    vm.getDupeNumberAnyAA = getDupeNumberAnyAA;
    vm.getExternalNumbers = getExternalNumbers;

    vm.inputNumber = {
      id: '',
      number: '',
      type: 'directoryNumber',
      trigger: 'incomingCall'
    };

    vm.availablePhoneNums = [];
    vm.addAAResourceFromInputNumber = addAAResourceFromInputNumber;
    vm.deleteAAResource = deleteAAResource;

    vm.selectPlaceHolder = $translate.instant('autoAttendant.selectPlaceHolder');

    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    // needed for cs-select's model, aaBuilderNumbers.tpl.html
    vm.selected = {
      "label": "",
      "value": ""
    };

    /////////////////////

    // Add Number, top-level method called by UI
    function addNumber(formattedNumber) {

      var index = vm.availablePhoneNums.indexOf(formattedNumber);

      if (index >= 0) {

        // strip the formatting from the number

        vm.inputNumber.number = formattedNumber.replace(/\D/g, '');

        addAAResourceFromInputNumber();

        vm.availablePhoneNums.splice(index, 1);

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

    function addAAResourceFromInputNumber() {

      if (angular.isUndefined(vm.inputNumber) || vm.inputNumber.number === '') {
        return;
      }

      // the server POST schema specifies an id and number field but the number is actually not used; the id is used as the number
      // So just set them both to the number
      vm.inputNumber.id = vm.inputNumber.number;

      // add new resource for this number
      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setNumber(vm.inputNumber.number);
      resource.setId(vm.inputNumber.id);
      resource.setType(vm.inputNumber.type);
      resource.setTrigger(vm.inputNumber.trigger);

      var resources = vm.ui.ceInfo.getResources();
      resources.push(resource);

    }

    // Delete the number to the CE Info resource list - called by UI
    function deleteAAResource(unFormattedNumber) {
      var i = 0;

      if (angular.isUndefined(unFormattedNumber)) {
        return;
      }
      vm.availablePhoneNums.push(filter(unFormattedNumber));

      vm.availablePhoneNums.sort();

      var resources = vm.ui.ceInfo.getResources();
      for (i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === unFormattedNumber) {
          resources.splice(i, 1);
        }
      }

    }

    function filter(number) {
      if (!number) {
        return '';
      }

      var countryTelephoneNumberRegex = /(\+?\d{1})(\d{3})(\d{3})(\d{4})/;
      var basicTelephoneNumberRegex = /(\d{3})(\d{3})(\d{4})/;

      if (countryTelephoneNumberRegex.test(number)) {
        return number.replace(countryTelephoneNumberRegex, "$1 ($2) $3-$4");
      } else if (basicTelephoneNumberRegex.test(number)) {
        return number.replace(basicTelephoneNumberRegex, "($1) $2-$3");
      } else {
        return number;
      }
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
              number: extPool[i].pattern.replace(/\D/g, ''),
              type: '', //tbd
              trigger: '' //tbd
            };

            if (!getDupeNumberAnyAA(dn.number)) {
              vm.availablePhoneNums.push(filter(dn.number));
            }

          }
        });
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.ui = AAUiModelService.getUiModel();

      getExternalNumbers();

    }

    activate();

  }
})();
