(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExportUserStatusesController', ExportUserStatusesController);

  /* @ngInject */
  function ExportUserStatusesController($q, serviceId, userStatusSummary, Authinfo, UiStats, UserDetails, USSService2, ClusterService, ExcelService) {
    var vm = this;
    var numberOfUsersPrCiRequest = 50; // can probably go higher, depending on the CI backend...

    vm.selectedServiceId = serviceId;
    vm.exportingUserStatusReport = false;
    vm.exportCanceled = false;
    vm.result = [];

    vm.statusTypes = getStatusTypes();
    vm.nothingToExport = nothingToExport;
    vm.cancelExport = cancelExport;
    vm.exportCSV = exportCSV;

    function exportCSV() {
      vm.exportingUserStatusReport = true;

      // TODO: replace null by what has really been selected in the UI…
      return getStatuses(vm.selectedServiceId, null)
        .then(addConnectorsDetails)
        .then(replaceWithDetails)
        .then(function (statuses) {
          if (vm.exportCanceled) {
            return $q.reject('User Status Report download canceled');
          }
          vm.result = vm.result.concat(statuses);
          return vm.result;
        })
        .then(function (statuses) {
          return ExcelService.createFile(UserDetails.getCSVColumnHeaders(), statuses);
        })
        .then(function (data) {
          var filename = 'export_user_statuses_SERVICE_STATUS.csv';
          ExcelService.downloadFile(filename, data);
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
      // inside UserDetails.getUsers is a bad idea, but it is legacy and
      // the code is being and the code is cleaned up commit after commit
      return getUsersDetails(statuses);
    }

    function getUsersDetails(statuses) {
      var orgId = Authinfo.getOrgId();
      var totalStatuses = statuses.length;

      return $q(function (resolve, reject) {
        var result = [];

        function getDetails(offset, limit, callback) {
          var statusesList = statuses.slice(offset, offset + numberOfUsersPrCiRequest);
          // Here is a good place to amit an updateProgress
          UserDetails.getUsers(statusesList, orgId, function (response) {
            result = result.concat(response);
            var newOffset = offset + limit;
            if (newOffset > totalStatuses) {
              callback(result);
            } else {
              getDetails(newOffset, limit, callback);
            }
          });
        }

        getDetails(0, numberOfUsersPrCiRequest, function (responses) {
          var result = responses.map(function (response) {
            return response.details;
          });
          resolve(result);
        });
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
          var hostNames = _.chain(connectors).indexBy('id').mapValues('host_name').value();
          // augment statuses with details about the connectors
          return _.map(statuses, function (status) {
            status.connector = hostNames[status.connectorId];
            return status;
          });
        });
    }

    // Note: this code would actually look simpler if USSService2.getStatuses
    // was accepting a callback and not just returning a promise…
    function getStatuses(serviceId, states) {
      return $q(function (resolve, reject) {
        var statuses = [];
        var limit = 1000;
        USSService2.getStatuses(serviceId, states, 0, limit)
          .then(function (response) {
            statuses = statuses.concat(response.userStatuses);
            if (response.paging.pages > 1) {
              var remainingPages = _.range(response.paging.pages - 1)
                .map(function (item, i) {
                  return USSService2.getStatuses(serviceId, states, (i + 1) * limit, limit);
                });
              $q.all(remainingPages)
                .then(function (results) {
                  var remainingUserStatuses = results.reduce(function (acc, result) {
                    return acc.concat(result.userStatuses);
                  }, []);
                  statuses = statuses.concat(remainingUserStatuses);
                  resolve(statuses);
                }, reject);
            } else {
              resolve(statuses);
            }
          }, reject);
      });
    }

    function getStatusTypes() {
      var serviceInfo = userStatusSummary;
      return serviceInfo ? UiStats.insertServiceInfo(serviceInfo) : [];
    }

    function nothingToExport() {
      return _.filter(vm.statusTypes, function (status) {
        return !status.unselectable;
      }).every(function (status) {
        return !status.selected;
      });
    }
  }

})();
