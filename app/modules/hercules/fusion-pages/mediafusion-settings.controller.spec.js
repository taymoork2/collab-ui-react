'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {

  beforeEach(angular.mock.module('core.config'));
  beforeEach(angular.mock.module('core.org'));
  beforeEach(angular.mock.module('Mediafusion'));

  var $httpBackend, MediaClusterServiceV2, FusionClusterService, controller, authInfo, $q, ResourceGroupService, $rootScope;
  authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function (_$rootScope_, $translate, _FusionClusterService_, _MediaClusterServiceV2_, _$httpBackend_, $controller, _$q_, _ResourceGroupService_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    FusionClusterService = _FusionClusterService_;
    ResourceGroupService = _ResourceGroupService_;
    $httpBackend.when('GET', 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/5632f806-ad09-4a26-a0c0-a49a13f38873?fields=@wide').respond({});

    spyOn(ResourceGroupService, 'getAllowedChannels').and.returnValue($q.when(['stable', 'beta', 'latest']));

    controller = $controller('MediafusionClusterSettingsController', {
      $stateParams: {
        id: '1234-5678-90'
      },
      $translate: $translate,
      MediaClusterServiceV2: MediaClusterServiceV2,
      FusionClusterService: FusionClusterService,
      ResourceGroupService: ResourceGroupService,
    });

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should call updateV2Cluster of MediaClusterServiceV2 ', function () {
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
    controller.changeReleaseChannel();
    expect(MediaClusterServiceV2.updateV2Cluster).toHaveBeenCalled();

  });

  it('should not call updateV2Cluster of MediaClusterServiceV2 ', function () {
    controller.selected = { label: 'Latest' };
    controller.displayName = 'displayName';
    controller.cluster = {
      releaseChannel: 'Latest',
      id: 'id',
      selected: 'selected'
    };
    spyOn(MediaClusterServiceV2, 'updateV2Cluster');
    controller.changeReleaseChannel();
    expect(MediaClusterServiceV2.updateV2Cluster).not.toHaveBeenCalled();

  });

  it('should populate the Release Channel options with values from ResourceGroupService, in a predictable order', function () {

    $rootScope.$apply();
    $httpBackend.flush();

    expect(controller.releaseChannelOptions.length).toBe(3);
    expect(controller.releaseChannelOptions[0].value).toBe('stable');
    expect(controller.releaseChannelOptions[1].value).toBe('beta');
    expect(controller.releaseChannelOptions[2].value).toBe('latest');

  });


});
