import ModuleName from './index';

describe('Component: addResourceSection', function () {
  let $componentController, $q, $scope, controller, AddResourceSectionService;

  afterEach(function () {
    $componentController = $q = $scope = controller = AddResourceSectionService  = undefined;

  });

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module(ModuleName));

  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$q_, $rootScope, _AddResourceSectionService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    AddResourceSectionService = _AddResourceSectionService_;
  }
  function initController() {
    controller = $componentController('addResourceSection', { $scope: {} }, {});
    controller.$onInit();
  }

  it('should set the init Values Correctly', function () {
    const onlineNodeList = [
      'sampleNode1',
      'sampleNode2',
    ];
    const offlineNodeList = [
      'sampleNode3',
    ];
    spyOn(AddResourceSectionService, 'onlineNodes').and.returnValue(onlineNodeList);
    spyOn(AddResourceSectionService, 'offlineNodes').and.returnValue(offlineNodeList);
    spyOn(AddResourceSectionService, 'updateClusterLists').and.returnValue($q.resolve({}));
    initController();

    expect(controller.onlineNodeList.length).toBe(2);
    expect(controller.offlineNodeList.length).toBe(1);
    expect(AddResourceSectionService.updateClusterLists).toHaveBeenCalled();
    expect(AddResourceSectionService.onlineNodes).toHaveBeenCalled();
  });

  it('should Check if entered Node is online', function () {
    const onlineNodeList = [
      'sampleNode1',
      'sampleNode2',
    ];
    spyOn(AddResourceSectionService, 'onlineNodes').and.returnValue(onlineNodeList);

    initController();
    controller.hostName = 'sampleNode1';
    controller.validateHostName();
    expect(controller.onlinenode).toBeTruthy();

  });

  it('should Check if entered Node is offline', function () {
    const offlineNodeList = [
      'sampleNode3',
    ];
    spyOn(AddResourceSectionService, 'offlineNodes').and.returnValue(offlineNodeList);

    initController();
    controller.hostName = 'sampleNode3';
    controller.validateHostName();
    expect(controller.offlinenode).toBeTruthy();
  });

  it('sshould be **true** if FQDN is not per standards', function () {
    const fqdn1 = 'foo.bar.abc.com';
    const fqdn2 = 'foo.bar.com';
    initController();
    expect(controller.validateNode(fqdn1)).toBeTruthy();
    expect(controller.validateNode(fqdn2)).toBeTruthy();
  });

  it('should be **true** if IP is not per standardss', function () {
    const ip = '10.196.23.32';
    initController();
    expect(controller.validateNode(ip)).toBeTruthy();

  });

  it('should be **false** if FQDN is not per standards', function () {
    const fqdn1 = 'foo.bar..abc.com';
    const fqdn2 = 'foo.ba-.r.com';
    initController();
    expect(controller.validateNode(fqdn1)).toBeFalsy();
    expect(controller.validateNode(fqdn2)).toBeFalsy();

  });

  it('should be **false** if IP is not per standards', function () {
    const ip = '10.196.23.32.43';
    initController();
    expect(controller.validateNode(ip)).toBeFalsy();

  });

});
