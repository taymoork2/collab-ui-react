import { ChangeReleaseChannelDialogController, ResourceType } from './change-release-channel-dialog.controller';

describe('ChangeReleaseChannelDialogController', () => {

  let $controller, $q, $scope, FusionClusterService, Notification, ResourceGroupService;
  let ctrl: ChangeReleaseChannelDialogController;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$controller_, _$q_, _$rootScope_, _FusionClusterService_, _Notification_, _ResourceGroupService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    FusionClusterService = _FusionClusterService_;
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
    spyOn(FusionClusterService, 'setReleaseChannel').and.returnValue($q.resolve());
    spyOn(ResourceGroupService, 'setReleaseChannel').and.returnValue($q.resolve());
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorWithTrackingId');
  }

  describe('confirmChange', () => {
    it('should call FusionClusterService.setReleaseChannel() if type is "cluster"', () => {
      initController('cluster');
      ctrl.confirmChange();
      $scope.$apply();
      expect(FusionClusterService.setReleaseChannel).toHaveBeenCalledWith(123, 'something');
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
      FusionClusterService.setReleaseChannel.and.returnValue($q.reject());
      initController('cluster');
      ctrl.confirmChange();
      $scope.$apply();
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });
});
