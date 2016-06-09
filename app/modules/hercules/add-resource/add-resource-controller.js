(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("AddResourceController", AddResourceController);

  /* @ngInject */
  function AddResourceController($modalInstance, $window, $translate, connectorType, servicesId, XhrNotificationService, FusionClusterService, FusionUtils) {
    var vm = this;
    vm.hostname = '';
    vm.releaseChannel = 'GA'; // hard-coded for now, release channel support is not part of phase 1
    vm.connectorType = connectorType;
    vm.servicesId = servicesId;
    vm.preregistrationCompleted = false;
    vm.provisioningToExistingExpresswayCompleted = false;
    vm.selectedAction = 'new';

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    vm.localizedAddNewExpressway = $translate.instant('hercules.addResourceDialog.registerNewExpressway', {
      "ConnectorName": vm.localizedConnectorName
    });
    vm.localizedAddToExistingExpressway = $translate.instant('hercules.addResourceDialog.addToExistingExpressway', {
      "ConnectorName": vm.localizedConnectorName
    });
    vm.localizedWillBeInstalledMessage = $translate.instant('hercules.addResourceDialog.willBeInstalled', {
      "ConnectorName": vm.localizedConnectorName,
      "ServiceName": vm.localizedServiceName
    });
    vm.localizedExpresswaysName = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
    vm.localizedCannotProvionError = $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
      "ConnectorName": vm.localizedConnectorName
    });
    vm.localizedServiceIsReady = $translate.instant('hercules.addResourceDialog.serviceIsReady', {
      "ServiceName": vm.localizedServiceName
    });

    vm.selectedCluster = '';
    vm.expresswayOptions = [];

    vm.provisionExpresswayWithNewConnector = provisionExpresswayWithNewConnector;
    vm.addPreregisteredClusterToAllowList = addPreregisteredClusterToAllowList;
    vm.getIconClassForService = getIconClassForService;
    vm.updateDropdownMenu = updateDropdownMenu;

    findAndPopulateExistingExpressways(vm.connectorType);

    vm.redirectToTargetAndCloseWindowClicked = function (hostName) {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(hostName) + "/fusionregistration");
    };

    vm.preregisterAndProvisionExpressway = function (connectorType) {
      preregisterCluster(vm.hostname)
        .then(_.partial(provisionConnector, 'c_mgmt'))
        .then(_.partial(provisionConnector, connectorType))
        .then(addPreregisteredClusterToAllowList)
        .then(pregistrationSucceeded)
        .catch(XhrNotificationService.notify);
    };

    function pregistrationSucceeded() {
      vm.preregistrationCompleted = true;
    }

    function preregisterCluster(hostname) {
      return FusionClusterService.preregisterCluster(hostname, vm.releaseChannel, 'c_mgmt')
        .catch(function () {
          throw $translate.instant('hercules.addResourceDialog.cannotCreateCluster');
        });
    }

    function provisionConnector(connectorType, clusterId) {
      return FusionClusterService.provisionConnector(clusterId, connectorType)
        .then(function () {
          return clusterId;
        })
        .catch(function () {
          if (connectorType === 'c_mgmt') {
            throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
              "ConnectorName": vm.localizedManagementConnectorName
            });
          }
          throw $translate.instant('hercules.addResourceDialog.cannotProvisionConnector', {
            "ConnectorName": vm.localizedConnectorName
          });
        });
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
        if (cluster.type === 'expressway') {
          allExpressways.push({
            'id': cluster.id,
            'name': cluster.name,
            'provisionedConnectors': _.map(cluster.provisioning, 'connectorType')
          });
        }
      });
      return allExpressways;
    }

    function removeAlreadyProvisionedExpressways(currentConnectorType, expressways) {
      var unprovisionedExpressways = [];
      expressways.forEach(function (expressway) {
        if (!_.includes(expressway.provisionedConnectors, currentConnectorType)) {
          unprovisionedExpressways.push(expressway);
        }
      });
      return unprovisionedExpressways;
    }

    function updateDropdownMenu(expressways) {
      expressways.forEach(function (expressway) {
        vm.expresswayOptions.push({
          'value': expressway.id,
          'label': expressway.name
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
            "ConnectorName": vm.localizedConnectorName
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

  }
}());
