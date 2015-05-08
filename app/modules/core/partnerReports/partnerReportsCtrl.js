(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, $q, PartnerReportService, GraphService) {
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
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];

    vm.recentUpdate = "";
    vm.customerOptions = [];
    vm.customerSelected = null;

    vm.mediaQualityRefresh = 'refresh';
    vm.mediaQualityFake = [];
    var mediaQualityRefreshDiv = 'mediaQualityRefreshDiv';
    var noMediaQualityDataDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isMediaQualityRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="mediaQuality-user-status icon icon-spinner icon-2x"></i>';

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
      angular.element('#' + activeUserRefreshDiv).html(isActiveUsersRefreshDiv);
      getActiveUserReports();
    };

    init();

    function init() {
      PartnerReportService.getCustomerList().then(function (response) {
        updateCustomerFilter(response);

        var promises = [];
        var activeUserPromise = getActiveUserReports().then(function () {
          GraphService.invalidateActiveUserGraphSize();
        });
        promises.push(activeUserPromise);

        var mediaQualityPromise = getMediaQualityReports();
        promises.push(mediaQualityPromise);
        $q.all(promises).then(function () {
          vm.recentUpdate = PartnerReportService.getMostRecentUpdate();
          setGraphResizing();
        });
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

    function getActiveUserReports() {
      return PartnerReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
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
        vm.activeUserPredicate = activeUsersSort[3];

        if (graphData.length === 0) {
          angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
          vm.activeUsersRefresh = 'empty';
        } else {
          vm.activeUsersRefresh = 'set';
        }

        return;
      });
    }

    function setGraphResizing() {
      angular.element('#engagementTab').on("click", function () {
        if (vm.activeUsersRefresh !== 'empty') {
          GraphService.invalidateActiveUserGraphSize();
        }
      });

      angular.element('#qualityTab').on("click", function () {
        if (vm.mediaQualityRefresh !== 'empty') {
          GraphService.invalidateMediaQualityGraphSize();
        }
      });
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics().then(function (response) {
        var graphData = response.data;
        GraphService.updateMediaQualityGraph(graphData);
        if (graphData.length === 0) {
          angular.element('#' + mediaQualityRefreshDiv).html(noMediaQualityDataDiv);
          vm.mediaQualityRefresh = 'empty';
        } else {
          vm.mediaQualityRefresh = 'set';
        }
        return;
      });
    }
  }

})();
