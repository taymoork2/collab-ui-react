(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function (Authinfo, UiStats, StatusFilter, UserDetails, UserListService, $scope, USSService, Userservice, Log) {
        $scope.loading = true;

        $scope.exportError = true;

        $scope.exportActivated = false;
        $scope.exportPending = false;
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
          return ["id", "email", service[0].displayName, "state", "message"];
        };

        $scope.selectedStateChanged = function () {
          $scope.nothingToExport = UiStats.noneSelected();
        };

        $scope.exportCSV = function () {
          UiStats.initStats();
          $scope.exportingUserStatusReport = true;
          $scope.userStatusResult = [];
          var getUsersBatch = function (userStatuses, index) {

            UserDetails.getUsers(userStatuses[index], function (data, status) {

              $scope.userStatusResult.push(data.details);

              var uiState = StatusFilter.convertToUiState(userStatuses[index]);
              UiStats.updateProgress(uiState);

              index++;
              if (index < userStatuses.length) {
                getUsersBatch(userStatuses, index);
              } else {
                Log.debug("resolved after " + index + " users");
                $scope.exportingUserStatusReport = false;
                dfd.resolve($scope.userStatusResult);
              }
              return false;
            });
          };

          $scope.loading = true;
          var serviceId = $scope.selectedServiceId;
          var dfd = $.Deferred();
          USSService.getStatuses(
            function (err, statuses) {
              Log.debug("statuses before:", statuses.userStatuses);
              // remove user statuses if its status is not among the selected ones
              statuses.userStatuses = $.grep(statuses.userStatuses, function (userStateInfo) {
                var uiState = StatusFilter.convertToUiState(userStateInfo);
                if (UiStats.isSelected(uiState)) {
                  return userStateInfo;
                }
              });
              Log.debug("statuses after:", statuses.userStatuses);

              if (err) {
                $scope.exportError = "Sorry, had serious problems getting statuses for user. Unable to export.";
              } else {
                Log.debug("statuses", statuses);
                if (statuses) {
                  getUsersBatch(statuses.userStatuses, 0);
                }
                $scope.loading = false;
              }
            }, serviceId, null, 1000); // TODO: Hardcoded limit .... ups...

          $scope.loading = false;
          return dfd.promise();

        };

      });

})();
