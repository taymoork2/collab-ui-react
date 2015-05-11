(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, PartnerReportService, GraphService) {
    var vm = this;

    // variables for the active users section
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var noActiveUserDataDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isActiveUsersRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="active-user-status icon icon-spinner icon-2x"></i>';
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'totalActivity'];

    vm.activeUsersRefresh = 'refresh';
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[2];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];

    vm.recentUpdate = "";
    vm.qualityTab = 'refresh';
    vm.customerOptions = [];
    vm.customerSelected = null;

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.week')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.month')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.threeMonths')
    }];
    vm.timeSelected = vm.timeOptions[0];

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.ceil((num + 1) / 5);
    };

    vm.changePage = function (num) {
      vm.activeUserCurrentPage = num;
    };

    vm.isRefresh = function (tab) {
      return tab === 'refresh';
    };

    vm.isEmpty = function (tab) {
      return tab === 'empty';
    };

    vm.mostActiveSort = function (num) {
      if (vm.activeUserPredicate === activeUsersSort[num]) {
        vm.activeUserReverse = !vm.activeUserReverse;
      } else {
        if (num >= 2) {
          vm.activeUserReverse = true;
        } else {
          vm.activeUserReverse = false;
        }
        vm.activeUserPredicate = activeUsersSort[num];
      }
    };

    vm.pageForward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[2]) && (vm.activeButton[2] !== vm.activeUsersTotalPages)) {
        vm.activeButton[0] += 1;
        vm.activeButton[1] += 1;
        vm.activeButton[2] += 1;
      }
      if (vm.activeUserCurrentPage !== vm.activeUsersTotalPages) {
        vm.changePage(vm.activeUserCurrentPage + 1);
      }
    };

    vm.pageBackward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[0]) && (vm.activeButton[0] !== 1)) {
        vm.activeButton[0] -= 1;
        vm.activeButton[1] -= 1;
        vm.activeButton[2] -= 1;
      }
      if (vm.activeUserCurrentPage !== 1) {
        vm.changePage(vm.activeUserCurrentPage - 1);
      }
    };

    vm.updateReports = function () {
      vm.activeUsersRefresh = 'refresh';
      var savedFilter = PartnerReportService.getPreviousFilter();
      angular.element('#' + activeUserRefreshDiv).html(isActiveUsersRefreshDiv);

      if (savedFilter !== vm.timeSelected) {
        PartnerReportService.setActiveUsersData(vm.timeSelected).then(function () {
          updateActiveUserReports();
        });
      } else {
        updateActiveUserReports();
      }
    };

    init();

    function init() {
      PartnerReportService.getCustomerList().then(function (response) {
        updateCustomerFilter(response);
        setActiveUserReports();
        setGraphResizing();
        vm.qualityTab = 'set';
      });
    }

    function setGraphResizing() {
      angular.element('#engagementTab').on("click", function () {
        if (vm.activeUsersRefresh !== 'empty') {
          GraphService.invalidateActiveUserGraphSize();
        }
      });
    }

    function updateActiveUserReports() {
      PartnerReportService.getActiveUserData(vm.customerSelected.value, vm.customerSelected.label).then(function (response) {
        var graphData = response.graphData;
        GraphService.updateActiveUsersGraph(graphData);

        vm.mostActiveUsers = response.tableData;

        if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
          var totalUsers = vm.mostActiveUsers.length;
          vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
        } else {
          vm.activeUsersTotalPages = 0;
        }
        vm.activeUserCurrentPage = 1;
        vm.activeButton = [1, 2, 3];

        if (graphData.length === 0) {
          angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
          vm.activeUsersRefresh = 'empty';
        } else {
          vm.activeUsersRefresh = 'set';
        }
      });
    }

    function updateCustomerFilter(orgsData) {
      // add all customer names to the customerOptions list
      angular.forEach(orgsData, function (org) {
        vm.customerOptions.push({
          value: org.customerOrgId,
          label: org.customerName
        });
      });
      if (vm.customerOptions[0] !== null && vm.customerOptions[0] !== undefined) {
        vm.customerSelected = vm.customerOptions[0];
      } else {
        vm.customerSelected = {
          value: 0,
          label: ""
        };
      }
    }

    function setActiveUserReports() {
      PartnerReportService.setActiveUsersData(vm.timeSelected).then(function () {
        vm.recentUpdate = PartnerReportService.getMostRecentUpdate();

        PartnerReportService.getActiveUserData(vm.customerSelected.value, vm.customerSelected.label).then(function (response) {
          var graphData = response.graphData;
          GraphService.createActiveUserGraph(graphData);
          GraphService.invalidateActiveUserGraphSize();

          vm.mostActiveUsers = response.tableData;

          if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
            var totalUsers = vm.mostActiveUsers.length;
            vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
          } else {
            vm.activeUsersTotalPages = 0;
          }
          vm.activeUserCurrentPage = 1;
          vm.activeButton = [1, 2, 3];

          if (graphData.length === 0) {
            angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
            vm.activeUsersRefresh = 'empty';
          } else {
            vm.activeUsersRefresh = 'set';
          }
        });
      });
    }
  }
})();
