import testModule from './index';

describe('DomainManagementService', () => {

  beforeEach(angular.mock.module(testModule));

  let $httpBackend, DomainManagementService: any, UrlConfig, Authinfo, $rootScope;

  beforeEach(() => {
    angular.mock.module($provide => {
      Authinfo = {
        getOrgId: () => {
          return 'mockOrgId';
        },
        isCare: () => {
          return false;
        },
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(($injector, _DomainManagementService_, _UrlConfig_, _$rootScope_) => {
    UrlConfig = _UrlConfig_;
    DomainManagementService = _DomainManagementService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    $rootScope = _$rootScope_;
  }));

  afterEach(() => {
    setTimeout($httpBackend.verifyNoOutstandingExpectation, 0);
    setTimeout($httpBackend.verifyNoOutstandingRequest, 0);
  });

  it('should produce a list of domains with tokens for the pending.', done => {
    const orgId = 'mockOrgId';
    const scomUrl = UrlConfig.getScomUrl() + '/' + orgId;

    $httpBackend
      .expectGET(scomUrl)
      .respond({
        id: 'theid',
        meta: { created: 'adfd' },
        displayName: 'org',
        domains: [
          'claimed1.grodum.org',
          'claimed2.grodum.org',
        ],
        verifiedDomains: [
          'claimed1.grodum.org',
          'verified1.grodum.org',
          'verified2.grodum.org',
        ],
        pendingDomains: [
          'verified1.grodum.org',
          'claimed1.grodum.org',
          'pending1.grodum.org',
        ],
      });

    /* If we want to expand the test to test tokens:
     let getTokenUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

     $httpBackend
     .expectPOST(getTokenUrl)
     .respond({
     token: "mockedtokenmockedtokenmockedtokemockedtokenmockedtokenmockedtoke"
     });*/

    DomainManagementService.getVerifiedDomains().then(data => {
      const expectedRes = [{
        text: 'claimed1.grodum.org',
        token: '',
        status: DomainManagementService.states.claimed,
      }, {
        text: 'claimed2.grodum.org',
        token: '',
        status: DomainManagementService.states.claimed,
      }, {
        text: 'verified1.grodum.org',
        token: '',
        status: DomainManagementService.states.verified,
      }, {
        text: 'verified2.grodum.org',
        token: '',
        status: DomainManagementService.states.verified,
      }, {
        text: 'pending1.grodum.org',
        token: 'mockedtokenmockedtokenmockedtokemockedtokenmockedtokenmockedtoke',
        status: DomainManagementService.states.pending,
      }];

      expect(data.length).toBe(expectedRes.length);
      data.forEach((v: any, i) => {
        expect(v.text).toBe(expectedRes[i].text);
        expect(v.status).toBe(expectedRes[i].status);
        expect(v.token).toBeFalsy(); //not set yet
      });
      done();
    }, (err) => {
      expect(err).toBe(null);
    });

    $httpBackend.flush();
  });

  it('add domain should invoke token api and put domain in list', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/GetToken/invoke';
    const domain = 'super.example.com';
    const token = 'mock-token';
    $httpBackend.expectPOST(url, () => {
      return true;
    }).respond({ token: token });

    DomainManagementService.addDomain(domain).then(() => {
      const list = DomainManagementService.domainList;
      const addedDomain: any = _.find(list, { text: domain });
      expect(addedDomain).not.toBeNull();
      expect(addedDomain.status).toBe('pending');
      expect(addedDomain.token).toBe(token);

    }, err => {
      fail(err);
    });
    $httpBackend.flush();
  });

  it('verify domain should invoke verify api and update domain status in list', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Verify/invoke';
    const domain = 'super.example.com';
    const token = 'mock-token';

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'pending', token: token });
    $httpBackend.expectPOST(url, (data: any) => {
      data = JSON.parse(data);
      expect(data.domain).toBe(domain);
      expect(data.claimDomain).toBeDefined();
      expect(data.claimDomain).toBeFalsy();
      return true;
    }).respond({});

    DomainManagementService.verifyDomain(domain).then(() => {
      const list = DomainManagementService.domainList;
      const addedDomain: any = _.find(list, { text: domain });
      expect(addedDomain).not.toBeNull();
      expect(addedDomain.status).toBe('verified');
    }, err => {
      fail(err);
    });

    $httpBackend.flush();
  });

  it('verify empty domain should immediately reject', () => {

    const domain = undefined;
    const token = 'mock-token';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'pending', token: token });

    DomainManagementService.verifyDomain(domain).then(() => {
      fail();
    }, err => {
      expect(err).toBeUndefined();
    });
    $rootScope.$digest();
  });

  it('verify domain with failing verify should set error on reject', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Verify/invoke';
    const domain = 'super.example.com';
    const token = 'mock-token';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'pending', token: token });
    $httpBackend.expectPOST(url, (data: any) => {
      data = JSON.parse(data);
      expect(data.domain).toBe(domain);
      expect(data.claimDomain).toBeDefined();
      expect(data.claimDomain).toBeFalsy();
      return true;
    }).respond(500, 'error-in-request', null, 'error');

    DomainManagementService.verifyDomain(domain).then(() => {
      fail();
    }, err => {
      expect(err).toBeDefined();
    });
    $httpBackend.flush();
  });

  it('delete pending should invoke api with removePending flag', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';
    const domain = 'super-domain.com';

    $httpBackend
      .expectPOST(url, (data: any) => {
        data = JSON.parse(data);
        expect(data).not.toBeNull();
        expect(data.removePending).toBeDefined();
        expect(data.removePending).toBeTruthy();  //correct flag
        expect(data.domain).toBe(domain);

        return true;
      }).respond({});

    //when('POST', url).respond({});

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'pending' });
    DomainManagementService.unverifyDomain(domain).then(res => {
      expect(res).toBeUndefined();
    }, () => {
      fail();
    });

    $httpBackend.flush();
    //$rootScope.$digest();

    //noinspection TypeScriptUnresolvedVariable
    expect(DomainManagementService._enforceUsersInVerifiedAndClaimedDomains).toBe(true); //It should not flip this when deleting a pending domain!
  });

  it('when delete empty domain, service should immediately reject', () => {
    const domain = false;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: false, status: 'pending' });
    DomainManagementService.unverifyDomain(domain).then(() => {
      fail();
    }, err => {
      expect(err).toBeUndefined();
    });
    $rootScope.$digest();
    //$httpBackend.flush(); no need to flush
  });

  it('when delete pending and api fails error should be returned with a reject', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';
    const domain = 'super-domain.com';

    $httpBackend
      .expectPOST(url, (data: any) => {
        data = JSON.parse(data);
        expect(data).not.toBeNull();
        expect(data.removePending).toBeDefined();
        expect(data.removePending).toBeTruthy();  //correct flag
        expect(data.domain).toBe(domain);

        return true;
      }).respond(500, 'error-in-request', null, 'error');

    //when('POST', url).respond({});

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'pending' });
    DomainManagementService.unverifyDomain(domain).then(() => {
      fail();

    }, err => {
      expect(err).toBeDefined();
    });
    $httpBackend.flush();

  });

  it('delete verified should invoke api with false removePending flag', () => {
    const url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';
    const domain = 'super-domain.com';

    $httpBackend
      .expectPOST(url, (data: any) => {
        data = JSON.parse(data);
        expect(data).not.toBeNull();
        expect(data.removePending).toBeDefined();
        expect(data.removePending).toBeFalsy();
        expect(data.domain).toBe(domain);

        return true;
      }).respond({});

    //when('POST', url).respond({});

    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({ text: domain, status: 'verified' });
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

    DomainManagementService.unverifyDomain(domain).then(res => {
      expect(res).toBeUndefined();
    }, () => {
      fail();
    });
    $httpBackend.flush();
    //$rootScope.$digest();

    expect(DomainManagementService.domainList.length).toBe(0);

    //noinspection TypeScriptUnresolvedVariable
    expect(DomainManagementService._enforceUsersInVerifiedAndClaimedDomains).toBe(false);
  });
});

