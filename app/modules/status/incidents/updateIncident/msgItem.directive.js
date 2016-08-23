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
      controller: function ($scope) {
        $scope.componentSection = false;
        $scope.showOrHideComponent = "Show Affected Components";
        $scope.showOrHideComponentFUN = function () {
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
