(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService($http, Config, $q, HelpdeskMockData, CsdmConfigService, CsdmConverter) {
    var urlBase = Config.getAdminServiceUrl();

    function extractItems(res) {
      return res.data.items;
    }

    function extractData(res) {
      return res.data;
    }

    function searchUsers(searchString, orgId) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.users);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/users?phrase=' + searchString + '&limit=5' + (orgId ? '&orgId=' + orgId : ''))
        .then(extractItems);
    }

    function searchOrgs(searchString) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.orgs);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/organizations?phrase=' + searchString + '&limit=5')
        .then(extractItems);
    }

    function getUser(orgId, userId) {
      return $http
        .get(urlBase + 'helpdesk/organizations/' + orgId + '/users/' + userId)
        .then(extractData);
    }

    function getOrg(orgId) {
      return $http
        .get(urlBase + 'helpdesk/organizations/' + orgId)
        .then(extractData);
    }

    function searchCloudberryDevices(searchString, orgId) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(filterDevices(searchString, CsdmConverter.convertDevices(HelpdeskMockData.devices)));
        return deferred.promise;
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + orgId + '/devices?checkOnline=false')
        .then(function (res) {
          return filterDevices(searchString, CsdmConverter.convertDevices(res.data));
        });
    }

    function filterDevices(searchString, devices) {
      searchString = searchString.toLowerCase();
      var filteredDevices = [];
      _.each(devices, function (device) {
        if ((device.displayName || '').toLowerCase().indexOf(searchString) != -1 || (device.mac || '').toLowerCase().indexOf(searchString) != -1 || (device.serial || '').toLowerCase().indexOf(searchString) != -1) {
          if (_.size(filterDevices) < 5) {
            filteredDevices.push(device);
          } else {
            return false;
          }
        }
      });
      return filteredDevices;
    }

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser,
      getOrg: getOrg,
      searchCloudberryDevices: searchCloudberryDevices
    };

  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
