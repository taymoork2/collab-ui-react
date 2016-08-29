(function () {
  'use strict';
  angular.module('Status.incidents')
		.controller('UpdateIncidentController', UpdateIncidentController);
  function UpdateIncidentController($scope, $stateParams, UpdateIncidentService, IncidentsWithoutSiteService) {
    $scope.showComponent = false;
    $scope.components = {};
   // var vm=this;
    //vm.incidentMsg = incidentMsg;
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
