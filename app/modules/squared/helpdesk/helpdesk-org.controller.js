(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskCardsService) {
    var vm = this;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      vm.orgId = vm.org.id;
    } else {
      vm.orgId = $stateParams.id;
    }
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.roomSystemsCard = {};
    vm.healthStatuses = {
      message: 'unknown',
      meeting: 'unknown',
      call: 'unknown',
      room: 'unknown',
      hybrid: 'unknown'
    };

    HelpdeskService.getOrg(vm.orgId).then(initOrgView, XhrNotificationService.notify);
    HelpdeskCardsService.getHealthStatuses().then(initHealth, angular.noop);

    function initOrgView(org) {
      vm.org = org;
      vm.messageCard = HelpdeskCardsService.getMessageCardForOrg(org);
      vm.meetingCard = HelpdeskCardsService.getMeetingCardForOrg(org);
      vm.callCard = HelpdeskCardsService.getCallCardForOrg(org);
      vm.hybridServicesCard = HelpdeskCardsService.getHybridServicesCardForOrg(org);
      vm.roomSystemsCard = HelpdeskCardsService.getRoomSystemsCardForOrg(org);
      findPartners(org);
    }

    function initHealth(healthStatuses) {
      vm.healthStatuses = healthStatuses;
    }

    function findPartners(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.partners = [];
        _.each(org.managedBy, function (parnterOrg) {
          HelpdeskService.getOrg(parnterOrg.orgId).then(function (res) {
            org.partners.push(res);
          }, angular.noop);
        });
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
