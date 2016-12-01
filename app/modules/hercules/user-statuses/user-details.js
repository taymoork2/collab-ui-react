(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UserDetails', UserDetails);

  /* @ngInject  */
  function UserDetails($http, $translate, UrlConfig, USSService, $q) {
    return {
      getCSVColumnHeaders: getCSVColumnHeaders,
      getUsers: getUsers,
      // exported for testing purpose
      multipleUserFilter: multipleUserFilter,
      userUrl: userUrl
    };

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

    function machineUrl(orgId, machineIds) {
      return UrlConfig.getDomainManagementUrl(orgId) + 'Machines?filter=' + multipleUserFilter(machineIds);
    }

    function getCSVColumnHeaders() {
      return [$translate.instant('common.user'),
        $translate.instant('common.type'),
        $translate.instant('cloudExtensions.cluster'),
        $translate.instant('cloudExtensions.status'), '' +
        $translate.instant('cloudExtensions.errorMessage'),
        $translate.instant('common.id'),
        $translate.instant('common.service')];
    }

    function addMachineRows(orgId, statuses, userRows) {
      var machineIds = _.map(statuses, 'userId');
      if (_.size(machineIds) === 0) {
        return $q.resolve(userRows);
      }
      return $http.get(machineUrl(orgId, machineIds))
        .then(function (response) {
          var machineRows = [];
          var data = response.data ? response.data.data : null;
          if (data) {
            machineRows = _.map(statuses, function (status) {
              var machine = _.find(data, { id: status.userId });
              return getRow(machine, status);
            });
          }
          return userRows.concat(machineRows);
        });
    }

    function getUsers(orgId, statuses) {
      var userIds = _.map(statuses, 'userId');
      var potentialMachineStatuses = [];
      return $http.get(userUrl(orgId, userIds))
        .then(function (response) {
          var data = response.data;
          var userRows = [];
          _.forEach(statuses, function (status) {
            var user = _.find(data.Resources, { id: status.userId });
            if (user) {
              userRows.push(getRow(user, status));
            } else {
              potentialMachineStatuses.push(status);
            }
          });
          return userRows;
        }).then(function (userRows) {
          return addMachineRows(orgId, potentialMachineStatuses, userRows);
        });
    }

    function getRow(userOrMachine, status) {
      // Same shape as getCSVColumnHeaders!
      return [
        getUserName(userOrMachine),
        getType(userOrMachine),
        status.connector ? status.connector.cluster_name : '',
        $translate.instant('hercules.activationStatus.' + USSService.decorateWithStatus(status)),
        status.state === 'error' && status.description ? status.description.defaultMessage : '',
        status.userId,
        status.serviceId === 'squared-fusion-uc' ? $translate.instant('hercules.serviceNames.squared-fusion-uc.full') : $translate.instant('hercules.serviceNames.' + status.serviceId)
      ];
    }

    function getUserName(userOrMachine) {
      if (!userOrMachine) {
        return $translate.instant('hercules.export.userNotFound');
      }
      return userOrMachine.userName || userOrMachine.displayName || userOrMachine.name;
    }

    function getType(userOrMachine) {
      if (!userOrMachine) {
        return '';
      }
      if (!userOrMachine.machineType) {
        return $translate.instant('common.user');
      }
      switch (userOrMachine.machineType) {
        case 'bot':
          return $translate.instant('machineTypes.bot');
        case 'room':
          return $translate.instant('machineTypes.room');
        case 'lyra_space':
          return $translate.instant('machineTypes.lyra_space');
        case 'spark_integration':
          return $translate.instant('machineTypes.spark_integration');
        case 'robot':
          return $translate.instant('machineTypes.robot');
        default:
          return '';
      }
    }
  }
})();
