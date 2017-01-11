(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('AddTrialUsersController', AddTrialUsersController);

  /* @ngInject */
  function AddTrialUsersController($translate, MailValidatorService, Notification) {
    var vm = this;
    vm.emailTrialUsers = '';
    vm.localizedAddEmailWatermark = $translate.instant('hds.addtrialusers.emailNotificationsWatermark');
    vm.savingEmail = false;

    // TODO: get existing emails of the trial users here IF add trial users needs to show existing users.
    //       from the UE, it seems only new trial users here.

    vm.addUser = function () {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).toString();
      if (isValidEmails(emailTrialUsers)) {
        vm.savingEmail = true;
      }
    };

    vm.removeUser = function () {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).toString();
      if (isValidEmails(emailTrialUsers)) {
        vm.savingEmail = true;
      }
      if (0 == vm.emailTrialUsers.length) {
        vm.savingEmail = false;
      }
    };

    vm.saveTrialUsers = function () {
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).toString();
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
    };

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
