(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('hybridServicesPanel', hybridServicesPanel)
    .controller('hybridServicesPanelCtrl', hybridServicesPanelCtrl);

  /* @ngInject */
  function hybridServicesPanelCtrl($scope, HybridService, Authinfo) {
    var vm = this;

    vm.isEnabled = false;
    vm.extensions = [];
    vm.entitlements = [];
    vm.setEntitlements = setEntitlements;

    $scope.shouldAddIndent = function (key, reference) {
      return key === reference;
    };

    init();

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

    function setCheckbox(entitlement, val)
    {
        var state = (val) ? 'ACTIVE' : 'INACTIVE';
        for ( var i = 0; i < $scope.vm.extensions.length; i++ ) {
          if ( $scope.vm.extensions[i].id === entitlement )
          {
            if ( $scope.vm.extensions[i].entitlementState !== state ) {
              $scope.vm.extensions[i].entitlementState = state;
            }
            break;
          }
        }      
    }

    function setEntitlements(ext) {
      var i;
      // If EC requires UC be checked as well
      if ( ext.id === 'squared-fusion-ec' ) {
        setCheckbox('squared-fusion-uc', true);
      }
      else if ( (ext.id === 'squared-fusion-uc') && (ext.entitlementState === 'INACTIVE') ) {
        setCheckbox('squared-fusion-ec', false);
      }

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
  }

  /* @ngInject */
  function hybridServicesPanel() {
    var directive = {
      restrict: 'E',
      scope: {
        'updateEntitlements': '&bindEntitlements'
      },
      bindToController: true,
      controllerAs: 'vm',
      controller: hybridServicesPanelCtrl,
      templateUrl: 'modules/hercules/hybridServices/hybridServicesPanel.tpl.html'
    };

    return directive;
  }
})();
