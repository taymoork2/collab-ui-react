(function () {
  'use strict';

  angular.module('Core')
    .service('PersonalMeetingRoomManagementService', personalMeetingRoomManagementService);

  /* @ngInject */
  function personalMeetingRoomManagementService($http, $q, Authinfo, Config, UrlConfig) {
    var adminOrderControllerUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/provisionparameters';
    var service = {
      addPmrSiteUrl: addPmrSiteUrl
    };

    return service;

    function addPmrSiteUrl(url) {
      if (!url || url === '') {
        return $q.reject('A Site Url input value must be entered');
      }

      var siteUrl = url + Config.siteDomainUrl.webexUrl;
      var paramName = 'PMR';
      var payload = {
        productName: 'WX',
        List: [paramName, siteUrl]
      };

      return $http.post(adminOrderControllerUrl, payload);
    }
  }
})();
