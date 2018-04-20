(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSettingsController', HDSSettingsController);

  /* @ngInject */
  function HDSSettingsController($modal, $q, $state, $translate, Analytics, Authinfo, Orgservice, HDSService, HybridServicesClusterService, Notification) {
    var vm = this;
    vm.lock = false;
    vm.PRE_TRIAL = 'pre_trial'; // service status Trial/Production mode
    vm.TRIAL = 'trial';
    vm.PRODUCTION = 'production';
    vm.NA_MODE = 'na_mode';
    vm.trialUserGroupId = null;
    vm.trialDomain = '';
    vm.prodDomain = 'Spark Default KMS';
    vm.numResourceNodes = 1; // # of resource nodes, TODO: from backend when APIs ready
    vm.numTrialUsers = 10;
    vm.recoverPreTrial = recoverPreTrial; // set to trial mode, TODO: remove this when at the very late stage of HDS dev
    vm.startTrial = startTrial;
    vm.moveToProduction = moveToProduction;
    vm.addResource = addResource;
    vm.openAddTrialUsersModal = openAddTrialUsersModal;
    vm.openEditTrialUsersModal = openEditTrialUsersModal;
    vm.deactivateTrialMode = deactivateTrialMode;
    vm.deactivateProductionMode = deactivateProductionMode;
    vm.dirsyncEnabled = false;
    vm.groupAssigned = groupAssigned;
    vm.setHDSDefaultForAltHDSServersGroup = setHDSDefaultForAltHDSServersGroup;
    vm.defaultHDSGroupName = 'HdsTrialGroup';
    vm.defaultHDSGroup = null;
    var localizedHdsModeError = $translate.instant('hds.resources.settings.hdsModeGetError');
    var trialKmsServer = '';
    var trialKmsServerMachineUUID = '';
    var trialAdrServer = '';
    var trialSecurityService = '';

    Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_HDS_SETTINGS);

    // TODO: below is the jason to recover initial state, remove it when at the very late stage of HDS dev
    var jsonTrialMode = {
      altHdsServers: [
        {
          type: 'kms',
          kmsServer: 'customer.com',
          kmsServerMachineUUID: 'e336ae2b-7afb-4e90-a023-61103e06a861',
          groupId: '755d989a-feef-404a-8669-085eb054afef',
          active: false,
        },
        {
          type: 'adr',
          adrServer: '5f40d7be-da6b-4a10-9c6c-8b061aee053a',
          groupId: '755d989a-feef-404a-8669-085eb054afef',
          active: false,
        },
        {
          type: 'sec',
          securityService: '2d2bdeaf-3e63-4561-be2f-4ecc1a48dcd4',
          groupId: '755d989a-feef-404a-8669-085eb054afef',
          active: false,
        },
      ],
    };

    vm.servicestatus = {
      title: 'hds.resources.settings.servicestatusTitle',
    };
    vm.deactivate = {
      title: 'common.deactivate',
    };

    var DEFAULT_SERVICE_MODE = vm.NA_MODE;

    vm.model = {
      serviceMode: DEFAULT_SERVICE_MODE,
    };

    init();

    function init() {
      getOrgHdsInfo();
    }

    function getTrialUsersInfo() {
      HDSService.getHdsTrialUsers(Authinfo.getOrgId(), vm.trialUserGroupId)
        .then(function (data) {
          var trialUsers = _.isObject(data.members) ? data.members : {};
          vm.numTrialUsers = _.size(trialUsers);
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, localizedHdsModeError);
        });
    }

    function getResourceInfo() {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.numResourceNodes = _.reduce(clusters, function (total, cluster) {
            if (cluster.targetType === 'hds_app') {
              // TODO: we may need to check if the status is active
              return total + cluster.connectors.length;
            }
            return total;
          }, 0);
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, localizedHdsModeError);
        });
    }
    function getOrgHdsInfo() {
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data, status) {
        if (data.success || status === 200) {
          vm.orgSettings = data.orgSettings;
          vm.altHdsServers = data.orgSettings.altHdsServers;
          vm.prodDomain = vm.orgSettings.kmsServer;
          vm.dirsyncEnabled = data.dirsyncEnabled;
          if (typeof vm.altHdsServers === 'undefined' || vm.altHdsServers.length === 1) {
            // prod info
            if (typeof vm.prodDomain === 'undefined') {
              vm.model.serviceMode = vm.NA_MODE;
            } else {
              vm.model.serviceMode = vm.PRODUCTION;
            }
          } else {
            if (typeof vm.prodDomain === 'undefined') {
              vm.prodDomain = 'Spark Default KMS';
            }
            // trial info
            if (_.size(vm.altHdsServers) > 0) {
              if (_.every(vm.altHdsServers, function (server) {
                return server.active;
              })) {
                vm.model.serviceMode = vm.TRIAL;
              } else {
                vm.model.serviceMode = vm.PRE_TRIAL;
              }
              _.forEach(vm.altHdsServers, function (server) {
                if (server.kmsServer) {
                  vm.trialDomain = server.kmsServer;
                  vm.trialUserGroupId = server.groupId;
                  trialKmsServer = server.kmsServer;
                  trialKmsServerMachineUUID = server.kmsServerMachineUUID;
                }
                if (server.adrServer) {
                  trialAdrServer = server.adrServer;
                }
                if (server.securityService) {
                  trialSecurityService = server.securityService;
                }
              });
              if (vm.groupAssigned()) {
                getTrialUsersInfo();
              } else {
                if (vm.dirsyncEnabled === true) {
                  setHDSDefaultForAltHDSServersGroup();
                }
              }
            } else {
              vm.model.serviceMode = vm.NA_MODE;
            }
          }
          getResourceInfo();
        } else {
          vm.model.serviceMode = vm.NA_MODE;
          Notification.error(localizedHdsModeError + status);
        }
      }, null, params);
    }

    function setHDSDefaultForAltHDSServersGroup() {
      //For dirsync orgs retrieve default HDS group info by name
      HDSService.queryGroup(Authinfo.getOrgId(), vm.defaultHDSGroupName)
        .then(function (group) {
          vm.defaultHDSGroup = group.Resources[0];
          vm.trialUserGroupId = vm.defaultHDSGroup.id;
          //Assign group id to each server
          _.forEach(vm.altHdsServers, function (server) {
            server.groupId = vm.defaultHDSGroup.id;
          });
          var altHdsServersJson = {
            altHdsServers: vm.altHdsServers,
          };
          HDSService.setOrgAltHdsServersHds(Authinfo.getOrgId(), altHdsServersJson)
            .then(function () {
              vm.model.serviceMode = vm.PRE_TRIAL;
              getTrialUsersInfo();
            }).catch(function (error) {
              Notification.errorWithTrackingId(error, localizedHdsModeError);
            });
        }).catch(function (error) {
          Notification.error(localizedHdsModeError + error.statusText);
        });
    }

    function groupAssigned() {
      return (_.isString(vm.trialUserGroupId) && vm.trialUserGroupId.length > 0);
    }

    function recoverPreTrial() {
      HDSService.setOrgAltHdsServersHds(Authinfo.getOrgId(), jsonTrialMode)
        .then(function () {
          vm.model.serviceMode = vm.PRE_TRIAL;
        }).catch(function (error) {
          Notification.error(localizedHdsModeError + error.statusText);
        });
    }

    function startTrial() {
      if (vm.model.serviceMode === vm.PRE_TRIAL && !vm.lock) {
        vm.lock = true;
        if (typeof vm.altHdsServers !== 'undefined' || vm.altHdsServers.length > 0) {
          _.forEach(vm.altHdsServers, function (server) {
            if (typeof server.active !== 'undefined') {
              server['active'] = true;
            }
          });
        }
        var myJSON = {
          altHdsServers: vm.altHdsServers,
        };
        HDSService.setOrgAltHdsServersHds(Authinfo.getOrgId(), myJSON)
          .then(function () {
            vm.model.serviceMode = vm.TRIAL;
          }).catch(function (error) {
            Notification.errorWithTrackingId(error, localizedHdsModeError);
          }).finally(function () {
            vm.lock = false;
          });
      }
    }

    function moveToProduction() {
      if (vm.model.serviceMode === vm.TRIAL && !vm.lock) {
        vm.lock = true;
        $modal.open({
          template: require('modules/hds/settings/confirm-move-to-production-dialog.html'),
          type: 'dialog',
        })
          .result.then(function () {
            HDSService.moveToProductionMode(trialKmsServer, trialKmsServerMachineUUID, trialAdrServer, trialSecurityService)
              .then(function () {
                getOrgHdsInfo();
                // TODO: add remove the CI Group for Trial Users after MVO or finish up e2e test
                Notification.success('hds.resources.settings.succeedMoveToProductionMode');
              }).catch(function (error) {
                Notification.errorWithTrackingId(error, localizedHdsModeError);
              }).finally(function () {
                vm.lock = false;
              });
          }).catch(function () {
            vm.lock = false;
          });
      }
    }

    function addResource() {
      $state.go('hds.list');
    }

    function openAddTrialUsersModal() {
      $modal.open({
        controller: 'AddTrialUsersController',
        controllerAs: 'addTrialUsersCtrl',
        template: require('modules/hds/settings/addtrialusers_modal/add-trial-users.html'),
        type: 'small',
      })
        .result.then(function () {
          setTimeout(function () {
            getTrialUsersInfo();
          }, 3000);
        });
    }

    function openEditTrialUsersModal() {
      $modal.open({
        controller: 'EditTrialUsersController',
        controllerAs: 'editTrialUsersCtrl',
        template: require('modules/hds/settings/edittrialusers_modal/edit-trial-users.html'),
        type: 'small',
        resolve: {
          dirsyncEnabled: vm.dirsyncEnabled,
        },
      })
        .result.then(function () {
          setTimeout(function () {
            getTrialUsersInfo();
          }, 3000);
        });
    }
    function deactivateTrialMode() {
      if (vm.model.serviceMode === vm.TRIAL && !vm.lock) {
        vm.lock = true;
        $modal.open({
          template: require('modules/hds/settings/confirm-deactivate-trialmode-dialog.html'),
          type: 'dialog',
        })
          .result.then(function () {
            if (_.size(vm.altHdsServers) > 0) {
              _.forEach(vm.altHdsServers, function (server) {
                if (typeof server.active !== 'undefined') {
                  server['active'] = false;
                }
              });
            }
            var myJSON = {
              altHdsServers: vm.altHdsServers,
            };
            HDSService.setOrgAltHdsServersHds(Authinfo.getOrgId(), myJSON)
              .then(function () {
                vm.model.serviceMode = vm.PRE_TRIAL;
                Notification.success('hds.resources.settings.succeedDeactivateTrialMode');
              }).catch(function (error) {
                Notification.errorWithTrackingId(error, localizedHdsModeError);
              }).finally(function () {
                vm.lock = false;
              });
          }).catch(function () {
            vm.lock = false;
          });
      }
    }
    function cleanTrialUserGroup() {
      return HDSService.getHdsTrialUsersGroup(Authinfo.getOrgId())
        .then(function (data) {
          if (_.size(data.Resources) > 0) {
            return HDSService.deleteCIGroup(Authinfo.getOrgId(), data.Resources[0].id);
          } else {
            return $q.resolve('No Trial User Group');
          }
        });
    }
    function createTrialUserGroup() {
      return HDSService.createHdsTrialUsersGroup(Authinfo.getOrgId())
        .then(function (data) {
          return data.id;
        });
    }
    function manageHdsServersInfo(newGroupID) {
      var defer = $q.defer();
      var jsonAltHdsServers = {
        altHdsServers: [
          {
            type: 'kms',
            kmsServer: vm.orgSettings.kmsServer,
            kmsServerMachineUUID: vm.orgSettings.kmsServerMachineUUID,
            groupId: newGroupID,
            active: false,
          },
          {
            type: 'adr',
            adrServer: vm.orgSettings.adrServer,
            groupId: newGroupID,
            active: false,
          },
          {
            type: 'sec',
            securityService: vm.orgSettings.securityService,
            groupId: newGroupID,
            active: false,
          },
        ],
      };
      HDSService.deleteHdsServerInfo(Authinfo.getOrgId())
        .then(function () {
          HDSService.setOrgAltHdsServersHds(Authinfo.getOrgId(), jsonAltHdsServers)
            .then(function () {
              getOrgHdsInfo();
              defer.resolve();
            })
            .catch(function () {
              HDSService.moveToProductionMode(trialKmsServer, trialKmsServerMachineUUID, trialAdrServer, trialSecurityService);
              HDSService.deleteCIGroup(Authinfo.getOrgId(), newGroupID);
              defer.reject();
            });
        }).catch(function () {
          defer.reject();
        });

      return defer.promise;
    }
    function deactivateProductionMode() {
      // create CI Group for Trial Users
      // delete kmsServer, kmsServerMachineUUID, adrServer, securityService from org settings
      // create altHdsServers under org settings with above info
      if (vm.model.serviceMode === vm.PRODUCTION && !vm.lock) {
        vm.lock = true;
        $modal.open({
          template: require('modules/hds/settings/confirm-deactivate-trialmode-dialog.html'),
          type: 'dialog',
        })
          .result.then(function () {
            if (vm.dirsyncEnabled === true) {
              manageHdsServersInfo(vm.trialUserGroupId)
                .then(function () {
                  Notification.success('hds.resources.settings.succeedDeactivateProductionMode');
                }).catch(function (error) {
                  Notification.errorWithTrackingId(error, localizedHdsModeError);
                }).finally(function () {
                  vm.lock = false;
                });
            } else {
              cleanTrialUserGroup()
                .then(function () {
                  createTrialUserGroup()
                    .then(function (newGroupID) {
                      manageHdsServersInfo(newGroupID)
                        .then(function () {
                          Notification.success('hds.resources.settings.succeedDeactivateProductionMode');
                        }).catch(function (error) {
                          Notification.errorWithTrackingId(error, localizedHdsModeError);
                        }).finally(function () {
                          vm.lock = false;
                        });
                    }).catch(function (error) {
                      throw error;
                    });
                }).catch(function (error) {
                  Notification.errorWithTrackingId(error, localizedHdsModeError);
                  vm.lock = false;
                });
            }
          }).catch(function () {
            // user clicked Cancle Button, no need for a notification.
            vm.lock = false;
          });
      }
    }
  }
}());
