'use strict';

angular.module('Core')
  .controller('SetupWizardCtrl', ['$scope', 'Authinfo', '$q', 'FeatureToggleService',
    function ($scope, Authinfo, $q, FeatureToggleService) {

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
        name: 'messagingSetup',
        label: 'firstTimeWizard.messaging',
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
          name: 'advanced',
          title: 'firstTimeWizard.advanced',
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
            template: 'modules/core/setupWizard/addUsers.syncStatus.tpl.html',
            title: 'firstTimeWizard.dirSyncStatus'
          }],
        }],
      }];

      $scope.isDirSyncEnabled = false;
      $scope.addClaimSipUrl = false;
      $scope.csvUploadSupport = false;

      $q.all([FeatureToggleService.supportsDirSync(),
          FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomain),
          FeatureToggleService.supportsCsvUpload(),
        ])
        .then(function (results) {
          $scope.isDirSyncEnabled = results[0];
          $scope.addClaimSipUrl = results[1];
          $scope.csvUploadSupport = results[2];
        }).finally(function () {
          init();
        });

      function init() {
        setupAddUserSubTabs();

        if (Authinfo.isSquaredUC()) {
          $scope.tabs.splice(1, 0, {
            name: 'serviceSetup',
            required: true,
            label: 'firstTimeWizard.serviceSetup',
            description: 'firstTimeWizard.serviceSetupSub',
            icon: 'icon-tools',
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
              label: 'firstTimeWizard.communications',
              description: 'firstTimeWizard.communicationsSub',
              icon: 'icon-phone',
              title: 'firstTimeWizard.claimSipUrl',
              controller: 'CommunicationsCtrl as communicationsCtrl',
              steps: [claimSipUrlStep],
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

        if (!$scope.isDirSyncEnabled) {
          var simpleSubTab = {
            name: 'simple',
            title: 'firstTimeWizard.simple',
            controller: 'OnboardCtrl',
            steps: [{
              name: 'init',
              template: 'modules/core/setupWizard/addUsers.init.tpl.html'
            }, {
              name: 'manualEntry',
              template: 'modules/core/setupWizard/addUsers.manualEntry.tpl.html',
              title: 'firstTimeWizard.manualEntryStep'
            }, {
              name: 'assignServices',
              template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html',
              title: 'firstTimeWizard.assignServicesStep'
            }, {
              name: 'assignDnAndDirectLines',
              template: 'modules/core/setupWizard/addUsers.assignDnAndDirectLines.tpl.html',
              title: 'firstTimeWizard.assignDnAndDirectLines'
            }]
          };
          userTab.subTabs.splice(0, 0, simpleSubTab);
        } else {
          var advancedSubTab = _.findWhere(userTab.subTabs, {
            name: 'advanced'
          });
          var advancedSubTabSteps = [{
            name: 'dirsyncServices',
            template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html',
            title: 'firstTimeWizard.assignServicesStep'
          }, {
            name: 'dirsyncProcessing',
            template: 'modules/core/setupWizard/addUsers.processCsv.tpl.html',
            title: 'firstTimeWizard.processDirSyncStep',
            buttons: false
          }, {
            name: 'dirsyncResult',
            template: 'modules/core/setupWizard/addUsers.uploadResult.tpl.html',
            title: 'firstTimeWizard.dirSyncResultStep',
            buttons: 'modules/core/setupWizard/addUsers.dirSyncResultButtons.tpl.html'
          }];
          advancedSubTab.steps = advancedSubTab.steps.concat(advancedSubTabSteps);
        }

        if ($scope.csvUploadSupport) {
          var csvSubTab = {
            name: 'csv',
            title: 'firstTimeWizard.uploadStep',
            controller: 'OnboardCtrl',
            steps: [{
              name: 'init',
              template: 'modules/core/setupWizard/addUsers.init.tpl.html'
            }, {
              name: 'csvUpload',
              template: 'modules/core/setupWizard/addUsers.uploadCsv.tpl.html',
              title: 'firstTimeWizard.uploadStep'
            }, {
              name: 'csvServices',
              template: 'modules/core/setupWizard/addUsers.assignServices.tpl.html',
              title: 'firstTimeWizard.assignServicesStep'
            }, {
              name: 'csvProcessing',
              template: 'modules/core/setupWizard/addUsers.processCsv.tpl.html',
              title: 'firstTimeWizard.processCsvStep',
              buttons: false
            }, {
              name: 'csvResult',
              template: 'modules/core/setupWizard/addUsers.uploadResult.tpl.html',
              title: 'firstTimeWizard.uploadResultStep',
              buttons: 'modules/core/setupWizard/addUsers.csvResultButtons.tpl.html'
            }]
          };
          userTab.subTabs.splice(1, 0, csvSubTab);
        }
      }
    }
  ]);
