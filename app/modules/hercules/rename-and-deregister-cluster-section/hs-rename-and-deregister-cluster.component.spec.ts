import renameAndDeregisterClusterSection from './index';

describe('Component: hsRenameAndDeregisterClusterSection', () => {

  let $componentController, $scope, $q, PrivateTrunkService, HybridServicesClusterService, Notification;

  beforeEach(function () {
    this.initModules(renameAndDeregisterClusterSection);
    this.injectDependencies(
      'HybridServicesClusterService',
      'Notification',
    );
  });

  describe ('template ', function() {

    afterEach(function () {
      if (this.view) {
        this.view.remove();
      }
    });

    it ('should contain a rename section if the showRenameSection attribute is true', function() {
      this.compileComponent('hsRenameAndDeregisterClusterSection', {
        showRenameSection: true,
      });
      expect(this.view).toContainElement('#renameSection');
    });

    it ('should NOT contain a rename section if the showRenameSection attribute is not set', function() {
      this.compileComponent('hsRenameAndDeregisterClusterSection');
      expect(this.view).not.toContainElement('#renameSection');
    });

  });

  describe ('controller', function () {

    beforeEach(inject(function (_$componentController_, $rootScope, _$q_, _PrivateTrunkService_, _HybridServicesClusterService_, _Notification_) {
      $componentController = _$componentController_;
      $scope = $rootScope.$new();
      $q = _$q_;
      PrivateTrunkService = _PrivateTrunkService_;
      HybridServicesClusterService = _HybridServicesClusterService_;
      Notification = _Notification_;
    }));

    let callbackHasBeenCalled = false;

    let bindings = {
      serviceId: 'squared-fusion-foobar',
      cluster: {
        provisioning: [{
          connectorType: 'c_cal',
          provisionedVersion: '8.7-1.0.3402',
        }],
      },
      showRenameSection: true,
      deregisterModalOptions: {},
      onNameUpdate: function () {
        callbackHasBeenCalled = true;
      },
    };

    it ('should show an error when trying to save an empty cluster name', function() {
      spyOn(Notification, 'error');
      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', null, bindings);
      ctrl.saveClusterName('');
      expect(Notification.error.calls.count()).toBe(1);
    });

    it ('should call the provided callback function when the name changes', function() {

      let MockHybridServicesClusterService = {
        setClusterInformation: function() {
          return $q.resolve();
        },
      };

      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', {
        HybridServicesClusterService: MockHybridServicesClusterService,
      }, bindings);
      ctrl.clusterName = 'This is a new cluster name';
      ctrl.saveClusterName();
      $scope.$apply();
      expect(callbackHasBeenCalled).toBe(true);
    });

    it ('should warn when c_cal is provisioned', function () {
      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', null, bindings);
      expect(ctrl.blockDeregistration()).toBe(true);
    });

    it ('should NOT warn when only c_mgmt is provisioned', function () {
      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', null, {
        cluster: {
          provisioning: [{
            connectorType: 'c_mgmt',
          }],
        },
      });
      expect(ctrl.blockDeregistration()).toBe(false);
    });

    it ('should use EnterprisePrivateTrunkService when dealing with private trunks', function () {
      spyOn(PrivateTrunkService, 'setPrivateTrunkResource').and.returnValue($q.resolve({}));
      spyOn(HybridServicesClusterService, 'setClusterInformation');
      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', {}, {
        cluster: {
          name: 'Private Trunk Something',
        },
        serviceId: 'ept',
        onNameUpdate: () => {},
      });
      ctrl.saveClusterName('This is a new name!');
      $scope.$apply();
      expect(PrivateTrunkService.setPrivateTrunkResource.calls.count()).toBe(1);
      expect(HybridServicesClusterService.setClusterInformation.calls.count()).toBe(0);
    });

    it ('should use HybridServicesClusterService when dealing with anything that is not a private trunk', function () {
      spyOn(PrivateTrunkService, 'setPrivateTrunkResource');
      spyOn(HybridServicesClusterService, 'setClusterInformation').and.returnValue($q.resolve({}));
      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', {}, {
        cluster: {
          name: 'Not a Private Trunk Cluster',
        },
        serviceId: 'not_ept',
        onNameUpdate: () => {},
      });
      ctrl.saveClusterName('This is a new name!');
      $scope.$apply();
      expect(PrivateTrunkService.setPrivateTrunkResource.calls.count()).toBe(0);
      expect(HybridServicesClusterService.setClusterInformation.calls.count()).toBe(1);
    });

  });

});
