(function () {
  'use strict';

  /**
   * A factory to take care of editing hunt groups. It keeps a pristine
   * copy as the base to revert back when a cancel is fired from UI. The
   * pristine will be updated on every successful PUT operation.
   */

  angular
    .module('uc.hurondetails')
    .factory('HuntGroupEditDataService', HuntGroupEditDataService);

  /* @ngInject */

  function HuntGroupEditDataService(HuntGroupService, HuntGroupMemberDataService,
    TelephoneNumberService, HuntGroupFallbackDataService,
    Notification, $q) {

    var pristineHGData = {};

    return {
      fetchHuntGroup: fetchHuntGroup,
      getPristine: getPristine,
      isFallbackDirty: isFallbackDirty,
      checkMemberDirtiness: checkMemberDirtiness,
      reset: reset
    };

    ////////////////

    function reset() {
      pristineHGData = {};
    }

    function fetchHuntGroup(customerId, hgId) {
      return HuntGroupService.getDetails(customerId, hgId).then(function (backendData) {
        pristineHGData = angular.copy(backendData);
        return backendData;
      });
    }

    function getPristine() {
      return angular.copy(pristineHGData);
    }

    function isFallbackDirty() {
      return HuntGroupFallbackDataService.isFallbackDirty(
        pristineHGData.fallbackDestination);
    }

    function checkMemberDirtiness(userUuid) {
      var dirty = false;
      pristineHGData.members.some(function (m) {
        if (m.userUuid === userUuid) {
          dirty = HuntGroupMemberDataService.checkMemberDirtiness(m);
        }
        return dirty;
      });
      return dirty;
    }
  }
})();
