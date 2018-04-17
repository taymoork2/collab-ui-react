import testModule from './index';

describe('Constructor of', () => {

  let $q, $rootScope, DomainManagementService;

  beforeEach(angular.mock.module(testModule));
  beforeEach(inject((_$q_, _$rootScope_, _DomainManagementService_) => {
    $q = _$q_;
    $rootScope = _$rootScope_;
    DomainManagementService = _DomainManagementService_;
  }));

  describe('DomainManagementCtrl', () => {
    let ctrl;
    beforeEach(inject(($controller) => {
      DomainManagementService.getVerifiedDomains = jasmine.createSpy('getVerifiedDomains').and.returnValue($q.resolve());
      ctrl = $controller('DomainManagementCtrl', {
        Authinfo: { getOrgId: jasmine.createSpy('getOrgId').and.returnValue('org-id') },
        CiService: {
          getUser: jasmine.createSpy('getUser').and.returnValue($q.resolve({ userName: 'logged-on-user' })),
        },
      });
    }));

    it('should create the ctrl and set loggedOnUser.email', () => {
      $rootScope.$digest();  //allow promises to be executed
      expect(ctrl.loggedOnUser.email).toBe('logged-on-user');
    });
  });

  describe('DomainManageInstructionsCtrl', () => {
    let ctrl;
    beforeEach(inject(($controller) => {
      ctrl = $controller('DomainManageInstructionsCtrl', {
        $stateParams: { domain: 'test.example.com', loggedOnUser: { email: jasmine.createSpy('email') } },
        $previousState: { go: jasmine.createSpy('go') },
      });
    }));

    it('should create the ctrl and set domain', () => {
      expect(ctrl.domain).toBe('test.example.com');
    });
  });

  describe('DomainManageClaimCtrl', () => {
    let ctrl;
    beforeEach(inject(($controller) => {
      ctrl = $controller('DomainManageClaimCtrl', {
        $state: { params: { domain: { text: 'test.example.com' }, loggedOnUser: { email: jasmine.createSpy('email') } } },
        $previousState: { go: jasmine.createSpy('go') },
      });
    }));

    it('should create the ctrl and set domainName', () => {
      expect(ctrl.domainName).toBe('test.example.com');
    });
  });
});
