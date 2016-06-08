(function () {
  'use strict';

  /* @ngInject */
  function EdiscoverySearchController($translate, $timeout, $scope, $modal, EdiscoveryService, $window) {

    var vm = this;
    vm.searchForRoom = searchForRoom;
    vm.createReport = createReport;
    vm.runReport = runReport;
    vm.progressType = progressType;
    vm.downloadReport = downloadReport;
    vm.cancelReport = cancelReport;
    vm.reportProgress = reportProgress;
    vm.keyPressHandler = keyPressHandler;
    vm.searchButtonDisabled = searchButtonDisabled;

    $scope.$on('$destroy', function () {
      disableAvalonPolling();
    });

    vm.searchInProgress = false;
    vm.searchCriteria = {
      "roomId": "", //36de9c50-8410-11e5-8b9b-9d7d6ad1ac82",
      "startDate": null, //moment(moment()).add(-7, 'days'), // week
      "endDate": null, //moment(),
      "displayName": "TBD"
    };
    vm.report = null;

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

    function openGenericModal(title, messages) {
      $modal.open({
        templateUrl: "modules/ediscovery/genericModal.html",
        controller: 'EdiscoveryGenericModalCtrl as modal',
        resolve: {
          title: function () {
            return title;
          },
          messages: function () {
            return messages;
          }
        }
      });
    }

    function validateDate() {
      var title = "Date validation";
      var errors = dateErrors(getStartDate(), getEndDate());
      if (errors.length > 0) {
        openGenericModal(title, errors);
        return false;
      } else {
        return true;
      }
    }

    $scope.$on('$destroy', function () {
      $timeout.cancel(avalonPoller);
    });

    $scope.$watch(getStartDate, function (startDate) {
      //validateDate();
    });

    $scope.$watch(getEndDate, function (endDate) {
      //validateDate();
    });

    function searchForRoom(roomId) {
      vm.roomInfo = null;
      vm.report = null;
      vm.error = "";
      vm.searchInProgress = true;
      EdiscoveryService.getAvalonServiceUrl(roomId)
        .then(function (result) {
          return EdiscoveryService.getAvalonRoomInfo(result.avalonRoomsUrl + '/' + roomId);
        })
        .then(function (result) {
          vm.roomInfo = result;
          vm.searchCriteria.id = result.id;
          vm.searchCriteria.startDate = result.published;
          vm.searchCriteria.endDate = result.lastReadableActivityDate;
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

    function findReportById(reports, id) {
      return _.find(reports, function (report) {
        return report.id === id;
      });
    }

    function createReport() {
      disableAvalonPolling();
      vm.errors = [];
      if (!validateDate()) {
        return;
      }
      // vm.report = {
      //   "state": "CREATED"
      // };

      EdiscoveryService.createReport(vm.searchCriteria.displayName, vm.searchCriteria.id, vm.searchCriteria.startDate, vm.searchCriteria.endDate)
        .then(function (res) {
          vm.searchResult = res;
          runReport();
        })
        .catch(function (err) {
          vm.errors = err.data.errors;
          vm.report = {};
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
      return (vm.searchCriteria.roomId === '' || vm.searchInProgress === true);
    }

    function pollAvalonReport() {
      // TODO: Implement proper handling of error when final API is in place
      EdiscoveryService.getReport(vm.searchResult.id).then(function (report) {
        vm.report = report;
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

    function runReport() {
      // Expect this API to be changed when Avalon updates their API
      EdiscoveryService.runReport(vm.searchResult.runUrl, vm.searchCriteria.roomId, vm.searchResult.url)
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

    function downloadReport() {}

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
