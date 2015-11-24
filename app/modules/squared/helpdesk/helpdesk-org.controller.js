(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController(Config, $stateParams, HelpdeskService, XhrNotificationService, Authinfo) {
    var vm = this;
    var orgId = null;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      orgId = vm.org.id;
    } else {
      orgId = $stateParams.id;
    }
    vm.showCard = showCard;

    HelpdeskService.getOrg(orgId).then(function (res) {
      vm.org = res;
      findPartners(vm.org);
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    if (hasEntitlement(Config.entitlements.fusion_mgmt)) {
      HelpdeskService.getHybridServices(orgId).then(function (services) {
        vm.enabledHybridServices = _.filter(services, {
          enabled: true
        });
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

    function findPartners(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.partners = [];
        _.each(org.managedBy, function (parnterOrg) {
          HelpdeskService.getOrg(parnterOrg.orgId).then(function (res) {
            org.partners.push(res);
          }, function (err) {});
        });
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
