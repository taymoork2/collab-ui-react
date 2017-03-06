xdescribe('HybridServicesHostDetailsController: ', function () {

  var $controller, $modal, $rootScope, $scope, controller, clusterServiceMock;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(dependencies));
  beforeEach(initController);
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$modal_) {
    $rootScope = $rootScope.$new();
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $modal = _$modal_;
  }

  function initSpies() {
    spyOn($modal, 'open').and.returnValue({
      result: {
        then: function () {
        },
      },
    });
  }

  function initController() {
    clusterServiceMock = {
      getCluster: function () {
        return {
          name: 'Example Name',
        };
      },
    };

    controller = $controller('HybridServicesHostDetailsController', {
      $rootScope: $rootScope,
      $scope: $scope,
      $state: {
        current: {
          data: '',
        },
      },
      $stateParams: {
        specificType: 'c_mgmt',
      },
      ClusterService: clusterServiceMock,
    });
    $scope.$apply();
  }

  it('should open the correct modal window when showReassignHostDialog() is called', function () {
    var correctReassignHostDialogOptions = {
      controller: 'ReassignClusterControllerV2',
      controllerAs: 'reassignClust',
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

});
