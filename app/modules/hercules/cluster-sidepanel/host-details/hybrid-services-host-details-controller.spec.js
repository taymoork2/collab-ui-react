describe('HybridServicesHostDetailsController: ', function () {
  var $controller, $modal, $q, $rootScope, $scope, $stateParams, controller, HybridServicesClusterService, HybridServicesClusterStatesService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _$modal_, _$stateParams_, _HybridServicesClusterService_, _HybridServicesClusterStatesService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $stateParams = _$stateParams_;
    $controller = _$controller_;
    $modal = _$modal_;
    HybridServicesClusterService = _HybridServicesClusterService_;
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
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([mockResult]));
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
      HybridServicesClusterService: HybridServicesClusterService,
      HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    });
    $scope.$apply();
  }));

  it('should open the correct modal window when showReassignHostDialog() is called', function () {
    var correctReassignHostDialogOptions = {
      controller: 'ReassignClusterControllerV2',
      controllerAs: 'reassignCluster',
      template: require('modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html'),
    };
    controller.showReassignHostDialog();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctReassignHostDialogOptions));
  });

  it('should open the correct modal window when showDeregisterHostDialog() is called', function () {
    var correctDeregisterHostDialogOptions = {
      controller: 'HostDeregisterControllerV2',
      controllerAs: 'hostDeregister',
      template: require('modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html'),
    };
    controller.showDeregisterHostDialog();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctDeregisterHostDialogOptions));
  });

  it('should open the correct modal window when deleteExpressway() is called', function () {
    var correctDeleteExpresswayNodeDialogOptions = {
      template: require('modules/hercules/hybrid-services-nodes-page/delete-expressway-host-modal/confirm-deleteHost-dialog.html'),
      controller: 'ConfirmDeleteHostController',
      controllerAs: 'confirmDeleteHostDialog',
    };
    controller.deleteExpressway();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctDeleteExpresswayNodeDialogOptions));
  });
});
