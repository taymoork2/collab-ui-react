namespace domainManagement {
  declare let punycode:any;

  describe('DomainManagementAddCtrl', () => {

    let Config, $q, $rootScope, DomainManagementAddCtrl, DomainManagementService;
    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Hercules'));
    beforeEach(inject((_$q_, _$rootScope_, $controller, $translate, _Config_, _DomainManagementService_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      DomainManagementService = _DomainManagementService_;
      DomainManagementAddCtrl = $controller('DomainManageAddCtrl', {
        $stateParams: {loggedOnUser: ''},
        $previousState: {go: sinon.stub()},
        DomainManagementService: DomainManagementService,
        $translate: $translate,
        LogMetricsService: {
          eventType: {domainManageAdd: 'add'},
          eventAction: {buttonClick: 'click'},
          logMetrics: sinon.stub()
        }
      });
    }));

    it('should have access to punycode.', ()=> {
      expect(punycode).not.toBeNull('punycode is undefined');
    });

    it('should encode IDN (top level and domain)', ()=> {
      let unEncoded = 'løv.no';
      let encoded = 'xn--lv-lka.no';
      DomainManagementAddCtrl.domain = unEncoded;
      expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
    });
    it('should encode IDN (top level and domain)', ()=> {
      let unEncoded = 'Домены.бел';//remark: with uppercase д
      let encoded = 'xn--d1acufc5f.xn--90ais';
      DomainManagementAddCtrl.domain = unEncoded;
      expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
    });

    it('should ignore UpperCase Domain names and treath them as valid', ()=> {
      let unEncoded = 'Test.com';
      let encoded = 'test.com';
      DomainManagementAddCtrl.domain = unEncoded;
      expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
      expect(DomainManagementAddCtrl.isValid).toBeTruthy();
      expect(DomainManagementAddCtrl.intDomain).not.toBeNull();
      expect(DomainManagementAddCtrl.intDomain.show).toBeFalsy('punycode should be qual to lowercase version of domain. e.g. no extra encoding');

    });

    it('should dissalow adding an existing domain', ()=> {
      let domain = 'alreadyadded.com';
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [{text: domain}];

      //type domain name.
      DomainManagementAddCtrl.domain = domain;
      expect(DomainManagementAddCtrl.isValid).toBeFalsy();
      expect(DomainManagementAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
    });

    it('should dissalow adding an existing IDN', ()=> {
      let domain = 'Домены.бел';
      let encoded = 'xn--d1acufc5f.xn--90ais';
      //noinspection TypeScriptUnresolvedVariable
      DomainManagementService._domainList = [{text: encoded}];
      DomainManagementAddCtrl.domain = domain;
      expect(DomainManagementAddCtrl.isValid).toBeFalsy();
      expect(DomainManagementAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
    });

    it('should add the given domain using addDomain on the service', ()=> {
      DomainManagementService.addDomain = sinon.stub().returns(
        $q.resolve());


      let unEncoded = 'test.com';
      //let encoded = 'test.com';
      DomainManagementAddCtrl.domain = unEncoded;
      DomainManagementAddCtrl.add();
      $rootScope.$digest();
      expect(DomainManagementService.addDomain.callCount).toBe(1);
    });

    it('should post metric for add domain', ()=> {
      DomainManagementService.addDomain = sinon.stub().returns(
        $q.resolve());


      let unEncoded = 'test.com';
      //let encoded = 'test.com';
      DomainManagementAddCtrl.domain = unEncoded;
      DomainManagementAddCtrl.add();
      $rootScope.$digest();
      expect(DomainManagementAddCtrl.LogMetricsService.logMetrics.callCount).toBe(1);
    });

    it('should set error if addDomain on the service fails', ()=> {
      DomainManagementService.addDomain = sinon.stub().returns(
        $q.reject('error-during-add'));


      let unEncoded = 'test.com';
      //let encoded = 'test.com';
      DomainManagementAddCtrl.domain = unEncoded;
      DomainManagementAddCtrl.add();
      $rootScope.$digest();
      expect(DomainManagementService.addDomain.callCount).toBe(1);
      expect(DomainManagementAddCtrl.error).toBe('error-during-add');
    });


  });
}
