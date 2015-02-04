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
    userDevicesCard.removeGenerateAuthCodeLink = removeGenerateAuthCodeLink;

    var generateOtpLink = {
      name: 'generateAuthCode',
      text: $translate.instant('usersPreview.generateActivationCode'),
      state: "generateauthcode({currentUser: currentUser, activationCode: 'new'})"
    };

    ////////////

    function addGenerateAuthCodeLink() {
      var foundLink = false;
      for (var i = 0; i < userDevicesCard.dropDownItems.length; i++) {
        if (userDevicesCard.dropDownItems[i].name === 'generateAuthCode') {
          foundLink = true;
        }
      };

      if (!foundLink) {
        userDevicesCard.dropDownItems.push(generateOtpLink);
      }
    }

    function removeGenerateAuthCodeLink() {
      for (var i = 0; i < userDevicesCard.dropDownItems.length; i++) {
        if (userDevicesCard.dropDownItems[i].name === 'generateAuthCode') {
          userDevicesCard.dropDownItems.splice(i, 1);
        }
      };
    }

  }
})();
