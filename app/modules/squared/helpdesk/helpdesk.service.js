(function () {
  'use strict';

  /* @ngInject */

  function HelpdeskService($http, $location, $q, $translate, $window, CacheFactory, Config, CsdmConfigService, CsdmConverter, FeatureToggleService, HelpdeskHttpRequestCanceller, HelpdeskMockData, ServiceDescriptor, UrlConfig, USSService) {
    var urlBase = UrlConfig.getAdminServiceUrl();
    var orgCache = CacheFactory.get('helpdeskOrgCache');
    var service = {
      usersWithRole: usersWithRole,
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      searchOrders: searchOrders,
      resendAdminEmail: resendAdminEmail,
      editAdminEmail: editAdminEmail,
      getUser: getUser,
      getOrg: getOrg,
      isEmailBlocked: isEmailBlocked,
      searchCloudberryDevices: searchCloudberryDevices,
      getHybridServices: getHybridServices,
      resendInviteEmail: resendInviteEmail,
      getWebExSites: getWebExSites,
      getServiceOrders: getServiceOrders,
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
      elevateToReadonlyAdmin: elevateToReadonlyAdmin,
      isSparkOnlineUser: isSparkOnlineUser,
      getInviteResendUrl: getInviteResendUrl,
      getInviteResendPayload: getInviteResendPayload,
      invokeInviteEmail: invokeInviteEmail,
      getAccount: getAccount,
      getOrder: getOrder,
      getEmailStatus: getEmailStatus
    };

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
      return _.get(res, 'data.items');
    }

    function extractData(res) {
      return _.get(res, 'data');
    }

    function extractDevice(res) {
      return CsdmConverter.convertCloudberryDevice(res.data);
    }

    function extractOrg(res) {
      var org = extractData(res);
      var id = _.get(org, 'id');
      if (id) {
        orgCache.put(id, org);
        orgDisplayNameCache.put(id, _.get(org, 'displayName'));
      }
      return org;
    }

    function extractUsers(res) {
      var users = extractItems(res);
      _.each(users, function (user) {
        user.displayName = getCorrectedDisplayName(user);
        if (user.organization) {
          user.isConsumerUser = user.organization.id === Config.consumerOrgId;
        }
      });
      return users;
    }

    function isSparkOnlineUser(user) {
      var value = _.get(user, 'onlineOrderIds', []);
      return (value) ? !!value.length : false;
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
          error.cancelled = _.get(error, 'config.timeout.cancelled', false);
          error.timedout = _.get(error, 'config.timeout.timedout', false);
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

    function searchOrders(searchString) {
      return cancelableHttpGET(urlBase + 'commerce/orders/search?webOrderId=' + encodeURIComponent(searchString))
        .then(extractData);
    }

    function resendAdminEmail(orderUUID, toCustomer) {
      var url;
      if (toCustomer) {
        url = urlBase + "helpdesk/orders/" + orderUUID + "/actions/resendcustomeradminemail/invoke";
      } else {
        url = urlBase + "helpdesk/orders/" + orderUUID + "/actions/resendpartneradminemail/invoke";
      }
      return $http.post(url).then(extractData);
    }

    function editAdminEmail(orderUUID, adminEmail, toCustomer) {
      var url = '';
      if (_.isUndefined(orderUUID) || !_.isString(orderUUID)) {
        $q.reject('A proper order UUID must be passed');
      }
      if (_.isUndefined(adminEmail) || !_.isString(adminEmail)) {
        $q.reject('A valid admin email must be passed');
      }
      if (_.isUndefined(toCustomer) || !_.isBoolean(toCustomer)) {
        $q.reject('Need specify email recipient');
      }
      var payload = {
        emailId: adminEmail
      };

      if (toCustomer) {
        url = urlBase + "helpdesk/orders/" + orderUUID + "/customerAdminEmail";
      } else {
        url = urlBase + "helpdesk/orders/" + orderUUID + "/partnerAdminEmail";
      }
      return $http.post(url, payload).then(extractData);
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
      return searchOrgs(orgId, 1)
        .then(function (result) {
          if (_.isArray(result) && _.size(result) > 0) {
            var org = result[0];
            if (org.id && org.displayName) {
              orgDisplayNameCache.put(org.id, org.displayName);
              return org.displayName;
            }
          }
          return $q.reject(result);
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
      var macSearchString = _.replace(searchString, /[:/.-]/g, '');
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
          // notes:
          // - 'pending' => CI status (see: https://wiki.cisco.com/display/PLATFORM/CI3.0+SCIM+API+-+Get+User )
          // - by default, 'pending' alone means a normal user that was invited to Spark by their
          //   admin but not yet accepted
          // - if user is a Spark Online user (ie. they purchased Spark through Digital River), then
          //   the user is the original purchaser, but has not registered yet
          if (status === 'pending') {
            status = (isSparkOnlineUser(user)) ? 'onboarding-pending' : 'invite-pending';
          }
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
            }, _.noop);
          });
        }

      }
    }

    function isEmailBlocked(email) {
      return $http.get(urlBase + 'email/bounces?email=' + encodeURIComponent(email));
    }

    function resendInviteEmail(trimmedUserData) {
      var email = trimmedUserData.email;
      return FeatureToggleService.supports(FeatureToggleService.features.atlasEmailStatus)
        .then(function (isSupported) {
          if (!isSupported) {
            return $q.reject();
          }
          return service.isEmailBlocked(email)
            .then(function () {
              return $http.delete(urlBase + 'email/bounces?email=' + email);
            })
            .then(function () {
              return service.invokeInviteEmail(trimmedUserData);
            });
        })
        .catch(function () {
          return service.invokeInviteEmail(trimmedUserData);
        });
    }

    function getInviteResendUrl(trimmedUserData) {
      var controllerAction = isSparkOnlineUser(trimmedUserData) ? 'resendonlineorderactivation' : 'resendinvitation';
      return urlBase + 'helpdesk/actions/' + controllerAction + '/invoke';
    }

    function getInviteResendPayload(trimmedUserData) {
      var displayName = trimmedUserData.displayName;
      var email = trimmedUserData.email;
      var onlineOrderIds = trimmedUserData.onlineOrderIds;
      var payload = {
        inviteList: [{
          displayName: displayName,
          email: email
        }]
      };
      if (isSparkOnlineUser(trimmedUserData)) {
        payload = {
          onlineOrderIds: onlineOrderIds
        };
      }
      return payload;
    }

    function invokeInviteEmail(trimmedUserData) {
      var url = service.getInviteResendUrl(trimmedUserData);
      var payload = service.getInviteResendPayload(trimmedUserData);
      return $http.post(url, payload)
        .then(function (res) {
          return extractData(res);
        });
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

    function getServiceOrders(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.serviceOrders);
      }
      return $http
        .get(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/serviceorders')
        .then(extractData);
    }

    function elevateToReadonlyAdmin(orgId) {
      return $http.post(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/actions/elevatereadonlyadmin/invoke');
    }

    function getHybridStatusesForUser(userId, orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.userStatuses);
      }
      return USSService.getStatusesForUserInOrg(userId, orgId);
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

    function getAccount(accountId) {
      return $http
        .get(urlBase + 'accounts/' + encodeURIComponent(accountId))
        .then(extractData);
    }

    function getOrder(orderId) {
      return $http
        .get(urlBase + 'orders/' + encodeURIComponent(orderId))
        .then(extractData);
    }

    function getEmailStatus(email) {
      return $http
        .get(urlBase + "email?email=" + encodeURIComponent(email))
        .then(extractItems);
    }

    return service;
  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
})();
