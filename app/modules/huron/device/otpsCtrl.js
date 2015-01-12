(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('OtpsCtrl', OtpsCtrl);

  /* @ngInject */
  function OtpsCtrl($scope, Config, OtpService) {
    var vm = this;
    vm.otps = [];

    ////////////

    function activate() {
      return OtpService.loadOtps($scope.currentUser.id).then(function (otps) {
        vm.otps = otps;
      });
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      if ($scope.currentUser && $scope.currentUser.entitlements) {
        for (var i = 0; i < $scope.currentUser.entitlements.length; i++) {
          var svc = $scope.currentUser.entitlements[i];
          if (svc === ent) {
            return true;
          }
        }
      }
      return false;
    }

    $scope.$watch('currentUser', function (newUser, oldUser) {
      if (newUser) {
        if (isHuronEnabled()) {
          activate();
        }
      }
    });

  }
})();
