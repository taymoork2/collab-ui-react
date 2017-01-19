(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('AddTrialUsersController', AddTrialUsersController);

  /* @ngInject */
  function AddTrialUsersController($translate, MailValidatorService, Notification) {
    var vm = this;
    vm.emailTrialUsers = '';
    vm.localizedAddEmailWatermark = $translate.instant('hds.addTrialUsers.emailNotificationsWatermark');
    vm.savingEmail = false;
    vm.addUser = addUser;
    vm.removeUser = removeUser;
    vm.saveTrialUsers = saveTrialUsers;

    // TODO: get existing emails of the trial users here IF add trial users needs to show existing users.
    //       from the UE, it seems only new trial users here.

    function addUser() {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).join(',');
      if (isValidEmails(emailTrialUsers)) {
        vm.savingEmail = true;
      }
    }

    function removeUser() {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).join(',');
      if (isValidEmails(emailTrialUsers)) {
        vm.savingEmail = true;
      }
      if (vm.emailTrialUsers.length === 0) {
        vm.savingEmail = false;
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
