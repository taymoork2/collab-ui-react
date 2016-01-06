(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService(ServiceDescriptor, $location, $http, Config, $q, HelpdeskMockData, CsdmConfigService, CsdmConverter, CacheFactory,
    $translate, $timeout, USSService2, DeviceService) {
    var urlBase = Config.getAdminServiceUrl(); //"http://localhost:8080/admin/api/v1/"
    var orgCache = CacheFactory.get('helpdeskOrgCache');
    var searchTimeout = 30000;
    if (!orgCache) {
      orgCache = new CacheFactory('helpdeskOrgCache', {
        maxAge: 120 * 1000,
        deleteOnExpire: 'aggressive'
      });
    }
    var orgDisplayNameCache = CacheFactory.get('helpdeskOrgDisplayNameCache');
    if (!orgDisplayNameCache) {
      orgDisplayNameCache = new CacheFactory('helpdeskOrgDisplayNameCache', {
        maxAge: 10 * 60 * 1000,
        deleteOnExpire: 'aggressive'
      });
    }
    var devicesInOrgCache = CacheFactory.get('helpdeskDevicesInOrgCache');
    if (!devicesInOrgCache) {
      devicesInOrgCache = new CacheFactory('helpdeskDevicesInOrgCache', {
        maxAge: 180 * 1000,
        deleteOnExpire: 'aggressive'
      });
    }

    //TODO: Useragent detection a probably not a reliable way to detect mobile device...
    var isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
      },
      all: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
    };

    function checkIfMobile() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }

    function extractItems(res) {
      return res.data.items;
    }

    function extractData(res) {
      return res.data;
    }

    function extractDevice(res) {
      return CsdmConverter.convertDevice(res.data);
    }

    function extractOrg(res) {
      var org = res.data;
      orgCache.put(org.id, org);
      orgDisplayNameCache.put(org.id, org.displayName);
      return org;
    }

    function extractUsers(res) {
      var users = res.data.items;
      _.each(users, function (user) {
        user.displayName = getCorrectedDisplayName(user);
        if (user.organization) {
          user.isConsumerUser = user.organization.id === Config.consumerOrgId;
        }
      });
      return users;
    }

    function getCorrectedDisplayName(user) {
      var displayName = '';
      if (user.name != null) {
        displayName = user.name.givenName ? user.name.givenName : '';
        displayName += user.name.familyName ? ' ' + user.name.familyName : '';
      }
      if (!displayName) {
        return user.displayName;
      }
      return displayName;
    }

    function useMock() {
      return $location.absUrl().match(/helpdesk-backend=mock/);
    }

    function searchUsers(searchString, orgId, limit, role, includeUnlicensed) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.users);
      }
      var deferred = $q.defer();
      var config = {
        timeout: deferred.promise
      };
      $timeout(function () {
        deferred.resolve();
      }, searchTimeout);

      return $http
        .get(urlBase + 'helpdesk/search/users?phrase=' + encodeURIComponent(searchString) + '&limit=' + limit + (orgId ? '&orgId=' +
            encodeURIComponent(orgId) : (includeUnlicensed ? '&includeUnlicensed=true' : '')) + (role ? '&role=' + encodeURIComponent(role) : ''),
          config)
        .then(extractUsers);
    }

    function searchOrgs(searchString, limit) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.orgs);
      }
      return $http
        .get(urlBase + 'helpdesk/search/organizations?phrase=' + encodeURIComponent(searchString) + '&limit=' + limit)
        .then(extractItems);
    }

    function getUser(orgId, userId) {
      if (useMock()) {
        return deferredResolve(extractAndMassageUser(HelpdeskMockData.user));
      }
      return $http
        .get(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/users/' + encodeURIComponent(userId))
        .then(extractAndMassageUser);
    }

    function getOrg(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.org);
      }
      var cachedOrg = orgCache.get(orgId);
      if (cachedOrg) {
        return deferredResolve(cachedOrg);
      }
      return $http
        .get(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId))
        .then(extractOrg);
    }

    function getOrgDisplayName(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.org.displayName);
      }
      var cachedDisplayName = orgDisplayNameCache.get(orgId);
      if (cachedDisplayName) {
        return deferredResolve(cachedDisplayName);
      }
      // Use the search function as it returns a lot less data
      return searchOrgs(orgId, 1).then(function (result) {
        if (result.length > 0) {
          var org = result[0];
          orgDisplayNameCache.put(org.id, org.displayName);
          return org.displayName;
        }
        return '';
      });
    }

    function getHybridServices(orgId) {
      if (useMock()) {
        return deferredResolve(filterRelevantServices(HelpdeskMockData.hybridServices));
      }
      return ServiceDescriptor.servicesInOrg(orgId, true).then(filterRelevantServices);
    }

    var filterRelevantServices = function (services) {
      return _.filter(services, function (service) {
        return service.id === 'squared-fusion-cal' || service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec' || service.id ===
          'squared-fusion-mgmt';
      });
    };

    function searchCloudberryDevices(searchString, orgId, limit) {
      if (useMock()) {
        return deferredResolve(filterDevices(searchString, CsdmConverter.convertDevices(HelpdeskMockData.devices), limit));
      }
      var devices = devicesInOrgCache.get(orgId);
      if (devices) {
        return deferredResolve(filterDevices(searchString, devices, limit));
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + encodeURIComponent(orgId) + '/devices?checkOnline=false&isHelpDesk=true')
        .then(function (res) {
          var devices = CsdmConverter.convertDevices(res.data);
          devicesInOrgCache.put(orgId, devices);
          return filterDevices(searchString, devices, limit);
        });
    }

    function getCloudberryDevice(orgId, deviceId) {
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + orgId + '/devices/' + deviceId + '?isHelpDesk=true&checkOnline=true')
        .then(extractDevice);
    }

    function filterDevices(searchString, devices, limit) {
      searchString = searchString.toLowerCase();
      var filteredDevices = [];
      var macSearchString = searchString.replace(/[:/.-]/g, '');
      _.each(devices, function (device) {
        if ((device.displayName || '').toLowerCase().indexOf(searchString) != -1 || (device.mac || '').toLowerCase().replace(/[:]/g, '').indexOf(macSearchString) != -1 || (device.serial || '').toLowerCase().indexOf(searchString) != -1) {
          if (_.size(filteredDevices) < limit) {
            device.id = device.url.split('/').pop();
            filteredDevices.push(device);
          } else {
            return false;
          }
        }
      });
      return _.sortBy(filteredDevices, 'displayName');
    }

    function extractAndMassageUser(res) {
      var user = res.data || res;
      user.displayName = getCorrectedDisplayName(user);
      user.isConsumerUser = user.orgId === Config.consumerOrgId;
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

    function findAndResolveOrgsForUserResults(userSearchResults, orgFilter, userLimit) {
      if (_.size(userSearchResults) > 0) {
        if (orgFilter) {
          _.each(userSearchResults, function (user) {
            user.organization.displayName = orgFilter.displayName;
          });
        } else {
          var orgs = [];
          var currentResults = _.take(userSearchResults, userLimit);
          _.each(currentResults, function (user) {
            if (user.organization.id === Config.consumerOrgId) {
              user.organization.displayName = $translate.instant('helpdesk.consumerOrg');
            } else if (!user.organization.displayName) {
              orgs.push(user.organization.id);
            }
          });
          _.each(_.uniq(orgs), function (orgId) {
            getOrgDisplayName(orgId).then(function (displayName) {
              _.each(userSearchResults, function (user) {
                if (user.organization && user.organization.id === orgId) {
                  user.organization.displayName = displayName;
                }
              });
            }, angular.noop);
          });
        }

      }
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

    function sendVerificationCode(displayName, email) {
      return $http
        .post(urlBase + 'helpdesk/actions/sendverificationcode/invoke', {
          inviteList: [{
            displayName: displayName,
            email: email
          }]
        })
        .then(extractData);
    }

    function getWebExSites(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.webExSites);
      }
      return $http
        .get(urlBase + 'helpdesk/webexsites/' + encodeURIComponent(orgId))
        .then(extractItems);
    }

    function getHuronDevices(orgId, userId) {
      if (useMock()) {
        return deferredResolve(massageHuronDevices(HelpdeskMockData.huronDevicesForUser));
      }
      return deferredResolve([]); //TODO: When Huron works with help desk role: DeviceService.loadDevices(userId, orgId).then(massageHuronDevices);
    }

    function massageHuronDevices(devices) {
      _.each(devices, function (device) {
        device.image = device.model ? 'images/devices/' + (device.model.trim().replace(/ /g, '_') + '.png').toLowerCase() : 'images/devices-hi/unknown.png';
        device.deviceStatus.cssColorClass = device.deviceStatus.status === 'Online' ? 'device-status-green' : 'device-status-red';
        if (!device.deviceStatus.status) {
          device.deviceStatus.status = 'Unknown';
        }
      });
      return devices;
    }

    function getHybridStatusesForUser(userId, orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.userStatuses);
      }
      return USSService2.getStatusesForUserInOrg(userId, orgId);
    }

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser,
      getOrg: getOrg,
      searchCloudberryDevices: searchCloudberryDevices,
      getHybridServices: getHybridServices,
      resendInviteEmail: resendInviteEmail,
      getWebExSites: getWebExSites,
      getCloudberryDevice: getCloudberryDevice,
      getOrgDisplayName: getOrgDisplayName,
      findAndResolveOrgsForUserResults: findAndResolveOrgsForUserResults,
      checkIfMobile: checkIfMobile,
      sendVerificationCode: sendVerificationCode,
      filterDevices: filterDevices,
      getHuronDevices: getHuronDevices,
      getHybridStatusesForUser: getHybridStatusesForUser
    };
  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
