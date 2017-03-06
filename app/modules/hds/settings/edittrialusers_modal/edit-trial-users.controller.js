(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('EditTrialUsersController', EditTrialUsersController);

  /* @ngInject */
  function EditTrialUsersController($translate, Authinfo, Userservice, HDSService, MailValidatorService, Notification) {
    var vm = this;
    vm.emailTrialUsers = [];
    vm.trialUserGroupId = null;
    vm.localizedAddEmailWatermark = $translate.instant('hds.resources.editTrialUsers.emailNotificationsWatermark');
    vm.hasTrialUsers = true;
    vm.savingEmail = false;
    vm.removeUser = removeUser;
    vm.addUser = addUser;
    vm.saveTrialUsers = saveTrialUsers;
    vm.getNumUsersInTagField = getNumUsersInTagField;
    vm.maxTrialUsers = 250;
    var localizedRefreshOtherServices = $translate.instant('hds.resources.addTrialUsers.refreshOtherServices');
    var localizedInvalidUsers = $translate.instant('hds.resources.editTrialUsers.invalidUsers');

    init();

    function init() {
      HDSService.getHdsTrialUserGroupID()
        .then(function (gid) {
          vm.trialUserGroupId = gid;
          getExistingTrialUsers();
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }

    function getExistingTrialUsers() {
      HDSService.getHdsTrialUsers(Authinfo.getOrgId(), vm.trialUserGroupId)
        .then(function (data) {
          vm.trialUsers = _.isObject(data.members) ? data.members : {};
          _.forEach(vm.trialUsers, function (user) {
            if (user) {
              Userservice.getUserAsPromise(user.value)
                .then(function (response) {
                  var email = response.data.userName;
                  user['email'] = email;
                  vm.emailTrialUsers.push({
                    text: email,
                  });
                });
            }
          });
          vm.numTrialUsers = vm.trialUsers.length;
        }).catch(function (error) {
          Notification.errorWithTrackingId(error);
        });
    }


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
      vm.emailTrialUsers = _.uniq(vm.emailTrialUsers);
      var emailTrialUsers = _.map(vm.emailTrialUsers, function (data) {
        return data.text;
      }).join(',');
      if (isValidEmails(emailTrialUsers)) {
        HDSService.queryUsers(Authinfo.getOrgId(), vm.emailTrialUsers)
          .then(function (data) {
            var numInvalidUsers = vm.emailTrialUsers.length - data.Resources.length;
            if (numInvalidUsers > 0) {
              Notification.error(numInvalidUsers + localizedInvalidUsers);
            }
            var jsonEmailTrialUsers = {
              schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
              meta: {
                attributes: [
                  'members',
                ],
              },
              members: _.map(data.Resources, function (resource) {
                return {
                  value: resource.id,
                };
              }),
            };
            HDSService.replaceHdsTrialUsers(Authinfo.getOrgId(), jsonEmailTrialUsers)
              .then(function () {
                vm.savingEmail = false;
                Notification.success('hercules.settings.emailNotificationsSavingSuccess');
                // refresh encryption server for the updated trial users
                HDSService.refreshEncryptionServerForTrialUsers(vm.trialUserGroupId)
                  .then(function () {
                    Notification.success(localizedRefreshOtherServices);
                  }).catch(function (error) {
                    Notification.errorWithTrackingId(error, localizedRefreshOtherServices);
                  });
              }).catch(function (error) {
                Notification.errorWithTrackingId(error, 'hercules.settings.emailNotificationsSavingError');
              });
          }).catch(function (error) {
            Notification.error(error);
          });
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
