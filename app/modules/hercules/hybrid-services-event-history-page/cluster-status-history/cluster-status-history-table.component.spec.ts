import moduleName from './index';

describe('HybridServicesClusterStatusHistoryTableCtrl', () => {

  let $componentController, $scope, $q, HybridServicesEventHistoryService;

  const timestamp = '2019-something-something';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  afterEach(cleanup);
  beforeEach(initSpies);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _HybridServicesEventHistoryService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesEventHistoryService = _HybridServicesEventHistoryService_;
  }

  function cleanup() {
    $componentController = $q = $scope = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesEventHistoryService, 'getAllEvents').and.returnValue($q.resolve({
      items: [{
        some: 'thing',
      }],
      earliestTimestampSearched: timestamp,
    }));
  }

  function initController(callback: Function) {
    const controller = $componentController('hybridServicesClusterStatusHistoryTable', {}, {
      earliestTimestampSearchedUpdated: callback,
    });
    return controller;
  }

  it('should call the provided callback function when we get a time filter from HybridServicesEventHistoryService', () => {
    const callback = jasmine.createSpy('callback');
    const controller = initController(callback);
    controller.$onChanges({ timeFilter: {
      currentValue: 'last_week',
    }});
    $scope.$apply();
    expect(callback.calls.count()).toBe(1);
    expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({
      options: {
        earliestTimestampSearched: timestamp,
      },
    }));
  });

});
