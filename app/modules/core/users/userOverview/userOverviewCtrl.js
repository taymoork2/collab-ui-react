(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserOverviewCtrl', UserOverviewCtrl);

  /* @ngInject */
  function UserOverviewCtrl($scope, $stateParams, $translate, $http, Authinfo, Config, Utils) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
    vm.queryuserslist = $stateParams.queryuserslist;
    vm.services = [];
    vm.dropDownItems = [];
    vm.titleCard = '';
    vm.subTitleCard = '';
    vm.addGenerateAuthCodeLink = addGenerateAuthCodeLink;
    vm.removeGenerateAuthCodeLink = removeGenerateAuthCodeLink;
    vm.hasAccount = Authinfo.hasAccount();
    vm.isSquaredUC = Authinfo.isSquaredUC();
    vm.isFusion = Authinfo.isFusion();
    vm.isFusionCal = Authinfo.isFusionCal();

    init();

    var generateOtpLink = {
      name: 'generateAuthCode',
      text: $translate.instant('usersPreview.generateActivationCode'),
      state: 'generateauthcode({currentUser: userOverview.currentUser, activationCode: \'new\'})'
    };

    function hasEntitlement(entitlement) {
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
    }

    function getCurrentUser() {
      var scimUrl = Config.getScimUrl();
      var userUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]) + '/' + vm.currentUser.id;

      $http.get(userUrl)
        .then(function (response) {
          angular.copy(response.data, vm.currentUser);
          vm.entitlements = Utils.getSqEntitlements(vm.currentUser);
          updateUserTitleCard();
          init();
        });
    }

    function init() {
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

      if (hasEntitlement('squared-room-moderation') || !vm.hasAccount) {
        vm.services.push(msgState);
      }
      if (hasEntitlement('squared-syncup')) {
        vm.services.push(confState);
      }
      if (hasEntitlement('ciscouc')) {
        vm.services.push(commState);
      }

      updateUserTitleCard();
    }

    $scope.$on('USER_LIST_UPDATED', function () {
      getCurrentUser();
    });

    $scope.$on('entitlementsUpdated', function () {
      getCurrentUser();
    });

    function updateUserTitleCard() {
      if (vm.currentUser.displayName) {
        vm.titleCard = vm.currentUser.displayName;
      } else if (vm.currentUser.name) {
        vm.titleCard = (vm.currentUser.name.givenName || '') + ' ' + (vm.currentUser.name.familyName || '');
      } else {
        vm.titleCard = vm.currentUser.userName;
      }

      if (vm.currentUser.title) {
        vm.subTitleCard = vm.currentUser.title;
      }
      if (angular.isArray(vm.currentUser.addresses) && vm.currentUser.addresses.length) {
        vm.subTitleCard += ' ' + (vm.currentUser.addresses[0].locality || '');
      }
      if (!vm.subTitleCard && vm.titleCard != vm.currentUser.userName) {
        vm.subTitleCard = vm.currentUser.userName;
      }
    }

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
