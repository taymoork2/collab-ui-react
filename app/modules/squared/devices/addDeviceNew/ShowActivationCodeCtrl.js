(function () {
  'use strict';

  angular.module('Core')
    .controller('ShowActivationCodeCtrl', ShowActivationCodeCtrl);
  /* @ngInject */
  function ShowActivationCodeCtrl($q, UserListService, OtpService, CsdmPlaceService, CsdmCodeService, $stateParams, XhrNotificationService, ActivationCodeEmailService, $translate, Notification) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.hideBackButton = vm.wizardData.function == "showCode";
    vm.showEmail = false;
    vm.selectedUser = "" + vm.wizardData.displayName + " (" + vm.wizardData.userName + ")";
    vm.email = {
      to: vm.wizardData.userName
    };
    vm.qrCode = undefined;
    vm.timeLeft = '';

    vm.getActivationCode = function () {
      return vm.wizardData.activationCode || (vm.wizardData.code && vm.wizardData.code.activationCode) || '';
    };

    if (vm.wizardData.deviceType === 'huron') {
      OtpService.getQrCodeUrl(vm.wizardData.activationCode || vm.wizardData.code.activationCode).then(function (qrcode) {
        var arrayData = '';
        for (var i in Object.keys(qrcode)) {
          if (qrcode.hasOwnProperty(i)) {
            arrayData += qrcode[i];
          }
        }
        vm.qrCode = arrayData;
      });
    } else if (!vm.wizardData.code || !vm.wizardData.code.activationCode) {
      var success = function success(code) {
        vm.isLoading = false;
        vm.wizardData.code = code;
        vm.activationCode = code.activationCode;
        vm.friendlyActivationCode = formatActivationCode(code.activationCode);
      };
      var error =
        function error(err) {
          XhrNotificationService.notify(err);
          vm.isLoading = false;
        };
      if (vm.place) {
        CsdmCodeService
          .createCodeForExisting(vm.place.cisUuid)
          .then(success, error);
      } else {
        if (vm.wizardData.deviceType === "cloudberry") {
          vm.isLoading = true;
          CsdmPlaceService.createPlace(vm.wizardData.deviceName, vm.wizardData.deviceType).then(function (place) {
            vm.place = place;
            CsdmCodeService
              .createCodeForExisting(place.cisUuid)
              .then(success, error);
          }, error);
        } else { //New Place
          success();
        }
      }
    }

    vm.activationFlowType = function () {
      if (vm.wizardData.deviceType === "cloudberry") {
        if (vm.wizardData.showPlaces) {
          return "places";
        }
        return "devices";
      }
      if (vm.wizardData.accountType === "shared") {
        return "places";
      }
      return "users";
    };

    function formatActivationCode(activationCode) {
      return activationCode ? activationCode.match(/.{4}/g).join('-') : '';
    }

    vm.friendlyActivationCode = formatActivationCode(vm.getActivationCode());

    vm.activateEmail = function () {
      vm.showEmail = true;
    };

    var timezone = jstz.determine().name();
    if (timezone === null || angular.isUndefined(timezone)) {
      timezone = 'UTC';
    }
    vm.getExpiresOn = function () {
      return moment(vm.wizardData.expiryTime || (vm.wizardData.code && vm.wizardData.code.expiresOn) || undefined).local().tz(timezone).format('LLL (z)');
    };

    vm.onTextClick = function ($event) {
      $event.target.select();
    };

    vm.searchUser = function (searchString) {
      var deferred = $q.defer();
      if (searchString.length >= 3) {
        var callback = function (data) {
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

    vm.selectUser = function ($item) {
      vm.selectedUser = "" + $item.extractedName + " (" + $item.userName + ")";
      vm.email.to = $item.userName;
      vm.foundUser = "";
    };

    vm.sendActivationCodeEmail = function sendActivationCodeEmail() {
      var entitleResult;
      var emailInfo = {
        email: vm.email.to,
        firstName: vm.email.to,
        oneTimePassword: vm.getActivationCode(),
        expiresOn: vm.getExpiresOn(),
        userId: vm.wizardData.cisUuid,
        customerId: vm.wizardData.organizationId
      };

      ActivationCodeEmailService.save({}, emailInfo, function () {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailSuccess'),
          type: 'success'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);

      }, function (error) {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailError') + "  " + error.data.error,
          type: 'error'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);
      });
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

  }
})();
