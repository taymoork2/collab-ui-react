(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, XhrNotificationService, USSService2, HelpdeskCardsService) {
    var vm = this;
    if ($stateParams.user) {
      vm.userId = $stateParams.user.id;
      vm.orgId = $stateParams.user.organization.id;
      vm.org = $stateParams.user.organization;
    } else {
      vm.userId = $stateParams.id;
      vm.orgId = $stateParams.orgId;
    }
    vm.resendInviteEmail = resendInviteEmail;
    vm.user = $stateParams.user;
    vm.resendInviteEnabled = false;
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};

    HelpdeskService.getUser(vm.orgId, vm.userId).then(initUserView, XhrNotificationService.notify);

    if (!vm.org || !vm.org.displayName) {
      // Only if there is no displayName. If set, the org has already been read (on the search page)
      HelpdeskService.getOrg(vm.orgId).then(function (res) {
        vm.org = res;
      }, XhrNotificationService.notify);
    }

    function resendInviteEmail() {
      HelpdeskService.resendInviteEmail(vm.user.displayName, vm.user.userName).then(angular.noop, XhrNotificationService.notify);
    }

    function initUserView(user) {
      vm.user = user;
      vm.resendInviteEnabled = _.includes(user.statuses, 'helpdesk.userStatuses.pending');
      vm.messageCard = HelpdeskCardsService.getMessageCardForUser(user);
      vm.meetingCard = HelpdeskCardsService.getMeetingCardForUser(user);
      vm.callCard = HelpdeskCardsService.getCallCardForUser(user);
      vm.hybridServicesCard = HelpdeskCardsService.getHybridServicesCardForUser(user);

      if (vm.hybridServicesCard.entitled) {
        USSService2.getStatusesForUserInOrg(vm.userId, vm.orgId).then(function (statuses) {
          _.each(statuses, function (status) {
            status.collapsedState = USSService2.decorateWithStatus(status);
            switch (status.serviceId) {
            case 'squared-fusion-cal':
              vm.hybridServicesCard.cal.status = status;
              break;
            case 'squared-fusion-uc':
              vm.hybridServicesCard.uc.status = status;
              break;
            case 'squared-fusion-ec':
              vm.hybridServicesCard.ec.status = status;
              break;
            }
          });
        }, XhrNotificationService.notify);
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
