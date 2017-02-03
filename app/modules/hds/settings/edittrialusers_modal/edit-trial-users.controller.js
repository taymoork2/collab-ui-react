(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('EditTrialUsersController', EditTrialUsersController);

  /* @ngInject */
  function EditTrialUsersController($translate, MailValidatorService, Notification) {
    var vm = this;
    vm.emailTrialUsers = ["user1@cisco.com", "user2@cisco.com", "user3@cisco.com", "user4@cisco.com", "user5@cisco.com"]; // TODO: rm data when APIs ready
    vm.localizedAddEmailWatermark = $translate.instant('hds.resources.editTrialUsers.emailNotificationsWatermark');
    vm.hasTrialUsers = true;
    vm.savingEmail = false;
    vm.removeUser = removeUser;
    vm.addUser = addUser;
    vm.saveTrialUsers = saveTrialUsers;
    vm.getNumUsersInTagField = getNumUsersInTagField;
    vm.maxTrialUsers = 250;
    // TODO: check if input is valid user

    function removeUser(email) {
      if (email) {
        vm.savingEmail = true;
      }
    }

    function addUser() {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).join(',');
      if (isValidEmails(emailTrialUsers)) {
        vm.savingEmail = true;
      }
    }

    function saveTrialUsers() {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).join(',');
      if (isValidEmails(emailTrialUsers)) {
        // TODO: use the real API when available
        /*ServiceDescriptor.setEmailSubscribers('squared-fusion-uc', emailSubscribers, function (statusCode) {
          if (statusCode === 204) {
            Notification.success('hercules.settings.emailNotificationsSavingSuccess');
          } else {
            Notification.error('hercules.settings.emailNotificationsSavingError');
          }
          vm.savingEmail = false;
        });*/
        vm.savingEmail = false;
      }
    }

    function getNumUsersInTagField() {
      return vm.emailTrialUsers.length;
    }

    function isValidEmails(emails) {
      if (emails && !MailValidatorService.isValidEmailCsv(emails)) {
        Notification.error('hercules.errors.invalidEmail');
        return false;
      } else {
        return true;
      }
    }
  }
})();
