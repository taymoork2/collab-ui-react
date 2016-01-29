///<reference path="../../../../../typings/tsd-testing.d.ts"/>
/*describe('DomainManagementService', function () {

  beforeEach(angular.mock.module('Core'));

  var $httpBackend, DomainManagementService, Config, Authinfo, XhrNotificationService;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return 'mockOrgId';
        }
      };

      XhrNotificationService = {getMessages: function (ar) {
        return ['formatted err msg: ' + ar[0] ];
      }};

      $provide.value('Authinfo', Authinfo);
      $provide.value('XhrNotificationService', XhrNotificationService);
    });
  });

  beforeEach(inject(function ($injector, _DomainManagementService_, _Config_) {
    Config = _Config_
    DomainManagementService = _DomainManagementService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  var $httpBackend, Orgservice, Auth, Authinfo, Config, Log;

  it('should fail to get an organization for a given orgId1', function () {

    let orgId = 'mockOrgId';
    let scomUrl = Config.getScomUrl() + '/' + orgId;
    let getTokenUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

    $httpBackend
      .expectGET(scomUrl)
      .respond({
        id: "theid",
        meta:{ created: "adfd"},
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
          "claimed2.grodum.org",
          "pending1.grodum.org",
          "pending2.grodum.org"
        ]
      });

    $httpBackend
      .when(
        'POST',
        getTokenUrl
      )
      .respond({
        token: "mockedtokenmockedtokenmockedtokemockedtokenmockedtokenmockedtoke"
      });

    let promise = DomainManagementService.getVerifiedDomains();

    $httpBackend.flush();

    var res;
    promise.then(r => {
      res = r;
    });

    let expectedRes = [{
      text: 'verified1.grodum.org',
      code: '',
      status: DomainManagementService.states.pending
    }]

  //  expect(res.length).toBe(expectedRes.length);
  //  expect(res[0].text).toBe(expectedRes[0].text);
 //   expect(res[0].status).toBe(expectedRes[0].status);
  });
});*/
