(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .service('AANumberAssignmentService', AANumberAssignmentService);

  /* @ngInject */

  function AANumberAssignmentService($q, AssignAutoAttendantService, Authinfo, $http) {

    /* jshint validthis: true */

    var feature;
    var customerId = Authinfo.getOrgId();
    var service = {
      setAANumberAssignment: setAANumberAssignment,
      getListOfAANumberAssignments: getListOfAANumberAssignments,
      deleteAANumberAssignments: deleteAANumberAssignments
    };

    return service;

    function getListOfAANumberAssignments(customerId, cesId) {

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
          return response;
        }
      );

    }

    function setAANumberAssignment(customerId, cesId, resources) {
      var numObjList = [];

      for (var i = 0; i < resources.length; i++) {

        var numType = "NUMBER_FORMAT_DIRECT_LINE";
        if (resources[i].getType() === "directoryNumber") {
          numType = "NUMBER_FORMAT_EXTENSION";
        } else if (resources[i].getType() === "externalNumber") {
          numType = "NUMBER_FORMAT_DIRECT_LINE";
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

    function deleteAANumberAssignments(customerId, cesId) {

      return AssignAutoAttendantService.delete({
        customerId: customerId,
        cesId: cesId
      }).$promise;

    }

  }

})();
