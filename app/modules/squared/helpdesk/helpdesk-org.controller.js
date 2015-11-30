(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskCardsService, Config, $translate, LicenseService) {
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
    vm.statusPageUrl = Config.getStatusPageUrl();

    HelpdeskService.getOrg(vm.orgId).then(initOrgView, XhrNotificationService.notify);
    HelpdeskCardsService.getHealthStatuses().then(initHealth, angular.noop);

    function initOrgView(org) {
      vm.org = org;
      vm.delegatedAdministration = org.delegatedAdministration ? $translate.instant('helpdesk.delegatedAdministration', {
        numManages: org.manages ? org.manages.length : 0
      }) : null;
      LicenseService.getLicensesInOrg(vm.orgId).then(initCards, XhrNotificationService.notify);
      findManagedByOrgs(org);
      findWebExSites(org);
    }

    function initCards(licenses) {
      vm.messageCard = HelpdeskCardsService.getMessageCardForOrg(vm.org, licenses);
      vm.meetingCard = HelpdeskCardsService.getMeetingCardForOrg(vm.org, licenses);
      vm.callCard = HelpdeskCardsService.getCallCardForOrg(vm.org, licenses);
      vm.hybridServicesCard = HelpdeskCardsService.getHybridServicesCardForOrg(vm.org);
      vm.roomSystemsCard = HelpdeskCardsService.getRoomSystemsCardForOrg(vm.org, licenses);
    }

    function initHealth(healthStatuses) {
      vm.healthStatuses = healthStatuses;
    }

    function findManagedByOrgs(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.managedByOrgs = [];
        _.each(org.managedBy, function (parnterOrg) {
          HelpdeskService.getOrg(parnterOrg.orgId).then(function (res) {
            org.managedByOrgs.push(res);
          }, angular.noop);
        });
      }
    }

    function findWebExSites(org) {
      if (LicenseService.orgIsEntitledTo(org, 'cloudMeetings')) {
        HelpdeskService.getWebExSites(vm.orgId).then(function (sites) {
          vm.org.webExSites = sites;
        }, XhrNotificationService.notify);
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
