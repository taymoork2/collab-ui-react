describe('HybridServicesHostDetailsController: ', function () {

  var $controller, $modal, $rootScope, $scope, $stateParams, controller, ClusterService, HybridServicesClusterStatesService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(function (_$rootScope_, _$controller_, _$modal_, _$stateParams_, _ClusterService_, _HybridServicesClusterStatesService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $stateParams = _$stateParams_;
    $controller = _$controller_;
    $modal = _$modal_;
    ClusterService = _ClusterService_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;

    var mockResult = {
      connectors: [
        {
          clusterId: 'abc123',
          hostSerial: '123456',
          connectorType: 'hds_app',
          hostname: 'hds.abc.com',
          state: 'running',
        },
      ],
      name: 'testCluster',
    };
    spyOn(ClusterService, 'getCluster').and.returnValue(mockResult);
    spyOn($rootScope, '$broadcast').and.callThrough();
    spyOn($modal, 'open').and.returnValue({
      result: {
        then: function () {
        },
      },
    });

    $stateParams = {
      connectorType: 'hds_app',
      clusterId: 'abc123',
      host: 'abc.com',
      hostSerial: '123456',
    };

    controller = $controller('HybridServicesHostDetailsController', {
      $rootScope: $rootScope,
      $scope: $scope,
      $state: {
        current: {
          data: {
            displayName: '',
          },
        },
      },
      $stateParams: $stateParams,
      ClusterService: ClusterService,
      HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    });
    $scope.$apply();

  }));

  it('should open the correct modal window when showReassignHostDialog() is called', function () {
    var correctReassignHostDialogOptions = {
      controller: 'ReassignClusterControllerV2',
      controllerAs: 'reassignCluster',
      templateUrl: 'modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html',
    };
    controller.showReassignHostDialog();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctReassignHostDialogOptions));
  });

  it('should open the correct modal window when showDeregisterHostDialog() is called', function () {
    var correctDeregisterHostDialogOptions = {
      controller: 'HostDeregisterControllerV2',
      controllerAs: 'hostDeregister',
      templateUrl: 'modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html',
    };
    controller.showDeregisterHostDialog();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctDeregisterHostDialogOptions));
  });

  it('should open the correct modal window when deleteExpresswayOrHDSNode() is called', function () {
    var correctDeleteExpresswayOrHDSNodeDialogOptions = {
      templateUrl: 'modules/hercules/cluster-sidepanel/host-details/confirm-deleteHost-dialog.html',
      controller: 'ConfirmDeleteHostController',
      controllerAs: 'confirmDeleteHostDialog',
    };
    controller.deleteExpresswayOrHDSNode();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctDeleteExpresswayOrHDSNodeDialogOptions));
  });

  it('should support HDS connector parsing', function () {
    expect(controller.host.connectorType).toBe('hds_app');
    expect(controller.host.state).toBe('running');
    expect(controller.showDeleteNodeAction()).toBe(true);
    expect(controller.showAction()).toBe(true);
    expect(controller.showGoToHostAction()).toBe(true);
  });

  it('should support HDS connector offline function', function () {
    controller.host = {};
    controller.host.state = 'offline';
    controller.host.connectorType = 'hds_app';
    expect(controller.showDeleteNodeAction()).toBe(true);
    expect(controller.showAction()).toBe(true);
    expect(controller.showGoToHostAction()).toBe(true);
  });

});
