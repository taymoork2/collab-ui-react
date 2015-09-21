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
        name: 'communications',
        label: 'firstTimeWizard.communications',
        description: 'firstTimeWizard.communicationsSub',
        icon: 'icon-phone',
        title: 'firstTimeWizard.claimSipUrl',
        controller: 'CommunicationsCtrl as communicationsCtrl',
        steps: [{
          name: 'claimSipUrl',
          template: 'modules/core/setupWizard/claimSipUrl.tpl.html'
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
        subTabs: []
      }];

      fillAddUserSteps().then(function () {
        if (Authinfo.isSquaredUC()) {
          $scope.tabs.splice(2, 1);
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
              name: 'claimSipUrl',
              template: 'modules/core/setupWizard/claimSipUrl.tpl.html'
            }, {
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

        var showSipUrl = false;
        // angular.forEach(Authinfo.getServices(), function (service) {
        //   // if it is not entitled, it wouldn't be in this list
        //   if (service.serviceId === 'squaredFusionUC') {
        //     showSipUrl = true;
        //   }
        // });

        if (!showSipUrl) {
          angular.forEach($scope.tabs, function (tab, index) {
            angular.forEach(tab.steps, function (step, subIndex) {
              if (step.name === 'claimSipUrl') {
                tab.steps.splice(subIndex, 1);

                // if there are no more steps then this page is blank, so remove it
                if (tab.steps.length === 0) {
                  $scope.tabs.splice(index, 1);
                }
              }
            });
          });
        }
      });

      function fillAddUserSteps() {
        var userTab = _.findWhere($scope.tabs, {
          name: 'addUsers'
        });
        var simpleSubTab, advancedSubTab, csvSubTab;
        var deferred = $q.defer();

        FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
          if (!dirSyncEnabled) {
            simpleSubTab = {
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
            userTab.subTabs.push(simpleSubTab);

            advancedSubTab = {
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
              }]
            };
            userTab.subTabs.push(advancedSubTab);
          } else {
            advancedSubTab = {
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
              }, {
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
              }]
            };
            userTab.subTabs.push(advancedSubTab);
          }

          FeatureToggleService.supportsCsvUpload().then(function (isSupported) {
            if (isSupported) {
              csvSubTab = {
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
            deferred.resolve(dirSyncEnabled);
          });
        });
        return deferred.promise;
      }

    }
  ]);
