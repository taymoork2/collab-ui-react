(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function (UserListService, $scope, USSService, Userservice, Log) {
        $scope.loading = true;
        $scope.exportError = true;
        $scope.exportActivated = false;
        $scope.exportPending = false;
        $scope.exportError = false;
        $scope.nothingToExport = true;

        var initStats = function () {
          $.each($scope.statusTypes, function (i, s) {
            s.progress = 0;
            if (s.count === "0") {
              s.unselectable = true;
            }
          });
        };

        // If a user has entitled=false, then its state should be shown as "not entitled" in UI
        // Will it ever happen that entitled=true while state=notActivated or deactivated ?
        var convertToUiState = function (serviceStateInfo) {
          return serviceStateInfo.entitled ? serviceStateInfo.state : "notEntitled";
        };

        USSService.getStatusesSummary(function (err, userStatusesSummary) {
          userStatusesSummary = userStatusesSummary.summary;
          var service = $.grep(userStatusesSummary, function (service) {
            return service.serviceId == $scope.selectedServiceId;
          });
          $scope.statusTypes = [{
            "stateType": "activated",
            "text": "activated",
            "count": service[0].activated.toString(),
            "selected": false,
            "unselectable": service[0].activated === 0 ? true : false,
            "progress": 0
          }, {
            "stateType": "error",
            "text": "in error",
            "count": service[0].error.toString(),
            "selected": false,
            "unselectable": service[0].error === 0 ? true : false,
            "progress": 0
          }, {
            "stateType": "notActivated",
            "text": "pending activation",
            "count": service[0].notActivated.toString(),
            "selected": false,
            "unselectable": service[0].notActivated === 0 ? true : false,
            "progress": 0
          }];

          $scope.loading = false;

        });

        var selectedStates = function () {
          var statusTypes = $.map($scope.statusTypes, function (val, i) {
            if (val.selected === true) {
              return val.stateType;
            }
          });
          return statusTypes;
        };

        var isSelected = function (state) {
          return ($.inArray(state, selectedStates()) !== -1) ? true : false;
        };

        $scope.getHeader = function () {
          return ["id", "email", $scope.selectedServiceId, "state", "message"];
        };

        $scope.selectedStateChanged = function () {
          var selected = $.grep($scope.statusTypes, function (s) {
            return (s.selected === true);
          });
          Log.debug(selected);

          $scope.nothingToExport = !selected.length;
          Log.debug("You selected", $scope.statusTypes);
        };

        $scope.exportCSV = function () {
          initStats();
          $scope.exportingUserStatusReport = true;
          $scope.userStatusResult = [];
          var getUsersBatch = function (userStatuses, index) {
            Log.debug("userStatuses", userStatuses);

            // Here, you get zero results for users not entitled...
            Userservice.getUser(userStatuses[index].userId, function (data, status) {
              if (data.success) {
                Log.debug("Found " + userStatuses[index].userId + ":");
                Log.debug("Data for user:", data);

                $scope.userStatusResult.push({
                  id: userStatuses[index].userId,
                  userName: data.userName,
                  entitled: userStatuses[index].entitled ? "Entitled" : "Not Entitled",
                  state: userStatuses[index].state,
                  message: userStatuses[index].state == "error" ? userStatuses[index].description.defaultMessage : ""

                });

              } else {
                Log.debug('Get user id=" + userStatuses[index].userId + "failed. Status: ' + status);
                $scope.userStatusResult.push({
                  id: userStatuses[index].userId,
                  userName: "username not found",
                  entitled: userStatuses[index].entitled ? "Entitled" : "Not Entitled",
                  state: userStatuses[index].state,
                  message: userStatuses[index].state == "error" ? userStatuses[index].description.defaultMessage : ""
                });
              }

              var uiState = convertToUiState(userStatuses[index]);

              $.grep($scope.statusTypes, function (s) {
                if (s.stateType == uiState) {
                  s.progress = (s.progress + 1);
                }
              });

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
              //console.info("statuses before:", statuses.userStatuses);

              Log.debug("statuses before:", statuses.userStatuses);
              // remove user statuses if its status is not among the selected ones
              statuses.userStatuses = $.grep(statuses.userStatuses, function (userStateInfo) {
                var uiState = convertToUiState(userStateInfo);
                if (isSelected(uiState)) {
                  return userStateInfo;
                }
              });
              Log.debug("statuses after:", statuses.userStatuses);

              if (err) {
                $scope.exportError = "Sorry, had serious problems getting statuses for user. Unable to export.";
              } else {
                Log.debug("statuses", statuses);
                if (statuses) {
                  //$scope.totalCount = statuses.paging.count;
                  Log.debug("userStatuses", statuses.userStatuses);
                  getUsersBatch(statuses.userStatuses, 0);
                }
                $scope.loading = false;
              }
              Log.debug($scope.userStatusResult);

            }, serviceId, null, 1000); // TODO: Hardcoded limit .... ups...

          $scope.loading = false;
          return dfd.promise();

        };

      });

})();
