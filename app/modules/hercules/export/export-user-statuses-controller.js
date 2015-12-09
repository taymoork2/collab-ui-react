(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function (serviceId, Authinfo, UiStats, UserDetails, USSService, ClusterService, Log) {
        var vm = this;
        vm.selectedServiceId = serviceId;
        vm.numberOfUsersPrCiRequest = 25; // can probably go higher, depending on the CI backend...
        vm.loading = true;
        vm.exportError = false;
        vm.nothingToExport = true;
        vm.exportingUserStatusReport = false;
        USSService.getStatusesSummary(function (err, userStatusesSummary) {
          userStatusesSummary = userStatusesSummary.summary;
          var serviceInfo = $.grep(userStatusesSummary, function (service) {
            return service.serviceId == vm.selectedServiceId;
          });
          vm.statusTypes = UiStats.insertServiceInfo(serviceInfo[0]);
          vm.loading = false;
        });

        vm.getHeader = function () {
          var service = $.grep(Authinfo.getServices(), function (s) {
            return s.ciName === vm.selectedServiceId;
          });
          return UserDetails.getCSVColumnHeaders(service[0].displayName);
        };

        vm.selectedStateChanged = function () {
          vm.nothingToExport = UiStats.noneSelected();
        };

        vm.getUsersBatch = function (userStatuses, index, dfd) {
          var usersPrRequest = vm.numberOfUsersPrCiRequest;
          var orgId = Authinfo.getOrgId();
          UserDetails.getUsers(userStatuses.slice(index, index + usersPrRequest), orgId, function (data, status) {

            $.each(data, function (ind, d) {
              var totalIndex = index + ind;
              if (totalIndex < userStatuses.length) {
                UiStats.updateProgress(userStatuses[totalIndex].state);
                vm.userStatusResult.push(d.details);
              }
            });

            index += usersPrRequest;
            if (index < userStatuses.length) {
              vm.getUsersBatch(userStatuses, index, dfd);
            } else {
              vm.exportingUserStatusReport = false;
              dfd.resolve(vm.userStatusResult);
            }
            return false;
          });
        };

        vm.exportCSV = function () {
          UiStats.initStats();
          vm.exportingUserStatusReport = true;
          vm.userStatusResult = [];

          vm.loading = true;
          var serviceId = vm.selectedServiceId;
          var dfd = $.Deferred();

          USSService.getStatuses(
            function (err, statuses) {
              //console.log("statuses before:", statuses.userStatuses);

              // TODO: REMOVE SPECIAL HANDLING FOR UNIT TEST !!!!!
              if (!vm.test) {
                //remove user statuses if its status is not among the selected ones
                statuses.userStatuses = $.grep(statuses.userStatuses, function (userStateInfo) {
                  if (UiStats.isSelected(userStateInfo.state)) {
                    return userStateInfo;
                  }
                });
              }
              //console.log("statuses after:", statuses.userStatuses);

              var connectorIds = [];
              $.each(statuses.userStatuses, function (ind, userStatus) {
                if (userStatus.connectorId && !_.contains(connectorIds, userStatus.connectorId)) {
                  connectorIds.push(userStatus.connectorId);
                }
              });

              if (connectorIds.length === 0) {
                vm.getUsersBatch(statuses.userStatuses, 0, dfd);
                vm.loading = false;
              }
              $.each(connectorIds, function (ind, connectorId) {
                ClusterService.getConnector(connectorId).then(function (connector) {
                  if (connector) {
                    _.forEach(statuses.userStatuses, function (userStatus) {
                      if (userStatus.connectorId === connectorId) {
                        userStatus.connector = connector.host_name;
                      } else {
                        userStatus.connector = "?";
                      }
                    });
                  }
                  if (ind + 1 == connectorIds.length) {
                    vm.getUsersBatch(statuses.userStatuses, 0, dfd);
                    vm.loading = false;
                  }
                }).catch(function (error) {
                  // connector i.e. found... collect potential user info anyway...?
                  if (ind + 1 == connectorIds.length) {
                    vm.getUsersBatch(statuses.userStatuses, 0, dfd);
                    vm.loading = false;
                  }
                });
              });

            }, serviceId, null, 100000); // TODO: should be paged? How does this scale ?

          vm.loading = false;
          return dfd.promise();
        };
      });
})();
