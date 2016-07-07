(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('GenerateActivationCodeCtrl', GenerateActivationCodeCtrl);

  /* @ngInject */
  function GenerateActivationCodeCtrl($previousState, $stateParams, $state, $translate, $window, OtpService, ActivationCodeEmailService, Notification) {
    var vm = this;
    vm.showEmail = false;
    vm.userName = $stateParams.currentUser.userName;
    vm.otp = $stateParams.activationCode;
    vm.email = {
      to: vm.userName
    };
    vm.qrCode = '';
    vm.timeLeft = '';
    vm.activateEmail = activateEmail;
    vm.sendActivationCodeEmail = sendActivationCodeEmail;
    vm.clipboardFallback = clipboardFallback;

    function handleError(response) {
      Notification.errorResponse(response,
        _.get(response, 'status') === 404 ? 'generateActivationCodeModal.generateErrorNotFound' : 'generateActivationCodeModal.generateError'
      );
      $previousState.go();
    }

    function activate() {
      if (vm.otp === 'new') {
        return OtpService.generateOtp(vm.userName).then(function (otpObj) {
          vm.otp = otpObj;
          vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
          setQRCode(vm.otp.code);
        }).catch(handleError);
      } else if (vm.otp.code) {
        vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
        setQRCode(vm.otp.code);
      } else {
        $state.go('users.list');
      }
    }

    function setQRCode(code) {
      if (angular.isString(code) && code.length > 0) {
        OtpService.getQrCodeUrl(code).then(function (qrcode) {
          var arrayData = '';
          for (var i in Object.keys(qrcode)) {
            if (qrcode.hasOwnProperty(i)) {
              arrayData += qrcode[i];
            }
          }
          vm.qrCode = arrayData;
        });
      }
    }

    function activateEmail() {
      vm.showEmail = true;
    }

    function clipboardFallback() {
      $window.prompt($translate.instant('generateActivationCodeModal.clipboardFallback'), _.get(vm, 'otp.friendlyCode'));
    }

    function sendActivationCodeEmail() {
      var entitleResult;
      var timezone = jstz.determine().name();
      if (timezone === null || angular.isUndefined(timezone)) {
        timezone = 'UTC';
      }
      var expiresOn = moment(vm.otp.expiresOn).local().tz(timezone).format('MMMM DD, YYYY h:mm A (z)');

      var emailInfo = {
        email: vm.email.to,
        firstName: vm.email.to,
        oneTimePassword: vm.otp.code,
        expiresOn: expiresOn,
        userId: _.get($stateParams.currentUser, 'id'),
        customerId: _.get($stateParams.currentUser, 'meta.organizationID')
      };

      ActivationCodeEmailService.save({}, emailInfo, function () {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailSuccess'),
          type: 'success'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);

        if (angular.isDefined($state.modal) && angular.isFunction($state.modal.close)) {
          $state.modal.close();
        }
      }, function (error) {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailError') + "  " + error.data,
          type: 'error'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);
      });
    }

    activate();
  }
})();
