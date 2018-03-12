import ModuleName from './index';

describe('Component: hybridMediaReleaseChannel', function () {
  let $componentController, $q, $scope, controller, ResourceGroupService;

  afterEach(function () {
    $componentController = $q = $scope = controller = ResourceGroupService = undefined;
  });

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(ModuleName));

  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$q_, $rootScope, _ResourceGroupService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    ResourceGroupService = _ResourceGroupService_;
  }

  function initController() {
    controller = $componentController('hybridMediaReleaseChannel', { $scope: {} }, {});
    controller.$onInit();
  }

  it('should have the defaults', function () {
    spyOn(ResourceGroupService, 'getAllowedChannels').and.returnValue($q.resolve({}));
    initController();
    expect(controller.releaseChannelOptions.length).toBe(1);
    expect(controller.releaseChannelOptions[0].value).toBe('stable');
  });

});
