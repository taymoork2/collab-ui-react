const loginDirectiveName = require('./index');

describe('Login directive', () => {

  let $compile, $q, $scope, $state, ApiCacheManagementService, Auth, Authinfo, HybridServicesExtrasService, USSService;

  beforeEach(angular.mock.module(loginDirectiveName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_$compile_, _$q_, _$rootScope_,  _$state_, _ApiCacheManagementService_, _Auth_, _Authinfo_, _HybridServicesExtrasService_, _USSService_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $q = _$q_;
    ApiCacheManagementService = _ApiCacheManagementService_;
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    HybridServicesExtrasService = _HybridServicesExtrasService_;
    USSService = _USSService_;
  }

  function initSpies() {
    spyOn(Auth, 'authorize').and.returnValue($q.resolve({}));
    spyOn(ApiCacheManagementService, 'invalidateHybridServicesCaches');
    spyOn(ApiCacheManagementService, 'warmUpAsynchronousCaches');
    spyOn(Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);
    spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
    spyOn(HybridServicesExtrasService, 'invalidateHybridUserCache');
    spyOn(USSService, 'invalidateHybridUserCache');
    spyOn($state, 'go').and.callFake(() => {
      return $q.resolve();
    });
  }

  afterEach(function () {
    $compile = $q = $scope = $state = ApiCacheManagementService = Auth = Authinfo = HybridServicesExtrasService = USSService = undefined;
  });

  function initDirective() {
    $compile(`<${loginDirectiveName} />`)($scope);
    $scope.$broadcast('ACCESS_TOKEN_RETRIEVED');
    $scope.$apply();
  }

  it('should not try to invalidate the hybrid services caches for normal admin users', () => {
    Authinfo.isCustomerLaunchedFromPartner.and.returnValue(false);
    initDirective();

    expect(ApiCacheManagementService.invalidateHybridServicesCaches).not.toHaveBeenCalled();
  });

  it('should not try to invalidate the hybrid services caches for read-only admins', () => {
    Authinfo.isReadOnlyAdmin.and.returnValue(true);
    initDirective();

    expect(ApiCacheManagementService.invalidateHybridServicesCaches).not.toHaveBeenCalled();
  });

  it('should try to invalidate the hybrid services caches for partners that have launched into customer orgs', () => {
    initDirective();

    expect(ApiCacheManagementService.invalidateHybridServicesCaches).toHaveBeenCalled();
  });

  it('should go to the overview page after a cache invalidation attempt, even if the API calls to FMS or USS fail', () => {
    ApiCacheManagementService.invalidateHybridServicesCaches.and.callThrough();
    HybridServicesExtrasService.invalidateHybridUserCache.and.returnValue($q.reject({}));
    initDirective();

    expect(HybridServicesExtrasService.invalidateHybridUserCache).toHaveBeenCalled();
    expect(USSService.invalidateHybridUserCache).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('overview', undefined);
  });

});
