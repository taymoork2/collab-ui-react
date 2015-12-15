// AANumberAssignmentService - use CMI AssignAutoAttendantService to set/get numbers for an AA

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .service('AANumberAssignmentService', AANumberAssignmentService);

  /* @ngInject */

  function AANumberAssignmentService($q, AssignAutoAttendantService, Authinfo, $http, ExternalNumberPoolService) {

    /* jshint validthis: true */

    var feature;
    var customerId = Authinfo.getOrgId();
    var service = {
      setAANumberAssignment: setAANumberAssignment,
      getAANumberAssignments: getAANumberAssignments,
      deleteAANumberAssignments: deleteAANumberAssignments,
      setAANumberAssignmentWithErrorDetail: setAANumberAssignmentWithErrorDetail,
      checkAANumberAssignments: checkAANumberAssignments,
      formatAAResourcesBasedOnList: formatAAResourcesBasedOnList,
      formatAAResourcesBasedOnCMI: formatAAResourcesBasedOnCMI,
      NUMBER_FORMAT_DIRECT_LINE: "NUMBER_FORMAT_DIRECT_LINE",
      NUMBER_FORMAT_EXTENSION: "NUMBER_FORMAT_EXTENSION",
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
            // check to see if it's in the CMI assigned list
            var rscObj = resources.filter(function (obj) {
              return obj.getNumber() == cmiAssignedNumbers[i].number.replace(/\D/g, '');
            });
            if (!angular.isDefined(rscObj) || rscObj == null || rscObj.length === 0) {
              onlyCMI.push(cmiAssignedNumbers[i].number);
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

    // Format AA resources based on a list of external numbers from CMI
    function formatAAResourcesBasedOnList(resources, externalNumberList) {
      var formattedResources = _.map(resources, function (res) {
        if (res.getType() === AANumberAssignmentService.EXTERNAL_NUMBER) {
          var fmtRes = angular.copy(res);
          var extNum = _.find(externalNumberList, function (n) {
            return n.number.replace(/\D/g, '') === res.number;
          });
          if (extNum) {
            fmtRes.number = extNum.number;
          }
          return fmtRes;
        } else {
          return res;
        }
      });

      return formattedResources;
    }

    // Format AA resources based on entries in CMI external number list
    function formatAAResourcesBasedOnCMI(resources) {

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

          return formatAAResourcesBasedOnList(resources, externalNumberList);
        });

    }

    // Set the numbers for an AA
    function setAANumberAssignment(customerId, cesId, resources) {
      var numObjList = [];

      for (var i = 0; i < resources.length; i++) {

        var numType = service.NUMBER_FORMAT_DIRECT_LINE;
        if (resources[i].getType() === service.DIRECTORY_NUMBER) {
          numType = service.NUMBER_FORMAT_EXTENSION;
        } else if (resources[i].getType() === service.EXTERNAL_NUMBER) {
          numType = service.NUMBER_FORMAT_DIRECT_LINE;
        }

        var numObj = {
          number: resources[i].getNumber(),
          type: numType
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

      // For an empty list, we're done, just return a successful promise
      if (resources.length === 0) {

        var deferred = $q.defer();
        deferred.resolve({
          workingResources: [],
          failedResources: []
        });
        return deferred.promise;

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
