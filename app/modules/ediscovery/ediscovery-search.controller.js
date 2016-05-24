(function () {
  'use strict';

  /* @ngInject */
  function EdiscoverySearchController($timeout, $window, $rootScope, $scope, $state, $translate, $modal, EdiscoveryService) {

    var vm = this;
    // console.log("EdiscoverySearchController...")
    vm.createReport = createReport;
    vm.showSearchHelp = showSearchHelp;

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

    function createReport() {
      if (!validateDate()) {
        return;
      }
      vm.searchResult = {};
      EdiscoveryService.createReport("whatever_" + randomString(), vm.searchCriteria.searchString).then(function (res) {
        vm.searchResult = res;
      });
    }

    function setSearchFieldFocus() {
      angular.element('#searchInput').focus();
    }

    function showSearchHelp() {
      var searchHelpUrl = "modules/ediscovery/search-help-dialog.html";
      $modal.open({
        templateUrl: searchHelpUrl
      }).result.finally(function () {
        setSearchFieldFocus();
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
