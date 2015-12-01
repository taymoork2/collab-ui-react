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
    vm.adminUserLimit = 1;
    vm.showAllAdminUsers = showAllAdminUsers;

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
      findAdminUsers(org);
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
          HelpdeskService.getOrgDisplayName(parnterOrg.orgId).then(function (displayName) {
            org.managedByOrgs.push({
              id: parnterOrg.orgId,
              displayName: displayName
            });
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

    function findAdminUsers(org) {
      HelpdeskService.searchUsers('', org.id, 100, 'id_full_admin').then(function (users) {
        vm.adminUsers = users;
        vm.showAllAdminUsersText = $translate.instant('helpdesk.showAllAdminUsers', {
          numUsers: users.length
        });
      }, XhrNotificationService.notify);
    }

    function showAllAdminUsers() {
      vm.adminUserLimit = vm.adminUsers.length;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
