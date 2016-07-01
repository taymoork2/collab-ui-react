(function () {
  'use strict';

  angular.module('Core')
    .controller('ChoosePersonalCtrl', ChoosePersonalCtrl);
  /* @ngInject */
  function ChoosePersonalCtrl($q, UserListService, OtpService, XhrNotificationService, MailValidatorService, $stateParams, $translate) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.radioSelect = null;
    vm.error = false;
    vm.selected = undefined;
    vm.selectedStates = [];
    vm.selectUser = selectUser;
    vm.errorInput = errorInput;
    vm.newUser = {
      firstName: undefined,
      lastName: undefined,
      emailAddress: undefined
    };

    vm.model = {
      userInputOption: 0,
      uploadProgress: 0
    };

    vm.strFirstName = $translate.instant('usersPage.firstNamePlaceHolder');
    vm.strLastName = $translate.instant('usersPage.lastNamePlaceHolder');
    vm.strEmailAddress = $translate.instant('usersPage.emailAddressPlaceHolder');
    var strNameAndEmailAdress = $translate.instant('usersPage.nameAndEmailAddress');
    vm.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');

    vm.userInputOptions = [{
      label: vm.strEmailAddress,
      value: 0,
      name: 'radioOption',
      id: 'radioEmail'
    }, {
      label: strNameAndEmailAdress,
      value: 1,
      name: 'radioOption',
      id: 'radioNamesAndEmail'
    }];

    vm.isNewCollapsed = true;
    vm.isExistingCollapsed = vm.wizardData.allowUserCreation;

    vm.validateTokens = function () {
      vm.deviceName = "NOT IMPLEMENTED";
    };

    vm.search = function (searchString) {
      var deferred = $q.defer();
      if (searchString.length >= 3) {
        var callback = function (data) {
          if (!data.success || !data.Resources) {
            deferred.resolve([]);
            return;
          }
          var userList = data.Resources.map(function (r) {
            var name = null;
            if (r.name) {
              name = r.name.givenName;
              if (r.name.familyName) {
                name += ' ' + r.name.familyName;
              }
            }
            if (_.isEmpty(name)) {
              name = r.displayName;
            }
            if (_.isEmpty(name)) {
              name = r.userName;
            }
            r.extractedName = name;
            return r;
          });
          deferred.resolve(userList);
        };
        UserListService.listUsers(0, 10, null, null, callback, searchString, false);
      } else {
        deferred.resolve([]);
      }
      return deferred.promise;
    };

    function selectUser($item) {
      vm.cisUuid = $item.id;
      vm.deviceName = $item.displayName;
      vm.userName = $item.userName;
      vm.displayName = $item.displayName;
      vm.selected = $item.extractedName;
      vm.organizationId = $item.meta.organizationID;
    }

    function errorInput() {
      vm.error = !vm.error;
    }

    vm.validateEmailField = function () {
      if (!vm.newUser.emailAddress || vm.newUser.emailAddress.length == 0) {
        vm.isValidEmailAddress = undefined;
      } else {
        if (MailValidatorService.isValidEmailCsv(vm.newUser.emailAddress)) {
          vm.isValidEmailAddress = true;
        } else {
          vm.isValidEmailAddress = false;
        }
      }
    };

    vm.next = function () {
      if (vm.cisUuid) {
        OtpService.generateOtp(vm.userName).then(function (code) {
          $stateParams.wizard.next({
            deviceName: vm.deviceName,
            activationCode: code.code,
            expiryTime: code.friendlyExpiresOn,
            cisUuid: vm.cisUuid,
            userName: vm.userName,
            displayName: vm.displayName,
            organizationId: vm.organizationId
          }, vm.radioSelect);
        }, XhrNotificationService.notify);
      } else {
        // create user!!!
        $stateParams.wizard.next({
          deviceName: "JUST A MOCK",
          activationCode: '1234567887654321',
          expiryTime: "never"
        }, vm.radioSelect);
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    vm.existing = function () {
      vm.radioSelect = "existing";
      vm.toggle();
    };

    vm.create = function () {
      vm.radioSelect = "create";
      vm.toggle();
    };

    vm.toggle = function () {
      vm.isNewCollapsed = vm.radioSelect == "existing";
      vm.isExistingCollapsed = vm.radioSelect == "create";
    };

    vm.isNameValid = function () {
      if (vm.cisUuid) {
        return true;
      } // hack;
      return vm.newUser.emailAddress && vm.newUser.emailAddress.length > 0 && vm.isValidEmailAddress;
    };

  }
})();
