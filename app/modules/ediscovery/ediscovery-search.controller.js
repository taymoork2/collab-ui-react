(function () {
  'use strict';

  /* @ngInject */
  function EdiscoverySearchController($stateParams, $translate, $timeout, $scope, EdiscoveryService) {

    var vm = this;
    vm.searchForRoom = searchForRoom;
    vm.createReport = createReport;
    vm.runReport = runReport;
    vm.progressType = progressType;
    vm.cancelReport = cancelReport;
    vm.reportProgress = reportProgress;
    vm.keyPressHandler = keyPressHandler;
    vm.searchButtonDisabled = searchButtonDisabled;
    vm.downloadReport = EdiscoveryService.downloadReport;
    vm.createReportInProgress = false;

    $scope.$on('$destroy', function () {
      disableAvalonPolling();
    });

    vm.searchInProgress = false;

    vm.currentReportId = null;
    vm.searchCriteria = {
      "roomId": null, //"36de9c50-8410-11e5-8b9b-9d7d6ad1ac82",
      "startDate": null,
      "endDate": null,
      "displayName": "TBD"
    };
    vm.report = null;

    if ($stateParams.roomId) {
      vm.searchCriteria.roomId = $stateParams.roomId;
      searchForRoom($stateParams.roomId);
    }

    function getStartDate() {
      return vm.searchCriteria.startDate;
    }

    function getEndDate() {
      return vm.searchCriteria.endDate;
    }

    function setEndDate(endDate) {
      vm.searchCriteria.endDate = endDate;
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
      vm.roomInfo = null;
      vm.report = null;
      vm.error = "";
      vm.searchCriteria.roomId = roomId;
      vm.searchInProgress = true;
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
          vm.error = $translate.instant("ediscovery.searchError", {
            roomId: roomId
          });
        })
        .finally(function () {
          vm.searchInProgress = false;
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
      return (!vm.searchCriteria.roomId || vm.searchCriteria.roomId === '' || vm.searchInProgress === true);
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

    function progressType() {
      if (vm.report) {
        if (vm.report.state === 'FAILED' || vm.report.state === 'ABORTED') {
          return 'danger';
        } else {
          return 'success';
        }
      }
    }

    function reportProgress() {
      if (vm.report && (vm.report.state === 'RUNNING' || vm.report.state === 'COMPLETED')) {
        return vm.report.progress;
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
      if (event.keyCode === 13) {
        $timeout(function () {
          angular.element("#ediscoverySearchButton").trigger('click');
        });
      }
    }
  }

  function EdiscoveryGenericModalCtrl($modalInstance, title, messages) {
    var vm = this;
    vm.messages = $.isArray(messages) ? messages : [messages];
    vm.title = title;
  }

  angular
    .module('Ediscovery')
    .controller('EdiscoverySearchController', EdiscoverySearchController)
    .controller('EdiscoveryGenericModalCtrl', EdiscoveryGenericModalCtrl);
}());
