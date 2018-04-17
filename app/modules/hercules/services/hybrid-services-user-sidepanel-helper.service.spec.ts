import hybridServiceUserSidepanelHelperServiceModuleName, { IEntitlementNameAndState, HybridServiceUserSidepanelHelperService } from './hybrid-services-user-sidepanel-helper.service';

describe('HybridServiceUserSidepanelHelperService', () => {

  let $httpBackend, HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService;

  const userId = 'sir-alex';
  const emailAddress = 'ferguson@example.org';
  const entitlements: IEntitlementNameAndState[] = [{
    entitlementName: 'squaredFusionUC',
    entitlementState: 'ACTIVE',
  }, {
    entitlementName: 'squaredFusionEC',
    entitlementState: 'ACTIVE',
  }];


  beforeEach(angular.mock.module(hybridServiceUserSidepanelHelperServiceModuleName));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _$q_, _HybridServiceUserSidepanelHelperService_) {
    $httpBackend = _$httpBackend_;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
  }

  describe('downstream service usage', () => {

    afterEach(() => {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call USSService.getStatusesForUser with the correct userId', () => {
      $httpBackend.expectGET(`https://uss-intb.ciscospark.com/uss/api/v1/orgs/null/userStatuses?includeMessages=true&entitled=true&userId=${userId}`).respond([]);
      HybridServiceUserSidepanelHelperService.getDataFromUSS(userId);
    });

    it('should call Userservice.updateUsers and USSService.refreshEntitlementsForUser with the correct userId', () => {
      $httpBackend.expectPATCH(`https://atlas-intb.ciscospark.com/admin/api/v1/organization/null/users`).respond([]);
      $httpBackend.expectPOST(`https://uss-intb.ciscospark.com/uss/api/v1/userStatuses/actions/refreshEntitlementsForUser/invoke?orgId=null&userId=${userId}`).respond([]);
      HybridServiceUserSidepanelHelperService.saveUserEntitlements(userId, emailAddress, entitlements);
    });

  });

  describe('refreshing user data', () => {

    let  $q, $scope, Userservice, USSService;

    beforeEach(inject(dependencies));

    function dependencies($rootScope, _$q_, _Userservice_, _USSService_) {
      $q = _$q_;
      $scope = $rootScope;
      Userservice = _Userservice_;
      USSService = _USSService_;
    }

    afterEach(function () {
      $q = $scope = Userservice = USSService = undefined;
    });

    it('should use the correct entitlement list when calling Userservice ', () => {
      spyOn(Userservice, 'updateUsers').and.returnValue($q.resolve({}));
      spyOn(USSService, 'refreshEntitlementsForUser');
      HybridServiceUserSidepanelHelperService.saveUserEntitlements(userId, emailAddress, entitlements);
      $scope.$apply();

      expect(Userservice.updateUsers).toHaveBeenCalledWith([{
        address: emailAddress,
      }], null, entitlements, 'updateEntitlement', null);
    });

  });

});
