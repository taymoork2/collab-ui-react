(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserStatusesController',
      /* @ngInject */
      function ($scope, USSService, XhrNotificationService, Userservice, Log, ConnectorService) {
        $scope.saving = false;
        $scope.loading = true;
        $scope.limit = 5;

        USSService.getStatuses(function (error, statuses) {
          if (error) {
            XhrNotificationService.notify("Failed to fetch user statuses", error);
            return;
          }
          if (statuses) {
            $scope.totalCount = statuses.paging.count;
            $scope.userStatuses = [];
            var connectorIds = [];

            _.forEach(statuses.userStatuses, function (userStatus) {
              if (userStatus.connectorId && !_.contains(connectorIds, userStatus.connectorId)) {
                connectorIds.push(userStatus.connectorId)
              }
              Userservice.getUser(userStatus.userId, function (data, status) {
                if (data.success) {
                  userStatus.displayName = data.displayName || data.userName;
                  $scope.userStatuses.push(userStatus);
                  $scope.showInfoPanel = true;
                } else {
                  Log.debug('Get user failed. Status: ' + status);
                }
              });
              return status;
            });

            _.forEach(connectorIds, function (connectorId) {
              ConnectorService.getConnector(connectorId, function (err, connector) {
                if (connector) {
                  _.forEach(statuses.userStatuses, function (userStatus) {
                    if (userStatus.connectorId === connectorId) {
                      userStatus.connector = connector;
                    }
                  });
                }
              });
            });

          } else {
            $scope.totalCount = 0;
            $scope.userStatuses = [];
          }
          $scope.loading = false;
        }, $scope.selectedServiceId, 'error', $scope.limit);
      });
})();
