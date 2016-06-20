(function () {
  'use strict';

  /* @ngInject */
  function EdiscoverySearchController($stateParams, $translate, $timeout, $scope, EdiscoveryService, $window) {
    $scope.$on('$viewContentLoaded', function () {
      angular.element('#searchInput').focus();
    });
    var vm = this;
    vm.searchForRoom = searchForRoom;
    vm.createReport = createReport;
    vm.runReport = runReport;
    vm.cancelReport = cancelReport;
    vm.reportProgress = reportProgress;
    vm.keyPressHandler = keyPressHandler;
    vm.searchButtonDisabled = searchButtonDisabled;
    vm.prettyPrintBytes = EdiscoveryService.prettyPrintBytes;
    vm.downloadReport = EdiscoveryService.downloadReport;
    vm.createReportInProgress = false;
    vm.searchingForRoom = false;
    vm.searchInProgress = false;
    vm.currentReportId = null;

    init($stateParams.report, $stateParams.reRun);

    $scope.$on('$destroy', function () {
      disableAvalonPolling();
    });

    function init(report, reRun) {
      vm.report = null;
      vm.error = null;
      if (report) {
        vm.roomInfo = { id: report.roomQuery.roomId, displayName: report.displayName };
        vm.searchCriteria = {
          "roomId": report.roomQuery.roomId,
          "startDate": report.roomQuery.startDate,
          "endDate": report.roomQuery.endDate,
          "displayName": report.displayName
        };
        if (!reRun) {
          vm.report = report;
          vm.currentReportId = report.id;
          enableAvalonPolling();
        }
      } else {
        vm.searchCriteria = {};
        vm.roomInfo = null;
      }
    }

    function getStartDate() {
      return vm.searchCriteria.startDate;
    }

    function getEndDate() {
      return vm.searchCriteria.endDate;
    }

    function dateErrors(start, end) {
      var errors = [];

      if (moment(start).isAfter(moment(end))) {
        errors.push($translate.instant("ediscovery.dateError.StartDateMustBeforeEndDate"));
      }
      if (moment(start).isAfter(moment())) {
        errors.push($translate.instant("ediscovery.dateError.StartDateCannotBeInTheFuture"));
      }
      return errors;
    }

    function validateDate() {
      vm.dateValidationError = null;
      var errors = dateErrors(getStartDate(), getEndDate());
      if (errors.length > 0) {
        vm.dateValidationError = {
          errors: errors
        };
        return false;
      } else {
        return true;
      }
    }

    $scope.$on('$destroy', function () {
      $timeout.cancel(avalonPoller);
    });

    $scope.$watch(getStartDate, function (startDate) {
      validateDate();
    });

    $scope.$watch(getEndDate, function (endDate) {
      validateDate();
    });

    function searchForRoom(roomId) {
      disableAvalonPolling();
      vm.roomInfo = null;
      vm.report = null;
      vm.error = null;
      vm.searchCriteria.roomId = roomId;
      vm.searchingForRoom = true;
      EdiscoveryService.getAvalonServiceUrl(roomId)
        .then(function (result) {
          return EdiscoveryService.getAvalonRoomInfo(result.avalonRoomsUrl + '/' + roomId);
        })
        .then(function (result) {
          vm.roomInfo = result;
          vm.searchCriteria.startDate = vm.searchCriteria.startDate || $stateParams.startDate || result.published;
          vm.searchCriteria.endDate = vm.searchCriteria.endDate || $stateParams.endDate || result.lastReadableActivityDate;
          vm.searchCriteria.displayName = result.displayName;
        })
        .catch(function (err) {
          if (err.status === 400) {
            vm.error = $translate.instant("ediscovery.invalidRoomId", {
              roomId: roomId
            });
          } else {
            vm.error = $translate.instant("ediscovery.searchError", {
              roomId: roomId
            });
          }
        })
        .finally(function () {
          vm.searchingForRoom = false;
        });
    }

    function createReport() {
      vm.report = {
        id: vm.searchCriteria.roomId,
        displayName: vm.searchCriteria.displayName,
        state: 'INIT',
        progress: 0
      };
      disableAvalonPolling();
      vm.errors = [];

      EdiscoveryService.createReport(vm.searchCriteria.displayName, vm.searchCriteria.roomId, vm.searchCriteria.startDate, vm.searchCriteria.endDate)
        .then(function (res) {
          vm.currentReportId = res.id;
          runReport(res.runUrl, res.url);
        })
        .catch(function (err) {
          vm.errors = err.data.errors;
          vm.report = {};
          vm.createReportInProgress = false;
        });
    }

    var avalonPoller;

    function enableAvalonPolling() {
      $timeout.cancel(avalonPoller);
      pollAvalonReport();
    }

    function disableAvalonPolling() {
      $timeout.cancel(avalonPoller);
    }

    function searchButtonDisabled() {
      return (!vm.searchCriteria.roomId || vm.searchCriteria.roomId === '' || vm.searchingForRoom === true);
    }

    function pollAvalonReport() {
      // TODO: Implement proper handling of error when final API is in place
      EdiscoveryService.getReport(vm.currentReportId).then(function (report) {
        vm.report = report;
        vm.createReportInProgress = false;
        if (report.state != 'COMPLETED' && report.state != 'FAILED' && report.state != 'ABORTED') {
          avalonPoller = $timeout(pollAvalonReport, 2000);
        } else {
          disableAvalonPolling();
        }
      }).catch(function (err) {
        // TODO: Proper error handling when final API is ready
        disableAvalonPolling();
      });
    }

    function runReport(runUrl, url) {
      // Expect this API to be changed when Avalon updates their API
      EdiscoveryService.runReport(runUrl, vm.searchCriteria.roomId, url)
        .then(function (res) {
          enableAvalonPolling();
        })
        .catch(function (err) {
          // TODO: Proper error handling when final API is ready
          disableAvalonPolling();
        });
    }

    function reportProgress() {
      if (vm.report && (vm.report.state === 'RUNNING' || vm.report.state === 'COMPLETED')) {
        return vm.report.progress || 0;
      } else {
        return 0;
      }
    }

    function cancelReport(id) {
      EdiscoveryService.patchReport(id, {
        state: "ABORTED"
      }).then(function (res) {
        pollAvalonReport();
      });
    }

    function keyPressHandler(event) {
      var ESC = 27;
      var ENTER = 13;
      var activeElement = angular.element($window.document.activeElement);
      var inputFieldHasFocus = activeElement[0]["id"] === "searchInput";
      if (!inputFieldHasFocus || !(event.keyCode === ESC || event.keyCode === ENTER)) {
        return; // if not escape and enter, nothing to do
      }
      switch (event.keyCode) {
      case ESC:
        init();
        break;

      case ENTER:
        $timeout(function () {
          angular.element("#ediscoverySearchButton").trigger('click');
        });
        break;
      }
    }
  }
  angular
    .module('Ediscovery')
    .controller('EdiscoverySearchController', EdiscoverySearchController);
}());
