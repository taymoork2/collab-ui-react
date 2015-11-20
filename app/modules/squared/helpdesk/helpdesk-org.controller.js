(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController(Config, $stateParams, HelpdeskService, XhrNotificationService) {
    var vm = this;
    vm.org = $stateParams.org;
    vm.orgId = vm.org.id;
    vm.showCard = showCard;

    HelpdeskService.getOrg(vm.org.id).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    // Not needed ?
    HelpdeskService.getHybridServices(vm.orgId).then(function (services) {
      vm.hybridServices = services;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    /*
      message : entitlement = "webex-squared" ?
      meeting (webex) : entitlement = "webex-messenger" ?
      call(huron) : authinfo.issquareduc()
      hybrid: Authinfo.isFusion()
      room (cloudberry): Authinfo.isDeviceManagement()
     */
    // TODO: Move and and reuse between user and org ?
    function showCard(type) {
      var entitlements = vm.org.services;
      switch (type) {
        //TODO: Check for the CORRECT entitlements !!!
      case 'message':
        return _.includes(entitlements, Config.entitlements.squared); //???
      case 'meeting':
        return _.includes(entitlements, "webex-messenger"); // ???
      case 'call':
        return _.includes(entitlements, Config.entitlements.huron);
      case 'hybrid':
        return _.includes(entitlements, Config.entitlements.fusion_mgmt);
      case 'room':
        return _.includes(entitlements, Config.entitlements.device_mgmt);
      }
      return true;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
