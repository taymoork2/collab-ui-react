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

});

