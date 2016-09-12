(function () {
  'use strict';

  angular
    .module('uc.overview')
    .controller('TelephonyOverviewCtrl', TelephonyOverviewCtrl);

  /* @ngInject */
  function TelephonyOverviewCtrl($state, $stateParams, TelephonyInfoService, FeatureToggleService) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.showSpeedDials = false;
    vm.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: addNewLine,
    }];

    init();

    function addNewLine() {
      $state.go('user-overview.communication.directorynumber', {
        directoryNumber: 'new'
      });
    }

    function init() {
      // TODO: Change TelephonyInfoService to return directly from this instead of having
      // to call into service twice.
      TelephonyInfoService.resetTelephonyInfo();
      TelephonyInfoService.getTelephonyUserInfo(vm.currentUser.id);
      TelephonyInfoService.getPrimarySiteInfo()
        .then(TelephonyInfoService.getUserDnInfo(vm.currentUser.id))
        .then(TelephonyInfoService.checkCustomerVoicemail());
      TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
      TelephonyInfoService.loadInternalNumberPool();
      TelephonyInfoService.loadExternalNumberPool();
      TelephonyInfoService.getInternationalDialing(vm.currentUser.id);
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfoObject();
      FeatureToggleService.supports(FeatureToggleService.features.huronSpeedDial).then(function (result) {
        vm.showSpeedDials = result;
      });
    }
  }
})();
