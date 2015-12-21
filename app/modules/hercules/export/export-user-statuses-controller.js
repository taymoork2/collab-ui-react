(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function ($q, $timeout, serviceId, Authinfo, UiStats, UserDetails, USSService2, ClusterService) {
        var vm = this;
        vm.selectedServiceId = serviceId;
        vm.numberOfUsersPrCiRequest = 25; // can probably go higher, depending on the CI backend...
        vm.nothingToExport = true;
        vm.exportingUserStatusReport = false;
        vm.exportCanceled = false;
        var serviceInfo = _.find(USSService2.getStatusesSummary(), {
          serviceId: vm.selectedServiceId
        });
        if (serviceInfo) {
          vm.statusTypes = UiStats.insertServiceInfo(serviceInfo);
        } else {
          vm.statusTypes = [];
        }

        vm.cancelExport = function () {
          vm.exportCanceled = true;
        };

        vm.selectedStateChanged = function () {
          vm.nothingToExport = UiStats.noneSelected();
        };

        vm.getUsersBatch = function (userStatuses, index) {
          var usersPrRequest = vm.numberOfUsersPrCiRequest;
          var orgId = Authinfo.getOrgId();
          return $q(function (resolve, reject) {
            UserDetails.getUsers(userStatuses.slice(index, index + usersPrRequest), orgId, function (data) {
              _.forEach(data, function (d, ind) {
                var totalIndex = index + ind;
                if (totalIndex < userStatuses.length) {
                  UiStats.updateProgress(userStatuses[totalIndex].state);
                  vm.result.push(d.details);
                }
              });
              index += usersPrRequest;
              if (index < userStatuses.length) {
                return vm.getUsersBatch(userStatuses, index);
              } else {
                vm.exportingUserStatusReport = false;
                resolve(vm.result);
              }
            });
          });
        };

        vm.exportCSV = function () {
          UiStats.initStats();
          vm.exportingUserStatusReport = true;
          vm.loading = true;
          vm.result = [];

          // Improve formatting in all versions of Excel even if it means
          // not being 100%  CSV-valid
          // See https://github.com/asafdav/ng-csv/issues/28
          vm.result.push(['sep=,']);
          vm.result.push(UserDetails.getCSVColumnHeaders());

          // TODO: should probably be paged
          return USSService2.getStatuses(vm.selectedServiceId, null, 100000)
            .then(function (response) {
              return response.data.userStatuses;
            })
            .then(function (statuses) {
              var connectorIds = _.reduce(statuses, function (result, userStatus) {
                if (userStatus.connectorId && !_.contains(result, userStatus.connectorId)) {
                  result.push(userStatus.connectorId);
                }
                return result;
              }, []);
              if (connectorIds.length === 0) {
                vm.loading = false;
                return vm.getUsersBatch(statuses, 0);
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
                  var hostNames = _.chain(connectors).indexBy('id').mapValues('host_name').value();
                  return _.map(statuses, function (status) {
                    status.connector = hostNames[status.connectorId];
                    return status;
                  });
                })
                .then(function (statuses) {
                  return vm.getUsersBatch(statuses, 0);
                })
                .then(function (statuses) {
                  if (vm.exportCanceled) {
                    throw new Error('User Status Report download canceled');
                  }
                  return statuses;
                })
                .finally(function () {
                  vm.loading = false;
                });
            });
        };
      });
})();
