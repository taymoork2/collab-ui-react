// TODO: refactor to typescript, add enum for
// orderingTool types here and throughout codebase
(function () {
  'use strict';

  /* @ngInject */

  function HelpdeskService($log, $http, $location, $q, $translate, $window, CacheFactory, Config, CsdmSearchService, CsdmConverter, FeatureToggleService, HelpdeskHttpRequestCanceller, HelpdeskMockData, ServiceDescriptorService, UrlConfig, USSService, HybridServicesExtrasService) {
    var urlBase = UrlConfig.getAdminServiceUrl();
    var orgCache = CacheFactory.get('helpdeskOrgCache');
    var service = {
      usersWithRole: usersWithRole,
      partnerAdmins: partnerAdmins,
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      searchOrders: searchOrders,
      filterOrders: filterOrders,
      resendAdminEmail: resendAdminEmail,
      editAdminEmail: editAdminEmail,
      getOrderProcessingUrl: getOrderProcessingUrl,
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
      sendRequestForFullAdminAccess: sendRequestForFullAdminAccess,
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
      getSubscription: getSubscription,
      getEmailStatus: getEmailStatus,
      hasBounceDetails: hasBounceDetails,
      clearBounceDetails: clearBounceDetails,
      hasComplaintDetails: hasComplaintDetails,
      clearComplaintDetails: clearComplaintDetails,
      hasUnsubscribeDetails: hasUnsubscribeDetails,
      clearUnsubscribeDetails: clearUnsubscribeDetails,
      getLatestEmailEvent: getLatestEmailEvent,
      unixTimestampToUTC: unixTimestampToUTC,
    };

    if (!orgCache) {
      orgCache = new CacheFactory('helpdeskOrgCache', {
        maxAge: 120 * 1000,
        deleteOnExpire: 'aggressive',
      });
    }
    var orgDisplayNameCache = CacheFactory.get('helpdeskOrgDisplayNameCache');
    if (!orgDisplayNameCache) {
      orgDisplayNameCache = new CacheFactory('helpdeskOrgDisplayNameCache', {
        maxAge: 10 * 60 * 1000,
        deleteOnExpire: 'aggressive',
      });
    }
    var userCache = CacheFactory.get('helpdeskUserCache');
    if (!userCache) {
      userCache = new CacheFactory('helpdeskUserCache', {
        maxAge: 60 * 1000,
        deleteOnExpire: 'aggressive',
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
      },
    };

    function checkIfMobile() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }

    function extractItems(res) {
      return _.get(res, 'data.items');
    }

    function extractPartners(res) {
      return _.get(res, 'data.partners');
    }

    function extractData(res) {
      return _.get(res, 'data');
    }

    function extractDevice(res) {
      return convertCsdmDevice(res.data);
    }

    function convertCsdmDevice(device) {
      var d = CsdmConverter.convertCloudberryDevice(device);//We render devices from csdm as csdm devices until huron cards are fixed.
      d.id = device.url.split('?')[0].split('/').pop();
      d.encoded_id = encodeURIComponent(device.url.split('/').pop());
      return d;
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

    function extractPartnerAdmins(res) {
      var users = extractPartners(res);
      _.each(users, function (user) {
        user.displayName = getCorrectedDisplayName(user);
        if (user.orgId) {
          user.isConsumerUser = user.orgId === Config.consumerOrgId;
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
      if (user.name) {
        displayName = user.name.givenName ? user.name.givenName : '';
        displayName += user.name.familyName ? ' ' + user.name.familyName : '';
      }
      if (!displayName) {
        return user.displayName ? user.displayName : user.userName;
      }
      return displayName;
    }

    function useMock() {
      return $location.absUrl().match(/helpdesk-backend=mock/);
    }

    function cancelableHttpGET(url) {
      var config = {
        timeout: HelpdeskHttpRequestCanceller.newCancelableTimeout(),
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

    function partnerAdmins(orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.users);
      }
      return cancelableHttpGET(urlBase + 'helpdesk/organizations/' + orgId + '/users/partneradmins')
        .then(extractPartnerAdmins);
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

    function filterOrders(orders) {
      // TODO: move usage into enum when file is made typescript
      var orderToolFilters = ['CCW', 'CCW-CSB', 'CCW-CDC'];
      return _.filter(orders, function (el) { return _.includes(orderToolFilters, el.orderingTool); });
    }

    function resendAdminEmail(orderUUID, isCustomer) {
      var url;
      if (isCustomer) {
        url = urlBase + 'helpdesk/orders/' + orderUUID + '/actions/resendcustomeradminemail/invoke';
      } else {
        url = urlBase + 'helpdesk/orders/' + orderUUID + '/actions/resendpartneradminemail/invoke';
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
        emailId: adminEmail,
      };

      if (toCustomer) {
        url = urlBase + 'helpdesk/orders/' + orderUUID + '/customerAdminEmail';
      } else {
        url = urlBase + 'helpdesk/orders/' + orderUUID + '/partnerAdminEmail';
      }
      return $http.post(url, payload).then(extractData);
    }

    function getOrderProcessingUrl(purchaseOrderId) {
      return $http
        .get(urlBase + 'ordersetup/' + encodeURIComponent(purchaseOrderId) + '/csmlink')
        .then(function (response) {
          return encodeOpcUrl(response.data);
        });
    }

    function encodeOpcUrl(url) {
      var encodedUrl = '';
      _.forEach(url.split('&'), function (param) {
        var paramSplit = param.split('=', 2);
        if (paramSplit.length === 1) {
          encodedUrl += param + '&';
        } else {
          encodedUrl += paramSplit[0] + '=' + encodeURIComponent(paramSplit[1]) + '&';
        }
      });
      return encodedUrl.slice(0, -1);
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
          return $q.reject($translate.instant('helpdesk.org.displayNameError'));
        });
    }

    function getHybridServices(orgId) {
      if (useMock()) {
        return deferredResolve(filterRelevantServices(HelpdeskMockData.hybridServices));
      }
      return ServiceDescriptorService.getServices(orgId).then(filterRelevantServices);
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
      return CsdmSearchService.searchWithQueryString(searchString, orgId, limit, 'helpdesk').then(function (searchRes) {
        return _.map(searchRes.data.hits.hits, convertCsdmDevice);
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
        .get(UrlConfig.getCsdmServiceUrl() + '/organization/' + encodeURIComponent(orgId) + '/devices/' + deviceId + ((deviceId.indexOf('?') > 0) ? '&' : '?') + 'isHelpDesk=true&checkOnline=true')
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
        id: user.orgId,
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
          email: email,
        }],
      };
      if (isSparkOnlineUser(trimmedUserData)) {
        payload = {
          onlineOrderIds: onlineOrderIds,
        };
      }
      return payload;
    }

    /*

     */
    function sendRequestForFullAdminAccess(adminUserId, orgId) {
      $log.debug('*** adminUserId ***', adminUserId);
      return $http
        .post(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/elevationrequest', {
          customerUserId: adminUserId,
        })
        .then(extractData);
    }

    /*

     */
    function invokeInviteEmail(trimmedUserData) {
      var url = service.getInviteResendUrl(trimmedUserData);
      var payload = service.getInviteResendPayload(trimmedUserData);
      return $http.post(url, payload)
        .then(function (res) {
          return extractData(res);
        });
    }

    /*

     */
    function sendVerificationCode(displayName, email) {
      return $http
        .post(urlBase + 'helpdesk/actions/sendverificationcode/invoke', {
          inviteList: [{
            displayName: displayName,
            email: email,
          }],
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
      return $http
        .post(urlBase + 'helpdesk/organizations/' + encodeURIComponent(orgId) + '/actions/elevatereadonlyadmin/invoke')
        .then(USSService.invalidateHybridUserCache)
        .catch(angular.noop)
        .then(HybridServicesExtrasService.invalidateHybridUserCache)
        .catch(angular.noop);
    }

    function getHybridStatusesForUser(userId, orgId) {
      if (useMock()) {
        return deferredResolve(HelpdeskMockData.userStatuses);
      }
      return USSService.getStatusesForUser(userId, orgId);
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

    function getSubscription(subscriptionId) {
      return $http
        .get(urlBase + 'subscriptions/' + encodeURIComponent(subscriptionId))
        .then(extractData);
    }

    function getLatestEmailEvent(email) {
      return service.getEmailStatus(email).then(function (emailEvents) {
        return _.first(emailEvents);
      });
    }

    function getEmailStatus(email) {
      return $http
        .get(urlBase + 'email?email=' + encodeURIComponent(email))
        .then(extractItems);
    }

    function hasSuppressionDetails(suppressionType, email) {
      if (!suppressionType) {
        return $q.reject('No suppression type provided.');
      }
      if (!email) {
        return $q.reject('No email provided.');
      }

      return $http.get(urlBase + 'email/' + suppressionType + '?email=' + encodeURIComponent(email))
        .then(function (data) {
          // notes:
          // - usually the response SHOULD be 404, indicating the email address is not on the list
          // - in certain cases, we get a 200 response, with an empty JSON object => `{}`
          // - so we additionally check for the expected 'address' property in the response, and
          //   reject if not present
          if (!_.get(data, 'data.address')) {
            return $q.reject('No email address in response payload.');
          }
          return data;
        });
    }

    function clearSuppressionDetails(suppressionType, email) {
      if (!suppressionType) {
        return $q.reject('No suppression type provided.');
      }
      if (!email) {
        return $q.reject('No email provided.');
      }
      return $http.delete(urlBase + 'email/' + suppressionType + '?email=' + encodeURIComponent(email));
    }

    function hasBounceDetails(email) {
      return hasSuppressionDetails('bounces', email);
    }

    function clearBounceDetails(email) {
      return clearSuppressionDetails('bounces', email);
    }

    function hasComplaintDetails(email) {
      return hasSuppressionDetails('complaints', email);
    }

    function clearComplaintDetails(email) {
      return clearSuppressionDetails('complaints', email);
    }

    function hasUnsubscribeDetails(email) {
      return hasSuppressionDetails('unsubscribes', email);
    }

    function clearUnsubscribeDetails(email) {
      return clearSuppressionDetails('unsubscribes', email);
    }

    // Convert Date from seconds to UTC format
    function unixTimestampToUTC(timestamp) {
      if (!timestamp) {
        return;
      }
      // convert seconds to ms
      var newDate = new Date();
      newDate.setTime(timestamp * 1000);
      return newDate.toUTCString();
    }

    return service;
  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
})();
