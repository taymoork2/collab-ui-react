'use strict';

angular.module('Core')
  .controller('SetupWizardCtrl', ['$rootScope', '$scope', '$translate', 'Config',
    function ($rootScope, $scope, $translate, Config) {

      //tabs state definition
      $scope.tabs = {
        planReview: true,
        enterpriseSettings: false,
        addUsers: false,
        finish: false
      };

      //internal steps states
      $scope.steps = {
        initial: true,
        importIdpData: false,
        exportCloudData: false,
        testSSO: false,
        enableSSO: false,
        manualEntry: false,
        domainEntry: false,
        installConnector: false,
        syncStatus: false
      };

      $scope.changeTab = function (tab) {
        for (var idx in $scope.tabs) {
          $scope.tabs[idx] = false;
        }
        $scope.tabs[tab] = true;
        $scope.changeStep('initial');
      };

      $scope.changeStep = function (step) {
        for (var idx in $scope.steps) {
          $scope.steps[idx] = false;
        }
        $scope.steps[step] = true;
        console.log('changing step: ' + step);
      };

      $scope.evaluateStep = function (currentStep, tab) {
        if (tab !== undefined) {
          //enterprise settings selection logic
          if (currentStep === 'initial' && tab === 'enterpriseSettings') {
            if ($scope.ssoChoice.value === 0) {
              $scope.changeStep('importIdpData');
            } else {
              $scope.changeTab('addUsers');
            }
          }
          //add users selection logic
          if (currentStep === 'initial' && tab === 'addUsers') {
            if ($scope.syncChoice.value === 0) {
              $scope.changeStep('manualEntry');
            } else {
              $scope.changeStep('domainEntry');
            }
          }
        }
      };

      //enterprise settings tab
      $scope.ssoOptions = [{
        ssoRbLabel: 'Yes, I have a custom SSO provider.',
        value: 0
      }, {
        ssoRbLabel: 'No, I don\'t have a SSO provider.',
        value: 1
      }];

      //add users syn settings tab
      $scope.syncOptions = [{
        syncRbLabel: $translate.instant('firstTimeWizard.simple'),
        value: 0
      }, {
        syncRbLabel: $translate.instant('firstTimeWizard.advanced'),
        value: 1
      }];

      $scope.isHuronEnabled = function () {
        var result = false;
        if (!!$rootScope.services) {
          for (var i = 0; i < $rootScope.services.length; i++) {
            var svc = $rootScope.services[i].ciService;
            if (svc === Config.entitlements.huron) {
              result = true;
              break;
            }
          }
        }
        return result;
      };

    }
  ]);
