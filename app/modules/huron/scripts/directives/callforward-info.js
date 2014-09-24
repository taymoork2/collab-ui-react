'use strict';


angular.module('Huron')
   .controller('callForwardInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberService', 'Log', 'Config', 'Notification',
    function($scope, $q, $http, UserDirectoryNumberService, Log, Config, Notification) {
      $scope.forward = 'all';
      $scope.forwardAllCalls = '';
      $scope.forwardBusyCalls = '';
      $scope.forwardNoAnswerCalls = '';
      $scope.forwardExternalCalls = false;
      $scope.validForwardOptions = ['Add New'];
      
      $scope.changeForwardAllCalls = function() {
        $scope.validForwardOptions.push($scope.forwardAllCalls);
      };

      $scope.selectForwardAllCalls = function(value) {
        $scope.forwardAllCalls = value;
      };

      $scope.changeForwardBusyCalls = function() {
        $scope.validForwardOptions.push($scope.forwardBusyCalls);
      };

      $scope.selectForwardBusyCalls = function(value) {
        $scope.forwardBusyCalls = value;
      };

      $scope.changeForwardNoAnswerCalls = function() {
        $scope.validForwardOptions.push($scope.forwardNoAnswerCalls);
      };

      $scope.selectForwardNoAnswerCalls = function(value) {
        $scope.forwardAllCalls = value;
      };

      $scope.isCallForwardSelected = function(value) {
        if ($scope.forward === value) {
          return true;
        } else {
          return false;
        }
      };

      $scope.$watch('telephonyUser', function(newVal, oldVal) {
        if (newVal) {
          if ($scope.isVoicemailEnabled()) {
            $scope.validForwardOptions.push('Voicemail');
          }
        }
      });
    }
])
  .directive('callForwardInfo', function() {
    return {
      controller: 'callForwardInfoCtrl',
      restrict: 'A',
      scope: false,
      templateUrl: 'modules/huron/scripts/directives/views/callforward-info.html',
      link: function(scope, elem, attrs){

      }
    };
  });