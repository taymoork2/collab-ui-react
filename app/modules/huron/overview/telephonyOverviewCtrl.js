(function () {
  'use strict';

  angular
    .module('uc.overview')
    .controller('TelephonyOverviewCtrl', TelephonyOverviewCtrl);

  /* @ngInject */
  function TelephonyOverviewCtrl($stateParams, $state, $rootScope, $translate, TelephonyInfoService, FeatureToggleService, Userservice) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentUser = $stateParams.currentUser;

    vm.gsxFeature = false;

    Userservice.getUser('me', function (data, status) {
      FeatureToggleService.getFeaturesForUser(data.id, 'gsxdemo').then(function (value) {
        vm.gsxFeature = value;
      }).finally(function () {
        activate();
      });
    });

    function activate() {
      // TODO: Change TelephonyInfoService to return directly from this instead of having
      // to call into service twice.
      TelephonyInfoService.resetTelephonyInfo();
      TelephonyInfoService.getTelephonyUserInfo(vm.currentUser.id);
      TelephonyInfoService.getUserDnInfo(vm.currentUser.id);
      TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
      TelephonyInfoService.loadInternalNumberPool();
      TelephonyInfoService.loadExternalNumberPool();
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

      if ($state.$current &&
        $state.$current.data &&
        $state.$current.data.displayName &&
        $state.$current.data.displayName === 'Communications' &&
        vm.gsxFeature
      ) {
        $state.$current.data.displayName = $translate.instant('usersPreview.calling');
        $rootScope.$broadcast('displayNameUpdated');
      }
    }

    activate();

  }
})();
