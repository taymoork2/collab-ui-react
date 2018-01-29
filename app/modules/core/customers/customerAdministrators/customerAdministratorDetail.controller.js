(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerAdministratorDetailCtrl', CustomerAdministratorDetail);

  /* @ngInject */
  function CustomerAdministratorDetail($stateParams, $translate, Analytics, Authinfo, CustomerAdministratorService, ModalService, Notification, Userservice) {
    var vm = this;
    var currentCustomer = $stateParams.currentCustomer;
    var customerOrgId = currentCustomer.customerOrgId;

    vm.disableAdminSearch = false;
    vm.error = false;

    vm.selected = '';
    vm.selectedAdmin = undefined;
    vm.foundUsers = [];
    vm.assignedAdmins = [];
    vm.addCustomerAdmin = addCustomerAdmin;
    vm.removeCustomerAdmin = removeCustomerAdmin;
    vm.getPartnerUsers = getPartnerUsers;
    vm.adminSuggestLimit = 8;
    vm.loading = false;
    vm.canAddUser = canAddUser;
    vm.resultsError = false;
    vm.resultsErrorMessage = '';
    vm.selectAdmin = selectAdmin;
    vm._helpers = {
      getFoundUsers: getFoundUsers,
      getAdminProfileFromUser: getAdminProfileFromUser,
      canAddUser: canAddUser,
      isUserAlreadyAssigned: isUserAlreadyAssigned,
      resetResultsError: resetResultsError,
      setResultsError: setResultsError,
    };

    init();

    function init() {
      CustomerAdministratorService.getCustomerAdmins(customerOrgId)
        .then(function (response) {
          var users = _.get(response, 'data.Resources', []);
          vm.assignedAdmins = _.map(users, getAdminProfileFromUser);
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'customerAdminPanel.customerAdministratorServiceError');
        });
    }

    function selectAdmin($item) {
      vm.selected = $item;
    }

    function addCustomerAdmin(fullName) {
      vm.loading = true;
      var user = _.find(vm.foundUsers, {
        fullName: fullName,
      });
      return CustomerAdministratorService.addCustomerAdmin(user, customerOrgId)
        .then(function () {
          vm.selected = '';
          vm.assignedAdmins.push(user);
          var uuid = _.get(user, 'uuid', 'N/A');
          Notification.success('customerAdminPanel.customerAdministratorAddSuccess');
          Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.ASSIGN, uuid, Authinfo.getOrgId());
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'customerAdminPanel.customerAdministratorAddFailure');
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function removeCustomerAdmin(fullName) {
      ModalService.open({
        title: $translate.instant('customerAdminPanel.deleteAdministrator'),
        message: $translate.instant('customerAdminPanel.deleteConfirmation', {
          pattern: fullName,
        }),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
        btnType: 'negative',
      }).result.then(function () {
        var user = _.find(vm.assignedAdmins, {
          fullName: fullName,
        });
        return CustomerAdministratorService.removeCustomerAdmin(user, customerOrgId)
          .then(function () {
            _.remove(vm.assignedAdmins, {
              fullName: fullName,
            });
            var uuid = _.get(user, 'uuid', 'N/A');
            Notification.success('customerAdminPanel.customerAdministratorRemoveSuccess');
            Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.REMOVE, uuid, Authinfo.getOrgId());
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'customerAdminPanel.customerAdministratorRemoveFailure');
          });
      }).catch(_.noop);
    }

    function getFoundUsers(str, users, limit) {
      var lcaseStr = str.toLowerCase();
      var foundUsers = [];

      _.every(users, function (user) {
        var adminProfile;
        var fullName = Userservice.getFullNameFromUser(user);
        var email = Userservice.getPrimaryEmailFromUser(user);
        var stringMatches = {
          fullName: fullName && _.includes(fullName.toLowerCase(), lcaseStr),
          displayName: user.displayName && _.includes(user.displayName.toLowerCase(), lcaseStr),
          email: email && _.includes(email.toLowerCase(), lcaseStr),
        };
        if (_.some(stringMatches)) {
          adminProfile = getAdminProfileFromUser(user);
          foundUsers.push(adminProfile);
        }
        return foundUsers.length < limit;
      });

      return foundUsers;
    }

    function getPartnerUsers(str) {
      resetResultsError();
      return CustomerAdministratorService.getPartnerUsers(str.split(' ')[0])
        .then(function (response) {
          var users = _.get(response, 'data.Resources', []);
          var searchUsers = getFoundUsers(str, users, vm.adminSuggestLimit);
          if (searchUsers.length === 0) {
            setResultsError('customerAdminPanel.noResultsError');
          } else {
            vm.foundUsers = searchUsers;
            return _.map(searchUsers, 'fullName');
          }
        })
        .catch(function (response) {
          if (_.get(response, 'status') === 403 && _.get(response, 'data.Errors[0].errorCode') === '200046') {
            setResultsError('customerAdminPanel.tooManyResultsError');
          }
          Notification.errorResponse(response, 'customerAdminPanel.customerAdministratorServiceError');
        });
    }

    function getAdminProfileFromUser(user) {
      var fullName = Userservice.getFullNameFromUser(user);
      var email = Userservice.getPrimaryEmailFromUser(user);
      var userName = _.get(user, 'userName');
      var uuid = _.get(user, 'id');
      var avatarSyncEnabled = _.get(user, 'avatarSyncEnabled', false);
      var roles = _.get(user, 'roles', []);
      var adminProfile = {
        uuid: uuid,
        userName: userName,
        fullName: fullName,
        email: email,
        roles: roles,
        avatarSyncEnabled: avatarSyncEnabled,
      };
      return adminProfile;
    }

    function canAddUser() {
      var fullName = vm.selected;
      var validUser = fullName && _.some(vm.foundUsers, {
        fullName: fullName,
      });
      return validUser && !vm._helpers.isUserAlreadyAssigned(fullName);
    }

    function isUserAlreadyAssigned(fullName) {
      return _.some(vm.assignedAdmins, {
        fullName: fullName,
      });
    }

    function resetResultsError() {
      vm.resultsError = false;
      vm.resultsErrorMessage = '';
    }

    function setResultsError(translateKey) {
      vm.resultsError = true;
      vm.resultsErrorMessage = $translate.instant(translateKey);
    }
  }
})();
