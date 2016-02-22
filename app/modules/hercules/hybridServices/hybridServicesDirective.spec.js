'use strict';

describe('Directive Controller: HybridServicesCtrl', function () {
  beforeEach(module('Hercules'));

  var vm, $rootScope, $controller, $timeout, Authinfo, Config, USSService, ServiceDescriptor;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$timeout_, _Authinfo_, _Config_, _USSService_, _ServiceDescriptor_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    USSService = _USSService_;
    ServiceDescriptor = _ServiceDescriptor_;

    Authinfo = {
      getOrgId: sinon.stub().returns('dead-beef-123'),
      isEntitled: sinon.stub().returns(true),
      isFusion: sinon.stub().returns(true)
    };

    sinon.spy(ServiceDescriptor, 'services');
  }));

  it('should start with isEnabled as false', function () {
    vm = createControllerWithUser({});
    expect(vm.isEnabled).toBe(false);
  });

  it('should call ServiceDescriptor.services if user has a CaaS license', function () {
    vm = createControllerWithUser({
      licenseID: ['MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com']
    });
    expect(ServiceDescriptor.services.called).toBe(true);
  });

  it('should not call ServiceDescriptor.services if user does not have a CaaS license', function () {
    vm = createControllerWithUser({
      licenseID: ['WHATEVER']
    });
    expect(ServiceDescriptor.services.called).toBe(false);
  });

  function createControllerWithUser(user) {
    return $controller('HybridServicesCtrl', {
      $scope: $rootScope.$new(),
      Authinfo: Authinfo,
      Config: Config,
      USSService: USSService,
      ServiceDescriptor: ServiceDescriptor,
      $timeout: $timeout
    }, {
      user: user
    });
  }
});
