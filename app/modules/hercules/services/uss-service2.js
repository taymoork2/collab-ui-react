(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('USSService2', USSService2);

  /* @ngInject */
  function USSService2($http, UrlConfig, Authinfo, CsdmPoller, CsdmHubFactory) {
    var cachedUserStatusSummary = [];

    var USSUrl = UrlConfig.getUssUrl() + 'uss/api/v1';

    var fetchStatusesSummary = function () {
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
    };

    var hub = CsdmHubFactory.create();
    CsdmPoller.create(fetchStatusesSummary, hub);

    var statusesParameterRequestString = function (serviceId, state, offset, limit) {
      var statefilter = state ? "&state=" + state : "";
      return 'serviceId=' + serviceId + statefilter + '&offset=' + offset + '&limit=' + limit + '&entitled=true';
    };

    function extractData(res) {
      return res.data;
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
        .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?userId=' + userId)
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

    function getStatuses(serviceId, state, offset, limit) {
      return $http
        .get(USSUrl + '/orgs/' + Authinfo.getOrgId() + '/userStatuses?' + statusesParameterRequestString(serviceId, state, offset, limit))
        .then(extractData);
    }

    function extractSummaryForAService(servicesId) {
      return _.filter(getStatusesSummary(), function (summary) {
        return _.includes(servicesId, summary.serviceId);
      });
    }

    return {
      getStatusesForUser: getStatusesForUser,
      decorateWithStatus: decorateWithStatus,
      getOrg: getOrg,
      updateOrg: updateOrg,
      getStatusesSummary: getStatusesSummary,
      getStatuses: getStatuses,
      subscribeStatusesSummary: hub.on,
      getStatusesForUserInOrg: getStatusesForUserInOrg,
      extractSummaryForAService: extractSummaryForAService
    };
  }

}());
