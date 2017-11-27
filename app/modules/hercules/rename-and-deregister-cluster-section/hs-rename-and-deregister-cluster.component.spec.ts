import renameAndDeregisterClusterSection from './index';

describe('Component: hsRenameAndDeregisterClusterSection', function () {
  beforeEach(function () {
    this.initModules(renameAndDeregisterClusterSection);
    this.injectDependencies('$componentController', '$q', '$scope', 'PrivateTrunkService', 'HybridServicesClusterService', 'Notification', 'FeatureToggleService');

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    spyOn(this.HybridServicesClusterService, 'setClusterInformation').and.returnValue(this.$q.resolve({}));
    spyOn(this.PrivateTrunkService, 'setPrivateTrunkResource').and.returnValue(this.$q.resolve({}));
    spyOn(this.Notification, 'error');
    this.callbackHasBeenCalled = false;
  });

  describe ('template ', function() {
    const element: string = '#renameSection';

    it ('should contain a rename section if the showRenameSection attribute is true', function() {
      this.compileComponent('hsRenameAndDeregisterClusterSection', {
        showRenameSection: true,
      });
      this.$scope.$apply();
      expect(this.view).toContainElement(element);
    });

    it ('should NOT contain a rename section if the showRenameSection attribute is not set', function() {
      this.compileComponent('hsRenameAndDeregisterClusterSection');
      this.$scope.$apply();
      expect(this.view).not.toContainElement(element);
    });
  });

  describe ('controller', function () {
    beforeEach(function () {
      this.newName = 'This is a new cluster name';

      this.initController = (): void => {
        this.controller = this.$componentController('hsRenameAndDeregisterClusterSection', null, {
          cluster: {
            targetType: 'c_mgmt',
            provisioning: [{
              connectorType: 'c_cal',
              provisionedVersion: '8.7-1.0.3402',
            }],
          },
          showRenameSection: true,
          deregisterModalOptions: {},
          onNameUpdate: () => {
            this.callbackHasBeenCalled = true;
          },
        });
        this.controller.$onInit();
        this.$scope.$apply();
      };
    });

    it ('should show an error when trying to save an empty cluster name', function() {
      this.initController();
      this.controller.saveClusterName('');
      expect(this.Notification.error).toHaveBeenCalledTimes(1);
    });

    it ('should call the provided callback function when the name changes', function() {
      this.initController();
      this.controller.clusterName = this.newName;
      this.controller.saveClusterName();
      this.$scope.$apply();
      expect(this.callbackHasBeenCalled).toBe(true);
    });

    it ('should warn when c_cal is provisioned', function () {
      this.initController();
      expect(this.controller.blockDeregistration()).toBe(true);
    });

    it ('should NOT warn when only c_mgmt is provisioned', function () {
      this.controller = this.$componentController('hsRenameAndDeregisterClusterSection', null, {
        cluster: {
          provisioning: [{
            connectorType: 'c_mgmt',
          }],
        },
      });
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.controller.blockDeregistration()).toBe(false);
    });

    it ('should use EnterprisePrivateTrunkService when dealing with private trunks', function () {
      this.controller = this.$componentController('hsRenameAndDeregisterClusterSection', null, {
        cluster: {
          name: 'Private Trunk Cluster',
          targetType: 'ept',
        },
        onNameUpdate: () => {},
      });
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.saveClusterName(this.newName);
      this.$scope.$apply();
      expect(this.PrivateTrunkService.setPrivateTrunkResource.calls.count()).toBe(1);
      expect(this.HybridServicesClusterService.setClusterInformation.calls.count()).toBe(0);
    });

    it ('should use HybridServicesClusterService when dealing with anything that is not a private trunk', function () {
      this.controller = this.$componentController('hsRenameAndDeregisterClusterSection', {}, {
        cluster: {
          name: 'Not a Private Trunk Cluster',
          targetType: 'c_mgmt',
        },
        onNameUpdate: () => {},
      });
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.saveClusterName(this.newName);
      this.$scope.$apply();
      expect(this.PrivateTrunkService.setPrivateTrunkResource.calls.count()).toBe(0);
      expect(this.HybridServicesClusterService.setClusterInformation.calls.count()).toBe(1);
    });
  });
});
