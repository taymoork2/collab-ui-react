(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService(ServiceDescriptor, $location, $http, Config, $q, HelpdeskMockData, CsdmConfigService, CsdmConverter) {
    var urlBase = Config.getAdminServiceUrl(); //"http://localhost:8080/admin/api/v1/"

    function extractItems(res) {
      return res.data.items;
    }

    function extractData(res) {
      return res.data;
    }

    function useMock() {
      return $location.absUrl().match(/helpdesk-backend=mock/);
    }

    function searchUsers(searchString, orgId) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.users);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/users?phrase=' + searchString + '&limit=5' + (orgId ? '&orgId=' + orgId : ''))
        .then(extractItems);
    }

    function searchOrgs(searchString) {
      if (useMock()) {
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
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.org);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/organizations/' + orgId)
        .then(extractData);
    }

    function filterHybridServices(entitlements) {
      // Use existing methods, such as in filter in service-descriptor, instead ???
      var services = [];
      if (_.includes(entitlements, "squared-fusion-mgmt")) {
        services = _.filter(entitlements, function (service) {
          return service === 'squared-fusion-cal' || service === 'squared-fusion-uc';
        });
      }
      return services;
    }

    function getHybridServices(orgId) {
      // Use existing methods, such as in service-descriptor, instead ???
      var deferred = $q.defer();
      if (useMock()) {
        deferred.resolve(filterHybridServices(HelpdeskMockData.org.entitlements));
        return deferred.promise;
      }
      ServiceDescriptor.servicesInOrg(orgId).then(function (services) {
        deferred.resolve(filterHybridServices(services));
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function searchCloudberryDevices(searchString, orgId) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(filterDevices(searchString, CsdmConverter.convertDevices(HelpdeskMockData.devices)));
        return deferred.promise;
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + orgId + '/devices?checkOnline=false&isHelpDesk=true')
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
      searchCloudberryDevices: searchCloudberryDevices,
      getHybridServices: getHybridServices
    };

  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
