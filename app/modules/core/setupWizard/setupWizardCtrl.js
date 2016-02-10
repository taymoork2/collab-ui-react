'use strict';

angular.module('Core')
  .controller('SetupWizardCtrl', ['$scope', 'Authinfo', '$q', 'FeatureToggleService',
    function ($scope, Authinfo, $q, FeatureToggleService) {

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
          template: 'modules/core/setupWizard/planReview.tpl.html'
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
          template: 'modules/core/setupWizard/messagingSetup.tpl.html'
        }]
      }, {
        name: 'enterpriseSettings',
        label: 'firstTimeWizard.enterpriseSettings',
        description: 'firstTimeWizard.enterpriseSettingsSub',
        icon: 'icon-settings',
        title: 'firstTimeWizard.enterpriseSettings',
        controller: 'EnterpriseSettingsCtrl',
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
        description: 'firstTimeWizard.addUsersSubDescription',
        icon: 'icon-add-users',
        title: 'firstTimeWizard.addUsers',
        controller: 'AddUserCtrl',
        subTabs: [{
          name: 'advanced',
          controller: 'OnboardCtrl',
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
          }],
        }],
      }];

      $scope.isDirSyncEnabled = false;
      $scope.addClaimSipUrl = false;
      $scope.csvUploadSupport = false;
      $scope.addEnterpriseSipUrl = false;

      if (Authinfo.isCustomerAdmin()) {
        $q.all([FeatureToggleService.supportsDirSync(),
            FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomain),
            FeatureToggleService.supportsCsvUpload(),
            FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomainEnterprise)
          ])
          .then(function (results) {
            $scope.isDirSyncEnabled = results[0];
            $scope.addClaimSipUrl = results[1];
            $scope.csvUploadSupport = results[2];
            $scope.addEnterpriseSipUrl = results[3];
          }).finally(function () {
            init();
          });
      }

      function init() {
        $scope.tabs = tabs;
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

        var enterpriseSipUrlStep = {
          name: 'enterpriseSipUrl',
          template: 'modules/core/setupWizard/enterprise.setSipUri.tpl.html',
        };

        if ($scope.addEnterpriseSipUrl) {
          if (Authinfo.isFusion()) {
            var enterpriseSettingsTab = _.find($scope.tabs, {
              name: 'enterpriseSettings',
            });
            if (angular.isDefined(enterpriseSettingsTab)) {
              enterpriseSettingsTab.steps.splice(0, 0, enterpriseSipUrlStep);
            }
          }
        }

        var claimSipUrlStep = {
          name: 'claimSipUrl',
          template: 'modules/core/setupWizard/claimSipUrl.tpl.html',
        };

        if ($scope.addClaimSipUrl) {
          if (Authinfo.isSquaredUC()) {
            var communicationsTab = _.find($scope.tabs, {
              name: 'serviceSetup',
            });
            if (angular.isDefined(communicationsTab)) {
              communicationsTab.steps.splice(0, 0, claimSipUrlStep);
            }
          } else {
            var communicationsStep = {
              name: 'communications',
              label: 'firstTimeWizard.call',
              description: 'firstTimeWizard.communicationsSub',
              icon: 'icon-phone',
              title: 'firstTimeWizard.claimSipUrl',
              controller: 'CommunicationsCtrl as communicationsCtrl',
              steps: [claimSipUrlStep]
            };

            $scope.tabs.splice(2, 0, communicationsStep);
          }
        }

        // if we have any step thats is empty, we remove the tab
        _.forEach($scope.tabs, function (tab, index) {
          if (tab.steps.length === 0) {
            $scope.tabs.splice(index, 1);
          }
        });
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
            template: 'modules/core/setupWizard/addUsers.init.tpl.html'
          }, {
            name: 'manualEntry',
            template: 'modules/core/setupWizard/addUsers.manualEntry.tpl.html'
          }, {
            name: 'assignServices',
            template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html'
          }, {
            name: 'assignDnAndDirectLines',
            template: 'modules/core/setupWizard/addUsers.assignDnAndDirectLines.tpl.html'
          }]
        };
        var oldCsvSubTab = {
          name: 'csv',
          controller: 'OnboardCtrl',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/addUsers.init.tpl.html'
          }, {
            name: 'csvUpload',
            template: 'modules/core/setupWizard/addUsers.uploadCsv.tpl.html'
          }, {
            name: 'csvServices',
            template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html'
          }, {
            name: 'csvProcessing',
            template: 'modules/core/setupWizard/addUsers.processCsv.tpl.html',
            buttons: false
          }, {
            name: 'csvResult',
            template: 'modules/core/setupWizard/addUsers.uploadResult.tpl.html',
            buttons: 'modules/core/setupWizard/addUsers.csvResultButtons.tpl.html'
          }]
        };
        var newCsvSubTab = {
          name: 'csv',
          controller: 'OnboardCtrl',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/addUsers.init.tpl.html'
          }, {
            name: 'csvDownload',
            template: 'modules/core/setupWizard/addUsers.downloadCsv.tpl.html'
          }, {
            name: 'csvUpload',
            template: 'modules/core/setupWizard/addUsers.uploadCsv.tpl.html'
          }, {
            name: 'csvProcessing',
            template: 'modules/core/setupWizard/addUsers.processCsv.tpl.html',
            buttons: false
          }, {
            name: 'csvResult',
            template: 'modules/core/setupWizard/addUsers.uploadResult.tpl.html',
            buttons: 'modules/core/setupWizard/addUsers.csvResultButtons.tpl.html'
          }]
        };
        var advancedSubTabSteps = [{
          name: 'dirsyncServices',
          template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html'
        }, {
          name: 'dirsyncProcessing',
          template: 'modules/core/setupWizard/addUsers.processCsv.tpl.html',
          buttons: false
        }, {
          name: 'dirsyncResult',
          template: 'modules/core/setupWizard/addUsers.uploadResult.tpl.html',
          buttons: 'modules/core/setupWizard/addUsers.dirSyncResultButtons.tpl.html'
        }];

        var csvSubTab = oldCsvSubTab;
        if ($scope.csvUploadSupport) {
          csvSubTab = newCsvSubTab;
        }

        if ($scope.isDirSyncEnabled) {
          userTab.subTabs.splice(0, 0, csvSubTab);
          var advancedSubTab = _.findWhere(userTab.subTabs, {
            name: 'advanced'
          });
          advancedSubTab.steps = advancedSubTab.steps.concat(advancedSubTabSteps);
        } else {
          userTab.subTabs.splice(0, 0, simpleSubTab);
          userTab.subTabs.splice(1, 0, csvSubTab);
        }

      }
    }
  ]);
