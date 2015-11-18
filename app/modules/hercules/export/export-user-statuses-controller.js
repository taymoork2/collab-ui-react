(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function (Authinfo, UiStats, UserDetails, $scope, $rootScope, USSService, ClusterService, Log) {
        $scope.numberOfUsersPrCiRequest = 25; // can probably go higher, depending on the CI backend...
        $scope.loading = true;
        $scope.exportError = false;
        $scope.nothingToExport = true;
        USSService.getStatusesSummary(function (err, userStatusesSummary) {
          userStatusesSummary = userStatusesSummary.summary;
          var serviceInfo = $.grep(userStatusesSummary, function (service) {
            return service.serviceId == $scope.selectedServiceId;
          });
          $scope.statusTypes = UiStats.insertServiceInfo(serviceInfo[0]);
          $scope.loading = false;
        });

        $scope.getHeader = function () {
          var service = $.grep(Authinfo.getServices(), function (s) {
            return s.ciName === $scope.selectedServiceId;
          });
          return UserDetails.getCSVColumnHeaders(service[0].displayName);
        };

        $scope.selectedStateChanged = function () {
          $scope.nothingToExport = UiStats.noneSelected();
        };

        $scope.getUsersBatch = function (userStatuses, index, dfd) {
          var usersPrRequest = $scope.numberOfUsersPrCiRequest;
          var orgId = Authinfo.getOrgId();
          UserDetails.getUsers(userStatuses.slice(index, index + usersPrRequest), orgId, function (data, status) {

            $.each(data, function (ind, d) {
              var totalIndex = index + ind;
              if (totalIndex < userStatuses.length) {
                UiStats.updateProgress(userStatuses[totalIndex].state);
                $scope.userStatusResult.push(d.details);
              }
            });

            index += usersPrRequest;
            if (index < userStatuses.length) {
              $scope.getUsersBatch(userStatuses, index, dfd);
            } else {
              $scope.exportingUserStatusReport = false;
              dfd.resolve($scope.userStatusResult);
            }
            return false;
          });
        };

        $scope.exportCSV = function () {
          UiStats.initStats();
          $scope.exportingUserStatusReport = true;
          $scope.userStatusResult = [];

          $scope.loading = true;
          var serviceId = $scope.selectedServiceId;
          var dfd = $.Deferred();

          USSService.getStatuses(
            function (err, statuses) {
              //console.log("statuses before:", statuses.userStatuses);

              // TODO: REMOVE SPECIAL HANDLING FOR UNIT TEST !!!!!
              if (!$scope.test) {
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
                $scope.getUsersBatch(statuses.userStatuses, 0, dfd);
                $scope.loading = false;
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
                    $scope.getUsersBatch(statuses.userStatuses, 0, dfd);
                    $scope.loading = false;
                  }
                }).catch(function (error) {
                  // connector i.e. found... collect potential user info anyway...?
                  if (ind + 1 == connectorIds.length) {
                    $scope.getUsersBatch(statuses.userStatuses, 0, dfd);
                    $scope.loading = false;
                  }
                });
              });

            }, serviceId, null, 100000); // TODO: should be paged? How does this scale ?

          $scope.loading = false;
          return dfd.promise();

        };

      });

})();
