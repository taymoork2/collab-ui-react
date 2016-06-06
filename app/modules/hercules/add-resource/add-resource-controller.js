(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("AddResourceController", AddResourceController);

  /* @ngInject */
  function AddResourceController($modalInstance, $window, $translate, connectorType, servicesId, ClusterService, XhrNotificationService) {
    var vm = this;
    vm.newHostname = '';
    vm.releaseChannel = 'GA'; // hard-coded for now, release channel support is not part of phase 1
    vm.connectorType = connectorType;
    vm.servicesId = servicesId;
    vm.preregistrationCompleted = false;
    vm.selectedAction = '';

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
    vm.localizedSelectClusterPlaceholder = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');
    vm.localizedExpresswaysName = $translate.instant('hercules.addResourceDialog.selectClusterPlaceholder');

    vm.selectedClusters = [];
    vm.expresswayOptions = [{
      'value': 'london.example.com',
      'label': 'london.example.com'
    }, {
      'value': 'singapore.example.com',
      'label': 'singapore.example.com'
    }];

    vm.redirectToTargetAndCloseWindowClicked = function (hostName) {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(hostName) + "/fusionregistration");
    };

    vm.preregisterAndProvisionExpressway = function (connectorType) {
      preregisterCluster(vm.newHostname)
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
      return ClusterService.preregisterCluster(hostname, vm.releaseChannel)
        .catch(function () {
          throw $translate.instant('hercules.addResourceDialog.cannotCreateCluster');
        });
    }

    function provisionConnector(connectorType, clusterId) {
      return ClusterService.provisionConnector(clusterId, connectorType)
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
      return ClusterService.addPreregisteredClusterToAllowList(vm.newHostname, 3600, clusterId)
        .catch(function () {
          $translate.instant('hercules.addResourceDialog.cannotFinalizeAllowlisting');
        });
    }

  }
}());
