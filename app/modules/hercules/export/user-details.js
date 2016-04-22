(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UserDetails', UserDetails);

  /* @ngInject  */
  function UserDetails($http, $translate, UrlConfig) {

    var multipleUserFilter = function (userIds) {
      var filter = '';
      $.each(userIds, function (index, elem) {
        filter += 'id eq ' + '"' + elem + '"' + ' or ';
      });
      filter = filter.slice(0, -4);
      return filter;
    };

    var userUrl = function (userIds, orgId) {
      return UrlConfig.getScimUrl(orgId) + '?filter=' + multipleUserFilter(userIds);
    };

    var getCSVColumnHeaders = function () {
      return ['User', 'Host', 'State', 'Message', 'User ID', 'Service'];
    };

    var getUsers = function (stateInfos, orgId, callback) {

      var userIds = $.map(stateInfos, function (stateInfo) {
        return stateInfo.userId;
      });

      $http.get(userUrl(userIds, orgId))
        .success(function (data, status) {
          var total = [];
          $.each(userIds, function (index, ussUserId) {
            var result = {};

            // Does the id exist in answer from CI ?
            var foundUser = $.grep(data.Resources, function (ciUser) {
              return ciUser.id === ussUserId;
            });

            var serviceName = stateInfos[index].serviceId === 'squared-fusion-uc' ? $translate.instant('hercules.serviceNames.squared-fusion-uc.full') : $translate.instant('hercules.serviceNames.' + stateInfos[index].serviceId);
            if (foundUser.length > 0) {
              result.success = true;
              result.details = {
                userName: foundUser[0].userName,
                connector: stateInfos[index].connector || 'not found(id=' + stateInfos[index].connectorId + ')',
                state: stateInfos[index].state == 'notActivated' ? 'Pending Activation' : stateInfos[index].state,
                message: stateInfos[index].state == 'error' ? stateInfos[index].description.defaultMessage : '',
                userId: userIds[index],
                service: serviceName
              };
            } else {
              result.success = false;
              result.details = {
                userName: 'Not found',
                connector: stateInfos[index].connector || 'not found(id=' + stateInfos[index].connectorId + ')',
                state: stateInfos[index].state == 'notActivated' ? 'Pending Activation' : stateInfos[index].state,
                message: stateInfos[index].state == 'error' ? stateInfos[index].description.defaultMessage : '',
                userId: userIds[index],
                service: serviceName
              };
            }

            total.push(result);
          });
          callback(total, status);
        });

    };

    return {
      getUsers: getUsers,
      multipleUserFilter: multipleUserFilter,
      userUrl: userUrl,
      getCSVColumnHeaders: getCSVColumnHeaders
    };
  }

})();
