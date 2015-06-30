(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function (Authinfo, UiStats, UserDetails, $scope, $rootScope, USSService, Log) {
        $scope.numberOfUsersPrCiRequest = 1;
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
          return ["id", "email", service[0].displayName + " state", "message"];
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
              // remove user statuses if its status is not among the selected ones
              // TODO: REMOVE SPECIAL HANDLING FOR UNIT TEST !!!!!
              if (!$scope.test) {
                statuses.userStatuses = $.grep(statuses.userStatuses, function (userStateInfo) {
                  if (UiStats.isSelected(userStateInfo.state)) {
                    return userStateInfo;
                  }
                });
              }
              //console.log("statuses after:", statuses.userStatuses);

              if (err) {
                $scope.exportError = "Sorry, had serious problems getting statuses for user. Unable to export.";
                dfd.resolve($scope.exportError);
              } else {
                if (statuses) {
                  $scope.getUsersBatch(statuses.userStatuses, 0, dfd);
                }
                $scope.loading = false;
              }
            }, serviceId, null, 1000); // TODO: Hardcoded limit .... ups...

          $scope.loading = false;
          return dfd.promise();

        };

      });

})();
