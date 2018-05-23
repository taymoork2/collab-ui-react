import { ChangeReleaseChannelDialogController, ResourceType } from './change-release-channel-dialog.controller';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

describe('ChangeReleaseChannelDialogController', () => {

  let $controller, $q, $scope, Notification, ResourceGroupService, HybridServicesClusterService: HybridServicesClusterService;
  let setClusterInformationSpy;
  let ctrl: ChangeReleaseChannelDialogController;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$controller_, _$q_, _$rootScope_, _HybridServicesClusterService_, _Notification_, _ResourceGroupService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    Notification = _Notification_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function initController(type: ResourceType) {
    ctrl = $controller('ChangeReleaseChannelDialogController', {
      $modalInstance: {
        close: () => {},
      },
      data: {
        id: 123,
      },
      type: type,
      releaseChannel: 'something',
    });
    $scope.$apply();
  }

  function initSpies() {
    setClusterInformationSpy = spyOn(HybridServicesClusterService, 'setClusterInformation').and.returnValue($q.resolve());
    spyOn(ResourceGroupService, 'setReleaseChannel').and.returnValue($q.resolve());
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorWithTrackingId');
  }

  describe('confirmChange', () => {
    it('should call HybridServicesClusterService.setClusterInformation() if type is "cluster"', () => {
      initController('cluster');
      ctrl.confirmChange();
      $scope.$apply();
      expect(HybridServicesClusterService.setClusterInformation).toHaveBeenCalledWith(123, { releaseChannel: 'something' });
      expect(Notification.success).toHaveBeenCalled();
    });

    it('should call ResourceGroupService.setReleaseChannel() if type is "resource-group"', () => {
      initController('resource-group');
      ctrl.confirmChange();
      $scope.$apply();
      expect(ResourceGroupService.setReleaseChannel).toHaveBeenCalledWith(123, 'something');
      expect(Notification.success).toHaveBeenCalled();
    });

    it('should call Notification.errorWithTrackingId() if a request fails', () => {
      initController('cluster');
      setClusterInformationSpy.and.returnValue($q.reject());
      ctrl.confirmChange();
      $scope.$apply();
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });
});
