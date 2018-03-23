(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('AddResourceController', AddResourceController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function AddResourceController($modal, $modalInstance, $state, $translate, $window, connectorType, firstTimeSetup, FmsOrgSettings, HybridServicesClusterService, HybridServicesExtrasService, Notification, ResourceGroupService, serviceId) {
    var vm = this;
    vm.connectors = [];
    vm.warning = warning;
    // Bug in toolkit for cs-input warning
    //https://wwwin-github.cisco.com/collab-ui/collab-library/issues/79
    vm.warningMessage = 'DummyMessage';
    vm.hostname = '';
    vm.releaseChannel = 'stable';
    vm.connectorType = connectorType;
    vm.serviceId = serviceId;
    vm.preregistrationCompletedGoToExpressway = false;
    vm.provisioningToExistingExpresswayCompleted = false;
    vm.gettingResourceGroupInput = false;
    vm.selectedAction = 'new';
    vm.closeSetupModal = closeSetupModal;
    vm.firstTimeSetup = firstTimeSetup;
    vm.welcomeScreenAccepted = !firstTimeSetup;
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

    vm.provisionExpresswayWithNewConnector = provisionExpresswayWithNewConnector;
    vm.addPreregisteredClusterToAllowList = addPreregisteredClusterToAllowList;
    vm.updateDropdownMenu = updateDropdownMenu;

    findAndPopulateExistingExpressways(vm.connectorType);
    FmsOrgSettings.get()
      .then(function (data) {
        vm.releaseChannel = data.expresswayClusterReleaseChannel;
      });

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
      if (!firstTimeSetup) {
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
  }
}());
