// AANumberAssignmentService - use CMI AssignAutoAttendantService to set/get numbers for an AA

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .service('AANumberAssignmentService', AANumberAssignmentService);

  /* @ngInject */

  function AANumberAssignmentService($q, AssignAutoAttendantService, Authinfo, TelephonyInfoService) {

    var feature;
    var customerId = Authinfo.getOrgId();
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
      EXTERNAL_NUMBER: "externalNumber"
    };

    return service;

    // Get the assigned numbers for an AA
    function getAANumberAssignments(customerId, cesId) {

      return AssignAutoAttendantService.get({
        customerId: customerId,
        cesId: cesId
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
          // _.difference() won't work here because CMI and resources list have different structs
          // let's just do it the straight-forward way...

          // find resources not in CMI
          var i = 0;
          for (i = 0; i < resources.length; i++) {
            // check to see if it's in the CMI assigned list
            var cmiObj = cmiAssignedNumbers.filter(function (obj) {

              return obj.number.replace(/\D/g, '') === resources[i].getNumber();
            });
            if (!angular.isDefined(cmiObj) || cmiObj === null || cmiObj.length === 0) {
              onlyResources.push(resources[i].getNumber());
            }
          }
          // find CMI assigned numbers not in resources
          for (i = 0; i < cmiAssignedNumbers.length; i++) {
            if (cmiAssignedNumbers[i].type != service.NUMBER_FORMAT_ENTERPRISE_LINE) {
              // check to see if it's in the resource list
              var rscObj = resources.filter(function (obj) {
                return obj.getNumber() === cmiAssignedNumbers[i].number.replace(/\D/g, '');
              });
              if (!angular.isDefined(rscObj) || rscObj === null || rscObj.length === 0) {
                onlyCMI.push(cmiAssignedNumbers[i].number);
              }
            }
          }
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
        var fmtRes = angular.copy(res);
        if (extNum instanceof Array) {
          var num = res.id ? res.id.replace(/\D/g, '') : res.number.replace(/\D/g, '');
          extNum = _.find(extNum, function (obj) {
            return obj.pattern.replace(/\D/g, '') === num;
          });

        }

        if (extNum) {
          // For external numbers, save the number in id so it's matched in call processsing
          // Save the E164 in number
          fmtRes.number = extNum.pattern;
          fmtRes.id = extNum.pattern.replace(/\D/g, '');
        } else {
          // We didn't find in CMI - shouldn't happen - but let's try to format fields
          // Note we are returning a copy (see above), not altering input parms, so this leaves CE structures alone
          // We should try to format as best as possible for CMI assignment
          fmtRes.number = phoneUtils.formatE164(fmtRes.id, phoneUtils.getRegionCodeForNumber(fmtRes.id));
          fmtRes.id = fmtRes.number.replace(/\D/g, '');
        }
        return fmtRes;
      } else {
        return res;
      }
    }

    // Format AA E164 resources based on entries in CMI external number list
    function formatAAE164ResourcesBasedOnCMI(resources) {

      var formattedResources = _.map(resources, function (res) {

        return TelephonyInfoService.loadExternalNumberPool(res.number.replace(/\D/g, '')).then(function (extNums) {
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

        var i = 0;
        for (i = 0; i < resources.length; i++) {
          if (resources[i].getType() === service.DIRECTORY_NUMBER) {

            // if we don't have an id, get it from CMI
            if (!resources[i].id) {
              // find it in CMI assigned list
              var cmiObjESN = _.find(cmiAssignedNumbers, function (obj) {
                return obj.type === service.NUMBER_FORMAT_ENTERPRISE_LINE && resources[i].getNumber() && endsWith(obj.number.replace(/\D/g, ''), resources[i].getNumber());
              });
              if (angular.isDefined(cmiObjESN) && cmiObjESN.number) {
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
              var cmiObjExtension = _.find(cmiAssignedNumbers, function (obj) {
                return obj.type === service.NUMBER_FORMAT_EXTENSION && resources[i].getId() && endsWith(resources[i].getId().replace(/\D/g, ''), obj.number);
              });
              if (angular.isDefined(cmiObjExtension) && cmiObjExtension.number) {
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
          "type": numType
        };

        numObjList.push(numObj);

      }

      var data = {
        numbers: numObjList
      };

      return AssignAutoAttendantService.update({
        customerId: customerId,
        cesId: cesId
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

        return setAANumberAssignment(customerId, cesId, resources).then(function (result) {
            return {
              workingResources: [],
              failedResources: []
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
        var myResourceList = angular.copy(resources);
        // Take one off
        var myResource = myResourceList.pop();

        // Recursively save the rest of the list...
        return setAANumberAssignmentWithErrorDetail(customerId, cesId, myResourceList).then(
          function (restOfListResponse) {
            // and when it's done, try to save with the element we popped, but without the failed ones
            myResourceList = angular.copy(restOfListResponse.workingResources);
            myResourceList.push(myResource);
            return setAANumberAssignment(customerId, cesId, myResourceList).then(
              function (response) {
                // successfully saved with the added one, add to working
                restOfListResponse.workingResources.push(myResource);
                return restOfListResponse;
              },
              function (response) {
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
        cesId: cesId
      }).$promise;

    }

  }

})();
