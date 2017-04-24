'use strict';

describe('Controller: UpgradeNowControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $rootScope, controller, clusterId, ClusterService, Notification, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function (_$rootScope_, $controller, _Notification_, _$q_, _$translate_) {
    $rootScope = _$rootScope_;
    clusterId = '134';

    ClusterService = {
      upgradeSoftware: sinon.stub(),
    };
    Notification = _Notification_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub(),
    };
    windowMock = {
      open: sinon.stub(),
    };
    controller = $controller('UpgradeNowControllerV2', {
      $scope: $rootScope.$new(),
      clusterId: clusterId,
      ClusterService: ClusterService,
      Notification: Notification,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
    });

  }));

  it('check if UpgradeNowControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if upgrade is called', function () {
    spyOn(ClusterService, 'upgradeSoftware').and.returnValue($q.resolve());
    controller.upgrade();
    expect(ClusterService.upgradeSoftware).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if upgradeSoftware is called with  clusterId', function () {

    spyOn(ClusterService, 'upgradeSoftware').and.returnValue($q.resolve());
    controller.upgrade();
    expect(ClusterService.upgradeSoftware).toHaveBeenCalledWith(clusterId, 'mf_mgmt');
  });

  it('Should go to success module of upgrade', function () {
    var upgradeDefered = $q.defer();
    spyOn(ClusterService, 'upgradeSoftware').and.returnValue(upgradeDefered.promise);
    upgradeDefered.resolve();
    $rootScope.$apply();

    controller.upgrade();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('Should go to failure module of upgrade', function () {
    var upgradeDefered = $q.defer();
    spyOn(ClusterService, 'upgradeSoftware').and.returnValue(upgradeDefered.promise);
    upgradeDefered.reject();
    $rootScope.$apply();

    controller.upgrade();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
