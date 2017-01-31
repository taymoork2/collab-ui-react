(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('USSService', USSService);

  /* @ngInject */
  function USSService($http, UrlConfig, Authinfo, CsdmPoller, CsdmHubFactory) {
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
      getUserCountFromResourceGroup: getUserCountFromResourceGroup,
      getUserJournal: getUserJournal,
      notifyReadOnlyLaunch: notifyReadOnlyLaunch,
      getAllStatuses: getAllStatuses
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
            total: 0
          };
          _.forEach(['squared-fusion-cal', 'squared-fusion-uc'], function (serviceId) {
            var found = _.find(summary, {
              serviceId: serviceId
            });
            if (!found) {
              var newSummary = angular.copy(emptySummary);
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
      return res.data.entries || [];
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
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userStatuses?userId=' + userId)
        .then(function (res) {
          return _.filter(res.data.userStatuses, function (nugget) {
            return nugget.entitled || (nugget.entitled === false && nugget.state != 'deactivated');
          });
        });
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
      return recursivelyReadStatuses(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?' + statusesParameterRequestString(serviceId, state, 10000));
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

    function getUserCountFromResourceGroup(resourceGroupId, orgId) {
      return $http
        .get(USSUrl + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/userProps/count?containingResourceGroupId=' + resourceGroupId)
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
  }
}());
