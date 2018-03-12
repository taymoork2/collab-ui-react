import moduleName from './index';

describe('HybridMediaEmailNotificationCtrl', function () {

  let $componentController, $scope, $q, ServiceDescriptorService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function cleanup() {
    $componentController = $scope = $q = ServiceDescriptorService = undefined;
  }

  function initSpies() {
    const dummyEmailSubscribers = ['sample@cisco.com'];
    spyOn(ServiceDescriptorService, 'getEmailSubscribers').and.returnValue($q.resolve({ dummyEmailSubscribers }));
  }

  function initController(bindings = {}) {
    const ctrl = $componentController('hybridMediaEmailNotification', { $scope: {} }, bindings);
    return ctrl;
  }

  it('should get cluster data from FMS when initializing', function () {
    const controller = initController();
    controller.$onInit();
    expect(controller.emailSubscribers).toBe([{ text: 'sample@cisco.com' }]);
  });

});
