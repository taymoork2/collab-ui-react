(function () {
  'use strict';
  angular.module('Status.incidents')
    .directive('msgItem', msgItem);
  function msgItem() {
    return {
      templateUrl: 'modules/status/incidents/updateIncident/msgItem.tpl.html',
      scope: {
        msg: '=info'
      },
      controller: function ($scope, AffectedComponentService) {
        $scope.componentSection = false;
        $scope.showOrHideComponent = "Show Affected Components";
        $scope.showOrHideComponentFUN = function (messageId) {
          AffectedComponentService.query({ messageId: messageId }).$promise.then(function (data) {
            $scope.affectedComponents = data;
          });
          $scope.componentSection = !$scope.componentSection;
          if ($scope.componentSection) {
            $scope.showOrHideComponent = "Hide Affected Components";
          } else {
            $scope.showOrHideComponent = "Show Affected Components";
          }
        };
      }
    };
  }
})();
