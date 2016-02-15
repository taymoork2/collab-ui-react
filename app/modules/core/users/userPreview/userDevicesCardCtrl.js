(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserDevicesCardCtrl', UserDevicesCardCtrl);

  /* @ngInject */
  function UserDevicesCardCtrl($translate) {
    var userDevicesCard = this;
    userDevicesCard.dropDownItems = [];
    userDevicesCard.addGenerateAuthCodeLink = addGenerateAuthCodeLink;
    var generateOtpLink = {
      name: 'generateAuthCode',
      text: $translate.instant('usersPreview.generateActivationCode'),
      state: "generateauthcode({currentUser: currentUser, activationCode: 'new'})"
    };

    ////////////

    function addGenerateAuthCodeLink() {
      userDevicesCard.dropDownItems.push(generateOtpLink);
    }
  }
})();
