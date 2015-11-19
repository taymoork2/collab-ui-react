(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController(HelpdeskMockData, Config, $stateParams, HelpdeskService, XhrNotificationService, ServiceDescriptor, Authinfo) {
    var vm = this;

    vm.org = $stateParams.org;
    vm.orgId = vm.org.id;

    vm.showCard = showCard;

    /*
    vm.messageLicences = {
      total: 1000,
      used: 190
    };
    vm.meetingLicences = {
      total: 1000,
      used: 658
    };
    vm.roomSystemsLicences = {
      total: 1000,
      used: 989
    };
    vm.hybridServicesLicences = {
      total: 100,
      used: 50
    };
*/
    var urlBase = Config.getAdminServiceUrl();

    HelpdeskService.getOrg(vm.org.id).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    HelpdeskService.getHybridServices(vm.org.id).then(function (services) {
      vm.hybridServices = services;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    function showCard(type) {
      var entitlements = vm.org.entitlements;
      switch (type) {
        //TODO: Check for the CORRECT entitlements !!!
      case 'message':
        return _.includes(entitlements, "webex-squared"); //???
      case 'meeting':
        return _.includes(entitlements, "webex-squared"); //???
      case 'call':
        return _.includes(entitlements, "squared-call-initiation");
      case 'hybrid':
        return _.includes(entitlements, "squared-fusion-cal") || _.includes(entitlements, "squared-fusion-uc");
      case 'room':
        return _.includes(entitlements, "webex-squared"); //???
      case 'users':
        return _.includes(entitlements, "webex-squared"); //???
      }
      return true;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
