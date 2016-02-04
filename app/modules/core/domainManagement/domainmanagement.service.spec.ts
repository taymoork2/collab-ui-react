///<reference path="../../../../typings/tsd-testing.d.ts"/>
describe('DomainManagementService', () => {

  beforeEach(angular.mock.module('Core'));

  let $httpBackend, DomainManagementService, Config, Authinfo, XhrNotificationService;

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

  beforeEach(inject(($injector, _DomainManagementService_, _Config_) => {
    Config = _Config_;
    DomainManagementService = _DomainManagementService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
  }));

  afterEach(() => {
    setTimeout($httpBackend.verifyNoOutstandingExpectation, 0);
    setTimeout($httpBackend.verifyNoOutstandingRequest, 0);
  });

  it('should produce a list of domains with tokens for the pending.', done => {

    let orgId = 'mockOrgId';
    let scomUrl = Config.getScomUrl() + '/' + orgId;

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
});
