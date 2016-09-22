'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {

  beforeEach(angular.mock.module('core.config'));
  beforeEach(angular.mock.module('core.org'));
  beforeEach(angular.mock.module('Mediafusion'));

  var httpMock, MediaClusterServiceV2, XhrNotificationService, FusionClusterService, controller, authInfo, $q, Config, Orgservice;
  authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($stateParams, $translate, _FusionClusterService_, _XhrNotificationService_, _MediaClusterServiceV2_, $httpBackend, $controller, _$q_, _Orgservice_, _Config_) {
    httpMock = $httpBackend;
    $q = _$q_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    XhrNotificationService = _XhrNotificationService_;
    FusionClusterService = _FusionClusterService_;
    Orgservice = _Orgservice_;
    Config = _Config_;
    httpMock.when('GET', /^\w+.*/).respond({});

    controller = $controller('MediafusionClusterSettingsController', {
      $stateParams: $stateParams,
      httpMock: httpMock,
      $translate: $translate,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      FusionClusterService: FusionClusterService,
      Orgservice: Orgservice,
      Config: Config
    });

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });

  }));

  afterEach(function () {
    httpMock.verifyNoOutstandingRequest();
    //httpMock.verifyNoOutstandingExpectation();

  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  describe('should call getOrg successfully', function () {
    it('should identify as a test org', function () {
      controller.getOrg();
      expect(controller.isTest).toBe(true);
    });
  });

  it('it should call updateV2Cluster of MediaClusterServiceV2 ', function () {
    controller.selected = {
      label: 'Beta',
      value: 'beta'
    };
    controller.displayName = 'Display Name';
    controller.cluster = {
      releaseChannel: 'latest',
      id: 'id',
      selected: 'selected'
    };
    spyOn(MediaClusterServiceV2, 'updateV2Cluster').and.returnValue($q.resolve(true));
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
