(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController(Config, $stateParams, HelpdeskService, XhrNotificationService, Authinfo) {
    var vm = this;
    vm.org = $stateParams.org;
    vm.orgId = vm.org.id;
    vm.showCard = showCard;

    HelpdeskService.getOrg(vm.org.id).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    if (hasEntitlement(Config.entitlements.fusion_mgmt)) {
      HelpdeskService.getHybridServices(vm.orgId).then(function (services) {
        console.log(services);
        vm.enabledHybridServices = _.filter(services, {enabled: true});
      }, function (err) {
        XhrNotificationService.notify(err);
      });
    }

    /*
      message : entitlement = "webex-squared" ?
      meeting (webex) : entitlement = "webex-messenger" ?
      call(huron) : authinfo.issquareduc()
      hybrid: Authinfo.isFusion()
      room (cloudberry): Authinfo.isDeviceManagement()
     */
    // TODO: Move and and reuse between user and org ?
    function showCard(type) {
      switch (type) {
        //TODO: Check for the CORRECT entitlements !!!
      case 'message':
        return hasEntitlement(Config.entitlements.squared); //???
      case 'meeting':
        return hasEntitlement("webex-messenger"); // ???
      case 'call':
        return hasEntitlement(Config.entitlements.huron);
      case 'hybrid':
        return hasEntitlement(Config.entitlements.fusion_mgmt);
      case 'room':
        return hasEntitlement(Config.entitlements.device_mgmt);
      }
      return true;
    }

    function hasEntitlement(entitlement) {
      if (vm.org && vm.org.services) {
        return _.includes(vm.org.services, entitlement);
      }
      return false;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
