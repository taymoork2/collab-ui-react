'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var httpMock, MediaClusterServiceV2, XhrNotificationService, FusionClusterService, controller, authInfo;
  authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($stateParams, $translate, _FusionClusterService_, _XhrNotificationService_, _MediaClusterServiceV2_, $httpBackend, $controller) {
    httpMock = $httpBackend;

    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    XhrNotificationService = _XhrNotificationService_;
    FusionClusterService = _FusionClusterService_;
    httpMock.when('GET', /^\w+.*/).respond({});

    controller = $controller('MediafusionClusterSettingsController', {
      $stateParams: $stateParams,
      httpMock: httpMock,
      $translate: $translate,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      FusionClusterService: FusionClusterService
    });

  }));

  afterEach(function () {
    httpMock.verifyNoOutstandingRequest();
    //httpMock.verifyNoOutstandingExpectation();

  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('it should call updateV2Cluster of MediaClusterServiceV2 ', function () {
    controller.selected = { label: 'DEV' };
    controller.displayName = 'displayName';
    controller.cluster = {
      releaseChannel: 'ALFHA',
      id: 'id',
      selected: 'selected'
    };
    spyOn(MediaClusterServiceV2, 'updateV2Cluster');
    controller.changeReleaseChanel();
    expect(MediaClusterServiceV2.updateV2Cluster).toHaveBeenCalled();

  });

  it('it should not call updateV2Cluster of MediaClusterServiceV2 ', function () {
    controller.selected = { label: 'DEV' };
    controller.displayName = 'displayName';
    controller.cluster = {
      releaseChannel: 'DEV',
      id: 'id',
      selected: 'selected'
    };
    spyOn(MediaClusterServiceV2, 'updateV2Cluster');
    controller.changeReleaseChanel();
    expect(MediaClusterServiceV2.updateV2Cluster).not.toHaveBeenCalled();

  });
});
