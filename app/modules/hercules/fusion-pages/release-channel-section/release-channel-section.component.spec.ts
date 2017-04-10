describe('Component: releaseChannelSection', () => {
  let $componentController, $q, $log, $scope, controller, FusionClusterService, ResourceGroupService;
  let expresswayCluster, expresswayClusterInResourceGroup, mediaCluster, resourceGroup;

  afterEach(function () {
    $componentController = $q = $log = $scope = controller = FusionClusterService = ResourceGroupService = undefined;
    expresswayCluster = expresswayClusterInResourceGroup = mediaCluster = resourceGroup = undefined;
  });

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(loadFixtures);

  function dependencies (_$componentController_, _$q_, _$log_, $rootScope, _FusionClusterService_, _ResourceGroupService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $log = _$log_;
    $scope = $rootScope.$new();
    FusionClusterService = _FusionClusterService_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function initSpies() {
    spyOn($log, 'error');
    spyOn(FusionClusterService, 'getOrgSettings').and.returnValue($q.resolve({}));
    spyOn(FusionClusterService, 'setReleaseChannel').and.returnValue($q.resolve({}));
    spyOn(ResourceGroupService, 'getAllowedChannels').and.returnValue($q.resolve({}));
    spyOn(ResourceGroupService, 'setReleaseChannel').and.returnValue($q.resolve({}));
  }

  function loadFixtures() {
    expresswayCluster = getJSONFixture('hercules/release-channel-section/expressway-cluster.json');
    expresswayClusterInResourceGroup = getJSONFixture('hercules/release-channel-section/expressway-cluster-in-resource-group.json');
    mediaCluster = getJSONFixture('hercules/release-channel-section/media-cluster.json');
    resourceGroup = getJSONFixture('hercules/release-channel-section/resource-group.json');
  }

  function initController(bindings = {}) {
    controller = $componentController('releaseChannelSection', { $scope: {} }, bindings);
    // magic transform `bindings` to a `changes` object
    const changesObject = _.chain(bindings)
      .toPairs()
      .map(entry => {
        entry[1] = {
          currentValue: entry[1],
        };
        return entry;
      })
      .fromPairs()
      .value();
    controller.$onInit();
    controller.$onChanges(changesObject);
  }

  it('should log an error when used with the 2 attributes', () => {
    initController({
      cluster: {},
      resourceGroup: {},
    });
    expect($log.error).toHaveBeenCalled();
  });

  it('should have sane defaults', () => {
    initController();
    expect(controller.releaseChannelOptions.length).toBe(1);
    expect(controller.releaseChannelOptions[0].value).toBe('stable');
    expect(controller.showResetSection).toBe(false);
    expect(controller.data).toEqual({});
    expect(controller.type).toBe(undefined);
    expect(controller.defaultReleaseChannel).toBe(undefined);
  });

  it('should fetch the default release channel for Expressways on init', () => {
    FusionClusterService.getOrgSettings.and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'smthg' }));
    initController();
    $scope.$apply();
    expect(FusionClusterService.getOrgSettings).toHaveBeenCalled();
    expect(controller.defaultReleaseChannel).toBe('smthg');
  });

  it('should have the type `cluster` if the `cluster` attribute is used', () => {
    initController({ cluster: expresswayCluster });
    expect(controller.type).toBe('cluster');
    expect(controller.data).toEqual(expresswayCluster);
  });

  it('should have the type `resource-group` if the `resource-group` attribute is used', () => {
    initController({ resourceGroup: resourceGroup });
    expect(controller.type).toBe('resource-group');
    expect(controller.data).toEqual(resourceGroup);
  });

  it('should populate the release channel options only with those approved', () => {
    ResourceGroupService.getAllowedChannels.and.returnValue($q.resolve(['beta']));
    initController({ cluster: expresswayCluster });
    $scope.$apply();
    expect(controller.releaseChannelOptions.length).toBe(2);
    expect(controller.releaseChannelOptions[0].value).toBe('stable');
    expect(controller.releaseChannelOptions[1].value).toBe('beta');
  });

  it('should show the reset section if the cluster\'s release channel is no longer available to the org', () => {
    const data = _.assign({}, expresswayClusterInResourceGroup, { releaseChannel: 'latest' });
    initController({ cluster: data });
    $scope.$apply();
    expect(controller.showResetSection).toBe(true);
  });

  it('should show the reset section if the resource groups\'s release channel is no longer available to the org', () => {
    const data = _.assign({}, resourceGroup, { releaseChannel: 'latest' });
    initController({ resourceGroup: data });
    $scope.$apply();
    expect(controller.showResetSection).toBe(true);
  });

  it('should show the reset section if the cluster is not in a resource group and its release channel is not the default one', () => {
    FusionClusterService.getOrgSettings.and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'stable' })); // default
    const data = _.assign({}, mediaCluster, { releaseChannel: 'latest' });
    initController({ cluster: data });
    $scope.$apply();
    expect(controller.showResetSection).toBe(true);
  });
});
