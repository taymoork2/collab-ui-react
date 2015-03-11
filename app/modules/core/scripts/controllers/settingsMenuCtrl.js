'use strict';

angular.module('Core')
  .controller('SettingsMenuCtrl', ['$scope', '$location', '$state', '$translate', 'Authinfo', 'Utils',
    function ($scope, $location, $state, $translate, Authinfo, Utils) {
      $scope.menuItems = [];

      var initialSetupText = $translate.instant('settings.initialSetup');
      var getAuthinfoData = function () {
        var partnerAdminProfile = {
          link: '/profile/true',
          title: $translate.instant('partnerProfile.link')
        };
        var customerAdminProfile = {
          link: '/profile/false',
          title: $translate.instant('partnerProfile.customerLink')
        };

        if (Authinfo.isPartner()) {
          if ($scope.menuItems.indexOf(partnerAdminProfile) == -1) {
            $scope.menuItems.push(partnerAdminProfile);
          }
        } else if (Authinfo.isCustomerAdmin()) {
          if ($scope.menuItems.indexOf(customerAdminProfile) == -1) {
            $scope.menuItems.push(customerAdminProfile);
          }
        }

        var found = false;
        if (Authinfo.isCustomerAdmin()) {
          for (var i = 0, l = $scope.menuItems.length; i < l; i++) {
            if ($scope.menuItems[i].title === initialSetupText) {
              found = true;
            }
          }
          if (!found) {
            $scope.menuItems.push({
              link: '/initialsetup',
              title: initialSetupText
            });
          }
        }
      };
      if (Utils.isAdminPage()) {
        getAuthinfoData();
      }
      //update the scope when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function () {
        getAuthinfoData();
      });

      $scope.doAction = function (path) {
        if (path === '/initialsetup') {
          $state.go('setupwizardmodal');
        } else {
          $location.path(path);
        }
      };

      var vm = this;
      vm.options = [];
      vm.filterPlaceholder = $translate.instant('common.select');
      vm.selectPlaceholder = $translate.instant('common.selectLanguage');
      vm.selected = {};

      vm.options = [{
        value: 'da_DK',
        label: 'Danish'
      }, {
        value: 'de_DE',
        label: 'German'
      }, {
        value: 'en_GB',
        label: 'English(British)'
      }, {
        value: 'en_US',
        label: 'English(American)'
      }, {
        value: 'es_ES',
        label: 'Spanish(Spain)'
      }, {
        value: 'es_LA',
        label: 'Spanish(Latin America)'
      }, {
        value: 'fr_FR',
        label: 'French'
      }, {
        value: 'id_ID',
        label: 'Indionesian'
      }, {
        value: 'it_IT',
        label: 'Italian'
      }, {
        value: 'jp_JA',
        label: 'Japanese'
      }, {
        value: 'ko_KR',
        label: 'Korean'
      }, {
        value: 'nb_NO',
        label: 'Norwegian'
      }, {
        value: 'nl_NL',
        label: 'Netherlands'
      }, {
        value: 'pl_PL',
        label: 'Polish'
      }, {
        value: 'pt_BR',
        label: 'Brazilian'
      }, {
        value: 'ru_RU',
        label: 'Russian'
      }, {
        value: 'sv_SE',
        label: 'Swedish'
      }, {
        value: 'tr_TR',
        label: 'Turkish'
      }, {
        value: 'zh_CN',
        label: 'Chinese(Mandarin)'
      }, {
        value: 'zh_TW',
        label: 'Chinese(Traditional)'
      }];

      for (var x = 0; x < vm.options.length; x++) {
        var option = vm.options[x];
        if (option.value === $translate.use()) {
          vm.selected = option;
          break;
        }
      }

      $scope.updateLanguage = function () {
        $translate.use(vm.selected.value);
        $state.go('overview');
        Authinfo.initializeTabs();
      };
    }
  ]);
