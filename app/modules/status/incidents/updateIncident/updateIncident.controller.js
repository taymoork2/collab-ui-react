(function () {
  'use strict';
  angular.module('Status.incidents')
		.controller('UpdateIncidentController', UpdateIncidentController);
  function UpdateIncidentController($scope, $stateParams, UpdateIncidentService, IncidentsWithoutSiteService, ComponentService, $state, $window, $log) {
    $scope.showOperational = true;
    var originComponentsTree = [];
    var originIncidentName, originImpact;
    $scope.impactStatuses = [{ label: 'Override impact to None', value: 'none' }, { label: 'Override impact to Minor', value: 'minor' }, { label: 'Override impact to Major', value: 'major' }, { label: 'Override impact to Critical', value: 'critical' }, { label: 'Override impact to Maintenance', value: 'maintenance' }];
    $scope.componentStatuses = [{ label: 'Operational', value: 'operational' }, { label: 'Degraded Performance', value: 'degraded_performance' }, { label: 'Partial Outage', value: 'partial_outage' }, { label: 'Major Outage', value: 'major_outage' }, { label: 'Under Maintenance', value: 'under_maintenance' }];
    function getComponentStatusObj(status) {
      switch (status) {
        case "operational":
          return ($scope.componentStatuses)[0];
        case "degraded_performance":
          return ($scope.componentStatuses)[1];
        case "partial_outage":
          return ($scope.componentStatuses)[2];
        case "major_outage":
          return ($scope.componentStatuses)[3];
        case "under_maintenance":
          return ($scope.componentStatuses)[4];
        default:
          break;
      }
    }
    function getImpactStatusObj(status) {
      switch (status) {
        case "none":
          return ($scope.impactStatuses)[0];
        case "minor":
          return ($scope.impactStatuses)[1];
        case "major":
          return ($scope.impactStatuses)[2];
        case "critical":
          return ($scope.impactStatuses)[3];
        case "maintenance":
          return ($scope.impactStatuses)[4];
        default:
          break;
      }
    }
    function incidentMsg() {
      IncidentsWithoutSiteService.getIncidentMsg({ incidentId: $stateParams.incidentId }).$promise.then(function (data) {
        $scope.msg = '';
        $scope.showComponent = false;
        $scope.incidentWithMsg = data;
        originIncidentName = data.incidentName;
        originImpact = data.impact;
        $scope.selectedImpactStatus = getImpactStatusObj(data.impact);
        getComponentsTree();
      }, function () {

      });
    }
    function getComponentsTree() {
      ComponentService.query({ "siteId": 101 }).$promise.then(function (metadata) {
        $log.log(metadata);
        $scope.componentsTree = metadata;
        angular.copy(metadata, originComponentsTree);
        for (var i = 0; i < ($scope.componentsTree).length; i++) {
          ($scope.componentsTree)[i].statusObj = getComponentStatusObj(($scope.componentsTree)[i].status);
          for (var j = 0; j < (($scope.componentsTree)[i].components).length; j++) {
            (($scope.componentsTree)[i].components)[j].statusObj = getComponentStatusObj((($scope.componentsTree)[i].components)[j].status);
          }
        }
      });
    }
    $scope.showComponentFUN = function () {
      $scope.showComponent = true;
    };
    $scope.setSelectedStatus = function (scope) {
      scope.status = scope.statusObj.value;
    };
    $scope.cancleModifyIncident = function () {
      $scope.showIncidentName = true;
      $scope.selectedImpactStatus = getImpactStatusObj(originImpact);
      $scope.incidentWithMsg.incidentName = originIncidentName;
    };
    $scope.modifyIncident = function () {
      IncidentsWithoutSiteService.modifyIncident({ incidentId: $scope.incidentWithMsg.incidentId }, { incidentName: $scope.incidentWithMsg.incidentName, impact: $scope.selectedImpactStatus.value }).$promise.then(function (data) {
        $scope.incidentWithMsg.impact = data.impact;
        $scope.incidentWithMsg.incidentName = data.incidentName;
        $scope.incidentWithMsg.lastModifiedTime = data.lastModifiedTime;
        $scope.showIncidentName = true;
        originIncidentName = data.incidentName;
        originImpact = data.impact;
        $window.alert("Successfully modify incident");
      });
    };
    $scope.toOperationalFUN = function () {
      for (var i = 0; i < ($scope.componentsTree).length; i++) {
        ($scope.componentsTree)[i].status = "operational";
        ($scope.componentsTree)[i].statusObj = getComponentStatusObj("operational");
        for (var j = 0; j < (($scope.componentsTree)[i].components).length; j++) {
          (($scope.componentsTree)[i].components)[j].status = "operational";
          (($scope.componentsTree)[i].components)[j].statusObj = getComponentStatusObj("operational");
        }
      }
      $scope.showOperational = false;
    };
    $scope.getChildStatus = function (scope, parent) {
      scope.status = scope.statusObj.value;
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
      $log.log(components);
      /*
        component status relation:
        operational<degraded_performance<partical_outage<major_outage<under_maintenance
      */
      var index;
      for (index = 0; index < components.length; index++) {
        if (angular.equals("under_maintenance", components[index].status)) {
          scope.status = components[index].status;
          scope.statusObj = ($scope.componentStatuses)[4];
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("major_outage", components[index].status)) {
          scope.status = components[index].status;
          scope.statusObj = ($scope.componentStatuses)[3];
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("partical_outage", components[index].status)) {
          scope.status = components[index].status;
          scope.statusObj = ($scope.componentStatuses)[2];
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("degraded_performance", components[index].status)) {
          scope.status = components[index].status;
          scope.statusObj = ($scope.componentStatuses)[1];
          return;
        }
      }
      for (index = 0; index < components.length; index++) {
        if (angular.equals("operational", components[index].status)) {
          scope.status = components[index].status;
          scope.statusObj = ($scope.componentStatuses)[0];
          return;
        }
      }
    };
    $scope.addIncidentMsg = function () {
      var affectComponents = [];
      var tempObj;
      for (var i = 0; i < originComponentsTree.length; i++) {
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
        for (var j = 0; j < (originComponentsTree[i].components).length; j++) {
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
        if (angular.equals($scope.incidentWithMsg.status, "resolved")) {
          $state.go('^');
        } else {
          incidentMsg();
        }
        $window.alert("Successfully update incident");
      }, function () {

      });
    };
    incidentMsg();
  }
})();
