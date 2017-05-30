// AANumberAssignmentService - use CMI AssignAutoAttendantService to set/get numbers for an AA

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .service('AANumberAssignmentService', AANumberAssignmentService);

  /* @ngInject */

  function AANumberAssignmentService($q, AssignAutoAttendantService, TelephonyInfoService,
    ExternalNumberPool, PhoneNumberService) {

    var service = {
      setAANumberAssignment: setAANumberAssignment,
      getAANumberAssignments: getAANumberAssignments,
      deleteAANumberAssignments: deleteAANumberAssignments,
      setAANumberAssignmentWithErrorDetail: setAANumberAssignmentWithErrorDetail,
      checkAANumberAssignments: checkAANumberAssignments,
      formatAAE164ResourcesBasedOnCMI: formatAAE164ResourcesBasedOnCMI,
      formatAAExtensionResourcesBasedOnCMI: formatAAExtensionResourcesBasedOnCMI,
      NUMBER_FORMAT_DIRECT_LINE: "NUMBER_FORMAT_DIRECT_LINE",
      NUMBER_FORMAT_EXTENSION: "NUMBER_FORMAT_EXTENSION",
      NUMBER_FORMAT_ENTERPRISE_LINE: "NUMBER_FORMAT_ENTERPRISE_LINE",
      DIRECTORY_NUMBER: "directoryNumber",
      EXTERNAL_NUMBER: "externalNumber",
    };

    var numberFormatMapping = [];
    numberFormatMapping[service.NUMBER_FORMAT_DIRECT_LINE] = service.EXTERNAL_NUMBER;
    numberFormatMapping[service.NUMBER_FORMAT_ENTERPRISE_LINE] = 'Not Used now';
    numberFormatMapping[service.NUMBER_FORMAT_EXTENSION] = service.DIRECTORY_NUMBER;

    return service;

    // Get the assigned numbers for an AA
    function getAANumberAssignments(customerId, cesId) {

      return AssignAutoAttendantService.get({
        customerId: customerId,
        cesId: cesId,
      }).$promise.then(
        function (response) {
          // success
          return response.numbers;
        },
        function (response) {
          // failure
          return $q.reject(response);
        }
      );

    }

    // Check the consistency of assigned numbers for an AA against the passed-in resources
    function checkAANumberAssignments(customerId, cesId, resources, onlyResources, onlyCMI) {

      return getAANumberAssignments(customerId, cesId).then(
        function (cmiAssignedNumbers) {

          // success
          // find differences between lists

          // we only want to scan for external and extension numbers (NUMBER_FORMAT_DIRECT_LINE and NUMBER_FORMAT_EXTENSION) only

          var CMInums = _.map(_.reject(cmiAssignedNumbers, { 'type': service.NUMBER_FORMAT_ENTERPRISE_LINE }), function (n) {
            return _.replace(n.number, '+', '');
          });

          var numbersResources = _.map(resources, function (n) {
            return _.replace(n.number, '+', '');
          });

          /* cannot use onlyCMi and onlyResource directly as it overwrites the reference. */
          var onlyThisResources = _.difference(numbersResources, CMInums);
          var onlyThisCMI = _.difference(CMInums, numbersResources);

          _.forEach(onlyThisCMI, function (num) {
            onlyCMI.push(num);
          });

          _.forEach(onlyThisResources, function (num) {
            onlyResources.push(num);
          });

          return cmiAssignedNumbers;
        },
        function (response) {
          // failure - we can't make any checks since we couldn't get CMI numbers - so just fail
          return $q.reject(response);
        }
      );

    }

    function formatAAE164Resource(res, extNum) {
      if (res.getType() === service.EXTERNAL_NUMBER) {
        var fmtRes = _.cloneDeep(res);
        if (extNum instanceof Array) {
          var num = res.id ? _.replace(res.id, /\D/g, '') : _.replace(res.number, /\D/g, '');
          extNum = _.find(extNum, function (obj) {
            return _.replace(obj.pattern, /\D/g, '') === num;
          });

        }

        if (extNum) {
          // For external numbers, save the number in id so it's matched in call processsing
          // Save the E164 in number
          fmtRes.number = extNum.pattern;
          fmtRes.id = _.replace(extNum.pattern, /\D/g, '');
        } else {
          // We didn't find in CMI - shouldn't happen - but let's try to format fields
          // Note we are returning a copy (see above), not altering input parms, so this leaves CE structures alone
          // We should try to format as best as possible for CMI assignment
          fmtRes.number = PhoneNumberService.getE164Format(fmtRes.id);
          fmtRes.id = _.replace(fmtRes.number, /\D/g, '');
        }
        return fmtRes;
      } else {
        return res;
      }
    }

    // Format AA E164 resources based on entries in CMI external number list
    function formatAAE164ResourcesBasedOnCMI(resources) {

      var formattedResources = _.map(resources, function (res) {

        return TelephonyInfoService.loadExternalNumberPool(
          _.get(res, 'number', '').replace(/\D/g, ''),
          ExternalNumberPool.ALL_EXTERNAL_NUMBER_TYPES
        ).then(function (extNums) {
          return formatAAE164Resource(res, extNums);
        });

      });

      return $q.all(formattedResources).then(function (value) {
        return value;
      },
        function (response) {
          // if any promise fails, we want to fail (with the details) so further promises don't execute (save fails)
          return $q.reject(response);
        });

    }

    // endsWith works on the browsers (ECMA6), but not phantomjs, so here is an implemenation
    function endsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    // Format AA extension resources based on entries in CMI assignment (when ESN #'s get derived)
    function formatAAExtensionResourcesBasedOnCMI(orgId, cesId, resources) {

      return getAANumberAssignments(orgId, cesId).then(function (cmiAssignedNumbers) {

        var inCMIAssignedList = function (obj) {
          return obj.type === service.NUMBER_FORMAT_ENTERPRISE_LINE && resources[i].getNumber() && endsWith(_.replace(obj.number, /\D/g, ''), resources[i].getNumber());
        };
        var inExtension = function (obj) {
          return obj.type === service.NUMBER_FORMAT_EXTENSION && resources[i].getId() && endsWith(_.replace(resources[i].getId(), /\D/g, ''), obj.number);
        };
        var i = 0;
        for (i = 0; i < resources.length; i++) {
          if (resources[i].getType() === service.DIRECTORY_NUMBER) {

            // if we don't have an id, get it from CMI
            if (!resources[i].id) {
              // find it in CMI assigned list
              var cmiObjESN = _.find(cmiAssignedNumbers, inCMIAssignedList);
              if (!_.isUndefined(cmiObjESN) && cmiObjESN.number) {
                resources[i].setId(cmiObjESN.number);
              } else {
                if (resources[i].getNumber()) {
                  // if we can't do it from CMI, copy the number
                  resources[i].setId(resources[i].getNumber());
                }
              }
            }

            // if we don't have a number, get it from CMI
            if (!resources[i].number) {
              // find it in CMI assigned list
              var cmiObjExtension = _.find(cmiAssignedNumbers, inExtension);
              if (!_.isUndefined(cmiObjExtension) && cmiObjExtension.number) {
                resources[i].setNumber(cmiObjExtension.number);
              } else {
                // if we can't do it from CMI, copy the id
                if (resources[i].getId()) {
                  resources[i].setNumber(resources[i].getId());
                }
              }

            }
          }

        }
        function isOurNumber(cmiNumber, resource) {
          // if numbers match and the types match
          return _.trimStart(cmiNumber.number, '+') === _.trimStart(resource.getNumber(), '+') &&
            _.isEqual(numberFormatMapping[cmiNumber.type], resource.type);
        }

        /* called from aaNumbersCtrl.js when new number is selected from list.
         * we can take advantage of this query instead of re-querying to obtain
         * the UUID from CMI
         */
        _.find(resources, function (resource) {

          var cmiNumber = _.find(cmiAssignedNumbers, function (cmiNumber) {
            return isOurNumber(cmiNumber, resource);
          });

          if (cmiNumber) {
            resource.setUUID(cmiNumber.uuid);
            resource.setNumber(cmiNumber.number);
          }
        });

        return resources;

      });

    }

    // Set the numbers for an AA
    function setAANumberAssignment(customerId, cesId, resources) {
      var numObjList = [];

      for (var i = 0; i < resources.length; i++) {

        var numType = service.NUMBER_FORMAT_DIRECT_LINE;
        var number = resources[i].getNumber();
        if (resources[i].getType() === service.DIRECTORY_NUMBER) {
          numType = service.NUMBER_FORMAT_EXTENSION;
        } else if (resources[i].getType() === service.EXTERNAL_NUMBER) {
          numType = service.NUMBER_FORMAT_DIRECT_LINE;
        }

        var numObj = {
          "number": number,
          "type": numType,
        };

        numObjList.push(numObj);

      }

      var data = {
        numbers: numObjList,
      };

      return AssignAutoAttendantService.update({
        customerId: customerId,
        cesId: cesId,
      }, data).$promise.then(
        function (response) {
          // success
          return response;
        },
        function (response) {
          // failure
          return $q.reject(response);
        }
      );

    }

    // Set the numbers for an AA and return a list of the working and failed resources
    // Note this method does multiple saves to determine good and bad numbers
    // This also means it resolves promises sequentially and will take a little more time
    function setAANumberAssignmentWithErrorDetail(customerId, cesId, resources) {

      // For an empty list, we're done, just ensure CMI has no numbers set
      if (resources.length === 0) {

        return setAANumberAssignment(customerId, cesId, resources).then(function () {
          return {
            workingResources: [],
            failedResources: [],
          };
        },
          function (response) {
            // failure
            return $q.reject(response);
          }

        );

      } else {

        // With one element removed, we're going to first recursively save the rest of the list
        // and then try to save those saved numbers, minus the failing ones, with our single additional element
        // if it saves successfully, we are done, as all good numbers plus our saved.
        // if it fails, we are done, because we can't save with our one additional number, and already
        //   saved the successful ones recursively.

        // get a copy of the list...
        var myResourceList = _.cloneDeep(resources);
        // Take one off
        var myResource = myResourceList.pop();

        // Recursively save the rest of the list...
        return setAANumberAssignmentWithErrorDetail(customerId, cesId, myResourceList).then(
          function (restOfListResponse) {
            // and when it's done, try to save with the element we popped, but without the failed ones
            myResourceList = _.cloneDeep(restOfListResponse.workingResources);
            myResourceList.push(myResource);
            return setAANumberAssignment(customerId, cesId, myResourceList).then(
              function () {
                // successfully saved with the added one, add to working
                restOfListResponse.workingResources.push(myResource);
                return restOfListResponse;
              },
              function () {
                // failed to save with the added one, add to failed
                restOfListResponse.failedResources.push(myResource);
                return restOfListResponse;
              });

          });
      }
    }

    // Delete the assigned numbers for an AA
    function deleteAANumberAssignments(customerId, cesId) {

      return AssignAutoAttendantService.delete({
        customerId: customerId,
        cesId: cesId,
      }).$promise;

    }

  }

})();
