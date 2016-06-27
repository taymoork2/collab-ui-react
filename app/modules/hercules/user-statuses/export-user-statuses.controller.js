(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExportUserStatusesController', ExportUserStatusesController);

  /* @ngInject */
  function ExportUserStatusesController($scope, $q, $translate, $modalInstance, servicesId, userStatusSummary, Authinfo, UserDetails, USSService2, ClusterService, ExcelService) {
    var vm = this;
    var numberOfUsersPrCiRequest = 50; // can probably go higher, depending on the CI backend...
    var numberOfUsersPrUssRequest = 500;

    vm.exportingUserStatusReport = false;
    vm.exportCanceled = false;

    vm.statusTypes = getStatusTypes();
    vm.nothingToExport = nothingToExport;
    vm.cancelExport = cancelExport;
    vm.exportCSV = exportCSV;

    $scope.$on('$destroy', function () {
      vm.exportCanceled = true;
    });

    function exportCSV() {
      vm.exportingUserStatusReport = true;
      var selectedTypes = _.chain(vm.statusTypes)
        .filter(function (status) {
          return status.selected && status.count;
        })
        .map('stateType')
        .value();

      return getAllUserStatuses(servicesId, selectedTypes)
        .then(_.flatten)
        .then(addConnectorsDetails)
        .then(replaceWithDetails)
        .then(function (statuses) {
          if (vm.exportCanceled) {
            return $q.reject('User Status Report download canceled');
          }
          return statuses;
        })
        .then(function (statuses) {
          return ExcelService.createFile(UserDetails.getCSVColumnHeaders(), statuses);
        })
        .then(function (data) {
          var filename = 'user_statuses.csv';
          ExcelService.downloadFile(filename, data);
          $modalInstance.close();
        })
        .finally(function () {
          vm.exportingUserStatusReport = false;
        });
    }

    function cancelExport() {
      vm.exportCanceled = true;
    }

    function replaceWithDetails(statuses) {
      // This idea of replacing statuses by value to please the CSV export
      // inside UserDetails.getUsers is a bad idea, but it is legacy.
      // The code should be cleaned up, one commit after another
      return getUsersDetails(statuses, 0, numberOfUsersPrCiRequest);
    }

    function getUsersDetails(statuses, offset, limit) {
      var orgId = Authinfo.getOrgId();
      var statusesList = statuses.slice(offset, offset + limit);
      var total = statuses.length;

      return UserDetails.getUsers(orgId, statusesList)
        .then(function (response) {
          if (offset + limit < total) {
            return getUsersDetails(statuses, offset + limit, limit)
              .then(function (innerResponse) {
                return response.concat(innerResponse);
              });
          } else {
            return response;
          }
        });
    }

    function addConnectorsDetails(statuses) {
      var connectorIds = _.reduce(statuses, function (result, userStatus) {
        if (userStatus.connectorId && !_.includes(result, userStatus.connectorId)) {
          result.push(userStatus.connectorId);
        }
        return result;
      }, []);

      if (connectorIds.length === 0) {
        // we have nothing to do
        return $q.when(statuses);
      }

      // Get more information about the connector IDs we collected
      var promises = _.map(connectorIds, function (connectorId) {
        return ClusterService.getConnector(connectorId)
          .catch(function () {
            // recover from not finding the connector on the server
            return {
              id: connectorId,
              host_name: null
            };
          });
      });
      return $q.all(promises)
        .then(function (connectors) {
          // convert response to a more usable data structure
          var hostNames = _.chain(connectors)
            .indexBy('id')
            .mapValues('host_name')
            .value();
          // augment statuses with details about the connectors
          return _.map(statuses, function (status) {
            status.connector = hostNames[status.connectorId];
            return status;
          });
        });
    }

    function getUserStatuses(service, type, offset, limit) {
      return USSService2.getStatuses(service, type, offset, limit)
        .then(function (response) {
          if (offset + limit < response.paging.count) {
            return getUserStatuses(service, type, offset + limit, limit)
              .then(function (statuses) {
                return response.userStatuses.concat(statuses);
              });
          } else {
            return response.userStatuses;
          }
        });
    }

    function getAllUserStatuses(services, types) {
      var requestList = _.chain(services)
        .map(function (service) {
          return _.map(types, function (type) {
            return getUserStatuses(service, type, 0, numberOfUsersPrUssRequest);
          });
        })
        .flatten()
        .value();
      return $q.all(requestList);
    }

    function getStatusTypes() {
      return formatStatusTypes(userStatusSummary);
    }

    function formatStatusTypes(summary) {
      return [{
        stateType: 'activated',
        text: $translate.instant('hercules.activationStatus.activated'),
        count: summary.activated,
        selected: false,
        unselectable: summary.activated === 0
      }, {
        stateType: 'notActivated',
        text: $translate.instant('hercules.activationStatus.pending_activation'),
        count: summary.notActivated,
        selected: true,
        unselectable: summary.notActivated === 0
      }, {
        stateType: 'error',
        text: $translate.instant('hercules.activationStatus.error'),
        count: summary.error,
        selected: true,
        unselectable: summary.error === 0
      }];
    }

    function nothingToExport() {
      return _.chain(vm.statusTypes)
        .filter(function (status) {
          return !status.unselectable;
        })
        .every(function (status) {
          return !status.selected;
        })
        .value();
    }
  }

})();
