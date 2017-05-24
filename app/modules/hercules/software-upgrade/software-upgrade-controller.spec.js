'use strict';

describe('Controller: SoftwareUpgradeController', function () {
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var $q, $scope, $controller, controller, modalInstance, cluster, HybridServicesExtrasService;
  beforeEach(inject(function (_$q_, _$controller_, $rootScope, _HybridServicesExtrasService_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    HybridServicesExtrasService = _HybridServicesExtrasService_;
    modalInstance = {
      close: function () {},
    };

    $scope.$apply();
  }));

  afterEach(function () {
    $scope.$destroy();
  });

  function initController() {
    cluster = {
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "CAL_TEST1",
      "releaseChannel": "DEV",
    };

    controller = $controller('SoftwareUpgradeController', {
      $modalInstance: modalInstance,
      servicesId: ['squared-fusion-cal'],
      connectorType: "c_cal",
      availableVersion: "1",
      cluster: cluster,
    });
    $scope.$apply();
  }

  it('should be defined', function () {
    spyOn(HybridServicesExtrasService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    expect(controller).toBeDefined();
  });

  it('should return the release notes text correctly when release notes is text only', function () {
    spyOn(HybridServicesExtrasService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    $scope.$apply();
    expect(HybridServicesExtrasService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotes).toBe('Example calendar connector release notes.');
  });

  it('should not set the release notes url when release notes is text only', function () {
    spyOn(HybridServicesExtrasService, 'getReleaseNotes').and.returnValue($q.resolve('Example calendar connector release notes.'));
    initController();

    $scope.$apply();
    expect(HybridServicesExtrasService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotesUrl).toBe('');
  });

  it('should set the release notes url when release notes is a url', function () {
    spyOn(HybridServicesExtrasService, 'getReleaseNotes').and.returnValue($q.resolve('http://example.com/release/notes/version/1'));
    initController();

    $scope.$apply();
    //updatedSpy.and.returnValue($q.resolve('http://example.com/release/notes/version/1'))
    expect(HybridServicesExtrasService.getReleaseNotes).toHaveBeenCalled();
    expect(controller.releaseNotesUrl).toBe('http://example.com/release/notes/version/1');
  });

});
