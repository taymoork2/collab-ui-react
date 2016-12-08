'use strict';

describe('Controller: SoftwareUpgradeController', function () {
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var $q, $scope, $controller, controller, $translate, modalInstance, cluster, ClusterService, FusionClusterService, Notification;
  beforeEach(inject(function (_$q_, _$controller_, $rootScope, _$translate_, _Notification_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $translate = _$translate_;
    Notification = _Notification_;

    ClusterService = {
      upgradeSoftware: sinon.stub()
    };
    FusionClusterService = {
      getReleaseNotes: sinon.stub()
    };
    modalInstance = {
      close: sinon.stub()
    };

    spyOn($translate, 'instant');
    spyOn(ClusterService, 'upgradeSoftware').and.returnValue($q.resolve());
    spyOn(Notification, 'error');
    $scope.$apply();
  }));

  afterEach(function () {
    $scope.$destroy();
  });

  function initController() {
    cluster = {
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "CAL_TEST1",
      "releaseChannel": "DEV"
    };

    controller = $controller('SoftwareUpgradeController', {
      $translate: $translate,
      $modalInstance: modalInstance,
      servicesId: ['squared-fusion-cal'],
      connectorType: "c_cal",
      availableVersion: "1",
      cluster: cluster,
      ClusterService: ClusterService,
      FusionClusterService: FusionClusterService,
      Notification: Notification
    })
    ;
    $scope.$apply();
  }

  it('should be defined', function () {
    spyOn(FusionClusterService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    expect(controller).toBeDefined();
  });

  it('should return the release notes text correctly when release notes is text only', function () {
    spyOn(FusionClusterService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    $scope.$apply();
    expect(FusionClusterService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotes).toBe('Example calendar connector release notes.');
  });

  it('should not set the release notes url when release notes is text only', function () {
    spyOn(FusionClusterService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    $scope.$apply();
    expect(FusionClusterService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotesUrl).toBe('');
  });

  it('should set the release notes url when release notes is a url', function () {
    spyOn(FusionClusterService, 'getReleaseNotes').and.returnValue($q.resolve('http://example.com/release/notes/version/1'));
    initController();

    $scope.$apply();
    //updatedSpy.and.returnValue($q.resolve('http://example.com/release/notes/version/1'))
    expect(FusionClusterService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotesUrl).toBe('http://example.com/release/notes/version/1');
  });

});
