import testModule from './index';

declare let punycode: any;

describe('DomainManagementAddCtrl', () => {

  let $q, $rootScope, DomainManagementAddCtrl, DomainManagementService;
  beforeEach(angular.mock.module(testModule));
  beforeEach(inject((_$q_, _$rootScope_, $controller, $translate, _DomainManagementService_) => {
    $q = _$q_;
    $rootScope = _$rootScope_;
    DomainManagementService = _DomainManagementService_;
    DomainManagementAddCtrl = $controller('DomainManageAddCtrl', {
      $stateParams: { loggedOnUser: '' },
      $previousState: { go: jasmine.createSpy('go') },
      DomainManagementService: DomainManagementService,
      $translate: $translate,
      LogMetricsService: {
        eventType: { domainManageAdd: 'add' },
        eventAction: { buttonClick: 'click' },
        logMetrics: jasmine.createSpy('logMetrics'),
      },
    });
  }));

  it('should have access to punycode.', () => {
    expect(punycode).not.toBeNull('punycode is undefined');
  });

  it('should encode IDN (top level and domain)', () => {
    const unEncoded = 'løv.no';
    const encoded = 'xn--lv-lka.no';
    DomainManagementAddCtrl.domain = unEncoded;
    expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
  });
  it('should encode IDN (top level and domain)', () => {
    const unEncoded = 'Домены.бел'; //remark: with uppercase д
    const encoded = 'xn--d1acufc5f.xn--90ais';
    DomainManagementAddCtrl.domain = unEncoded;
    expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
  });

  it('should ignore UpperCase Domain names and treath them as valid', () => {
    const unEncoded = 'Test.com';
    const encoded = 'test.com';
    DomainManagementAddCtrl.domain = unEncoded;
    expect(DomainManagementAddCtrl.encodedDomain).toBe(encoded);
    expect(DomainManagementAddCtrl.isValid).toBeTruthy();
    expect(DomainManagementAddCtrl.intDomain).not.toBeNull();
    expect(DomainManagementAddCtrl.intDomain.show).toBeFalsy('punycode should be qual to lowercase version of domain. e.g. no extra encoding');

  });

  it('should dissalow adding an existing domain', () => {
    const domain = 'alreadyadded.com';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{ text: domain }];

    //type domain name.
    DomainManagementAddCtrl.domain = domain;
    expect(DomainManagementAddCtrl.isValid).toBeFalsy();
    expect(DomainManagementAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
  });

  it('should dissalow adding an existing IDN', () => {
    const domain = 'Домены.бел';
    const encoded = 'xn--d1acufc5f.xn--90ais';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList = [{ text: encoded }];
    DomainManagementAddCtrl.domain = domain;
    expect(DomainManagementAddCtrl.isValid).toBeFalsy();
    expect(DomainManagementAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
  });

  it('should add the given domain using addDomain on the service', () => {
    DomainManagementService.addDomain = jasmine.createSpy('addDomain').and.returnValue(
      $q.resolve());

    const unEncoded = 'test.com';
    //let encoded = 'test.com';
    DomainManagementAddCtrl.domain = unEncoded;
    DomainManagementAddCtrl.add();
    $rootScope.$digest();
    expect(DomainManagementService.addDomain.calls.count()).toBe(1);
  });

  it('should post metric for add domain', () => {
    DomainManagementService.addDomain = jasmine.createSpy('addDomain').and.returnValue(
      $q.resolve());

    const unEncoded = 'test.com';
    //let encoded = 'test.com';
    DomainManagementAddCtrl.domain = unEncoded;
    DomainManagementAddCtrl.add();
    $rootScope.$digest();
    expect(DomainManagementAddCtrl.LogMetricsService.logMetrics.calls.count()).toBe(1);
  });

  it('should set error if addDomain on the service fails', () => {
    DomainManagementService.addDomain = jasmine.createSpy('addDomain').and.returnValue(
      $q.reject('error-during-add'));

    const unEncoded = 'test.com';
    //let encoded = 'test.com';
    DomainManagementAddCtrl.domain = unEncoded;
    DomainManagementAddCtrl.add();
    $rootScope.$digest();
    expect(DomainManagementService.addDomain.calls.count()).toBe(1);
    expect(DomainManagementAddCtrl.error).toBe('error-during-add');
  });

});
