(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('USSService', USSService);

  /* @ngInject */
  function USSService($http, UrlConfig, Authinfo, CsdmPoller, CsdmHubFactory, $translate, HybridServicesUtils) {
    var cachedUserStatusSummary = [];

    var USSUrl = UrlConfig.getUssUrl() + 'uss/api/v1';

    var hub = CsdmHubFactory.create();

    var service = {
      getStatusesForUser: getStatusesForUser,
      decorateWithStatus: decorateWithStatus,
      getOrg: getOrg,
      updateOrg: updateOrg,
      getStatusesSummary: getStatusesSummary,
      subscribeStatusesSummary: hub.on,
      getStatusesForUserInOrg: getStatusesForUserInOrg,
      extractSummaryForAService: extractSummaryForAService,
      getUserProps: getUserProps,
      updateUserProps: updateUserProps,
      getAllUserProps: getAllUserProps,
      updateBulkUserProps: updateBulkUserProps,
      removeAllUsersFromResourceGroup: removeAllUsersFromResourceGroup,
      refreshEntitlementsForUser: refreshEntitlementsForUser,
      getUserPropsSummary: getUserPropsSummary,
      getUserJournal: getUserJournal,
      notifyReadOnlyLaunch: notifyReadOnlyLaunch,
      getAllStatuses: getAllStatuses,
    };

    CsdmPoller.create(fetchStatusesSummary, hub);

    return service;

    function statusesParameterRequestString(serviceId, state, limit) {
      var statefilter = state ? '&state=' + state : '';
      return 'serviceId=' + serviceId + statefilter + '&limit=' + limit + '&entitled=true';
    }

    function fetchStatusesSummary() {
      return $http
        .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses/summary')
        .then(function (res) {
          var summary = res.data.summary;
          // The server returns *nothing* for call and calendar
          // but we want to show that there are 0 users so let's populate
          // the data with defaults
          var emptySummary = {
            serviceId: null,
            activated: 0,
            notActivated: 0,
            error: 0,
            total: 0,
          };
          _.forEach(['squared-fusion-cal', 'squared-fusion-uc'], function (serviceId) {
            var found = _.find(summary, {
              serviceId: serviceId,
            });
            if (!found) {
              var newSummary = _.cloneDeep(emptySummary);
              newSummary.serviceId = serviceId;
              summary.push(newSummary);
            }
          });
          cachedUserStatusSummary = summary;
        });
    }

    function extractData(res) {
      return res.data;
    }

    function extractUserProps(res) {
      return res.data.userProps;
    }

    function extractJournalEntries(res) {
      var entries = res.data.entries || [];
      return _.chain(entries)
        .map(function (entry) {
          if (entry.entry.payload) {
            entry.entry.payload.messages = sortAndTweakUserMessages(entry.entry.payload.messages);
          }
          return entry;
        })
        .value();
    }

    function decorateWithStatus(status) {
      if (!status) {
        return 'unknown';
      }
      if (!status.entitled) {
        return 'not_entitled';
      }
      switch (status.state) {
        case 'error':
          return 'error';
        case 'deactivated':
        case 'notActivated':
          return 'pending_activation';
        case 'activated':
          return 'activated';
        default:
          return 'unknown';
      }
    }

    function getStatusesForUser(userId) {
      return getStatusesForUserInOrg(userId, Authinfo.getOrgId());
    }

    function getStatusesForUserInOrg(userId, orgId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userStatuses?includeMessages=true&entitled=true&userId=' + userId)
        .then(extractAndTweakUserStatuses);
    }

    function getOrg(orgId) {
      return $http
        .get(USSUrl + '/orgs/' + orgId)
        .then(extractData);
    }

    function updateOrg(org) {
      return $http
        .patch(USSUrl + '/orgs/' + org.id, org)
        .then(extractData);
    }

    function getStatusesSummary() {
      return cachedUserStatusSummary;
    }

    function getAllStatuses(serviceId, state) {
      return recursivelyReadStatuses(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?includeMessages=true&' + statusesParameterRequestString(serviceId, state, 10000))
        .then(extractAndTweakUserStatuses);
    }

    function recursivelyReadStatuses(statusesUrl) {
      return $http
        .get(statusesUrl)
        .then(extractData)
        .then(function (response) {
          if (response.paging && response.paging.next) {
            return recursivelyReadStatuses(response.paging.next)
              .then(function (statuses) {
                return response.userStatuses.concat(statuses);
              });
          } else {
            return response.userStatuses;
          }
        });
    }

    function extractSummaryForAService(servicesId) {
      return _.filter(getStatusesSummary(), function (summary) {
        return _.includes(servicesId, summary.serviceId);
      });
    }

    function getUserProps(userId, orgId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps/' + userId)
        .then(extractData);
    }

    function updateUserProps(props, orgId) {
      return $http
        .post(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps', { userProps: [props] })
        .then(extractData);
    }

    function updateBulkUserProps(manyProps, orgId) {
      return $http
        .post(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps', { userProps: manyProps })
        .then(extractData);
    }

    function getAllUserProps(orgId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps')
        .then(extractUserProps);
    }

    function removeAllUsersFromResourceGroup(resourceGroupId) {
      return $http
        .post(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/actions/removeAllUsersFromResourceGroup/invoke?resourceGroupId=' + resourceGroupId)
        .then(extractData);
    }

    function refreshEntitlementsForUser(userId, orgId) {
      return $http
        .post(USSUrl + '/userStatuses/actions/refreshEntitlementsForUser/invoke?orgId=' + (orgId || Authinfo.getOrgId()) + '&userId=' + userId)
        .then(extractData);
    }

    function getUserPropsSummary(orgId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps/summary')
        .then(extractData);
    }

    function getUserJournal(userId, orgId, limit, serviceId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userJournal/' + userId + (limit ? '?limit=' + limit : '') + (serviceId ? '&serviceId=' + serviceId : ''))
        .then(extractJournalEntries);
    }

    function notifyReadOnlyLaunch() {
      return $http.post(USSUrl + '/internals/actions/invalidateUser/invoke');
    }

    function extractAndTweakUserStatuses(res) {
      var userStatuses = res.data ? res.data.userStatuses : res;
      return _.chain(userStatuses)
        .map(function (userStatus) {
          userStatus.messages = sortAndTweakUserMessages(userStatus.messages);
          return userStatus;
        })
        .value();
    }

    function sortAndTweakUserMessages(messages) {
      if (_.size(messages) > 0) {
        return _.chain(messages)
          .sortBy(function (message) {
            return getMessageSortOrder(message.severity);
          })
          .map(function (message) {
            var translateReplacements = convertToTranslateReplacements(message.replacementValues);
            message.title = translateWithFallback(message.key + '.title', message.title, translateReplacements);
            message.description = translateWithFallback(message.key + '.description', message.description, translateReplacements);
            message.iconClass = getMessageIconClass(message.severity);
            return message;
          })
          .value();
      }
      return messages;
    }

    function translateWithFallback(messageKey, fallback, translateReplacements) {
      var translationKey = 'hercules.userStatusMessages.' + messageKey;
      var translation = $translate.instant(translationKey, translateReplacements);
      return translation === translationKey ? fallback : translation;
    }

    function convertToTranslateReplacements(messageReplacementValues) {
      return _.reduce(messageReplacementValues, function (translateReplacements, replacementValue) {
        translateReplacements[replacementValue.key] = replacementValue.type === 'timestamp' ? HybridServicesUtils.getLocalTimestamp(replacementValue.value) : replacementValue.value;
        return translateReplacements;
      }, {});
    }

    function getMessageIconClass(severity) {
      switch (severity) {
        case 'error':
          return 'icon-error';
        case 'warning':
          return 'icon-warning';
        default:
          return 'icon-info';
      }
    }

    function getMessageSortOrder(severity) {
      switch (severity) {
        case 'error':
          return 0;
        case 'warning':
          return 1;
        default:
          return 2;
      }
    }
  }
}());
