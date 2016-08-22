(function () {
  'use strict';
  angular.module('Status.incidents')
		.controller('UpdateIncidentController', UpdateIncidentController);
  function UpdateIncidentController($scope, $stateParams, UpdateIncidentService, IncidentsWithoutSiteService) {
    $scope.showComponent = false;
    $scope.componentSection = false;
    $scope.showOrHideComponent = "Show Affected Components";
    function incidentMsg() {
      IncidentsWithoutSiteService.getIncidentMsg({ incidentId: $stateParams.incidentId, isArray: false }).$promise.then(function (data) {
        $scope.incidentName = data.incidentName;
        $scope.status = data.status;
        $scope.msg = '';
        $scope.messages = data.Messages;
      }, function () {

      });
    }
    incidentMsg();
    $scope.showComponentFUN = function () {
      $scope.showComponent = true;
    };
    $scope.showOrHideComponentFUN = function () {
      $scope.componentSection = !$scope.componentSection;
      if ($scope.componentSection) {
        $scope.showOrHideComponent = "Hide Affected Components";
      } else {
        $scope.showOrHideComponent = "Show Affected Components";
      }
    };
    $scope.addIncidentMsg = function () {
      UpdateIncidentService.save({
        incidentId: $stateParams.incidentId
      }, {
        status: $scope.status,
        message: $scope.msg,
        email: 'chaoluo@cisco.com',
        affectComponents: []
      }).$promise.then(function () {
        incidentMsg();
      }, function () {
        $scope.incidentName = 'fail';
      });
    };
  }
})();
