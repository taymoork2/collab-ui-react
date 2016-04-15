(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderNumbersCtrl', AABuilderNumbersCtrl); /* was AutoAttendantGeneralCtrl */

  /* @ngInject */
  function AABuilderNumbersCtrl(AAUiModelService, AutoAttendantCeInfoModelService, AANumberAssignmentService,
    AAModelService, AACommonService, Authinfo, Notification, $translate, telephoneNumberFilter, TelephoneNumberService, TelephonyInfoService) {
    var vm = this;

    vm.addNumber = addNumber;
    vm.loadNums = loadNums;
    vm.removeNumber = removeNumber;
    vm.addAAResource = addAAResource;
    vm.deleteAAResource = deleteAAResource;
    vm.getExternalNumbers = getExternalNumbers;
    vm.getInternalNumbers = getInternalNumbers;
    vm.getDupeNumberAnyAA = getDupeNumberAnyAA;
    vm.addToAvailableNumberList = addToAvailableNumberList;
    vm.compareNumbersExternalThenInternal = compareNumbersExternalThenInternal;
    vm.warnOnAssignedNumberDiscrepancies = warnOnAssignedNumberDiscrepancies;

    // a mapping of numbers to their type (internal or external)
    vm.numberTypeList = {};

    // a list of external numbers as they came from CMI
    vm.externalNumberList = [];

    // available number list offered in GUI
    vm.availablePhoneNums = [];

    vm.selectPlaceHolder = $translate.instant('autoAttendant.selectNumberPlaceHolder');

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
        return compareNumbersExternalThenInternal(a.value, b.value);
      });
      deleteAAResource(number);

      // clear selection
      vm.selected = {
        "label": "",
        "value": ""
      };

    }

    // Save the AA Number Assignments in CMI
    function saveAANumberAssignments(customerId, aaRecordUUID, resources) {

      // CMI seems to correctly remove numbers from the number pool when the number is formatted as it came from CMI
      // So save to CMI with the original CMI format for external numbers
      return AANumberAssignmentService.formatAAE164ResourcesBasedOnCMI(resources).then(function (formattedResources) {

        return AANumberAssignmentService.setAANumberAssignment(customerId, aaRecordUUID, formattedResources);

      });
    }

    // Add the number to the CE Info resource list
    function addAAResource(number) {

      var resource = AutoAttendantCeInfoModelService.newResource();
      // both internal and external triggers are incomingCall
      resource.setTrigger('incomingCall');

      // set the type
      if (vm.numberTypeList[number]) {
        resource.setType(vm.numberTypeList[number]);
      } else {
        if (TelephoneNumberService.validateDID(number)) {
          resource.setType(AANumberAssignmentService.EXTERNAL_NUMBER);
        } else {
          resource.setType(AANumberAssignmentService.DIRECTORY_NUMBER);
        }
      }

      // the number field contains the phone number as known to the human
      resource.setNumber(number);
      // for external numbers, we just store the number as the routable id, extension id's are formatted later based on CMI
      if (resource.getType() === AANumberAssignmentService.EXTERNAL_NUMBER)
        resource.setId(number);

      // add to the resource list
      var resources;

      resources = vm.ui.ceInfo.getResources();

      resources.push(resource);

      // Assign the number in CMI
      // TODO: Remove the force
      //saveAANumberAssignments(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, resources).then(
      saveAANumberAssignments(Authinfo.getOrgId(), "1", resources).then(
        function (response) {

          // after assignment, the extension ESN numbers are derived; update CE based on CMI ESN info
          AANumberAssignmentService.formatAAExtensionResourcesBasedOnCMI(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, resources).then(function (resources) {

              // find first e164 number, move to array[0] if not already there
              var r = _.find(resources, function (resource) {
                return (TelephoneNumberService.validateDID(resource.number));
              });

              if (angular.isDefined(r)) {
                var index = _.indexOf(resources, r);

                // if e164 number is already the 0th element, all done

                if (index >= 1) {
                  resources.splice(0, 0, _.pullAt(resources, index)[0]);
                }
              }

              sortAssignedResources(resources);
              AACommonService.setCENumberStatus(true);

            },
            function (response) {
              Notification.error('autoAttendant.errorAddCMI', {
                phoneNumber: number,
                statusText: response.statusText,
                status: response.status,
                trackingId: response.config.headers.TrackingID
              });

              resources.pop();

            });

        },
        function (response) {
          Notification.error('autoAttendant.errorAddCMI', {
            phoneNumber: number,
            statusText: response.statusText,
            status: response.status,
            trackingId: response.config.headers.TrackingID
          });

          resources.pop();

        });

    }

    // Delete the number to the CE Info resource list
    function deleteAAResource(number) {
      var i = 0;

      // remove number from resources list
      var resources = vm.ui.ceInfo.getResources();
      for (i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === number) {
          resources.splice(i, 1);
        }
      }

      // Un-Assign the number in CMI by setting with resource removed
      saveAANumberAssignments(Authinfo.getOrgId(),
        vm.aaModel.aaRecordUUID, resources).then(function () {
        AACommonService.setCENumberStatus(true);
      }).catch(
        function (response) {
          /* Use AACommonService to thwart the saving when it is in this state. */
          AACommonService.setIsValid('errorRemoveCMI', false);
          Notification.error('autoAttendant.errorRemoveCMI');
        });

    }

    function getDupeNumberAnyAA(testNum) {

      var isNumberInUseOtherAA = vm.aaModel.aaRecords.some(function (record) {
        return record.assignedResources.some(function (resource) {
          return resource.number === testNum;
        });
      });
      return isNumberInUseOtherAA;

    }

    function sortAssignedResources(resources) {

      // We don't change the top-line "preferred" number in the header
      // Further the first number after that would be "sorted", since it can't swap with the "preferred" number
      // so if it's longer than 2, we sort it
      if (resources.length > 2) {

        // but we don't change the first top-line number, which is also shown in the header, so
        // get a temp list without that first number
        var tmp = _.rest(resources);

        // and sort it
        tmp.sort(function (a, b) {
          return compareNumbersExternalThenInternal(a.number, b.number);
        });

        // we have a sorted list, take out the old unsorted ones, put in the sorted ones
        resources.splice(1, resources.length - 1);
        _.forEach(tmp, function (n) {
          resources.push(n);
        });
      }
    }

    // A comparison method used in sorting to make external numbers first, internal numbers last
    function compareNumbersExternalThenInternal(a, b) {

      // if they are of the same type, ie both external or internal, just compare directly
      if (vm.numberTypeList[a] === vm.numberTypeList[b]) {
        return a.localeCompare(b);
      }
      // else if a is an internal extension, it comes after
      else if (vm.numberTypeList[a] === AANumberAssignmentService.DIRECTORY_NUMBER) {
        return 1;
        // else a must be an externalNumber, which comes first
      } else {
        return -1;
      }

    }

    function addToAvailableNumberList(label, number) {
      var opt = {
        label: label,
        value: number
      };
      vm.availablePhoneNums.push(opt);
    }

    function loadNums(pattern) {

      vm.availablePhoneNums = [];

      getExternalNumbers(pattern).finally(function () {
        getInternalNumbers(pattern);
      });

      /* make sure the mapping exists for already existing resource numbers, so it sorts correctly */

      if (_.has(vm, 'ui.ceInfo.resources')) {
        _.forEach(vm.ui.ceInfo.resources, function (r) {
          if (TelephoneNumberService.validateDID(r.number)) {
            vm.numberTypeList[r.number] = AANumberAssignmentService.EXTERNAL_NUMBER;
          } else {
            vm.numberTypeList[r.number] = AANumberAssignmentService.DIRECTORY_NUMBER;
          }
        });
      }
    }

    function getInternalNumbers(pattern) {

      return TelephonyInfoService.loadInternalNumberPool(pattern).then(function (intPool) {
        for (var i = 0; i < intPool.length; i++) {

          var number = intPool[i].pattern.replace(/\D/g, '');

          vm.numberTypeList[number] = AANumberAssignmentService.DIRECTORY_NUMBER;

          // Add to the available phone number list if not already used
          if (!getDupeNumberAnyAA(number)) {
            // Internal extensions don't need formatting
            addToAvailableNumberList(number, number);

          }
        }
      });
    }

    function getExternalNumbers(pattern) {

      vm.externalNumberList = [];

      return TelephonyInfoService.loadExternalNumberPool(pattern).then(function (extPool) {
        for (var i = 0; i < extPool.length; i++) {

          if (extPool[i].uuid.toUpperCase() === "NONE")
            continue;

          var dn = {
            id: extPool[i].uuid,
            number: extPool[i].pattern
          };

          // the externalNumberList will contain the info as it came from CMI
          vm.externalNumberList.push(dn);

          var number = extPool[i].pattern.replace(/\D/g, '');

          vm.numberTypeList[number] = AANumberAssignmentService.EXTERNAL_NUMBER;

          // Add to the available phone number list if not already used
          if (!getDupeNumberAnyAA(number)) {
            // For the option list, format the number for the label,
            // and return the value as just the number
            addToAvailableNumberList(telephoneNumberFilter(number), number);

          }

        }
      });
    }

    // Warn the user when discrepancies are found between CMI and CES number assignment
    function warnOnAssignedNumberDiscrepancies() {
      var onlyResources = [];
      var onlyCMI = [];

      // if we don't have a record (as in new) then there's nothing to check
      if (!vm.aaModel.aaRecordUUID)
        return;

      var currentResources = [];
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.resources)) {
        currentResources = vm.ui.ceInfo.getResources();
      }

      AANumberAssignmentService.checkAANumberAssignments(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, currentResources, onlyResources, onlyCMI).then(
        function (response) {
          if (onlyCMI.length > 0) {
            vm.aaModel.possibleNumberDiscrepancy = true;
            Notification.error('autoAttendant.errorNumbersCMIOnly', {
              phoneNumbers: onlyCMI
            });
          }
          if (onlyResources.length > 0) {
            vm.aaModel.possibleNumberDiscrepancy = true;
            Notification.error('autoAttendant.errorNumbersCESOnly', {
              phoneNumbers: onlyResources
            });
          }
        },
        function (response) {
          if (currentResources.length > 0) {

            // Use AACommonService to thwart the saving when it is in this state
            AACommonService.setIsValid('readErrorCMI', false);

            Notification.error('autoAttendant.errorReadCMI');
          }
        });
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.ui = AAUiModelService.getUiModel();

      vm.aaModel.possibleNumberDiscrepancy = false;
      warnOnAssignedNumberDiscrepancies();

    }

    activate();

  }
})();
