(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerAdministratorDetailCtrl', CustomerAdministratorDetail);

  /* @ngInject */
  function CustomerAdministratorDetail($http, $q, $stateParams, $log, $translate, Authinfo, CustomerAdministratorService, Notification, ModalService) {
    var vm = this;
    var currentCustomer = $stateParams.currentCustomer;
    var customerOrgId = currentCustomer.customerOrgId;

    vm.disableAdminSearch = false;
    vm.error = false;

    vm.selected = '';
    vm.selectedAdmin = undefined;
    vm.searchUsers = [];
    vm.users = [];
    vm.administrators = [];
    vm.addAdmin = addAdmin;
    vm.unassignSalesAdmin = unassignSalesAdmin;

    init();

    function init() {
      getPartnerUsers();
      getAssignedSalesAdministrators();
    }

    vm.selectAdmin = function ($item) {
      vm.selected = $item;
    };

    function addAdmin(fullName) {
      var user = _.find(vm.users, {
        fullName: fullName
      });
      if (_.has(user, 'uuid')) {
        CustomerAdministratorService.addCustomerAdmin(customerOrgId, user.uuid)
          .then(function (response) {
            var fullName = '';
            if (response.data.name) {
              var givenName = _.get(response.data, 'name.givenName');
              var familyName = _.get(response.data, 'name.familyName');
              if (givenName && familyName) {
                fullName = givenName + ' ' + familyName;
              }
            } else if (response.data.displayName) {
              fullName = _.get(response.data, 'displayName');
            } else {
              fullName = _.get(response.data, 'username');
            }
            var userEmails = _.get(response.data, 'emails', []);
            var email = '';
            _.forEach(userEmails, function (emailDetail) {
              if (emailDetail.primary === true) {
                email = emailDetail.value;
              }
            });
            var uuid = _.get(response.data, 'id');
            var avatarSyncEnabled = _.get(response.data, 'avatarSyncEnabled');
            $log.log(fullName);
            var adminProfile = {
              uuid: uuid,
              fullName: fullName,
              avatarSyncEnabled: avatarSyncEnabled,
              email: email
            };
            vm.administrators.push(adminProfile);
            patchSalesAdminRole(email);
            Notification.success('customerAdminPanel.customerAdministratorAddSuccess');
          })
          .catch(function () {
            Notification.error('customerAdminPanel.customerAdministratorAddFailure');
          });
      }
    }

    function patchSalesAdminRole(email) {
      CustomerAdministratorService.patchSalesAdminRole(email)
        .catch(function () {
          var someUser = _.find(vm.administrators, {
            email: email
          });
          CustomerAdministratorService.unassignCustomerSalesAdmin(customerOrgId, someUser.uuid)
            .then(function () {
              var index = vm.administrators.indexOf(someUser);
              vm.administrators.splice(index, 1);
            });
        });
    }

    function unassignSalesAdmin(uuid, fullName) {
      ModalService.open({
        title: $translate.instant('customerAdminPanel.deleteAdministrator'),
        message: $translate.instant('customerAdminPanel.deleteConfirmation', {
          pattern: fullName
        }),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
        btnType: 'negative'
      }).result.then(function () {
        return CustomerAdministratorService.unassignCustomerSalesAdmin(customerOrgId, uuid)
          .then(function () {
            var someUser = _.find(vm.administrators, {
              uuid: uuid
            });
            var index = vm.administrators.indexOf(someUser);
            vm.administrators.splice(index, 1);
            Notification.success('customerAdminPanel.customerAdministratorRemoveSuccess');
          })
          .catch(function () {
            Notification.error('customerAdminPanel.customerAdministratorRemoverFailure');
          });
      });
    }

    function getPartnerUsers() {
      CustomerAdministratorService.getPartnerUsers()
        .then(function (response) {
          var resources = _.get(response, 'data.Resources', []);
          var fullName = '';
          var uuid = '';
          _.each(resources, function (user) {
            if (user.name) {
              var givenName = _.get(user, 'name.givenName');
              var familyName = _.get(user, 'name.familyName');
              if (givenName && familyName) {
                fullName = givenName + ' ' + familyName;
              }
            } else if (user.displayName) {
              fullName = _.get(user, 'displayName');
            } else {
              fullName = _.get(user, 'username');
            }
            uuid = _.get(user, 'id');
            vm.searchUsers.push(fullName);
            vm.users.push({
              fullName: fullName,
              uuid: uuid
            });
          });
        })
        .catch(function () {
          Notification.error('customerAdminPanel.customerAdministratorServiceError');
        });
    }

    function getAssignedSalesAdministrators() {
      CustomerAdministratorService.getAssignedSalesAdministrators(customerOrgId)
        .then(function (response) {
          var resources = _.get(response, 'data.Resources', []);
          _.forEach(resources, function (user) {
            var fullName = '';
            var uuid = '';
            var avatarSyncEnabled = false;
            var adminProfile = {};
            if (user.name) {
              var givenName = _.get(user, 'name.givenName');
              var familyName = _.get(user, 'name.familyName');
              if (givenName && familyName) {
                fullName = givenName + ' ' + familyName;
              }
            } else if (user.displayName) {
              fullName = _.get(user, 'displayName');
            } else {
              fullName = _.get(user, 'username');
            }
            var userEmails = _.get(response.data, 'emails', []);
            var email = '';
            _.forEach(userEmails, function (emailDetail) {
              if (emailDetail.primary === true) {
                email = emailDetail.value;
              }
            });
            uuid = _.get(user, 'id');
            avatarSyncEnabled = _.get(user, 'avatarSyncEnabled');
            adminProfile = {
              uuid: uuid,
              fullName: fullName,
              avatarSyncEnabled: avatarSyncEnabled,
              email: email
            };
            vm.administrators.push(adminProfile);
          });
        })
        .catch(function () {
          Notification.error('customerAdminPanel.customerAdministratorServiceError');
        });
    }
  }
})();
