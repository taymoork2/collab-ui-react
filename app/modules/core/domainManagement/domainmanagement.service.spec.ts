describe('DomainManagementService', () => {

  beforeEach(angular.mock.module('Core'));

  let $httpBackend, DomainManagementService:any, UrlConfig, Authinfo, XhrNotificationService, $rootScope;

  beforeEach(() => {
    angular.mock.module($provide => {
      Authinfo = {
        getOrgId: () => {
          return 'mockOrgId';
        }
      };

      XhrNotificationService = {
        getMessages: ar => {
          return ['formatted err msg: ' + ar[0]];
        }
      };

      $provide.value('Authinfo', Authinfo);
      $provide.value('XhrNotificationService', XhrNotificationService);
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

    let orgId = 'mockOrgId';
    let scomUrl = UrlConfig.getScomUrl() + '/' + orgId;

    $httpBackend
      .expectGET(scomUrl)
      .respond({
        id: "theid",
        meta: {created: "adfd"},
        displayName: "org",
        domains: [
          "claimed1.grodum.org",
          "claimed2.grodum.org"
        ],
        verifiedDomains: [
          "claimed1.grodum.org",
          "verified1.grodum.org",
          "verified2.grodum.org"
        ],
        pendingDomains: [
          "verified1.grodum.org",
          "claimed1.grodum.org",
          "pending1.grodum.org",
        ]
      });


    /* If we want to expand the test to test tokens:
     let getTokenUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

     $httpBackend
     .expectPOST(getTokenUrl)
     .respond({
     token: "mockedtokenmockedtokenmockedtokemockedtokenmockedtokenmockedtoke"
     });*/

    DomainManagementService.getVerifiedDomains().then(data=> {
      let expectedRes = [{
        text: 'claimed1.grodum.org',
        token: '',
        status: DomainManagementService.states.claimed
      }, {
        text: 'claimed2.grodum.org',
        token: '',
        status: DomainManagementService.states.claimed
      }, {
        text: 'verified1.grodum.org',
        token: '',
        status: DomainManagementService.states.verified
      }, {
        text: 'verified2.grodum.org',
        token: '',
        status: DomainManagementService.states.verified
      }, {
        text: 'pending1.grodum.org',
        token: 'mockedtokenmockedtokenmockedtokemockedtokenmockedtokenmockedtoke',
        status: DomainManagementService.states.pending
      }];

      expect(data.length).toBe(expectedRes.length);
      data.forEach((v:any, i)=> {
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

  it('add domain should invoke token api and put domain in list', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/GetToken/invoke';
    let domain = 'super.example.com';
    let token = 'mock-token';
    $httpBackend.expectPOST(url, data=> {
      return true;
    }).respond({token: token});

    DomainManagementService.addDomain(domain).then(res=> {
      let list = DomainManagementService.domainList;
      let addedDomain:any = _.find(list, {text: domain});
      expect(addedDomain).not.toBeNull();
      expect(addedDomain.status).toBe('pending');
      expect(addedDomain.token).toBe(token);

    }, err => {
      fail(err);
    });
    $httpBackend.flush();
  });

  it('verify domain should invoke verify api and update domain status in list', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Verify/invoke';
    let domain = 'super.example.com';
    let token = 'mock-token';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'pending', token: token});
    $httpBackend.expectPOST(url, (data:any)=> {
      data = JSON.parse(data);
      expect(data.domain).toBe(domain);
      expect(data.claimDomain).toBeDefined();
      expect(data.claimDomain).toBeFalsy();
      return true;
    }).respond({});

    DomainManagementService.verifyDomain(domain).then(res=> {
      let list = DomainManagementService.domainList;
      let addedDomain:any = _.find(list, {text: domain});
      expect(addedDomain).not.toBeNull();
      expect(addedDomain.status).toBe('verified');
    }, err => {
      fail(err);
    });
    $httpBackend.flush();
  });

  it('verify empty domain should immediately reject', ()=> {

    let domain = undefined;
    let token = 'mock-token';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'pending', token: token});

    DomainManagementService.verifyDomain(domain).then(res=> {
      fail();
    }, err => {
      expect(err).toBeUndefined();
    });
    $rootScope.$digest();
  });

  it('verify domain with failing verify should set error on reject', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Verify/invoke';
    let domain = 'super.example.com';
    let token = 'mock-token';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'pending', token: token});
    $httpBackend.expectPOST(url, (data:any)=> {
      data = JSON.parse(data);
      expect(data.domain).toBe(domain);
      expect(data.claimDomain).toBeDefined();
      expect(data.claimDomain).toBeFalsy();
      return true;
    }).respond(500, 'error-in-request', null, 'error');

    DomainManagementService.verifyDomain(domain).then(res=> {
      fail();
    }, err => {
      expect(err).toBeDefined();
    });
    $httpBackend.flush();
  });

  it('delete pending should invoke api with removePending flag', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';

    $httpBackend
      .expectPOST(url, (data:any)=> {
          data = JSON.parse(data);
          expect(data).not.toBeNull();
          expect(data.removePending).toBeDefined();
          expect(data.removePending).toBeTruthy();  //correct flag
          expect(data.domain).toBe(domain);

          return true;
        }
      ).respond({});

    //when('POST', url).respond({});
    let domain = 'super-domain.com';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'pending'});
    DomainManagementService.unverifyDomain(domain).then(res=> {
      expect(res).toBeUndefined();
    }, err=> {
      fail();
    });
    $httpBackend.flush();
    //$rootScope.$digest();

    //noinspection TypeScriptUnresolvedVariable
    expect(DomainManagementService._enforceUsersInVerifiedAndClaimedDomains).toBe(true); //It should not flip this when deleting a pending domain!
  });

  it('when delete empty domain, service should immediately reject', ()=> {
    let domain = false;
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: false, status: 'pending'});
    DomainManagementService.unverifyDomain(domain).then(res=> {
      fail();
    }, err=> {
      expect(err).toBeUndefined();
    });
    $rootScope.$digest();
    //$httpBackend.flush(); no need to flush
  });

  it('when delete pending and api fails error should be returned with a reject', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';

    $httpBackend
      .expectPOST(url, (data:any)=> {
          data = JSON.parse(data);
          expect(data).not.toBeNull();
          expect(data.removePending).toBeDefined();
          expect(data.removePending).toBeTruthy();  //correct flag
          expect(data.domain).toBe(domain);

          return true;
        }
      ).respond(500, 'error-in-request', null, 'error');

    //when('POST', url).respond({});
    let domain = 'super-domain.com';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'pending'});
    DomainManagementService.unverifyDomain(domain).then(res=> {
      fail();

    }, err=> {
      expect(err).toBeDefined();
    });
    $httpBackend.flush();

  });

  it('delete verified should invoke api with false removePending flag', ()=> {
      let url = UrlConfig.getDomainManagementUrl('mockOrgId') + 'actions/DomainVerification/Unverify/invoke';

    $httpBackend
      .expectPOST(url, (data:any)=> {
          data = JSON.parse(data);
          expect(data).not.toBeNull();
          expect(data.removePending).toBeDefined();
          expect(data.removePending).toBeFalsy();
          expect(data.domain).toBe(domain);

          return true;
        }
      ).respond({});

    //when('POST', url).respond({});
    let domain = 'super-domain.com';
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._domainList.push({text: domain, status: 'verified'});
    //noinspection TypeScriptUnresolvedVariable
    DomainManagementService._enforceUsersInVerifiedAndClaimedDomains = true;

    DomainManagementService.unverifyDomain(domain).then(res=> {
      expect(res).toBeUndefined();
    }, err=> {
      fail();
    });
    $httpBackend.flush();
    //$rootScope.$digest();

    expect(DomainManagementService.domainList.length).toBe(0);

    //noinspection TypeScriptUnresolvedVariable
    expect(DomainManagementService._enforceUsersInVerifiedAndClaimedDomains).toBe(false);
  });
});
