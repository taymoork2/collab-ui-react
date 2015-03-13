'use strict';

angular.module('Core')
  .controller('SettingsMenuCtrl', ['$scope', '$location', '$state', '$translate', 'Authinfo', 'Utils', '$rootScope',
    function ($scope, $location, $state, $translate, Authinfo, Utils, $rootScope) {
      $scope.menuItems = [];

      var initialSetupText = $translate.instant('settings.initialSetup');
      var getAuthinfoData = function () {
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
      vm.label = $translate.instant('settings.title');
      vm.filterPlaceholder = $translate.instant('common.select');
      vm.selectPlaceholder = $translate.instant('common.selectLanguage');
      vm.selected = {};

      vm.options = [{
        value: 'da_DK',
        label: $translate.instant('languages.danish')
      }, {
        value: 'de_DE',
        label: $translate.instant('languages.german')
      }, {
        value: 'en_GB',
        label: $translate.instant('languages.englishBritish')
      }, {
        value: 'en_US',
        label: $translate.instant('languages.englishAmerican')
      }, {
        value: 'es_ES',
        label: $translate.instant('languages.spanishSpain')
      }, {
        value: 'es_LA',
        label: $translate.instant('languages.spanishColumbian')
      }, {
        value: 'fr_FR',
        label: $translate.instant('languages.french')
      }, {
        value: 'id_ID',
        label: $translate.instant('languages.indionesian')
      }, {
        value: 'it_IT',
        label: $translate.instant('languages.italian')
      }, {
        value: 'jp_JA',
        label: $translate.instant('languages.japanese')
      }, {
        value: 'ko_KR',
        label: $translate.instant('languages.korean')
      }, {
        value: 'nb_NO',
        label: $translate.instant('languages.norwegian')
      }, {
        value: 'nl_NL',
        label: $translate.instant('languages.dutch')
      }, {
        value: 'pl_PL',
        label: $translate.instant('languages.polish')
      }, {
        value: 'pt_BR',
        label: $translate.instant('languages.portugeseBrazillian')
      }, {
        value: 'ru_RU',
        label: $translate.instant('languages.russian')
      }, {
        value: 'sv_SE',
        label: $translate.instant('languages.swedish')
      }, {
        value: 'tr_TR',
        label: $translate.instant('languages.turkish')
      }, {
        value: 'zh_CN',
        label: $translate.instant('languages.chineseMandarin')
      }, {
        value: 'zh_TW',
        label: $translate.instant('languages.chineseTraditional')
      }];

      for (var x = 0; x < vm.options.length; x++) {
        var option = vm.options[x];
        if (option.value === $translate.use()) {
          vm.selected = option;
          break;
        }
      }

      $scope.updateLanguage = function () {
        $translate.use(vm.selected.value).then(function () {
          Authinfo.initializeTabs();
          $state.go('login');
          $rootScope.$broadcast('TABS_UPDATED');
        });
      };
    }
  ]);
