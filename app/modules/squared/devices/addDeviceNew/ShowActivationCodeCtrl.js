(function () {
  'use strict';

  angular.module('Core')
    .controller('ShowActivationCodeCtrl', ShowActivationCodeCtrl);
  /* @ngInject */
  function ShowActivationCodeCtrl($q, UserListService, OtpService, CsdmDataModelService, CsdmHuronPlaceService, $stateParams, ActivationCodeEmailService, $translate, Notification, CsdmEmailService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.showATA = wizardData.showATA;
    vm.showPersonal = wizardData.showPersonal;
    vm.failure = false;
    vm.account = {
      name: wizardData.account.name,
      type: wizardData.account.type,
      deviceType: wizardData.account.deviceType,
      cisUuid: wizardData.account.cisUuid,
      isEntitledToHuron: wizardData.account.isEntitledToHuron
    };

    vm.hideBackButton = wizardData.function === 'showCode';
    vm.showEmail = false;
    vm.selectedUser = {
      nameWithEmail: '' + wizardData.recipient.displayName + ' (' + wizardData.recipient.email + ')',
      email: wizardData.recipient.email,
      cisUuid: wizardData.recipient.cisUuid,
      firstName: wizardData.recipient.firstName,
      orgId: wizardData.recipient.organizationId
    };
    vm.qrCode = undefined;
    vm.timeLeft = '';
    if (vm.account.type === 'personal') {
      if (vm.showPersonal) {
        if (vm.account.isEntitledToHuron) {
          vm.showPersonalText = true;
        } else {
          vm.showCloudberryText = true;
        }
      } else {
        if (vm.showATA) {
          vm.showHuronWithATAText = true;
        } else {
          vm.showHuronWithoutATAText = true;
        }
      }
    } else {
      if (vm.account.deviceType === 'huron') {
        if (vm.showATA) {
          vm.showHuronWithATAText = true;
        } else {
          vm.showHuronWithoutATAText = true;
        }
      } else {
        vm.showCloudberryText = true;
      }
    }

    vm.createActivationCode = function () {
      vm.isLoading = true;
      vm.failure = false;
      if (vm.account.deviceType === 'huron') {
        if (vm.account.type === 'shared') {
          if (vm.account.cisUuid) { // Existing place
            createCodeForHuronPlace(vm.account.cisUuid).then(success, error);
          } else { // New place
            createHuronPlace(vm.account.name, wizardData.account.directoryNumber, wizardData.account.externalNumber)
              .then(function (place) {
                vm.account.cisUuid = place.cisUuid;
                createCodeForHuronPlace(vm.account.cisUuid).then(success, error);
              }, error);
          }
        } else { // Personal (never create new)
          createCodeForHuronUser(wizardData.account.username);
        }
      } else { // Cloudberry
        if (vm.account.type === 'shared') {
          if (vm.account.cisUuid) { // Existing place
            createCodeForCloudberryAccount(vm.account.cisUuid).then(success, error);
          } else { // New place
            createCloudberryPlace(vm.account.name, wizardData.account.entitlements, wizardData.account.directoryNumber, wizardData.account.externalNumber)
              .then(function (place) {
                vm.account.cisUuid = place.cisUuid;
                createCodeForCloudberryAccount(vm.account.cisUuid).then(success, error);
              }, error);
          }
        } else { // Personal (never create new)
          createCodeForCloudberryAccount(vm.account.cisUuid).then(success, error);
        }
      }
    };

    function init() {
      vm.createActivationCode();
    }

    init();

    vm.onCopySuccess = function () {
      Notification.success(
        'generateActivationCodeModal.clipboardSuccess',
        undefined,
        'generateActivationCodeModal.clipboardSuccessTitle'
      );
    };

    vm.onCopyError = function () {
      Notification.error(
        'generateActivationCodeModal.clipboardError',
        undefined,
        'generateActivationCodeModal.clipboardErrorTitle'
      );
    };

    function generateQRCode() {
      var qrImage = require('qr-image');
      vm.qrCode = qrImage.imageSync(vm.activationCode, {
        ec_level: 'L',
        size: 14,
        margin: 5
      }).toString('base64');
      vm.isLoading = false;
    }

    function createHuronPlace(name, directoryNumber, externalNumber) {
      return CsdmDataModelService.createCmiPlace(name, directoryNumber, externalNumber);
    }

    function createCodeForHuronPlace(cisUuid) {
      return CsdmHuronPlaceService.createOtp(cisUuid);
    }

    function createCodeForHuronUser(username) {
      OtpService.generateOtp(username).then(function (code) {
        vm.activationCode = code.code;
        vm.friendlyActivationCode = formatActivationCode(vm.activationCode);
        vm.expiryTime = code.friendlyExpiresOn;
        generateQRCode();
      }, error);
    }

    function createCloudberryPlace(name, entitlements, directoryNumber, externalNumber) {
      return CsdmDataModelService.createCsdmPlace(name, entitlements, directoryNumber, externalNumber);
    }

    function createCodeForCloudberryAccount(cisUuid) {
      return CsdmDataModelService.createCodeForExisting(cisUuid);
    }

    function success(code) {
      if (code) {
        vm.activationCode = code.activationCode;
        vm.friendlyActivationCode = formatActivationCode(code.activationCode);
        vm.expiryTime = code.expiryTime;
        generateQRCode();
      }
    }


    function error(err) {
      Notification.errorResponse(err, 'addDeviceWizard.showActivationCode.failedToGenerateActivationCode');
      vm.isLoading = false;
      vm.failure = true;
    }

    function formatActivationCode(activationCode) {
      return activationCode ? activationCode.match(/.{4}/g).join('-') : '';
    }

    vm.friendlyActivationCode = formatActivationCode(vm.activationCode);

    vm.activateEmail = function () {
      vm.showEmail = true;
    };

    var timezone = jstz.determine().name();
    if (timezone === null || _.isUndefined(timezone)) {
      timezone = 'UTC';
    }
    vm.getExpiresOn = function () {
      return moment(vm.expiryTime || undefined).local().tz(timezone).format('LLL (z)');
    };

    vm.onTextClick = function ($event) {
      $event.target.select();
    };

    vm.searchUser = function (searchString) {
      if (searchString.length >= 3) {
        var deferredCustomerOrg = $q.defer();
        var deferredAdmin = $q.defer();
        var transformResults = function (deferred) {
          return function (data) {
            var userList = data.Resources.map(function (r) {
              var firstName = r.name && r.name.givenName;
              var lastName = r.name && r.name.familyName;
              return extractUserObject(firstName, lastName, r.displayName, r.userName, r.id, r.meta.organizationID);
            });
            deferred.resolve(userList);
          };
        };
        var searchMatchesAdmin = function () {
          return _.startsWith(wizardData.admin.userName, searchString) ||
            _.startsWith(wizardData.admin.firstName, searchString) ||
            _.startsWith(wizardData.admin.lastName, searchString) ||
            _.startsWith(wizardData.admin.displayName, searchString);
        };
        UserListService.listUsers(0, 6, null, null, transformResults(deferredCustomerOrg), searchString, false);
        if (wizardData.admin.organizationId !== wizardData.account.organizationId && searchMatchesAdmin()) {
          deferredAdmin.resolve([extractUserObject(wizardData.admin.firstName,
            wizardData.admin.lastName,
            wizardData.admin.displayName,
            wizardData.admin.userName,
            wizardData.admin.cisUuid,
            wizardData.admin.organizationId)]);
        } else {
          deferredAdmin.resolve([]);
        }
        return deferredAdmin.promise.then(function (ownOrgResults) {
          return deferredCustomerOrg.promise.then(function (customerOrgResults) {
            return _.sortBy(ownOrgResults.concat(customerOrgResults), ['extractedName', 'userName']);
          });
        });
      } else {
        return $q.resolve([]);
      }
    };

    var extractUserObject = function (firstName, lastName, displayName, userName, cisUuid, orgId) {
      var name = null;
      var returnFirstName = firstName;
      if (!_.isEmpty(firstName)) {
        name = firstName;
        if (!_.isEmpty(lastName)) {
          name += ' ' + lastName;
        }
      }

      if (_.isEmpty(name)) {
        name = displayName;
      }
      if (_.isEmpty(name)) {
        name = lastName;
      }
      if (_.isEmpty(name)) {
        name = userName;
      }
      if (_.isEmpty(returnFirstName)) {
        returnFirstName = displayName;
      }
      if (_.isEmpty(returnFirstName)) {
        returnFirstName = userName;
      }
      return {
        extractedName: name,
        firstName: returnFirstName,
        userName: userName,
        displayName: displayName,
        cisUuid: cisUuid,
        orgId: orgId
      };
    };

    vm.selectUser = function ($item) {
      vm.selectedUser = {
        nameWithEmail: "" + $item.extractedName + " (" + $item.userName + ")",
        email: $item.userName,
        cisUuid: $item.cisUuid,
        firstName: $item.firstName,
        orgId: $item.orgId
      };
      vm.foundUser = "";
    };

    vm.sendActivationCodeEmail = function sendActivationCodeEmail() {
      var success = function () {
        Notification.notify(
          [$translate.instant('generateActivationCodeModal.emailSuccess', {
            'address': vm.selectedUser.email
          })],
          'success',
          $translate.instant('generateActivationCodeModal.emailSuccessTitle')
        );
      };
      var error = function () {
        Notification.notify(
          [$translate.instant('generateActivationCodeModal.emailError', {
            'address': vm.selectedUser.email
          })],
          'error',
          $translate.instant('generateActivationCodeModal.emailErrorTitle')
        );
      };

      if (vm.account.deviceType === 'huron' && vm.account.type === 'personal') {
        var emailInfo = {
          email: vm.selectedUser.email,
          firstName: vm.selectedUser.firstName,
          oneTimePassword: vm.activationCode,
          expiresOn: vm.getExpiresOn(),
          userId: vm.selectedUser.cisUuid,
          customerId: vm.selectedUser.orgId
        };
        ActivationCodeEmailService.save({}, emailInfo, success, error);
      } else {
        var cbEmailInfo = {
          toCustomerId: vm.selectedUser.orgId,
          toUserId: vm.selectedUser.cisUuid,
          machineAccountCustomerId: wizardData.account.organizationId,
          machineAccountId: vm.account.cisUuid,
          activationCode: vm.activationCode,
          expiryTime: vm.getExpiresOn()
        };
        var mailFunction;
        if (vm.account.deviceType === 'cloudberry') {
          mailFunction = CsdmEmailService.sendCloudberryEmail;
        } else {
          mailFunction = CsdmEmailService.sendHuronEmail;
        }

        mailFunction(cbEmailInfo).then(success, error);
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
