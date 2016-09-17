'use strict';

describe('Controller: UpgradeNowControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $rootScope, controller, clusterId, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function (_$rootScope_, $controller, _XhrNotificationService_, _$q_, _$translate_) {
    $rootScope = _$rootScope_;
    clusterId = '134';

    MediaClusterServiceV2 = {

      upgradeCluster: sinon.stub()
    };
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    controller = $controller('UpgradeNowControllerV2', {
      $scope: $rootScope.$new(),
      clusterId: clusterId,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock
    });

  }));

  it('check if UpgradeNowControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if upgrade is called', function () {
    spyOn(MediaClusterServiceV2, 'upgradeCluster').and.returnValue($q.when());
    controller.upgrade();
    expect(MediaClusterServiceV2.upgradeCluster).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if upgradeCluster is called with  clusterId', function () {

    spyOn(MediaClusterServiceV2, 'upgradeCluster').and.returnValue($q.when());
    controller.upgrade();
    expect(MediaClusterServiceV2.upgradeCluster).toHaveBeenCalledWith(clusterId);
  });

  it('Should go to success module of upgrade', function () {
    var upgradeDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'upgradeCluster').and.returnValue(upgradeDefered.promise);
    upgradeDefered.resolve();
    $rootScope.$apply();

    controller.upgrade();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('Should go to failure module of upgrade', function () {
    var upgradeDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'upgradeCluster').and.returnValue(upgradeDefered.promise);
    upgradeDefered.reject();
    $rootScope.$apply();

    controller.upgrade();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
