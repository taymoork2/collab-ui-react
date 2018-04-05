'use strict';

describe('Controller: AddResourceController', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      '$state',
      '$translate',
      'FmsOrgSettings',
      'HybridServicesExtrasService',
      'HybridServicesClusterService',
      'ResourceGroupService'
    );

    this.jsonData = getJSONFixture('hercules/add-resource.json');
    this.clusterIdOfNewCluster = 'c6b4d8f1-6d34-465c-8d6d-b541058fc15e';
    this.newConnectorType = 'c_cal';

    spyOn(this.HybridServicesExtrasService, 'addPreregisteredClusterToAllowList').and.returnValue(this.$q.resolve({}));
    spyOn(this.FmsOrgSettings, 'get').and.returnValue(this.$q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    spyOn(this.HybridServicesClusterService, 'provisionConnector').and.returnValue(this.$q.resolve({ id: this.clusterIdOfNewCluster }));
    spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.resolve({ id: this.clusterIdOfNewCluster }));
    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve(this.jsonData.getAll));
    spyOn(this.ResourceGroupService, 'getAllAsOptions').and.returnValue(this.$q.resolve({}));
    spyOn(this.$translate, 'instant').and.callThrough();

    this.initController = function () {
      this.controller = this.$controller('AddResourceController', {
        $scope: this.$scope,
        $modalInstance: { close: _.noop },
        connectorType: this.newConnectorType,
        serviceId: 'squared-fusion-cal',
        HybridServicesClusterService: this.HybridServicesClusterService,
        FmsOrgSettings: this.FmsOrgSettings,
        HybridServicesExtrasService: this.HybridServicesExtrasService,
        options: {
          firstTimeSetup: false,
          hasCapacityFeatureToggle: false,
        },
        ResourceGroupService: this.ResourceGroupService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });


  describe('provision connectors to an existing cluster', function () {
    it('should find and populate the dropdown with only the one Expressway that does not have calendar', function () {
      expect(this.controller.expresswayOptions.length).toBe(1);
      expect(this.controller.expresswayOptions[0].value).toBe('fe5acf7a-6246-484f-8f43-3e8c910fc50d');
      expect(this.controller.expresswayOptions[0].label).toBe('Test Expressway Cluster 01 – starting with c_ucmc but no c_cal');
    });

    it('should tell the modal that it must proceed when a connector has been provisioned', function () {
      this.controller._provisionExpresswayWithNewConnector('fe5acf7a-6246-484f-8f43-3e8c910fc50d', this.newConnectorType);
      this.$scope.$apply();
      expect(this.controller.provisioningToExistingExpresswayCompleted).toBe(true);
    });

    it('should parse the hostname from the connector list of the cluster, and make it available to the view', function () {
      this.controller._provisionExpresswayWithNewConnector('fe5acf7a-6246-484f-8f43-3e8c910fc50d', this.newConnectorType);
      this.$scope.$apply();
      expect(this.controller.hostname).toBe('host1.example.org');
    });

    it('should not touch the hostname if it cannot find a better one when parsing the connector list', function () {
      this.controller.hostname = 'old_hostname';
      this.controller._provisionExpresswayWithNewConnector('invalid_cluster_id', this.newConnectorType);
      this.$scope.$apply();
      expect(this.controller.hostname).toBe('old_hostname');
    });

    it('should provision the new connector, but nothing else', function () {
      this.controller.preregisterAndProvisionExpressway(this.newConnectorType);
      this.$scope.$apply();
      expect(this.HybridServicesClusterService.provisionConnector).toHaveBeenCalledWith(this.clusterIdOfNewCluster, this.newConnectorType);
      expect(this.HybridServicesClusterService.provisionConnector).toHaveBeenCalledTimes(1);
    });

    it('should add the new cluster to the FMS allow-list exactly once, and with the correct clusterId', function () {
      this.HybridServicesExtrasService.addPreregisteredClusterToAllowList.and.returnValue(this.$q.resolve({ }));
      this.controller.preregisterAndProvisionExpressway(this.newConnectorType);
      this.controller.hostname = 'hostnameProvidedByUser';
      this.$scope.$apply();
      expect(this.HybridServicesExtrasService.addPreregisteredClusterToAllowList).toHaveBeenCalledTimes(1);
      expect(this.HybridServicesExtrasService.addPreregisteredClusterToAllowList).toHaveBeenCalledWith('hostnameProvidedByUser', this.clusterIdOfNewCluster);
    });

    it('should not show the Resource Group step unless you are feature toggled', function () {
      this.$scope.$apply();
      expect(this.controller.optionalSelectResourceGroupStep).toBe(false);
    });
  });
  describe('check for existing hostnames', function () {
    it('Verify connectors get populated', function () {
      expect(this.controller.connectors.length).toBe(1);
    });

    it('should create a warning if hostname is previously used', function () {
      this.controller.hostname = 'host1.example.org';
      expect(this.controller.warning()).toBe(true);
    });

    it('should not create a warning if hostname is previously not used', function () {
      this.controller.hostname = 'neverUsedHostname.example.org';
      expect(this.controller.warning()).toBe(false);
    });
  });
});
