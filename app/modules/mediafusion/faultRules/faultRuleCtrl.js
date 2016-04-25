(function() {
  'use strict';

  //Defining a controller for Meeting List with required dependencies.
  angular.module('Mediafusion')
    .controller('FaultRulesCtrl', FaultRulesCtrl);

  /* @ngInject */
  function FaultRulesCtrl($scope, $rootScope, Log, FaultRuleService) {

    $scope.systemTypes = [];
    $scope.systemNames = [];
    $scope.metricTypes = [];
    $scope.metricCounters = [];
    $scope.sysTypeSelected = {
      "orgId": "Cisco",
      "systemType": "All"
    };
    $scope.systemSelected = "All";
    $scope.metricTypeSelected = "";
    $scope.metricCounterSelected = "";
    $scope.operatorSelected = "";
    $scope.thresholdName = "";
    $scope.valuePercentage = "";
    $scope.eventSelected = "";

    $scope.operators = [{
      "name": "Equals",
      "value": "=="
    }, {
      "name": "Not Equals",
      "value": "!="
    }, {
      "name": "Greaterthan",
      "value": ">"
    }, {
      "name": "Lessthan",
      "value": "<"
    }, {
      "name": "Greaterthan or Equals",
      "value": ">="
    }, {
      "name": "Lessthan or Equals",
      "value": "<="
    }];

    $scope.events = [{
      "eventName": "Test"
    }, {
      "eventName": "Test1"
    }];

    $scope.saveThreshold = function () {
      var operator = "";
      for (var index = 0; index < $scope.operators.length; index++) {
        if ($scope.operators[index].name == $scope.operatorSelected.name) {
          operator = $scope.operators[index].value;
          break;
        }
      }
      var threshold = {
        "systemType": $scope.sysTypeSelected.systemType,
        "hostName": $scope.systemSelected.system,
        "metricType": $scope.metricTypeSelected.metricType,
        "counter": $scope.metricCounterSelected.counterName,
        "operator": operator,
        "thresholdName": $scope.thresholdName,
        "value": $scope.valuePercentage,
        "eventName": $scope.eventSelected.eventName
      };

      FaultRuleService.addThreshold(threshold, function (data, status) {
        //console.log("Threshold saved status is : " + data);
      });
    };

    $scope.cancel = function () {
      $scope.systemSelected = "";
      $scope.metricTypeSelected = "";
      $scope.metricCounterSelected = "";
      $scope.operatorSelected = "";
      $scope.thresholdName = "";
      $scope.valuePercentage = "";
      $scope.eventSelected = "";
    };

    var getSystemTypesList = function () {
      FaultRuleService.listSystemTypes(function (data, status) {
        $scope.systemTypes = data;
      });
    };

    $scope.getSystemsByType = function () {
      FaultRuleService.listSystems($scope.sysTypeSelected.systemType, function (data, status) {
        $scope.systemNames = data;
      });

      $scope.metricTypes = [];
      $scope.metricCounters = [];
    };

    $scope.getMetricTypesBySystem = function () {
      FaultRuleService.listMetricTypes($scope.systemSelected.system, function (data, status) {
        $scope.metricTypes = data;
      });
    };

    $scope.getMetricCountersByMetricType = function () {
      FaultRuleService.listMetricCounters($scope.systemSelected.system, $scope.metricTypeSelected.metricType, function (data, status) {
        $scope.metricCounters = data;
      });
    };

    getSystemTypesList();

  }
})();