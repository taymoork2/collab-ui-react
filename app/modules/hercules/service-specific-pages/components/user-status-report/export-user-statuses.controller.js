(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExportUserStatusesController', ExportUserStatusesController);

  /* @ngInject */
  function ExportUserStatusesController($scope, $q, $translate, $modalInstance, userStatusSummary, Authinfo, UserDetails, USSService, HybridServicesClusterService, ExcelService, ResourceGroupService) {
    var vm = this;
    var numberOfUsersPrCiRequest = 50; // can probably go higher, depending on the CI backend...

    vm.exportingUserStatusReport = false;
    vm.includeResourceGroupColumn = false;
    vm.progress = {
      total: 0,
      current: 0,
      message: $translate.instant('hercules.export.readingUserStatuses'),
      exportCanceled: false,
    };

    vm.statusTypes = getStatusTypes();
    vm.nothingToExport = nothingToExport;
    vm.cancelExport = cancelExport;
    vm.exportCSV = exportCSV;

    $scope.$on('$destroy', function () {
      cancelExport();
    });

    function exportCSV() {
      vm.exportingUserStatusReport = true;
      var selectedTuples = _.chain(vm.statusTypes)
        .flatten()
        .filter(function (status) {
          return status.selected && status.count;
        })
        .map(function (item) {
          return {
            service: item.id,
            type: item.stateType,
            count: item.count,
          };
        })
        .value();

      vm.progress.total = _.sum(_.map(selectedTuples, 'count'));

      return getAllUserStatuses(selectedTuples)
        .then(_.flatten)
        .then(addClusterAndConnectorsDetails)
        .then(addResourceGroupNames)
        .then(replaceWithDetails)
        .then(function (statuses) {
          if (vm.progress.exportCanceled) {
            return $q.reject('User Status Report download canceled');
          }
          return statuses;
        })
        .then(function (statuses) {
          return ExcelService.createFile(UserDetails.getCSVColumnHeaders(vm.includeResourceGroupColumn), statuses);
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
      vm.progress.exportCanceled = true;
    }

    function replaceWithDetails(statuses) {
      // This idea of replacing statuses by value to please the CSV export
      // inside UserDetails.getUsers is a bad idea, but it is legacy.
      // The code should be cleaned up, one commit after another
      vm.progress.message = $translate.instant('hercules.export.prepareFile');
      return getUsersDetails(statuses, 0, numberOfUsersPrCiRequest);
    }

    function getUsersDetails(statuses, offset, limit) {
      if (vm.progress.exportCanceled) {
        return $q.resolve(statuses);
      }
      var orgId = Authinfo.getOrgId();
      var statusesList = statuses.slice(offset, offset + limit);
      var total = statuses.length;

      return UserDetails.getUsers(orgId, statusesList, vm.progress, vm.includeResourceGroupColumn)
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

    function addClusterAndConnectorsDetails(statuses) {
      vm.progress.message = $translate.instant('hercules.export.readingConnectors');
      if (_.every(statuses, function (userStatus) { return !userStatus.clusterId; })) {
        // we have nothing to do
        return $q.resolve(statuses);
      }
      return HybridServicesClusterService.getAll()
        .then(function (clusterList) {
          var clustersById = _.chain(clusterList)
            .keyBy('id')
            .value();
          // augment statuses with details about the cluster/connector the user is homed on
          return _.map(statuses, function (status) {
            status.cluster = clustersById[status.clusterId];
            status.connector = status.cluster ? _.find(status.cluster.connectors, { id: status.connectorId }) : undefined;
            return status;
          });
        });
    }

    function addResourceGroupNames(statuses) {
      return ResourceGroupService.getAll().then(function (resourceGroups) {
        if (_.size(resourceGroups) > 0) {
          vm.includeResourceGroupColumn = true;
          return _.map(statuses, function (status) {
            if (status.resourceGroupId) {
              status.resourceGroup = _.find(resourceGroups, { id: status.resourceGroupId });
            }
            return status;
          });
        }
        return statuses;
      });
    }

    function getAllUserStatuses(tuples) {
      var requestList = _.chain(tuples)
        .map(function (tuple) {
          return USSService.getAllStatuses(tuple.service, tuple.type)
            .then(function (userStatuses) {
              return userStatuses.map(function (userStatus) {
                if (userStatus.serviceId === 'squared-fusion-cal' && userStatus.owner === 'ccc') {
                  userStatus.serviceId = 'squared-fusion-o365';
                }
                return userStatus;
              });
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
      return _.map(summary, function (service) {
        return [{
          id: service.serviceId,
          stateType: 'activated',
          text: $translate.instant('hercules.activationStatus.activated'),
          count: service.activated,
          selected: false,
          unselectable: service.activated === 0,
        }, {
          id: service.serviceId,
          stateType: 'notActivated',
          text: $translate.instant('hercules.activationStatus.pending_activation'),
          count: service.notActivated,
          selected: service.notActivated > 0,
          unselectable: service.notActivated === 0,
        }, {
          id: service.serviceId,
          stateType: 'error',
          text: $translate.instant('hercules.activationStatus.error'),
          count: service.error,
          selected: service.error > 0,
          unselectable: service.error === 0,
        }];
      });
    }

    function nothingToExport() {
      return _.chain(vm.statusTypes)
        .flatten()
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
