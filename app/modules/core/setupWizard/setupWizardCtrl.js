(function () {
  'use strict';

  angular.module('Core')
    .controller('SetupWizardCtrl', SetupWizardCtrl);

  function SetupWizardCtrl($scope, $stateParams, Authinfo, Config, FeatureToggleService, Orgservice, Utils) {

    $scope.tabs = [];
    var tabs = [{
      name: 'planReview',
      label: 'firstTimeWizard.planReview',
      description: 'firstTimeWizard.planReviewSub',
      icon: 'icon-plan-review',
      title: 'firstTimeWizard.planReview',
      controller: 'PlanReviewCtrl as planReview',
      steps: [{
        name: 'init',
        template: 'modules/core/setupWizard/planReview/planReview.tpl.html'
      }]
    }, {
      name: 'messagingSetup',
      label: 'firstTimeWizard.messageSettings',
      description: 'firstTimeWizard.messagingSetupSub',
      icon: 'icon-convo',
      title: 'firstTimeWizard.messagingSetup',
      controller: 'MessagingSetupCtrl as msgSetup',
      steps: [{
        name: 'setup',
        template: 'modules/core/setupWizard/messageSettings/messagingSetup.tpl.html'
      }]
    }, {
      name: 'enterpriseSettings',
      label: 'firstTimeWizard.enterpriseSettings',
      description: 'firstTimeWizard.enterpriseSettingsSub',
      icon: 'icon-settings',
      title: 'firstTimeWizard.enterpriseSettings',
      controller: 'EnterpriseSettingsCtrl',
      steps: [{
        name: 'enterpriseSipUrl',
        template: 'modules/core/setupWizard/enterpriseSettings/enterprise.setSipDomain.tpl.html'
      }, {
        name: 'init',
        template: 'modules/core/setupWizard/enterpriseSettings/enterprise.init.tpl.html'
      }, {
        name: 'exportMetadata',
        template: 'modules/core/setupWizard/enterpriseSettings/enterprise.exportMetadata.tpl.html'
      }, {
        name: 'importIdp',
        template: 'modules/core/setupWizard/enterpriseSettings/enterprise.importIdp.tpl.html'
      }, {
        name: 'testSSO',
        template: 'modules/core/setupWizard/enterpriseSettings/enterprise.testSSO.tpl.html'
      }]
    }, {
      name: 'addUsers',
      label: 'firstTimeWizard.addUsers',
      description: 'firstTimeWizard.addUsersSubDescription',
      icon: 'icon-add-users',
      title: 'firstTimeWizard.addUsers',
      controller: 'AddUserCtrl',
      subTabs: [{
        name: 'csv',
        controller: 'UserCsvCtrl as csv',
        controllerAs: 'csv',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/addUsers/addUsers.init.tpl.html'
        }, {
          name: 'csvDownload',
          template: 'modules/core/setupWizard/addUsers/addUsers.downloadCsv.tpl.html'
        }, {
          name: 'csvUpload',
          template: 'modules/core/setupWizard/addUsers/addUsers.uploadCsv.tpl.html'
        }, {
          name: 'csvProcessing',
          template: 'modules/core/setupWizard/addUsers/addUsers.processCsv.tpl.html',
          buttons: false
        }, {
          name: 'csvResult',
          template: 'modules/core/setupWizard/addUsers/addUsers.uploadResult.tpl.html',
          buttons: 'modules/core/setupWizard/addUsers/addUsers.csvResultButtons.tpl.html'
        }]
      }, {
        name: 'advanced',
        controller: 'OnboardCtrl',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/addUsers/addUsers.init.tpl.html'
        }, {
          name: 'domainEntry',
          template: 'modules/core/setupWizard/addUsers/addUsers.domainEntry.tpl.html'
        }, {
          name: 'installConnector',
          template: 'modules/core/setupWizard/addUsers/addUsers.installConnector.tpl.html'
        }, {
          name: 'syncStatus',
          template: 'modules/core/setupWizard/addUsers/addUsers.syncStatus.tpl.html'
        }]
      }]
    }];

    $scope.isDirSyncEnabled = false;
    $scope.isTelstraCsbEnabled = false;
    $scope.isCSB = Authinfo.isCSB();

    if (Authinfo.isCustomerAdmin()) {
      FeatureToggleService.supportsDirSync()
        .then(function (result) {
          $scope.isDirSyncEnabled = result;
        }).finally(init);
    }

    function init() {

      $scope.tabs = filterTabs(tabs);

      setupAddUserSubTabs();

      if (Authinfo.isSquaredUC()) {
        $scope.tabs.splice(1, 0, {
          name: 'serviceSetup',
          required: true,
          label: 'firstTimeWizard.callSettings',
          description: 'firstTimeWizard.serviceSetupSub',
          icon: 'icon-calls',
          title: 'firstTimeWizard.unifiedCommunication',
          controller: 'ServiceSetupCtrl as squaredUcSetup',
          controllerAs: 'squaredUcSetup',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/callSettings/serviceSetup.tpl.html'
          }]
        });
      }

      if (!Authinfo.isSetupDone()) {
        $scope.tabs.push({
          name: 'finish',
          label: 'firstTimeWizard.finish',
          description: 'firstTimeWizard.finishSub',
          icon: 'icon-check',
          title: 'firstTimeWizard.getStarted',
          controller: 'WizardFinishCtrl',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/finish/finish.tpl.html'
          }]
        });
      }

      if ($scope.isCSB) {
        _.remove($scope.tabs, {
          name: 'addUsers'
        });
      }

      Orgservice.getAdminOrgUsage()
        .then(function (subscriptions) {
          var licenseTypes = Utils.getDeepKeyValues(subscriptions, 'licenseType');
          if (_.without(licenseTypes, Config.licenseTypes.SHARED_DEVICES).length === 0) {
            $scope.tabs = _.reject($scope.tabs, function (tab) {
              return tab.name === 'messagingSetup' || tab.name === 'addUsers';
            });
          }
        });

      // if we have any step thats is empty, we remove the tab
      _.forEach($scope.tabs, function (tab, index) {
        if (tab.steps.length === 0) {
          $scope.tabs.splice(index, 1);
        }
      });
    }

    function filterTabs(tabs) {
      if (!($stateParams.onlyShowSingleTab && $stateParams.currentTab)) {
        return tabs;
      }

      var filteredTabs = _.filter(tabs, function (tab) {
        return ($stateParams.currentTab == tab.name);
      });

      if ($stateParams.currentStep && filteredTabs.length === 1 && filteredTabs[0].steps) {
        //prevent "back" button if a step is defined in single tab mode:
        var tab = filteredTabs[0];
        var index = _.findIndex(tab.steps, {
          name: $stateParams.currentStep
        });
        if (index > 0) {
          tab.steps.splice(0, index);
        }
      }
      return filteredTabs;
    }

    function setupAddUserSubTabs() {
      var userTab = _.findWhere($scope.tabs, {
        name: 'addUsers'
      });
      var simpleSubTab = {
        name: 'simple',
        controller: 'OnboardCtrl',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/addUsers/addUsers.init.tpl.html'
        }, {
          name: 'manualEntry',
          template: 'modules/core/setupWizard/addUsers/addUsers.manualEntry.tpl.html'
        }, {
          name: 'assignServices',
          template: 'modules/core/setupWizard/addUsers/addUsers.assignServices.tpl.html'
        }, {
          name: 'assignDnAndDirectLines',
          template: 'modules/core/setupWizard/addUsers/addUsers.assignDnAndDirectLines.tpl.html'
        }, {
          name: 'addUsersResults',
          template: 'modules/core/setupWizard/addUsers/addUsers.results.tpl.html'
        }]
      };
      var advancedSubTabSteps = [{
        name: 'dirsyncServices',
        template: 'modules/core/setupWizard/addUsers/addUsers.assignServices.tpl.html'
      }, {
        name: 'dirsyncProcessing',
        template: 'modules/core/setupWizard/addUsers/addUsers.processDirSync.tpl.html',
        buttons: false
      }, {
        name: 'dirsyncResult',
        template: 'modules/core/setupWizard/addUsers/addUsers.uploadResultDirSync.tpl.html',
        buttons: 'modules/core/setupWizard/addUsers/addUsers.dirSyncResultButtons.tpl.html'
      }];

      if ($scope.isDirSyncEnabled) {
        var advancedSubTab = _.findWhere(userTab.subTabs, {
          name: 'advanced'
        });
        advancedSubTab.steps = advancedSubTab.steps.concat(advancedSubTabSteps);
      } else {
        userTab.subTabs.splice(0, 0, simpleSubTab);
      }
    }

  }
})();
