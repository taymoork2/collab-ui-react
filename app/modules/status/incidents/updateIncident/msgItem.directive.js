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
      controller: function ($scope, MessageService, $window, $filter, $log) {
        /* use a function for the exact format desired... */
        function ISODateString(d) {
          function pad(n) {
            return n < 10 ? '0' + n : n;
          }
          return d.getUTCFullYear() + '-'
              + pad(d.getUTCMonth() + 1) + '-'
              + pad(d.getUTCDate()) + 'T'
              + pad(d.getUTCHours()) + ':'
              + pad(d.getUTCMinutes()) + ':'
              + pad(d.getUTCSeconds()) + 'Z';
        }
        var originMsg = {};
        angular.copy($scope.msg, originMsg);
        $scope.componentSection = false;
        $scope.showMsgInfo = true;
        $scope.showOrHideComponent = "Show Affected Components";
        $scope.dateVal = $filter('date')($scope.msg.postAt, 'yyyy-MM-dd');
        $scope.timeVal = $filter('date')($scope.msg.postAt, 'HH:mm');
        $scope.modifyMsg = function () {
          MessageService.modifyMsg({ messageId: $scope.msg.messageId }, { postAt: ISODateString(new Date($scope.dateVal + " " + $scope.timeVal)), email: "chaoluo@ciscoc.com", message: $scope.msg.message }).$promise.then(function () {
            $window.alert("Successfully modify message");
            $scope.msg.postAt = ISODateString(new Date($scope.dateVal + " " + $scope.timeVal));
            $scope.showMsgInfo = true;
          });
        };
        $scope.cancleModifyMsg = function () {
          $scope.showMsgInfo = true;
          $scope.msg.message = originMsg.message;
          $scope.dateVal = $filter('date')($scope.msg.postAt, 'yyyy-MM-dd');
          $scope.timeVal = $filter('date')($scope.msg.postAt, 'HH:mm');
        };
        $log.log(ISODateString(new Date($scope.dateVal + " " + $scope.timeVal)));
        $scope.showOrHideComponentFUN = function (messageId) {
          MessageService.query({ messageId: messageId }).$promise.then(function (data) {
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
