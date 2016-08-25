(function () {
  'use strict';

  /* @ngInject */

  function HelpdeskService($http, $location, $q, $translate, $window, CacheFactory, Config, CsdmConfigService, CsdmConverter, FeatureToggleService, HelpdeskHttpRequestCanceller, HelpdeskMockData, ServiceDescriptor, UrlConfig, USSService2) {
    var urlBase = UrlConfig.getAdminServiceUrl();
    var orgCache = CacheFactory.get('helpdeskOrgCache');
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
    var userCache = CacheFactory.get('helpdeskUserCache');
    if (!userCache) {
      userCache = new CacheFactory('helpdeskUserCache', {
        maxAge: 60 * 1000,
        deleteOnExpire: 'aggressive'
      });
    }

    //TODO: Useragent detection a probably not a reliable way to detect mobile device...
    var isMobile = {
      Android: function () {
        return $window.navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return $window.navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return $window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return $window.navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return $window.navigator.userAgent.match(/IEMobile/i) || $window.navigator.userAgent.match(/WPDesktop/i);
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
      return CsdmConverter.convertCloudberryDevice(res.data);
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

    function cancelableHttpGET(url) {
      var config = {
        timeout: HelpdeskHttpRequestCanceller.newCancelableTimeout()
      };

      return $http
        .get(url, config)
        .catch(function (error) {
          error.cancelled = error.config.timeout.cancelled;
          error.timedout = error.config.timeout.timedout;
          return $q.reject(error);
        });
    }

    function usersWithRole(orgId, role, limit) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.users);
      }
      return cancelableHttpGET(urlBase + 'helpdesk/organizations/' + orgId + '/users?limit=' + limit + (role ? '&role=' + encodeURIComponent(role) : ''))
        .then(extractUsers);
    }

    function searchUsers(searchString, orgId, limit, role, includeUnlicensed) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.users);
      }

      var includeUnlicensedStr = includeUnlicensed ? '&includeUnlicensed=true' : '';
      var roleStr = role ? '&role=' + encodeURIComponent(role) : '';
      return cancelableHttpGET(urlBase + 'helpdesk/search/users?phrase=' + encodeURIComponent(searchString) + '&limit=' + limit + (orgId ? '&orgId=' + encodeURIComponent(orgId) : includeUnlicensedStr) + roleStr)
        .then(extractUsers);
    }

    function searchOrgs(searchString, limit) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.orgs);
      }

      return cancelableHttpGET(urlBase + 'helpdesk/search/organizations?phrase=' + encodeURIComponent(searchString) + '&limit=' + limit)
        .then(extractItems);
    }

    function getUser(orgId, userId) {
      if (useMock()) {
        return deferredResolve(extractAndMassageUser(HelpdeskMockData.user));
      }
      var cachedUser = userCache.get(userId);
      if (cachedUser) {
        return deferredResolve(cachedUser);
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
        return deferredResolve(filterDevices(searchString, CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), limit));
      }
      var devices = devicesInOrgCache.get(orgId);
      if (devices) {
        return deferredResolve(filterDevices(searchString, devices, limit));
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + encodeURIComponent(orgId) + '/devices?checkOnline=false&isHelpDesk=true')
        .then(function (res) {
          var devices = CsdmConverter.convertCloudberryDevices(res.data);
          devicesInOrgCache.put(orgId, devices);
          return filterDevices(searchString, devices, limit);
        });
    }

    function getCloudberryDevice(orgId, deviceId) {
      if (useMock()) {
        var device = _.find(CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), function (val, key) {
          var id = _.last(key.split('/'));
          return id === deviceId;
        });
        return deferredResolve(device);
      }
      return $http
        .get(CsdmConfigService.getUrl() + '/organization/' + orgId + '/devices/' + deviceId + '?isHelpDesk=true&checkOnline=true')
        .then(extractDevice);
    }

    function filterDevices(searchString, devices, limit) {
      searchString = searchString.toLowerCase();
      var filteredDevices = [];
      var macSearchString = searchString.replace(/[:/.-]/g, '');
      _.each(devices, function (device) {
        if ((device.displayName || '').toLowerCase().indexOf(searchString) != -1 || (device.mac || '').toLowerCase().replace(/[:]/g, '').indexOf(
            macSearchString) != -1 || (device.serial || '').toLowerCase().indexOf(searchString) != -1 || (device.cisUuid || '').toLowerCase().indexOf(searchString) != -1) {
          if (_.size(filteredDevices) < limit) {
            device.id = device.url.split('/').pop();
            filteredDevices.push(device);
          } else {
            return false;
          }
        }
      });
      return filteredDevices;
    }

    function extractAndMassageUser(res) {
      var user = res.data || res;
      user.displayName = getCorrectedDisplayName(user);
      user.isConsumerUser = user.orgId === Config.consumerOrgId;
      user.organization = {
        id: user.orgId
      };
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
      userCache.put(user.id, user);
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

    function isEmailBlocked(email) {
      return $http.get(urlBase + 'email/bounces?email=' + encodeURIComponent(email));
    }

    function resendInviteEmail(displayName, email) {
      if (FeatureToggleService.supports(FeatureToggleService.features.atlasEmailStatus)) {
        return isEmailBlocked(email).then(function () {
          $http.delete(urlBase + 'email/bounces?email=' + email)
            .then(function () {
              return invokeInviteEmail(displayName, email);
            });
        }).catch(function () {
          return invokeInviteEmail(displayName, email);
        });
      } else {
        return invokeInviteEmail(displayName, email);
      }
    }

    function invokeInviteEmail(displayName, email) {
      return $http.post(urlBase + 'helpdesk/actions/resendinvitation/invoke', {
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

    function getServiceOrder(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.serviceOrder);
      }
      return $http
        .get(urlBase + 'helpdesk/serviceorder/' + encodeURIComponent(orgId))
        .then(extractData);
    }

    function elevateToReadonlyAdmin(orgId) {
      return $http.post(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/actions/elevatereadonlyadmin/invoke');
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

    function cancelAllRequests() {
      return HelpdeskHttpRequestCanceller.cancelAll();
    }

    function noOutstandingRequests() {
      return HelpdeskHttpRequestCanceller.empty();
    }

    return {
      usersWithRole: usersWithRole,
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser,
      getOrg: getOrg,
      isEmailBlocked: isEmailBlocked,
      searchCloudberryDevices: searchCloudberryDevices,
      getHybridServices: getHybridServices,
      resendInviteEmail: resendInviteEmail,
      getWebExSites: getWebExSites,
      getServiceOrder: getServiceOrder,
      getCloudberryDevice: getCloudberryDevice,
      getOrgDisplayName: getOrgDisplayName,
      findAndResolveOrgsForUserResults: findAndResolveOrgsForUserResults,
      checkIfMobile: checkIfMobile,
      sendVerificationCode: sendVerificationCode,
      filterDevices: filterDevices,
      getHybridStatusesForUser: getHybridStatusesForUser,
      cancelAllRequests: cancelAllRequests,
      noOutstandingRequests: noOutstandingRequests,
      useMock: useMock,
      elevateToReadonlyAdmin: elevateToReadonlyAdmin
    };
  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
