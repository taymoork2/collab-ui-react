(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('AddTrialUsersController', AddTrialUsersController);

  /* @ngInject */
  function AddTrialUsersController($translate, Authinfo, HDSService, MailValidatorService, Notification) {
    var vm = this;
    vm.emailTrialUsers = '';
    vm.trialUserGroupId = null;
    vm.localizedAddEmailWatermark = $translate.instant('hds.resources.addTrialUsers.emailNotificationsWatermark');
    vm.savingEmail = false;
    vm.addUser = addUser;
    vm.removeUser = removeUser;
    vm.saveTrialUsers = saveTrialUsers;

    init();

    function init() {
      vm.trialUserGroupId = HDSService.getHdsTrialUserGroupID();
    }

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
        var jsonEmailTrialUsers = {
          "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
          "members": []
        };
        HDSService.queryUsers(Authinfo.getOrgId(), vm.emailTrialUsers)
          .then(function (response) {
            var numInvalidUsers = vm.emailTrialUsers.length - response.data.Resources.length;
            if (numInvalidUsers > 0) {
              Notification.error(numInvalidUsers + " not valid user(s) in this org won't be saved.");
            }
            _.forEach(response.data.Resources, function (resource) {
              var uid = resource.id;
              jsonEmailTrialUsers.members.push({
                "value": uid
              });
            });
            HDSService.addHdsTrialUsers(Authinfo.getOrgId(), jsonEmailTrialUsers)
              .then(function () {
                vm.savingEmail = false;
                Notification.success('hercules.settings.emailNotificationsSavingSuccess');
              }).catch(function (error) {
                Notification.error('hercules.settings.emailNotificationsSavingError' + error.status + error.statusText);
              });
          }).catch(function (error) {
            Notification.error(error);
          });
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
