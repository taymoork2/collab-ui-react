import moduleName from './index';

describe('HybridMediaEmailNotificationCtrl', function () {

  let $componentController, controller, $scope, $q, ServiceDescriptorService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function cleanup() {
    $componentController = controller = $scope = $q = ServiceDescriptorService = undefined;
  }

  function initController(bindings = {}) {
    controller = $componentController('hybridMediaEmailNotification', { $scope: {} }, bindings);
    controller.$onInit();
  }

  it('should get cluster data from FMS when initializing', function () {
    const dummyEmailSubscribers = ['sample@cisco.com'];
    spyOn(ServiceDescriptorService, 'getEmailSubscribers').and.returnValue($q.resolve({ dummyEmailSubscribers }));
    initController();
    expect(controller.emailSubscribers).toBe([{ text: 'sample@cisco.com' }]);
  });

});
