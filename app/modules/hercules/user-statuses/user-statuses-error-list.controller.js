(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UserErrorsController', UserErrorsController);

  /* @ngInject */
  function UserErrorsController($modal, $scope, servicesId, userStatusSummary, USSService, XhrNotificationService, Userservice, ClusterService) {
    var vm = this;
    vm.loading = true;
    vm.limit = 5;
    vm.serviceId = servicesId[0];
    vm.openUserStatusReportModal = openUserStatusReportModal;

    USSService.getStatuses(function (error, statuses) {
      if (error) {
        XhrNotificationService.notify('Failed to fetch user statuses', error);
        return;
      }
      if (statuses) {
        vm.totalCount = statuses.paging.count;
        vm.userStatuses = [];
        var connectorIds = [];

        _.forEach(statuses.userStatuses, function (userStatus) {
          if (userStatus.connectorId && !_.contains(connectorIds, userStatus.connectorId)) {
            connectorIds.push(userStatus.connectorId);
          }
          Userservice.getUser(userStatus.userId, function (data, status) {
            if (data.success) {
              userStatus.displayName = data.displayName || data.userName;
              userStatus.emailAddress = data.emails[0].value;
              vm.userStatuses.push(userStatus);
            }
          });
        });

        _.forEach(connectorIds, function (connectorId) {
          ClusterService.getConnector(connectorId).then(function (connector) {
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
        vm.totalCount = 0;
        vm.userStatuses = [];
      }
      vm.loading = false;
    }, vm.serviceId, 'error', vm.limit);

    function openUserStatusReportModal(serviceId) {
      // $scope.modal.close();
      $scope.close = function () {
        $scope.$parent.modal.close();
      };
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/user-statuses/export-user-statuses.html',
        resolve: {
          servicesId: function () {
            return [serviceId];
          },
          userStatusSummary: function () {
            return userStatusSummary;
          }
        }
      });
    }
  }
}());
