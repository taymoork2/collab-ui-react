(function () {
  'use strict';

  /**
   * A factory to take care of editing call parks. It keeps a pristine
   * copy as the base to revert back when a cancel is fired from UI. The
   * pristine will be updated on every successful PUT operation.
   */

  angular
    .module('uc.hurondetails')
    .factory('CallParkEditDataService', CallParkEditDataService);

  /* @ngInject */

  function CallParkEditDataService(CallParkService, CallParkMemberDataService) {

    var pristineCPData = {};

    return {
      fetchCallPark: fetchCallPark,
      getPristine: getPristine,
      isMemberDirty: isMemberDirty,
      reset: reset,
      setPristine: setPristine
    };

    function setPristine(updatedCP) {
      pristineCPData = angular.copy(updatedCP);
    }

    function reset() {
      pristineCPData = {};
    }

    function fetchCallPark(customerId, cpId) {
      return CallParkService.getDetails(customerId, cpId).then(function (backendData) {
        pristineCPData = backendData;
        return getPristine();
      });
    }

    function getPristine() {
      return angular.copy(pristineCPData);
    }

    function isMemberDirty(userUuid) {
      var dirty = false;
      pristineCPData.members.some(function (m) {
        if (m.userUuid === userUuid) {
          dirty = CallParkMemberDataService.isMemberDirty(m);
        }
        return dirty;
      });
      return dirty;
    }
  }
})();
