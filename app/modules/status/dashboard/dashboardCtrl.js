(function () {
  'use strict';

  angular
    .module('Status')
    .controller('DashboardCtrl', DashboardCtrl);

  /* @ngInject */
  function DashboardCtrl($scope, $window, $state, $stateParams, $translate, DashboardService, DcomponentService, statusService) {
    var vm = this;
    vm.pageTitle = $translate.instant('statusPage.pageTitle');

    vm.tab = $stateParams.tab;

    vm.headerTabs = [{
      title: $translate.instant('statusPage.dashboard'),
      state: 'status-dashboard'
    },

    {
      title: $translate.instant('statusPage.components'),
      state: 'status-components'
    },
    {
      title: $translate.instant('statusPage.incidents'),
      state: 'status'
    }];

    $scope.showList = true;
    DashboardService.query({
      "siteId": 1
    }).$promise.then(function (incidentList) {
      if (incidentList.length == 0) {
        $scope.showList = false;
      }
      $scope.incidentList = incidentList;
    }, function () {
      $scope.showList = false;
    });
    $scope.toCreatePage = function () {
      $state.go("status.incidents.new");
    };
    //$scope.showList = false;
    $scope.activities = [
      "Degraded Performance",
      "Operational",
      "Under Maintenance",
      "Partial Outage",
      "Major Outage"
    ];

    $scope.newIncident = {
      status: '',
      msg: '',
      name: ''
    };
    vm.CreateIncident = CreateIncident;
    function CreateIncident() {
      DashboardService.save({
        "siteId": 1
      }, {
        "incidentName": $scope.newIncident.name,
        "status": $scope.newIncident.status,
        "message": $scope.newIncident.msg,
        "email": "chaoluo@cisco.com"
      }).$promise.then(function () {
        $window.location.reload();
        $window.alert("Incident successfully created!");
      }, function () {
      });
    }

    $scope.statuses = [{ label: 'Operational', value: 'major' }, { label: 'Under Maintenance', value: 'critical' }, { label: 'Degraded Performance', value: 'maintenance' }, { label: 'Partial Outage', value: 'maintenance' }, { label: 'Major Outage', value: 'maintenance' }];

    vm.statusService = statusService;
    //watch service changes
    $scope.$watch(
      function () {
        return vm.statusService.getServiceId();
      },
      function (newServiceId) {
        if (newServiceId === undefined) {
          return;
        }
        DcomponentService
          .getComponents(newServiceId)
          .then(function (components) {
            vm.components = components;
          });
      });
    $scope.selectPlaceholder = 'Operational';
  }
})();
