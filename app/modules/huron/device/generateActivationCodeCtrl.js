(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('GenerateActivationCodeCtrl', GenerateActivationCodeCtrl);

  /* @ngInject */
  function GenerateActivationCodeCtrl($state, $filter, OtpService, DeviceService, HuronUser) {
    var vm = this;
    vm.showEmail = false;
    vm.userName = $state.params.currentUser.userName;
    vm.email = {
      to: vm.userName,
      subject: $filter('translate')('generateActivationCodeModal.subjectContent'),
      message: ''
    };
    vm.qrCodeUrl = '';
    vm.otp = {};
    vm.friendlyExpiresOn = '';
    vm.timeLeft = '';
    vm.activateEmail = activateEmail;
    vm.getHyphenatedActivationCode = getHyphenatedActivationCode;

    activate();
    ////////////

    function activate() {
      HuronUser.acquireOTP(vm.userName).then(function (otpObj) {
        vm.otp = otpObj;
        // TODO:  Detect user's timezone instead of hardcoding Pacific
        vm.friendlyExpiresOn = moment.tz(vm.otp.expiresOn, 'America/Los_Angeles').format('MMMM DD, YYYY h:mmA');
        vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
        vm.qrCodeUrl = DeviceService.getQrCodeUrl(otpObj.password);
      });
    }

    function activateEmail() {
      vm.showEmail = true;
    }

    function getHyphenatedActivationCode() {
      return OtpService.hyphenateOtp(vm.otp.password);
    }

  }

})();
