(function () {
  'use strict';

  /* @ngInject */
  function EdiscoverySearchController($timeout, $window, $rootScope, $scope, $state, $translate, $modal, EdiscoveryService) {

    var vm = this;
    // console.log("EdiscoverySearchController...")
    vm.createReport = createReport;
    vm.createReportDoIt = createReportDoIt;
    //vm.showSearchHelp = showSearchHelp;

    vm.searchCriteria = {
      "searchString": "36de9c50-8410-11e5-8b9b-9d7d6ad1ac82",
      "startDate": moment(),
      "endDate": moment(moment()).add(1, 'days')
    };
    vm.reports = [];

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
        errors.push("Start date must be before end date");
      }
      if (moment(start).isAfter(moment())) {
        errors.push("Start date cannot be in the future");
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

    function randomString() {
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return _.sample(possible, 5).join('');
    }

    function findReportById(reports, id) {
      return _.find(reports, function (report) {
        return report.id === id;
      });
    }

    // Should eventually be a search API
    function createReport() {
      if (!validateDate()) {
        return;
      }
      vm.report = {
        "state": "Searching..."
      };
      // Expect this API to be changed when Avalon updates their API
      EdiscoveryService.createReport("whatever_" + randomString(), vm.searchCriteria.searchString)
        .then(function (res) {
          vm.searchResult = res;
          createReportDoIt();
        }).catch(function (err) {
          //  TODO: Implement proper handling of error when final API is in place
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

    function pollAvalonReport() {
      //  TODO: Implement proper handling of error when final API is in place
      EdiscoveryService.getReport().then(function (reports) {
        vm.report = findReportById(reports, vm.searchResult.data.id);
      }).finally(function (res) {
        disableAvalonPolling();
        avalonPoller = $timeout(pollAvalonReport, 2000);
      });
    }

    function createReportDoIt() {
      // Expect this API to be changed when Avalon updates their API
      EdiscoveryService.createReportDoIt(vm.searchResult.data.runUrl, vm.searchCriteria.searchString)
        .then(function (res) {
          enableAvalonPolling();
        })
        .catch(function (err) {
          //  TODO: Implement proper handling of error when final API is in place
          vm.report = {
            "state": "NOT FOUND"
          };
          disableAvalonPolling();
        });
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
