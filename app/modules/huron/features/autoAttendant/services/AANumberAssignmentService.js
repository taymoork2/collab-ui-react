// AANumberAssignmentService - use CMI AssignAutoAttendantService to set/get numbers for an AA

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .service('AANumberAssignmentService', AANumberAssignmentService);

  /* @ngInject */

  function AANumberAssignmentService($q, AssignAutoAttendantService, Authinfo, $http, ExternalNumberPoolService) {

    var feature;
    var customerId = Authinfo.getOrgId();
    var service = {
      setAANumberAssignment: setAANumberAssignment,
      getAANumberAssignments: getAANumberAssignments,
      deleteAANumberAssignments: deleteAANumberAssignments,
      setAANumberAssignmentWithErrorDetail: setAANumberAssignmentWithErrorDetail,
      checkAANumberAssignments: checkAANumberAssignments,
      formatAAE164ResourcesBasedOnList: formatAAE164ResourcesBasedOnList,
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

      return AssignAutoAttendantService.query({
        customerId: customerId,
        cesId: cesId
      }).$promise.then(
        function (response) {
          // success
          return response[0].numbers;
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

              return obj.number.replace(/\D/g, '') == resources[i].getNumber();
            });
            if (!angular.isDefined(cmiObj) || cmiObj == null || cmiObj.length === 0) {
              onlyResources.push(resources[i].getNumber());
            }
          }
          // find CMI assigned numbers not in resources
          for (i = 0; i < cmiAssignedNumbers.length; i++) {
            if (cmiAssignedNumbers[i].type != service.NUMBER_FORMAT_ENTERPRISE_LINE) {
              // check to see if it's in the resource list
              var rscObj = resources.filter(function (obj) {
                return obj.getNumber() == cmiAssignedNumbers[i].number.replace(/\D/g, '');
              });
              if (!angular.isDefined(rscObj) || rscObj == null || rscObj.length === 0) {
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

    // Format AA E164 resources based on a list of external numbers from CMI
    function formatAAE164ResourcesBasedOnList(resources, externalNumberList) {
      var formattedResources = _.map(resources, function (res) {
        if (res.getType() === service.EXTERNAL_NUMBER) {
          var fmtRes = angular.copy(res);
          var extNum = _.find(externalNumberList, function (n) {
            if (angular.isDefined(res.number) && res.number != null && res.number.length > 0)
              return n.number.replace(/\D/g, '') === res.number.replace(/\D/g, '');
            else
              return n.number.replace(/\D/g, '') === res.id.replace(/\D/g, '');
          });
          if (extNum) {
            // For external numbers, save the id as E164 as in CMI so it's matched in call processsing
            // Save just the numbers in the phone number
            fmtRes.id = extNum.number;
            fmtRes.number = extNum.number.replace(/\D/g, '');
          } else {
            // We didn't find in CMI - shouldn't happen - but let's try to fixup any empty fields
            if (!angular.isDefined(fmtRes.number) || fmtRes.number === null || fmtRes.number.length <= 0) {
              fmtRes.number = fmtRes.id;
            }
            if (!angular.isDefined(fmtRes.id) || fmtRes.id === null || fmtRes.id.length <= 0) {
              fmtRes.id = fmtRes.number;
            }
          }
          return fmtRes;
        } else {
          return res;
        }
      });

      return formattedResources;
    }

    // Format AA E164 resources based on entries in CMI external number list
    function formatAAE164ResourcesBasedOnCMI(resources) {

      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          order: 'pattern'
        }).$promise
        .then(function (extPool) {

          var externalNumberList = [];

          for (var i = 0; i < extPool.length; i++) {

            var dn = {
              id: extPool[i].uuid,
              number: extPool[i].pattern
            };

            // the externalNumberList will contain the info as it came from CMI
            externalNumberList.push(dn);

          }

          return formatAAE164ResourcesBasedOnList(resources, externalNumberList);
        });

    }

    // Format AA extension resources based on entries in CMI assignment (when ESN #'s get derived)
    function formatAAExtensionResourcesBasedOnCMI(orgId, cesId, resources) {

      return getAANumberAssignments(orgId, cesId).then(function (cmiAssignedNumbers) {

        var i = 0;
        for (i = 0; i < resources.length; i++) {
          if (resources[i].getType() === service.DIRECTORY_NUMBER) {

            if (!angular.isDefined(resources[i].id) || resources[i].id === null || resources[i].id.length <= 0) {
              // find it in CMI assigned list
              var cmiObjESN = _.find(cmiAssignedNumbers, function (obj) {
                return obj.type == service.NUMBER_FORMAT_ENTERPRISE_LINE && obj.number.replace(/\D/g, '').endsWith(resources[i].getNumber());
              });
              if (angular.isDefined(cmiObjESN) && cmiObjESN) {
                resources[i].setId(cmiObjESN.number);
              } else {
                resources[i].setId(resources[i].getNumber());
              }
            }

            if (!angular.isDefined(resources[i].number) || resources[i].number === null || resources[i].number.length <= 0) {
              // find it in CMI assigned list
              var cmiObjExtension = _.find(cmiAssignedNumbers, function (obj) {
                return obj.type == service.NUMBER_FORMAT_EXTENSION && resources[i].getId().replace(/\D/g, '').endsWith(obj.number);
              });
              if (angular.isDefined(cmiObjExtension) && cmiObjExtension) {
                resources[i].setNumber(cmiObjExtension.number);
              } else {
                resources[i].setNumber(resources[i].getId());
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
          number = resources[i].getNumber();
        } else if (resources[i].getType() === service.EXTERNAL_NUMBER) {
          numType = service.NUMBER_FORMAT_DIRECT_LINE;
          number = resources[i].getId();
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
