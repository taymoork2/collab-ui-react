(function () {
  'use strict';

  module.exports = UserDetails;

  /* @ngInject  */
  function UserDetails($http, $translate, UrlConfig, USSService, $q) {
    return {
      getCSVColumnHeaders: getCSVColumnHeaders,
      getUsers: getUsers,
      // exported for testing purpose
      multipleUserFilter: multipleUserFilter,
      userUrl: userUrl,
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

    function getCSVColumnHeaders(includeResourceGroupColumn) {
      var columnHeaders = [$translate.instant('common.user'),
        $translate.instant('common.type'),
        $translate.instant('cloudExtensions.cluster'),
        $translate.instant('cloudExtensions.status'),
        $translate.instant('cloudExtensions.details'),
        $translate.instant('common.id'),
        $translate.instant('common.service')];
      if (includeResourceGroupColumn) {
        columnHeaders.splice(3, 0, $translate.instant('hercules.resourceGroups.resourceGroupHeading'));
      }
      return columnHeaders;
    }

    function addMachineRows(orgId, statuses, userRows, progress) {
      var machineIds = _.map(statuses, 'userId');
      if (_.size(machineIds) === 0) {
        return $q.resolve(userRows);
      }
      return $http.get(machineUrl(orgId, machineIds))
        .then(function (response) {
          var machineRows = [];
          var data = _.get(response, 'data.data');
          if (data) {
            machineRows = _.map(statuses, function (status) {
              var machine = _.find(data, { id: status.userId });
              return getRow(machine, status);
            });
          }
          progress.current += machineRows.length;
          return userRows.concat(machineRows);
        });
    }

    function getUsers(orgId, statuses, progress, includeResourceGroupColumn) {
      var userIds = _.map(statuses, 'userId');
      if (_.size(userIds) === 0) {
        return $q.resolve([]);
      }
      var potentialMachineStatuses = [];
      return $http.get(userUrl(orgId, userIds))
        .then(function (response) {
          var data = response.data;
          var userRows = [];
          _.forEach(statuses, function (status) {
            var user = _.find(data.Resources, { id: status.userId });
            if (user) {
              userRows.push(getRow(user, status, includeResourceGroupColumn));
              progress.current += 1;
            } else {
              potentialMachineStatuses.push(status);
            }
          });
          return userRows;
        }).then(function (userRows) {
          return addMachineRows(orgId, potentialMachineStatuses, userRows, progress);
        });
    }

    function getRow(userOrMachine, status, includeResourceGroupColumn) {
      // Same shape as getCSVColumnHeaders!
      var row = [
        getUserName(userOrMachine),
        getType(userOrMachine),
        getClusterAndHost(status),
        $translate.instant('hercules.activationStatus.' + USSService.decorateWithStatus(status)),
        flattenMessages(status.messages),
        status.userId,
        status.serviceId === 'squared-fusion-uc' ? $translate.instant('hercules.hybridServiceNames.squared-fusion-uc.full') : $translate.instant('hercules.hybridServiceNames.' + status.serviceId),
      ];
      if (includeResourceGroupColumn) {
        row.splice(3, 0, status.resourceGroup ? status.resourceGroup.name : '');
      }
      return row;
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

    function getClusterAndHost(status) {
      if (status.serviceId === 'squared-fusion-o365') {
        return $translate.instant('common.ciscoCollaborationCloud');
      } else if (!status.cluster) {
        return '';
      }
      return status.cluster.name + (status.connector && status.connector.hostname ? ' (' + status.connector.hostname + ')' : '');
    }

    function flattenMessages(messages) {
      if (!messages || messages.length === 0) {
        return '';
      }
      return _.chain(messages)
        .map(function (message) {
          var severity = translateSeverity(message.severity);
          var title = message.title ? message.title + ' - ' : '';
          return severity + ': ' + title + message.description;
        })
        .join(' | ')
        .value();
    }

    function translateSeverity(severity) {
      switch (severity) {
        case 'error':
          return $translate.instant('common.error');
        case 'warning':
          return $translate.instant('common.warning');
        default:
          return $translate.instant('common.info');
      }
    }
  }
})();
