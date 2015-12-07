(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, XhrNotificationService, USSService2, HelpdeskCardsUserService, Config) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.user) {
      vm.userId = $stateParams.user.id;
      vm.orgId = $stateParams.user.organization.id;
      vm.org = $stateParams.user.organization;
    } else {
      vm.userId = $stateParams.id;
      vm.orgId = $stateParams.orgId;
      vm.org = {
        id: $stateParams.orgId
      };
    }
    vm.resendInviteEmail = resendInviteEmail;
    vm.user = $stateParams.user;
    vm.resendInviteEnabled = false;
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.keyPressHandler = keyPressHandler;

    HelpdeskService.getUser(vm.orgId, vm.userId).then(initUserView, XhrNotificationService.notify);

    function resendInviteEmail() {
      HelpdeskService.resendInviteEmail(vm.user.displayName, vm.user.userName).then(angular.noop, XhrNotificationService.notify);
    }

    function initUserView(user) {
      vm.user = user;
      vm.resendInviteEnabled = _.includes(user.statuses, 'helpdesk.userStatuses.pending');
      vm.messageCard = HelpdeskCardsUserService.getMessageCardForUser(user);
      vm.meetingCard = HelpdeskCardsUserService.getMeetingCardForUser(user);
      vm.callCard = HelpdeskCardsUserService.getCallCardForUser(user);
      vm.hybridServicesCard = HelpdeskCardsUserService.getHybridServicesCardForUser(user);

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

      if (!vm.org.displayName && vm.org.id !== Config.consumerOrgId) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, XhrNotificationService.notify);
      }

      angular.element(".helpdesk-details").focus();
    }
  }

  function keyPressHandler(event) {
    if (event.keyCode === 27) { // Esc
      window.history.back();
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
