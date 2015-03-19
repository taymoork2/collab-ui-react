(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserOverviewCtrl', UserOverviewCtrl);

  /* @ngInject */
  function UserOverviewCtrl($stateParams, $translate, Authinfo) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
    vm.queryuserslist = $stateParams.queryuserslist;
    vm.services = [];
    vm.dropDownItems = [];
    vm.addGenerateAuthCodeLink = addGenerateAuthCodeLink;
    vm.removeGenerateAuthCodeLink = removeGenerateAuthCodeLink;
    vm.hasAccount = Authinfo.hasAccount();
    vm.isSquaredUC = Authinfo.isSquaredUC();
    vm.isFusion = Authinfo.isFusion();

    var hasEntitlement = function (entitlement) {
      var userEntitlements = vm.currentUser.entitlements;
      if (userEntitlements) {
        for (var n = 0; n < userEntitlements.length; n++) {
          var ent = userEntitlements[n];
          if (ent === entitlement) {
            return true;
          }
        }
      }
      return false;
    };

    var generateOtpLink = {
      name: 'generateAuthCode',
      text: $translate.instant('usersPreview.generateActivationCode'),
      state: 'generateauthcode({currentUser: userOverview.currentUser, activationCode: \'new\'})'
    };

    function activate() {
      vm.services = [];

      var msgState = {
        name: $translate.instant('onboardModal.messaging'),
        state: 'user-overview.messaging'
      };

      var commState = {
        name: $translate.instant('onboardModal.communications'),
        state: 'user-overview.communication'
      };

      var confState = {
        name: $translate.instant('onboardModal.conferencing'),
        state: 'user-overview.conferencing'
      };

      var webexState = {
        name: "WebEx Session Enablement",
        state: 'user-overview.webex'
      };

      var webex2State = {
        name: "WebEx Privileges",
        state: 'user-overview.webex2'
      };

      if (hasEntitlement('squared-room-moderation') || !vm.hasAccount) {
        vm.services.push(msgState);
      }
      if (hasEntitlement('squared-syncup')) {
        vm.services.push(confState);
      }
      if (hasEntitlement('ciscouc')) {
        vm.services.push(commState);
      }

      // vm.services.push(webexState);
      // vm.services.push(webex2State);
    }

    activate();

    function addGenerateAuthCodeLink() {
      var foundLink = false;
      for (var i = 0; i < vm.dropDownItems.length; i++) {
        if (vm.dropDownItems[i].name === 'generateAuthCode') {
          foundLink = true;
        }
      }

      if (!foundLink) {
        vm.dropDownItems.push(generateOtpLink);
      }
    }

    function removeGenerateAuthCodeLink() {
      for (var i = 0; i < vm.dropDownItems.length; i++) {
        if (vm.dropDownItems[i].name === 'generateAuthCode') {
          vm.dropDownItems.splice(i, 1);
        }
      }
    }

  }
})();
