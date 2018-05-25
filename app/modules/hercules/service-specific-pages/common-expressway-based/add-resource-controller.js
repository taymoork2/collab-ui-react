(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('AddResourceController', AddResourceController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function AddResourceController($q, $modal, $modalInstance, $state, $scope, $translate, $window, connectorType, options, serviceId, FmsOrgSettings, HybridServicesClusterService, HybridServicesExtrasService, HybridServicesUtilsService, Notification, ResourceGroupService, USSService) {
    var vm = this;
    vm.connectors = [];
    vm.warning = warning;
    // Bug in toolkit for cs-input warning
    // https://wwwin-github.cisco.com/collab-ui/collab-library/issues/79
    vm.warningMessage = 'DummyMessage';
    vm.hostname = '';
    vm.releaseChannel = 'stable';
    vm.expresswayClusters = [];
    vm.connectorType = connectorType;
    vm.serviceId = serviceId;
    vm.preregistrationCompletedGoToExpressway = false;
    vm.provisioningToExistingExpresswayCompleted = false;
    vm.gettingResourceGroupInput = false;
    vm.selectedAction = 'new';
    vm.closeSetupModal = closeSetupModal;
    vm.firstTimeSetup = options.firstTimeSetup;
    vm.welcomeScreenAccepted = !options.firstTimeSetup;
    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.localizedServiceName = $translate.instant('hercules.hybridServiceNames.' + vm.serviceId);
    vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    vm.localizedAddNewExpressway = $translate.instant('hercules.addResourceDialog.registerNewExpressway');
    vm.localizedAddNewExpresswayHelp = $translate.instant('hercules.addResourceDialog.registerNewExpresswayHelp');
    vm.localizedAddToExistingExpressway = $translate.instant('hercules.addResourceDialog.addToExistingExpressway');
    vm.localizedExpresswaysName = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
    vm.localizedCannotProvionError = $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
      ConnectorName: vm.localizedConnectorName,
    });
    vm.userStatusesByClustersSummary = [];
    vm.subscribeStatusesSummary = null;
    vm.numberOfUsersWithoutService = 0;
    vm.resourceGroupName = '';
    vm.hasCapacityFeatureToggle = options.hasCapacityFeatureToggle;
    vm.optionalSelectResourceGroupStep = false;
    vm.chooseClusterName = false;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
    };
    vm.clustername = '';

    vm.localizedHostNameHelpText = $translate.instant('hercules.addResourceDialog.nameHelptext');

    vm.localizedClusternameWatermark = $translate.instant('hercules.addResourceDialog.clusternameWatermark');

    vm.selectedCluster = '';
    vm.expresswayOptions = [];

    vm.resourceGroupOptions = [{ label: $translate.instant('hercules.addResourceDialog.selectGroup'), value: '' }];
    vm.selectedResourceGroup = vm.resourceGroupOptions[0];
    vm.assignToResourceGroup = 'no';
    vm._translation = {
      assignYes: $translate.instant('hercules.addResourceDialog.assignYes'),
      assignNo: $translate.instant('hercules.addResourceDialog.assignNo'),
    };

    // For unit testing purposes
    vm._provisionExpresswayWithNewConnector = provisionExpresswayWithNewConnector;

    // INIT
    extractSummary();
    vm.subscribeStatusesSummary = USSService.subscribeStatusesSummary('data', extractSummary);
    findAndPopulateExistingExpressways(vm.connectorType);
    FmsOrgSettings.get()
      .then(function (data) {
        vm.releaseChannel = data.expresswayClusterReleaseChannel;
      });
    $scope.$on('$destroy', function () {
      vm.subscribeStatusesSummary.cancel();
    });

    function extractSummary() {
      vm.userStatusesByClustersSummary = USSService.extractSummaryForClusters(['squared-fusion-uc', 'squared-fusion-cal', 'spark-hybrid-impinterop']);
    }

    vm.preregisterAndProvisionExpressway = function (connectorType) {
      vm.loading = true;
      preregisterCluster(vm.clustername)
        .then(_.partialRight(_.get, 'id'))
        .then(_.partial(provisionConnector, connectorType))
        .then(addPreregisteredClusterToAllowList)
        .then(displayResourceGroupsOrEndWizard)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.getServiceNameKey = function (serviceId) {
      return $translate.instant('hercules.hybridServiceNames.' + serviceId);
    };

    function warning() {
      if (_.some(vm.connectors, function (connector) {
        vm.warningMessage = $translate.instant('hercules.addResourceDialog.hostnameRegistered');
        return connector.toLowerCase() === vm.hostname.toLowerCase();
      })
      ) {
        return true;
      }
      return false;
    }

    function displayResourceGroupsOrEndWizard() {
      if (vm.optionalSelectResourceGroupStep) {
        vm.gettingResourceGroupInput = true;
      } else {
        vm.preregistrationCompletedGoToExpressway = true;
      }
    }

    function preregisterCluster(clusterName) {
      return HybridServicesClusterService.preregisterCluster(clusterName, vm.releaseChannel, 'c_mgmt')
        .catch(function () {
          throw $translate.instant('hercules.addResourceDialog.cannotCreateCluster');
        });
    }

    function provisionConnector(connectorType, clusterId) {
      return HybridServicesClusterService.provisionConnector(clusterId, connectorType)
        .then(function () {
          return clusterId;
        })
        .catch(function () {
          if (connectorType === 'c_mgmt') {
            throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
              ConnectorName: vm.localizedManagementConnectorName,
            });
          }
          throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
            ConnectorName: vm.localizedConnectorName,
          });
        });
    }

    function addPreregisteredClusterToAllowList(clusterId) {
      return HybridServicesExtrasService.addPreregisteredClusterToAllowList(vm.hostname, clusterId)
        .then(function () {
          vm.clusterId = clusterId;
        })
        .catch(function () {
          $translate.instant('hercules.addResourceDialog.cannotFinalizeAllowlisting');
        });
    }

    function findAndPopulateExistingExpressways(connectorType) {
      HybridServicesClusterService.getAll()
        .then(getAllExpressways)
        .then(updateConnectorNameList)
        .then(_.partial(removeAlreadyProvisionedExpressways, connectorType))
        .then(updateDropdownMenu)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.addResourceDialog.cannotReadExpresswayList');
        });
    }

    function getAllExpressways(data) {
      var allExpressways = [];
      data.forEach(function (cluster) {
        if (cluster.targetType === 'c_mgmt') {
          allExpressways.push({
            id: cluster.id,
            name: cluster.name,
            provisionedConnectors: _.map(cluster.provisioning, 'connectorType'),
            connectorsHostname: cluster.connectors,
          });
        }
      });
      vm.expresswayClusters = data.filter(function (cluster) {
        return cluster.targetType === 'c_mgmt';
      });
      return allExpressways;
    }

    function updateConnectorNameList(allExpressways) {
      _.forEach(allExpressways, function (cluster) {
        _.forEach(cluster.connectorsHostname, function (connector) {
          if (connector.connectorType === 'c_mgmt') {
            vm.connectors.push(
              connector.hostname
            );
          }
        });
      });
      return allExpressways;
    }

    function removeAlreadyProvisionedExpressways(currentConnectorType, expressways) {
      return _.filter(expressways, function (e) {
        return !_.includes(e.provisionedConnectors, currentConnectorType);
      });
    }

    function updateDropdownMenu(expressways) {
      expressways.forEach(function (expressway) {
        vm.expresswayOptions.push({
          value: expressway.id,
          label: expressway.name,
        });
      });
      if (vm.expresswayOptions.length === 0) {
        vm.localizedClusterlistPlaceholder = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholderNoneFound');
      } else {
        vm.localizedClusterlistPlaceholder = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
      }
    }

    function provisionExpresswayWithNewConnector(clusterId, connectorType) {
      vm.loading = true;
      HybridServicesClusterService.provisionConnector(clusterId, connectorType)
        .then(function () {
          vm.provisioningToExistingExpresswayCompleted = true;
          setHostNameForCluster(clusterId);
        })
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'hercules.addResourceDialog.cannotProvisionConnector', {
            ConnectorName: vm.localizedConnectorName,
          });
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function setHostNameForCluster(clusterId) {
      HybridServicesClusterService.getAll()
        .then(function (allClusters) {
          return _.find(allClusters, function (cluster) {
            return cluster.id === clusterId;
          });
        })
        .then(function (cluster) {
          if (cluster && cluster.connectors[0]) {
            vm.hostname = cluster.connectors[0].hostname;
          }
        });
    }

    function closeSetupModal() {
      if (!options.firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      $modal.open({
        template: require('modules/hercules/service-specific-pages/common-expressway-based/confirm-setup-cancel-dialog.html'),
        type: 'dialog',
      })
        .result.then(function (isAborting) {
          if (isAborting) {
            $state.go('services-overview');
            $modalInstance.dismiss();
          }
        });
    }

    vm.inWelcomeScreen = function () {
      return !vm.welcomeScreenAccepted;
    };

    vm.completeWelcomeScreen = function () {
      vm.welcomeScreenAccepted = true;
    };

    vm.inChooseNewOrExistingScreen = function () {
      return !(vm.preregistrationCompletedGoToExpressway || vm.provisioningToExistingExpresswayCompleted || !vm.welcomeScreenAccepted || vm.chooseClusterName);
    };

    vm.inHostnameSelectionScreen = function () {
      return !(vm.chooseClusterName || vm.selectedAction === 'existing' || !vm.welcomeScreenAccepted);
    };

    vm.completeEnterHostnameScreen = function () {
      vm.chooseClusterName = true;
      vm.clustername = _.clone(vm.hostname);
    };

    vm.inClusterNameSelectionScreen = function () {
      return vm.chooseClusterName && !vm.gettingResourceGroupInput && !vm.preregistrationCompletedGoToExpressway;
    };

    vm.completeClusterNameScreen = function () {
      vm.preregisterAndProvisionExpressway(vm.connectorType);
    };

    vm.inSelectExistingExpresswayScreen = function () {
      return vm.selectedAction === 'existing' && !vm.provisioningToExistingExpresswayCompleted && vm.welcomeScreenAccepted;
    };

    vm.cannotGoPastClusterSelection = function () {
      return !vm.selectedCluster || vm.numberOfUsersWithoutService > 0 || vm.executingDryRun;
    };

    vm.completeExistingExpresswayScreen = function () {
      provisionExpresswayWithNewConnector(vm.selectedCluster.value, vm.connectorType);
    };

    vm.inFinalScreen = function () {
      return vm.preregistrationCompletedGoToExpressway || vm.provisioningToExistingExpresswayCompleted;
    };

    vm.completeAddResourceModal = function () {
      $modalInstance.close();
      $window.open('https://' + encodeURIComponent(vm.hostname) + '/fusionregistration');
    };

    vm.isEnterKeypress = function ($event) {
      return $event.which === KeyCodes.Enter;
    };

    vm.back = function () {
      if (vm.welcomeScreenAccepted) {
        vm.welcomeScreenAccepted = false;
        vm.chooseClusterName = false;
        vm.provisioningToExistingExpresswayCompleted = false;
        vm.preregistrationCompletedGoToExpressway = false;
        return;
      }
      $modalInstance.close('back');
    };

    ResourceGroupService.getAllAsOptions().then(function (options) {
      if (options.length > 0) {
        vm.resourceGroupOptions = vm.resourceGroupOptions.concat(options);
        vm.optionalSelectResourceGroupStep = true;
      }
    }, function () {
      vm.couldNotReadResourceGroupsFromServer = true;
    });

    vm.saveResourceGroup = function () {
      if (vm.selectedResourceGroup.value !== '') {
        ResourceGroupService.assign(vm.clusterId, vm.selectedResourceGroup.value)
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.addResourceDialog.couldNotSaveResourceGroup');
          })
          .finally(function () {
            vm.preregistrationCompletedGoToExpressway = true;
            vm.gettingResourceGroupInput = false;
          });
      } else {
        vm.preregistrationCompletedGoToExpressway = true;
        vm.gettingResourceGroupInput = false;
      }
    };

    vm.selectedClusterChanged = function () {
      if (!options.hasCapacityFeatureToggle) {
        return;
      }
      vm.executingDryRun = true;
      var resourceGroupId = _.find(vm.expresswayClusters, { id: vm.selectedCluster.value }).resourceGroupId;

      $q.resolve(resourceGroupId)
        .then(function (resourceGroupId) {
          if (resourceGroupId) {
            // Load Resource Group name, used in the warning message
            return ResourceGroupService.get(resourceGroupId)
              .then(function (resourceGroup) {
                vm.resourceGroupName = resourceGroup.name;
              });
          } else {
            vm.resourceGroupName = '';
            return '';
          }
        })
        .then(function () {
          // Find all clusters in the relevant resource group (or all clusters without resource group)
          var relevantClusters = _.filter(vm.expresswayClusters, function (cluster) {
            return cluster.resourceGroupId === resourceGroupId;
          });

          var allConnectorsRunningOnExpressways = [
            'c_cal',
            'c_ucmc',
            'c_imp',
          ];
          var relevantConnectors = _.filter(allConnectorsRunningOnExpressways, function (connectorType) {
            // All of the above without the one the admin is trying to add
            return connectorType !== vm.connectorType;
          });
          // Compute as much information as needed about the capacity for the existing services running in the group of clusters
          // where the cluster the admin selected belongs to
          var existingServicesInfo = _.map(relevantConnectors, function (connectorType) {
            var serviceId = HybridServicesUtilsService.connectorType2ServicesId(connectorType)[0];
            var relevantUserSummaries = _.filter(vm.userStatusesByClustersSummary, { serviceId: serviceId });
            return {
              connectorType: connectorType,
              capacityInfo: HybridServicesExtrasService.getCapacityInformation(relevantClusters, connectorType, relevantUserSummaries),
            };
          });

          HybridServicesClusterService.provisionConnectorDryRun(vm.selectedCluster.value, vm.connectorType)
            .then(function (dryRunData) {
              vm.numberOfUsersWithoutService = _.reduce(existingServicesInfo, function (acc, info) {
                var reducedCapacityForTheSelectedCluster = _.get(dryRunData.userCapacitiesBefore, info.connectorType, 0) - _.get(dryRunData.userCapacitiesAfter, info.connectorType, 0);
                var availableRemainingCapacityForUsers = info.capacityInfo.maxUsers - reducedCapacityForTheSelectedCluster - info.capacityInfo.users;
                return acc + Math.max(0, -availableRemainingCapacityForUsers);
              }, 0);
            })
            .finally(function () {
              vm.executingDryRun = false;
            });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    };
  }
}());
