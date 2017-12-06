import { ClusterTargetType } from 'modules/hercules/hybrid-services.types';

describe('HybridServicesNodesPageActionsComponentCtrl', () => {

  let $componentController, $modal, $scope, $q, ctrl, HybridServicesClusterService, ModalService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$modal_, _$q_, _$rootScope_, _HybridServicesClusterService_, _ModalService_) {
    $componentController = _$componentController_;
    $modal = _$modal_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    ModalService = _ModalService_;
  }

  function initSpies() {
    spyOn(ModalService, 'open').and.returnValue({
      result: $q.resolve(),
    });
    spyOn(HybridServicesClusterService, 'updateHost').and.returnValue($q.resolve());
    spyOn($modal, 'open').and.returnValue({
      result: $q.resolve(),
    });
  }

  function cleanup() {
    $componentController = $modal = $scope = $q = ctrl = HybridServicesClusterService = undefined;
  }

  function initController(node,
                          numberOfClusterNodes: number,
                          reloadDataCallback: Function,
                          targetType: ClusterTargetType) {
    ctrl = $componentController('hybridServicesNodesPageActions', {}, {
      clusterId: 'something',
      clusterName: 'something',
      node: node,
      numberOfClusterNodes: numberOfClusterNodes,
      reloadDataCallback: reloadDataCallback,
      targetType: targetType,
    });
  }

  describe('actions for removing Expressway nodes ', () => {

    it('should not show for Media Clusters', () => {
      const targetType = 'mf_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'mf_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDocumentationLink(targetType, node, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDeregisterInfo(targetType, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should not trigger enabled removal action by Call or Calendar Connectors being offline', () => {
      const targetType = 'c_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'c_mgmt',
          originalState: 'running',
        }, {
          connectorType: 'c_cal',
          originalState: 'offline',
        }, {
          connectorType: 'c_ucmc',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDocumentationLink(targetType, node, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDeregisterInfo(targetType, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should show as a clickable link when management connector is offline, but it is not the last node', () => {
      const targetType = 'c_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'c_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDocumentationLink(targetType, node, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDeregisterInfo(targetType, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
    });

    it('should instruct the admin to rather deregister the cluster if there is only one node left, and it is offline', () => {
      const targetType = 'c_mgmt';
      const numberOfNodes = 1;
      const node = {
        connectors: [{
          connectorType: 'c_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDocumentationLink(targetType, node, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayDisabledRemoveNodeMenuItemWithDeregisterInfo(targetType, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

  });

  describe('actions for removing Context nodes ', () => {

    it('should be able to remove node if context connector is offline, but it is not the last node', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'cs_context',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
    });

    it('should be able to remove node if context management connector is offline, but it is not the last node', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'cs_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
    });

    it('should not allow the admin to remove node if context connector is running', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 3;
      const node = {
        connectors: [{
          connectorType: 'cs_mgmt',
          originalState: 'running',
        }, {
          connectorType: 'cs_context',
          originalState: 'running',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should not allow the admin to remove node if context connector is running and it is the last node', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 1;
      const node = {
        connectors: [{
          connectorType: 'cs_context',
          originalState: 'running',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should not allow the admin to remove if there is only one node left, and it is offline', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 1;
      const node = {
        connectors: [{
          connectorType: 'cs_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should not allow the admin to remove if there is only one node left, and it is offline', () => {
      const targetType = 'cs_mgmt';
      const numberOfNodes = 1;
      const node = {
        connectors: [{
          connectorType: 'cs_context',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeTruthy();
      expect(ctrl.displayActiveRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

    it('should not show disabled remove node for Expressway Clusters', () => {
      const targetType = 'c_mgmt';
      const numberOfNodes = 2;
      const node = {
        connectors: [{
          connectorType: 'mf_mgmt',
          originalState: 'offline',
        }],
      };
      initController(node, numberOfNodes, Function(), targetType);
      expect(ctrl.displayDisabledRemoveNodeMenuItem(targetType, node, numberOfNodes)).toBeFalsy();
    });

  });

  describe('actions for deregistering ECP nodes', () => {

    it('should show for Hybrid Media nodes', () => {
      const targetType = 'mf_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayDeregisterNodeMenuItem(targetType)).toBeTruthy();
    });

    it('should show for Hybrid Data Security nodes', () => {
      const targetType = 'hds_app';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayDeregisterNodeMenuItem(targetType)).toBeTruthy();
    });

    it('should not show for Expressway nodes', () => {
      const targetType = 'c_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayDeregisterNodeMenuItem(targetType)).toBeFalsy();
    });

    it('should open a modal, and on success call the callback function', () => {
      const callback = jasmine.createSpy('callback');
      initController({}, 4, callback, 'mf_mgmt');
      ctrl.openDeregisterNodeModal({});
      $scope.$apply();
      expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
        resolve: {
          connectorId: jasmine.any(Function),
        },
      }));
      expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ options: { reload: true } }));
      expect(callback.calls.count()).toBe(1);
    });

  });

  describe('actions for moving ECP nodes', () => {

    it('should show for Hybrid Media nodes', () => {
      const targetType = 'mf_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMoveNodeMenuItem(targetType)).toBeTruthy();
    });

    it('should not show for Hybrid Data Security nodes', () => {
      const targetType = 'hds_app';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMoveNodeMenuItem(targetType)).toBeFalsy();
    });

    it('should not show for Expressway nodes', () => {
      const targetType = 'c_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMoveNodeMenuItem(targetType)).toBeFalsy();
    });

    it('should open a modal, and on success call the callback function', () => {
      const callback = jasmine.createSpy('callback');
      initController({}, 4, callback, 'mf_mgmt');
      ctrl.openMoveNodeModal({});
      $scope.$apply();
      expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
        resolve: {
          cluster: jasmine.any(Function),
          connector: jasmine.any(Function),
        },
      }));
      expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ options: { reload: true } }));
      expect(callback.calls.count()).toBe(1);
    });

  });

  describe('maintenance mode', () => {

    it('should show for Hybrid Media nodes', () => {
      const targetType = 'mf_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMaintenanceModeMenuItem(targetType)).toBeTruthy();
    });

    it('should not show for Hybrid Data Security nodes', () => {
      const targetType = 'hds_app';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMaintenanceModeMenuItem(targetType)).toBeFalsy();
    });

    it('should show for Expressway nodes', () => {
      const targetType = 'c_mgmt';
      initController({}, 4, Function(), targetType);
      expect(ctrl.displayMaintenanceModeMenuItem(targetType)).toBeTruthy();
    });

    describe('callbacks and used APIs', () => {

      let targetType, expectedSerial, node, callback;

      beforeEach(() => {
        targetType = 'c_mgmt';
        expectedSerial = 'expected serial';
        node = {
          serial: expectedSerial,
        };
        callback = jasmine.createSpy('callback');
        initController(node, 1, callback, targetType);
      });

      afterEach(() => {
        targetType = expectedSerial = node = callback = undefined;
      });

      it('should persist the maintenance mode flag in FMS when enabling it, and then call the callback so the parent can reload', () => {

        ctrl.enableMaintenanceMode(node);
        $scope.$apply();

        expect(HybridServicesClusterService.updateHost).toHaveBeenCalledWith(expectedSerial, { maintenanceMode: 'on' });
        expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ options: { reload: true } }));
        expect(callback.calls.count()).toBe(1);
      });

      it('should persist the maintenance mode flag in FMS when disabling it, and then call the callback so the parent can reload', () => {

        ctrl.disableMaintenanceMode(node);
        $scope.$apply();

        expect(HybridServicesClusterService.updateHost).toHaveBeenCalledWith(expectedSerial, { maintenanceMode: 'off' });
        expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ options: { reload: true } }));
        expect(callback.calls.count()).toBe(1);
      });

    });

  });

});
