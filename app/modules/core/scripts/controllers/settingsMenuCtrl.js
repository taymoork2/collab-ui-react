'use strict';

angular.module('Core')
  .controller('SettingsMenuCtrl', ['$scope', '$location', '$state', '$translate', 'Authinfo', 'Utils', '$rootScope', '$log',
    function ($scope, $location, $state, $translate, Authinfo, Utils, $rootScope, $log) {
      $scope.menuItems = [];

      var planReviewText = $translate.instant('firstTimeWizard.planReview');
      var enterpriseSettingsText = $translate.instant('firstTimeWizard.enterpriseSettings');
      var addUsersText = $translate.instant('firstTimeWizard.addUsers');
      var serviceSetupText = $translate.instant('firstTimeWizard.serviceSetup');

      var getAuthinfoData = function () {
        if (Authinfo.isCustomerAdmin()) {
          $scope.menuItems.push({
            link: '/planreview',
            title: planReviewText
          }, {
            link: '/enterprisesettings',
            title: enterpriseSettingsText
          }, {
            link: '/addusers',
            title: addUsersText
          });

          if (Authinfo.isSquaredUC()) {
            $scope.menuItems.push({
              link: 'servicesetup',
              title: serviceSetupText
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
        if (path === '/planreview') {
          $state.go('setupwizardmodal', {
            currentTab: 'planReview'
          });
        } else if (path === '/enterprisesettings') {
          $state.go('setupwizardmodal', {
            currentTab: 'enterpriseSettings'
          });
        } else if (path === '/addusers') {
          $state.go('setupwizardmodal', {
            currentTab: 'addUsers'
          });
        } else if (path === '/servicesetup') {
          $state.go('setupwizardmodal', {
            currentTab: 'serviceSetup'
          });
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
