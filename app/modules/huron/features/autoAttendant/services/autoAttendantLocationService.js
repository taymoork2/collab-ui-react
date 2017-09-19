(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantLocationService', AutoAttendantLocationService);

  /* @ngInject */
  function AutoAttendantLocationService(AALocationsService, AALocationService, Authinfo) {
    var authInfoOrgId = Authinfo.getOrgId();

    var service = {
      listLocations: listLocations,
      getDefaultLocation: getDefaultLocation,
    };

    return service;

    /////////////////////

    function listLocations() {
      return AALocationsService.get({
        customerId: authInfoOrgId,
      }).$promise;
    }

    function getDefaultLocation() {
      return listLocations().then(
        function (response) {
          // get the default location uuid
          var defaultLoc = _.find(response.locations, { defaultLocation: true });

          return AALocationService.get({
            customerId: authInfoOrgId,
            locId: _.get(defaultLoc, 'uuid', ''),
          }).$promise;
        });
    }
  }
})();
