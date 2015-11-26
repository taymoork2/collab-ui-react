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
        .get(urlBase + 'helpdesk/search/users?phrase=' + encodeURIComponent(searchString) + '&limit=5' + (orgId ? '&orgId=' + encodeURIComponent(orgId) : ''))
        .then(extractItems);
    }

    function searchOrgs(searchString) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.orgs);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/organizations?phrase=' + encodeURIComponent(searchString) + '&limit=5')
        .then(extractItems);
    }

    function getUser(orgId, userId) {
      return $http
        .get(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/users/' + encodeURIComponent(userId))
        .then(extractUserAndSetUserStatuses);
    }

    function getOrg(orgId) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.org);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId))
        .then(extractData);
    }

    function getHybridServices(orgId) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(ServiceDescriptor.filterAllRelevantToExpressway(HelpdeskMockData.org.services));
        return deferred.promise;
      }
      return ServiceDescriptor.servicesInOrg(orgId, true).then(filterRelevantServices);
    }

    var filterRelevantServices = function (services) {
      return _.filter(services, function (service) {
        return service.id === 'squared-fusion-cal' || service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec' || service.id === 'squared-fusion-mgmt';
      });
    };

    function searchCloudberryDevices(searchString, orgId) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(filterDevices(searchString, CsdmConverter.convertDevices(HelpdeskMockData.devices)));
        return deferred.promise;
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + encodeURIComponent(orgId) + '/devices?checkOnline=false&isHelpDesk=true')
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

    function extractUserAndSetUserStatuses(res) {
      var user = res.data;
      if (!user.accountStatus) {
        user.statuses = [];
        if (user.active) {
          user.statuses.push('helpdesk.userStatuses.active');
        } else {
          user.statuses.push('helpdesk.userStatuses.inactive');
        }
      } else {
        user.statuses = _.map(user.accountStatus, function (status) {
          return 'helpdesk.userStatuses.' + status;
        });
      }
      return user;
    }

    function resendInviteEmail(displayName, email) {
      return $http
        .post(urlBase + 'helpdesk/actions/resendinvitation/invoke', {
          inviteList: [{
            displayName: displayName,
            email: email
          }]
        })
        .then(extractData);
    }

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser,
      getOrg: getOrg,
      searchCloudberryDevices: searchCloudberryDevices,
      getHybridServices: getHybridServices,
      resendInviteEmail: resendInviteEmail
    };

  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
