'use strict';

describe('Directive Controller: HybridServicesCtrl', function () {
  beforeEach(module('Hercules'));

  var vm, $rootScope, $controller, $timeout, $q, Authinfo, Config, USSService, ServiceDescriptor;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$timeout_, _Authinfo_, _Config_, _USSService_, _ServiceDescriptor_, _$q_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    USSService = _USSService_;
    ServiceDescriptor = _ServiceDescriptor_;
    $q = _$q_;

    Authinfo = {
      getOrgId: sinon.stub().returns('dead-beef-123'),
      isEntitled: sinon.stub().returns(true),
      isFusion: sinon.stub().returns(true)
    };

    sinon.stub(ServiceDescriptor, 'services').returns({});
  }));

  it('should start with isEnabled as false', function () {
    vm = createController({});
    expect(vm.isEnabled).toBe(false);
  });

  it('should call ServiceDescriptor.services if the org has no license', function () {
    vm = createController({});
    $rootScope.$digest();
    expect(ServiceDescriptor.services.called).toBe(true);
  });

  it('should call ServiceDescriptor.services if the org has a license and the user too', function () {
    vm = createController({
      licenseID: ['MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com']
    }, $q.when([{
      licenses: ['MC']
    }]));
    $rootScope.$digest();
    expect(ServiceDescriptor.services.called).toBe(true);
  });

  it('should NOT call ServiceDescriptor.services if the org has a license and but NOT the user', function () {
    vm = createController({}, $q.when([{
      licenses: ['MC']
    }]));
    $rootScope.$digest();
    expect(ServiceDescriptor.services.called).toBe(false);
  });

  function createController(user, promise) {
    if (!promise) {
      promise = $q.reject();
    }
    var Orgservice = {
      whatever: 123,
      getLicensesUsage: function () {
        return promise;
      }
    };
    return $controller('HybridServicesCtrl', {
      $scope: $rootScope.$new(),
      $timeout: $timeout,
      Authinfo: Authinfo,
      Config: Config,
      USSService: USSService,
      ServiceDescriptor: ServiceDescriptor,
      Orgservice: Orgservice
    }, {
      user: user
    });
  }
});
