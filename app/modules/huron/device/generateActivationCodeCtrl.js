(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('GenerateActivationCodeCtrl', GenerateActivationCodeCtrl);

  /* @ngInject */
  function GenerateActivationCodeCtrl($stateParams, $translate, $window, OtpService, ActivationCodeEmailService, Notification, HttpUtils) {
    var vm = this;
    vm.showEmail = false;
    vm.userName = $stateParams.currentUser.userName;
    vm.otp = $stateParams.activationCode;
    vm.email = {
      to: vm.userName
        // subject: $translate.instant('generateActivationCodeModal.subjectContent'),
        // message: ''
    };
    vm.qrCodeUrl = '';
    vm.timeLeft = '';
    vm.activateEmail = activateEmail;
    vm.sendActivationCodeEmail = sendActivationCodeEmail;
    vm.clipboardFallback = clipboardFallback;

    activate();
    ////////////

    function activate() {
      HttpUtils.setTrackingID().then(function () {
        if (vm.otp === 'new') {
          return OtpService.generateOtp(vm.userName).then(function (otpObj) {
            vm.otp = otpObj;
            vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
            vm.qrCodeUrl = OtpService.getQrCodeUrl(otpObj.code);
          });
        } else {
          vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
          vm.qrCodeUrl = OtpService.getQrCodeUrl(vm.otp.code);
        }
      });
    }

    function activateEmail() {
      vm.showEmail = true;
    }

    function clipboardFallback(copy) {
      $window.prompt($translate.instant('generateActivationCodeModal.clipboardFallback'), copy);
    }

    function sendActivationCodeEmail() {
      var entitleResult;
      var emailInfo = {
        'email': vm.email.to,
        'firstName': vm.email.to,
        'oneTimePassword': vm.otp.code,
        'expiresOn': vm.otp.expiresOn
      };

      ActivationCodeEmailService.save({}, emailInfo, function (response) {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailSuccess'),
          type: 'success'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);
      }, function (error) {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailError') + "  " + error.data,
          type: 'error'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);
      });
    }
  }
})();
