import renameAndDeregisterClusterSection from './index';

describe('Component: hsRenameAndDeregisterClusterSection ', () => {

  let $componentController, $scope, $q, Notification;

  beforeEach(function () {
    this.initModules(renameAndDeregisterClusterSection);
    this.injectDependencies(
      'FusionClusterService',
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

  describe ('controller ', function () {

    beforeEach(inject(function (_$componentController_, $rootScope, _$q_, _Notification_) {
      $componentController = _$componentController_;
      $scope = $rootScope.$new();
      $q = _$q_;
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

      let MockFusionClusterService = {
        setClusterName: function() {
          return $q.resolve(true);
        },
      };

      let ctrl = $componentController('hsRenameAndDeregisterClusterSection', {
        FusionClusterService: MockFusionClusterService,
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

  });

});
