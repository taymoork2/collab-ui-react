(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('hybridServicesPanel', hybridServicesPanel);

  /* @ngInject */
  function hybridServicesPanel() {
    var directive = {
      restrict: 'E',
      scope: {
        'updateEntitlements': '&bindEntitlements'
      },
      bindToController: true,
      controllerAs: 'vm',
      controller: Controller,
      templateUrl: 'modules/hercules/hybridServices/hybridServicesPanel.tpl.html'
    };

    return directive;
  }

  /* @ngInject */
  function Controller($scope, HybridService) {
    var vm = this;

    vm.isEnabled = false;
    vm.extensions = [];
    vm.entitlements = [];
    vm.setEntitlements = setEntitlements;
    vm.shouldAddIndent = shouldAddIndent;

    init();

    $scope.shouldAddIndent = function (key, reference) {
      return key !== reference;
    };

    ////////////////

    function init() {
      HybridService.getEntitledExtensions()
        .then(function (extensions) {
          vm.isEnabled = _.some(extensions, {
            'enabled': true
          });
          vm.extensions = extensions || [];
          // Sort items so they show in proper order (UC first, Calendar Last, everything else in the middle)
          vm.extensions.sort(function (a, b) {
            if (a.id == 'squared-fusion-uc') return -1;
            if (a.id == 'squared-fusion-cal') return 1;
            return 0;
          });
        });
    }

    function setEntitlements() {
      // US8209 says to only add entitlements, not remove them.
      // Allowing INACTIVE would remove entitlement when users are patched.
      vm.entitlements = _(vm.extensions)
        .map(function (extension) {
          return _.pick(extension, ['entitlementState', 'entitlementName']);
        })
        .filter({
          entitlementState: 'ACTIVE'
        })
        .value();

      // Check before calling.
      if (angular.isDefined(vm.updateEntitlements)) {
        vm.updateEntitlements({
          'entitlements': vm.entitlements
        });
      }
    }

    $scope.$watch('squaredFusionEC.entitled', function (newVal, oldVal) {
      if (newVal != oldVal) {
      }
    });
  }
})();
