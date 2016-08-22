(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerAdministratorDetailCtrl', CustomerAdministratorDetail);

  /* @ngInject */
  function CustomerAdministratorDetail($stateParams, $translate, Analytics, Authinfo, Config, CustomerAdministratorService, Notification, ModalService) {
    var vm = this;
    var currentCustomer = $stateParams.currentCustomer;
    var customerOrgId = currentCustomer.customerOrgId;

    vm.disableAdminSearch = false;
    vm.error = false;

    vm.selected = '';
    vm.selectedAdmin = undefined;
    vm.users = [];
    vm.administrators = [];
    vm.addAdmin = addAdmin;
    vm.getPartnerUsers = getPartnerUsers;
    vm.removeSalesAdmin = removeSalesAdmin;
    vm.adminSuggestLimit = 8;
    vm.resultsError = false;
    vm.resultsErrorMessage = '';

    init();

    function init() {
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
        return CustomerAdministratorService.addCustomerAdmin(customerOrgId, user.uuid)
          .then(addCustomerAdminToList)
          .catch(function () {
            Notification.error('customerAdminPanel.customerAdministratorAddFailure');
          });
      }
    }

    function addCustomerAdminToList(response) {
      var fullName = '';
      if (_.has(response.data, 'name')) {
        var givenName = _.get(response.data, 'name.givenName');
        var familyName = _.get(response.data, 'name.familyName');
        if (givenName && familyName) {
          fullName = givenName + ' ' + familyName;
        }
      } else if (_.has(response.data, 'displayName')) {
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
      var roles = _.get(response.data, 'roles');
      var uuid = _.get(response.data, 'id');
      var avatarSyncEnabled = _.get(response.data, 'avatarSyncEnabled');
      var adminProfile = {
        uuid: uuid,
        fullName: fullName,
        avatarSyncEnabled: avatarSyncEnabled,
        email: email,
        roles: roles
      };
      vm.administrators.push(adminProfile);

      var isNotFullAdmin = Authinfo.hasRole(Config.backend_roles.full_admin);
      var isNotSalesAdmin = Authinfo.hasRole(Config.backend_roles.sales);

      if (isNotFullAdmin && isNotSalesAdmin) {
        patchSalesAdminRole(email);
      }
      Notification.success('customerAdminPanel.customerAdministratorAddSuccess');
      Analytics.trackPartnerActions(Analytics.eventNames.ASSIGN, uuid, Authinfo.getOrgId());
    }

    function patchSalesAdminRole(email) {
      CustomerAdministratorService.patchSalesAdminRole(email)
        .catch(function () {
          var someUser = _.find(vm.administrators, {
            email: email
          });
          CustomerAdministratorService.removeCustomerSalesAdmin(customerOrgId, someUser.uuid)
            .then(function () {
              var index = vm.administrators.indexOf(someUser);
              vm.administrators.splice(index, 1);
            });
        });
    }

    function removeSalesAdmin(uuid, fullName) {
      ModalService.open({
        title: $translate.instant('customerAdminPanel.deleteAdministrator'),
        message: $translate.instant('customerAdminPanel.deleteConfirmation', {
          pattern: fullName
        }),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
        btnType: 'negative'
      }).result.then(function () {
        return CustomerAdministratorService.removeCustomerSalesAdmin(customerOrgId, uuid)
          .then(function () {
            var someUser = _.find(vm.administrators, {
              uuid: uuid
            });
            var index = vm.administrators.indexOf(someUser);
            vm.administrators.splice(index, 1);
            Notification.success('customerAdminPanel.customerAdministratorRemoveSuccess');
            Analytics.trackPartnerActions(Analytics.eventNames.REMOVE, uuid, Authinfo.getOrgId());
          })
          .catch(function () {
            Notification.error('customerAdminPanel.customerAdministratorRemoverFailure');
          });
      });
    }

    function getPartnerUsers(str) {
      vm.resultsError = false;
      return CustomerAdministratorService.getPartnerUsers(str.split(' ')[0])
        .then(function (response) {
          var resources = _.get(response, 'data.Resources', []);
          var searchUsers = [];
          var fullName = '';
          var uuid = '';
          _.every(resources, function (user) {
            if (user.name) {
              var givenName = user.name.givenName;
              var familyName = user.name.familyName;
              if (givenName && familyName) {
                fullName = givenName + ' ' + familyName;
              }
            } else if (user.displayName) {
              fullName = user.displayName;
            } else {
              fullName = user.userName;
            }
            uuid = user.id;
            if (fullName.toLowerCase().indexOf(str.toLowerCase()) !== -1 ||
              user.displayName.toLowerCase().indexOf(str.toLowerCase()) !== -1 ||
              user.userName.toLowerCase().indexOf(str.toLowerCase()) !== -1) {
              searchUsers.push(fullName);
              vm.users.push({
                fullName: fullName,
                uuid: uuid
              });
            }
            return searchUsers.length < vm.adminSuggestLimit;
          });
          if (searchUsers.length === 0) {
            vm.resultsError = true;
            vm.resultsErrorMessage = $translate.instant('customerAdminPanel.noResultsError');
          }
          return searchUsers;
        })
        .catch(function (err) {
          if (_.get(err, 'status') === 403 && _.get(err, 'data.Errors[0].errorCode') === '200046') {
            vm.resultsError = true;
            vm.resultsErrorMessage = $translate.instant('customerAdminPanel.tooManyResultsError');
          }
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
              var givenName = user.name.givenName;
              var familyName = user.name.familyName;
              if (givenName && familyName) {
                fullName = givenName + ' ' + familyName;
              }
            } else if (user.displayName) {
              fullName = user.displayName;
            } else {
              fullName = user.userName;
            }
            var userEmails = _.get(response.data, 'emails', []);
            var email = '';
            _.forEach(userEmails, function (emailDetail) {
              if (emailDetail.primary === true) {
                email = emailDetail.value;
              }
            });
            uuid = user.id;
            avatarSyncEnabled = user.avatarSyncEnabled;
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
