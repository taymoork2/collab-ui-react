(function () {
  'use strict';
  angular.module('Status.incidents')
		.controller('UpdateIncidentController', UpdateIncidentController);
  function UpdateIncidentController($scope, $stateParams, UpdateIncidentService, IncidentsWithoutSiteService, ComponentService, $window) {
    $scope.showOperational = true;
    var originComponentsTree = [];
    function incidentMsg() {
      IncidentsWithoutSiteService.getIncidentMsg({ incidentId: $stateParams.incidentId }).$promise.then(function (data) {
        $scope.msg = '';
        $scope.showComponent = false;
        $scope.incidentWithMsg = data;
        getComponentsTree();
      }, function () {

      });
    }
    function getComponentsTree() {
      ComponentService.query({ siteId: '101' }).$promise.then(function (data) {
        /*data = [{ "componentId": 195, "serviceId": 101, "componentName": "YvetteTest", "status": "partial_outage", "description": "", "position": 1, "components": [{ "componentId": 197, "serviceId": 101, "componentName": "Y1", "status": "operational", "description": "" }, { "componentId": 197, "serviceId": 101, "componentName": "Y11", "status": "degraded_performance", "description": "" }], "isOverridden": false }, { "componentId": 195, "serviceId": 101, "componentName": "Yvette", "status": "under_maintenance", "description": "", "position": 1, "components": [{ "componentId": 197, "serviceId": 101, "componentName": "Ye1", "status": "major_outage", "description": "" }, { "componentId": 197, "serviceId": 101, "componentName": "Ye11", "status": "degraded_performance", "description": "" }], "isOverridden": false }];*/
        $scope.componentsTree = data;
        angular.copy(data, originComponentsTree);
      });
    }
    incidentMsg();
    $scope.showComponentFUN = function () {
      $scope.showComponent = true;
    };
    $scope.modifyIncident = function () {
      IncidentsWithoutSiteService.modifyIncident({ incidentId: $scope.incidentWithMsg.incidentId }, { incidentName: $scope.incidentWithMsg.incidentName, impact: $scope.incidentWithMsg.impact }).$promise.then(function (data) {
        $scope.incidentWithMsg.impact = data.impact;
        $scope.incidentWithMsg.incidentName = data.incidentName;
        $scope.incidentWithMsg.lastModifiedTime = data.lastModifiedTime;
        $scope.showIncidentName = true;
        $window.alert("Successfully modify incident");
      });
    };
    $scope.toOperationalFUN = function () {
      for (var i in $scope.componentsTree) {
        ($scope.componentsTree)[i].status = "operational";
        for (var j in ($scope.componentsTree)[i].components) {
          (($scope.componentsTree)[i].components)[j].status = "operational";
        }
      }
      $scope.showOperational = false;
    };
    $scope.getChildStatus = function (scope, parent) {
      if (!(parent.isOverridden)) {
        return;
      }
      switch (parent.status) {
        case "under_maintenance":
          break;
        case "major_outage":
          switch (scope.status) {
            case "under_maintenance":
              parent.status = scope.status;
              break;
            default:
              break;
          }
          break;
        case "partical_outage":
          switch (scope.status) {
            case "under_maintenance":
              parent.status = scope.status;
              break;
            case "major_outage":
              parent.status = scope.status;
              break;
            default:
              break;
          }
          break;
        case "degraded_performance":
          switch (scope.status) {
            case "operational":
              break;
            default:
              parent.status = scope.status;
              break;
          }
          break;
        default:
          parent.status = scope.status;
          break;
      }
    };
    $scope.getOverriddenComponent = function (scope) {
      scope.isOverridden = true;
      var components = scope.components;
      /*
        component status relation:
        operational<degraded_performance<partical_outage<major_outage<under_maintenance
      */
      var index;
      for (index = 0; index < components.length; index++) {
        if (angular.equals("under_maintenance", components[index].status)) {
          scope.status = components[index].status;
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("major_outage", components[index].status)) {
          scope.status = components[index].status;
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("partical_outage", components[index].status)) {
          scope.status = components[index].status;
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("degraded_performance", components[index].status)) {
          scope.status = components[index].status;
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("operational", components[index].status)) {
          scope.status = components[index].status;
          return;
        }
      }
    };
    $scope.addIncidentMsg = function () {
      var affectComponents = [];
      var tempObj;
      for (var i in originComponentsTree) {
        if (($scope.componentsTree)[i].isOverridden) {
          tempObj = {};
          tempObj.status = "overridden";
          tempObj.componentId = ($scope.componentsTree)[i].componentId;
          affectComponents.push(tempObj);
        } else {
          if (($scope.componentsTree)[i].status != originComponentsTree[i].status) {
            tempObj = {};
            tempObj.status = ($scope.componentsTree)[i].status;
            tempObj.componentId = ($scope.componentsTree)[i].componentId;
            affectComponents.push(tempObj);
          }
        }
        for (var j in originComponentsTree[i].components) {
          if ((($scope.componentsTree)[i].components)[j].status != (originComponentsTree[i].components)[j].status) {
            tempObj = {};
            tempObj.status = (($scope.componentsTree)[i].components)[j].status;
            tempObj.componentId = (($scope.componentsTree)[i].components)[j].componentId;
            affectComponents.push(tempObj);
          }
        }
      }
      UpdateIncidentService.save({
        incidentId: $stateParams.incidentId
      }, {
        status: $scope.incidentWithMsg.status,
        message: $scope.msg,
        email: 'chaoluo@cisco.com',
        affectComponents: affectComponents
      }).$promise.then(function () {
        incidentMsg();
        $window.alert("Successfully update incident");
      }, function () {

      });
    };
  }
})();
