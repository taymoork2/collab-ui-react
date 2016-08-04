(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('AddResourceController', AddResourceController);

  /* @ngInject */
  function AddResourceController($modalInstance, $window, $translate, connectorType, servicesId, firstTimeSetup, XhrNotificationService, FusionClusterService, FusionUtils, $modal, $state) {
    var vm = this;
    vm.hostname = '';
    vm.releaseChannel = 'GA'; // hard-coded for now, release channel support is not part of phase 1
    vm.connectorType = connectorType;
    vm.servicesId = servicesId;
    vm.preregistrationCompleted = false;
    vm.provisioningToExistingExpresswayCompleted = false;
    vm.selectedAction = 'new';
    vm.closeSetupModal = closeSetupModal;
    vm.firstTimeSetup = firstTimeSetup;
    vm.welcomeScreenAccepted = !firstTimeSetup;

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    vm.localizedAddNewExpressway = $translate.instant('hercules.addResourceDialog.registerNewExpressway', {
      ConnectorName: vm.localizedConnectorName
    });
    vm.localizedAddToExistingExpressway = $translate.instant('hercules.addResourceDialog.addToExistingExpressway', {
      ConnectorName: vm.localizedConnectorName
    });
    vm.localizedWillBeInstalledMessage = $translate.instant('hercules.addResourceDialog.willBeInstalled', {
      ConnectorName: vm.localizedConnectorName,
      ServiceName: vm.localizedServiceName
    });
    vm.localizedExpresswaysName = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
    vm.localizedCannotProvionError = $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
      ConnectorName: vm.localizedConnectorName
    });
    vm.localizedServiceIsReady = $translate.instant('hercules.addResourceDialog.serviceIsReady', {
      ServiceName: vm.localizedServiceName
    });
    vm.chooseClusterName = false;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired')
    };
    vm.clustername = '';
    vm.localizedHostNameHelpText = $translate.instant('hercules.expresswayClusterSettings.renameClusterDescription');
    vm.localizedClusternameWatermark = $translate.instant('hercules.addResourceDialog.clusternameWatermark');

    vm.selectedCluster = '';
    vm.expresswayOptions = [];

    vm.provisionExpresswayWithNewConnector = provisionExpresswayWithNewConnector;
    vm.addPreregisteredClusterToAllowList = addPreregisteredClusterToAllowList;
    vm.getIconClassForService = getIconClassForService;
    vm.updateDropdownMenu = updateDropdownMenu;

    findAndPopulateExistingExpressways(vm.connectorType);

    vm.preregisterAndProvisionExpressway = function (connectorType) {
      preregisterCluster(vm.clustername)
        .then(_.partialRight(_.get, 'id'))
        .then(_.partial(provisionConnector, connectorType))
        .then(addPreregisteredClusterToAllowList)
        .then(pregistrationSucceeded)
        .catch(XhrNotificationService.notify);
    };

    function pregistrationSucceeded() {
      vm.preregistrationCompleted = true;
    }

    function preregisterCluster(clusterName) {
      return FusionClusterService.preregisterCluster(clusterName, vm.releaseChannel, 'c_mgmt')
        .catch(function () {
          throw $translate.instant('hercules.addResourceDialog.cannotCreateCluster');
        });
    }

    function provisionConnector(connectorType, clusterId) {
      FusionClusterService.provisionConnector(clusterId, connectorType)
        .catch(function () {
          if (connectorType === 'c_mgmt') {
            throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
              ConnectorName: vm.localizedManagementConnectorName
            });
          }
          throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
            ConnectorName: vm.localizedConnectorName
          });
        });
      return clusterId;
    }

    function addPreregisteredClusterToAllowList(clusterId) {
      return FusionClusterService.addPreregisteredClusterToAllowList(vm.hostname, 3600, clusterId)
        .catch(function () {
          $translate.instant('hercules.addResourceDialog.cannotFinalizeAllowlisting');
        });
    }

    function findAndPopulateExistingExpressways(connectorType) {
      FusionClusterService.getAll()
        .then(getAllExpressways)
        .then(_.partial(removeAlreadyProvisionedExpressways, connectorType))
        .then(updateDropdownMenu)
        .catch(function (error) {
          XhrNotificationService.notify($translate.instant('hercules.addResourceDialog.cannotReadExpresswayList'));
        });
    }

    function getAllExpressways(data) {
      var allExpressways = [];
      data.forEach(function (cluster) {
        if (cluster.targetType === 'c_mgmt') {
          allExpressways.push({
            id: cluster.id,
            name: cluster.name,
            provisionedConnectors: _.map(cluster.provisioning, 'connectorType')
          });
        }
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
          label: expressway.name
        });
      });
      if (vm.expresswayOptions.length === 0) {
        vm.localizedClusterlistPlaceholder = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholderNoneFound');
      } else {
        vm.localizedClusterlistPlaceholder = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
      }
    }

    function provisionExpresswayWithNewConnector(clusterId, connectorType) {
      FusionClusterService.provisionConnector(clusterId, connectorType)
        .then(function () {
          vm.provisioningToExistingExpresswayCompleted = true;
          setHostNameForCluster(clusterId);
        }, function () {
          XhrNotificationService.notify($translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
            ConnectorName: vm.localizedConnectorName
          }));
        });
    }

    function setHostNameForCluster(clusterId) {
      FusionClusterService.getAll()
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

    function getIconClassForService() {
      return FusionUtils.serviceId2Icon(vm.servicesId[0]);
    }

    function closeSetupModal() {
      if (!firstTimeSetup) {
        $modalInstance.close();
        return;
      }
      $modal.open({
          templateUrl: 'modules/hercules/add-resource/confirm-setup-cancel-dialog.html',
          type: 'dialog'
        })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.close();
            $state.go('services-overview');
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
      return !(vm.preregistrationCompleted || vm.provisioningToExistingExpresswayCompleted || !vm.welcomeScreenAccepted || vm.chooseClusterName);
    };

    vm.inHostnameSelectionScreen = function () {
      return !(vm.chooseClusterName || vm.selectedAction === 'existing' || !vm.welcomeScreenAccepted);
    };

    vm.completeEnterHostnameScreen = function () {
      vm.chooseClusterName = true;
      vm.clustername = vm.hostname;
    };

    vm.inClusterNameSelectionScreen = function () {
      return vm.chooseClusterName && !vm.preregistrationCompleted;
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
      return vm.preregistrationCompleted || vm.provisioningToExistingExpresswayCompleted;
    };

    vm.completeAddResourceModal = function () {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(vm.hostname) + "/fusionregistration");
    };

  }
}());
