'use strict';

angular.module('Core')
  .controller('SetupWizardCtrl', ['$scope', 'Authinfo',
    function ($scope, Authinfo) {

      $scope.tabs = [{
        name: 'planReview',
        label: 'firstTimeWizard.planReview',
        description: 'firstTimeWizard.planReviewSub',
        icon: 'icon-plan-review',
        title: 'firstTimeWizard.planReview',
        controller: 'PlanReviewCtrl as planReview',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/planReview.tpl.html'
        }]
      }, {
        name: 'enterpriseSettings',
        label: 'firstTimeWizard.enterpriseSettings',
        description: 'firstTimeWizard.enterpriseSettingsSub',
        icon: 'icon-settings',
        title: 'firstTimeWizard.enterpriseSettings',
        controller: 'setupSSODialogCtrl',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/enterprise.init.tpl.html'
        }, {
          name: 'exportMetadata',
          template: 'modules/core/setupWizard/enterprise.exportMetadata.tpl.html'
        }, {
          name: 'importIdp',
          template: 'modules/core/setupWizard/enterprise.importIdp.tpl.html'
        }, {
          name: 'testSSO',
          template: 'modules/core/setupWizard/enterprise.testSSO.tpl.html'
        }]
      }, {
        name: 'addUsers',
        label: 'firstTimeWizard.addUsers',
        icon: 'icon-add-users',
        title: 'firstTimeWizard.addUsers',
        controller: 'AddUserCtrl',
        subTabs: [{
          name: 'simple',
          title: 'firstTimeWizard.simple',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/addUsers.init.tpl.html'
          }, {
            name: 'manualEntry',
            template: 'modules/core/setupWizard/addUsers.manualEntry.tpl.html'
          }]
        }, {
          name: 'advanced',
          title: 'firstTimeWizard.advanced',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/addUsers.init.tpl.html'
          }, {
            name: 'domainEntry',
            template: 'modules/core/setupWizard/addUsers.domainEntry.tpl.html'
          }, {
            name: 'installConnector',
            template: 'modules/core/setupWizard/addUsers.installConnector.tpl.html'
          }, {
            name: 'syncStatus',
            template: 'modules/core/setupWizard/addUsers.syncStatus.tpl.html'
          }]
        }]
      }];

      if (Authinfo.isFusion()) {
        $scope.tabs.push({
          name: 'hercules.setup',
          label: 'hercules.setup.label',
          title: 'hercules.setup.title',
          description: 'hercules.setup.desc',
          icon: 'icon-tools',
          controller: 'FusionSetupCtrl',
          steps: [{
            name: 'intro',
            template: 'modules/hercules/setup/intro.html'
          }, {
            name: 'fuse',
            template: 'modules/hercules/setup/fuse.html'
          }]
        });
      }

      if (Authinfo.isSquaredUC()) {
        $scope.tabs.splice(1, 0, {
          name: 'serviceSetup',
          required: true,
          label: 'firstTimeWizard.serviceSetup',
          description: 'firstTimeWizard.serviceSetupSub',
          icon: 'icon-tools',
          title: 'firstTimeWizard.unifiedCommunication',
          controller: 'serviceSetupCtrl',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/serviceSetup.tpl.html'
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
            template: 'modules/core/setupWizard/finish.tpl.html'
          }]
        });
      }
    }
  ]);
