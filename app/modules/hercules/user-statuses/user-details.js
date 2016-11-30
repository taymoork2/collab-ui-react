(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UserDetails', UserDetails);

  /* @ngInject  */
  function UserDetails($http, $translate, UrlConfig, USSService) {
    var service = {
      getCSVColumnHeaders: getCSVColumnHeaders,
      getUsers: getUsers,
      // exported for testing purpose
      multipleUserFilter: multipleUserFilter,
      userUrl: userUrl
    };

    return service;

    function multipleUserFilter(userIds) {
      return _.chain(userIds)
        .map(function (id) {
          return 'id eq "' + id + '"';
        })
        .join(' or ')
        .value();
    }

    function userUrl(orgId, userIds) {
      return UrlConfig.getScimUrl(orgId) + '?filter=' + multipleUserFilter(userIds);
    }

    function getCSVColumnHeaders() {
      return ['User', 'Cluster', 'State', 'Error Message', 'User ID', 'Service'];
    }

    function getUsers(orgId, statuses) {
      var userIds = _.map(statuses, 'userId');
      return $http.get(userUrl(orgId, userIds))
        .then(function (response) {
          var data = response.data;
          return _.map(statuses, function (status) {
            // Does the id exist in answer from CI?
            var foundUser = _.find(data.Resources, { id: status.userId });
            var serviceName = status.serviceId === 'squared-fusion-uc' ? $translate.instant('hercules.serviceNames.squared-fusion-uc.full') : $translate.instant('hercules.serviceNames.' + status.serviceId);
            // Same shape as getCSVColumnHeaders!
            return [
              foundUser ? foundUser.userName : $translate.instant('hercules.export.userNotFound'),
              status.connector ? status.connector.cluster_name : '',
              $translate.instant('hercules.activationStatus.' + USSService.decorateWithStatus(status)),
              status.state === 'error' && status.description ? status.description.defaultMessage : '',
              status.userId,
              serviceName
            ];
          });
        });
    }
  }
})();