describe('Syncing verified domains with care', function () {

  beforeEach(angular.mock.module(testModule));

  let $httpBackend, DomainManagementService: any, Authinfo, scomUrl, sunlightConfigUrl;

  beforeEach(() => {
    angular.mock.module($provide => {
      Authinfo = {
        getOrgId: () => {
          return 'mockOrgId';
        },
        isCare: () => {
          return true;
        },
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(($injector, _DomainManagementService_, _UrlConfig_) => {
    DomainManagementService = _DomainManagementService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    scomUrl = _UrlConfig_.getScomUrl() + '/mockOrgId';
    sunlightConfigUrl = _UrlConfig_.getSunlightConfigServiceUrl() + '/organization/mockOrgId/chat';
  }));

  afterEach(() => {
    setTimeout($httpBackend.verifyNoOutstandingExpectation, 0);
    setTimeout($httpBackend.verifyNoOutstandingRequest, 0);
  });
  it('when the org has no verified domains', function () {
    $httpBackend.expectGET(scomUrl)
      .respond({ pendingDomains : ['pending1.grodum.org'] });

    $httpBackend
      .expectPUT(sunlightConfigUrl, (data: any) => {
        data = JSON.parse(data);
        expect(data).not.toBeNull();
        expect(data.allowedOrigins.length).toBe(1);
        expect(data.allowedOrigins[0]).toBe('.*');
        return true;
      }).respond({});

    DomainManagementService.syncDomainsWithCare();

    $httpBackend.flush();
  });
  it('when the org has verified domains', function () {
    const domain = 'verified1.grodum.org';

    $httpBackend.expectGET(scomUrl)
      .respond({ verifiedDomains : [domain] });

    $httpBackend
      .expectPUT(sunlightConfigUrl, (data: any) => {
        data = JSON.parse(data);
        expect(data).not.toBeNull();
        expect(data.allowedOrigins.length).toBe(1);
        expect(data.allowedOrigins[0]).toBe(domain);
        return true;
      }).respond({});

    DomainManagementService.syncDomainsWithCare();

    $httpBackend.flush();
  });
  it('when the domain management service call fails', function () {

    $httpBackend.expectGET(scomUrl).respond(400);

    DomainManagementService.syncDomainsWithCare();

    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
