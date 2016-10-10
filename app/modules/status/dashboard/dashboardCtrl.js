(function () {
  'use strict';

  angular
    .module('Status')
    .controller('DashboardCtrl', DashboardCtrl);

  /* @ngInject */
  function DashboardCtrl($log, $scope, $window, $state, $stateParams, $translate, DincidentListService, DcomponentService, statusService) {
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
    DincidentListService.query({
      "siteId": statusService.getServiceId()
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
    $scope.$watch(
      function () {
        return statusService.getServiceId();
      },
      function (newServiceId, oldServiceId) {
        if (newServiceId === oldServiceId) {
          return;
        }
        $state.go("status.components");
      }
      );

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
      DincidentListService.save({
        "siteId": statusService.getServiceId()
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

    $scope.statuses = [{ label: 'Operational', value: 'operational' }, { label: 'Degraded Performance', value: 'degraded_performance' }, { label: 'Partial Outage', value: 'partial_outage' }, { label: 'Major Outage', value: 'major_outage' }, { label: 'Under Maintenance', value: 'under_maintenance' }];
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
            for (var i = 0; i < (vm.components).length; i++) {
              switch ((vm.components)[i].status) {
                case 'operational':
                  (vm.components)[i].statusObj = ($scope.statuses)[0];
                  break;
                case 'degraded_performance':
                  (vm.components)[i].statusObj = ($scope.statuses)[1];
                  break;
                case 'partial_outage':
                  (vm.components)[i].statusObj = ($scope.statuses)[2];
                  break;
                case 'major_outage':
                  (vm.components)[i].statusObj = ($scope.statuses)[3];
                  break;
                case 'under_maintenance':
                  (vm.components)[i].statusObj = ($scope.statuses)[4];
                  break;
              }
              for (var j = 0; j < ((vm.components)[i].components).length; j++) {
                switch (((vm.components)[i].components)[j].status) {
                  case 'operational':
                    ((vm.components)[i].components)[j].statusObj = ($scope.statuses)[0];
                    break;
                  case 'degraded_performance':
                    ((vm.components)[i].components)[j].statusObj = ($scope.statuses)[1];
                    break;
                  case 'partial_outage':
                    ((vm.components)[i].components)[j].statusObj = ($scope.statuses)[2];
                    break;
                  case 'major_outage':
                    ((vm.components)[i].components)[j].statusObj = ($scope.statuses)[3];
                    break;
                  case 'under_maintenance':
                    ((vm.components)[i].components)[j].statusObj = ($scope.statuses)[4];
                    break;
                }
              }
            }
          });
      });
    $scope.selectPlaceholder = { label: 'Under Maintenance', value: 'critical' };

    vm.modifyComponentStatus = function (scope) {
      $log.log(scope);
      scope.status = scope.statusObj.value;
      var newComponent = {
        "componentId": scope.componentId,
        "status": scope.status
      };
      DcomponentService.modifyComponent(
        newComponent
      ).then(function () {
        $window.alert('status of ' + scope.componentName + ' has been changed to ' + scope.status);
      });
    };
  }
})();
