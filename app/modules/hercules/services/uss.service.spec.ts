import serviceModule from 'modules/hercules/services/uss.service';

describe('Service: USSService', function () {
  beforeEach(angular.mock.module(serviceModule));

  let $httpBackend, Authinfo, CsdmHubFactory, USSService, hubOn, $translate, HybridServicesI18NService;
  const rootPath = 'https://uss-intb.ciscospark.com/uss/api/v1/';
  const translations = {};

  beforeEach(angular.mock.module(function ($provide) {
    hubOn = jasmine.createSpy('hubOn');
    CsdmHubFactory = {
      create: jasmine.createSpy('create'),
    };
    CsdmHubFactory.create.and.returnValue({
      on: hubOn,
      onListener: jasmine.createSpy('onListener'),
    });
    $provide.value('CsdmHubFactory', CsdmHubFactory);
  }));

  beforeEach(inject(function (_$httpBackend_, _USSService_, _Authinfo_, _$translate_, _HybridServicesI18NService_) {
    Authinfo = _Authinfo_;
    Authinfo.getOrgId = jasmine.createSpy('getOrgId').and.returnValue('456');
    $translate = _$translate_;
    spyOn($translate, 'instant').and.callFake(function (key) {
      return translations[key] || key;
    });
    HybridServicesI18NService = _HybridServicesI18NService_;
    spyOn(HybridServicesI18NService, 'getLocalTimestamp');
    $httpBackend = _$httpBackend_;
    USSService = _USSService_;
  }));

  it('should fetch and return data from the correct backend', function () {
    $httpBackend
      .when('GET', `${rootPath}orgs/456/userStatuses?includeMessages=true&entitled=true&userId=123`)
      .respond({
        userStatuses: [{
          userId: '123',
          orgId: 'cisco',
          serviceId: 'squared-fusion-yolo',
          entitled: true,
          state: 'deactivated',
        }, {
          userId: '123',
          orgId: 'cisco',
          serviceId: 'squared-fusion-monaco',
          entitled: true,
          state: 'activated',
        }],
      });

    USSService.getStatusesForUser('123')
      .then(function (response) {
        expect(response.length).toBe(2);
        expect(response[0].serviceId).toBe('squared-fusion-yolo');
        expect(response[1].serviceId).toBe('squared-fusion-monaco');
      });

    $httpBackend.flush();
  });

  describe('getStatusesForUser', function () {
    it('should return statuses for a given user and correctly deal with messages', function () {
      translations['hercules.userStatusMessages.c_cal.error.title'] = 'Replaced error title';
      translations['hercules.userStatusMessages.c_cal.error.description'] = 'Replaced error description';
      $httpBackend
        .when('GET', `${rootPath}orgs/456/userStatuses?includeMessages=true&entitled=true&userId=123`)
        .respond({
          userStatuses: [{
            userId: '123',
            orgId: 'cisco',
            serviceId: 'squared-fusion-cal',
            entitled: true,
            state: 'error',
            messages: [
              {
                key: 'c_cal.warn',
                title: 'warn title',
                severity: 'warning',
                description: 'warn description',
              },
              {
                key: 'c_cal.error',
                severity: 'error',
                title: 'error title',
                description: 'error description',
                replacementValues: [
                  {
                    key: 'replace1',
                    value: 'value1',
                  },
                  {
                    key: 'replace2',
                    value: '2017-01-31T14:05:34.069Z',
                    type: 'timestamp',
                  },
                ],
              },
            ],
          }],
        });

      USSService.getStatusesForUser('123')
        .then(function (statuses) {
          expect(statuses.length).toBe(1);
          const status = statuses[0];
          expect(status.state).toBe('error');
          expect(status.serviceId).toBe('squared-fusion-cal');
          expect(status.messages.length).toBe(2);
          expect(status.messages[0].key).toBe('c_cal.error');
          expect(status.messages[0].title).toBe('Replaced error title');
          expect(status.messages[0].description).toBe('Replaced error description');
          expect(status.messages[1].key).toBe('c_cal.warn');
          expect(status.messages[1].title).toBe('warn title');
          expect(status.messages[1].description).toBe('warn description');
          expect(HybridServicesI18NService.getLocalTimestamp).toHaveBeenCalledWith('2017-01-31T14:05:34.069Z');
        });
      $httpBackend.flush();
    });

    it('should return error status if unable to fetch data from backend', function () {
      $httpBackend
        .when('GET', `${rootPath}orgs/456/userStatuses?includeMessages=true&entitled=true&userId=123`)
        .respond(500);

      USSService.getStatusesForUser('123')
        .then(fail)
        .catch(function (error) {
          expect(error.status).toBe(500);
        });
      $httpBackend.flush();
    });
  });

  describe('decorateWithStatus', function () {
    describe('when not entitled', function () {
      it('error state is not entitled', function () {
        const status = USSService.decorateWithStatus({
          entitled: false,
          state: 'error',
        });
        expect(status).toBe('not_entitled');
      });

      it('deactivated state is not entitled', function () {
        const status = USSService.decorateWithStatus({
          entitled: false,
          state: 'deactivated',
        });
        expect(status).toBe('not_entitled');
      });

      it('notActivated state is not entitled', function () {
        const status = USSService.decorateWithStatus({
          entitled: false,
          state: 'notActivated',
        });
        expect(status).toBe('not_entitled');
      });

      it('activated state is pending deactivation', function () {
        const status = USSService.decorateWithStatus({
          entitled: false,
          state: 'activated',
        });
        expect(status).toBe('not_entitled');
      });

      it('other state is unknown', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'other',
        });
        expect(status).toBe('unknown');
      });
    });

    describe('when entitled', function () {
      it('deactivated state is pending activation', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'deactivated',
        });
        expect(status).toBe('pending_activation');
      });

      it('notActivated state is pending activation', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'notActivated',
        });
        expect(status).toBe('pending_activation');
      });

      it('activated state is activated', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'activated',
        });
        expect(status).toBe('activated');
      });

      it('error state is error', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'error',
        });
        expect(status).toBe('error');
      });

      it('other state is unknown', function () {
        const status = USSService.decorateWithStatus({
          entitled: true,
          state: 'other',
        });
        expect(status).toBe('unknown');
      });
    });
  });

  describe('getOrg', function () {
    it('should work', function () {
      $httpBackend
        .when('GET', `${rootPath}orgs/456`)
        .respond({
          id: '456',
          sipDomain: '',
        });

      USSService.getOrg('456')
        .then(function (response) {
          expect(response.id).toEqual('456');
        });
      $httpBackend.flush();
    });
  });

  describe('updateOrg', function () {
    it('should work', function () {
      $httpBackend
        .when('PATCH', `${rootPath}orgs/456`, {
          id: '456',
          sipDomain: 'whatever',
        })
        .respond({
          id: '456',
          sipDomain: 'whatever',
        });

      USSService.updateOrg({
        id: '456',
        sipDomain: 'whatever',
      })
        .then(function (response) {
          expect(response.sipDomain).toEqual('whatever');
        });
      $httpBackend.flush();
    });
  });

  describe('getStatusesSummary', function () {
    it('should be empty by default', function () {
      const statuses = USSService.getStatusesSummary();
      expect(statuses).toEqual({});
    });

    // TODO: find how to check changes after polling
    // TODO: find how to check that the HTTP request trigerred will have ?entitled=true
  });

  describe('getStatuses', function () {
    it('should work', function () {
      $httpBackend
        .when('GET', `${rootPath}orgs/456/userStatuses?includeMessages=true&serviceId=squared-fusion-cal&limit=10000&entitled=true`)
        .respond({
          userStatuses: [{
            userId: '123',
            orgId: '456',
            serviceId: 'squared-fusion-cal',
            entitled: true,
            state: 'notActivated',
          }, {
            userId: 'ABC',
            orgId: '456',
            serviceId: 'squared-fusion-cal',
            entitled: true,
            state: 'error',
            connectorId: 'c_cal@0A5E3DE8',
            description: {
              key: 'c_cal.DiscoveryScoreException',
              defaultMessage: 'Failed to get score for the user:  MailServer Error:  User folder bind error',
            },
            clusterId: 'f61e9340-928e-11e5-9965-005056b12db1',
          }],
        });

      USSService.getAllStatuses('squared-fusion-cal')
        .then(function (userStatuses) {
          expect(userStatuses.length).toEqual(2);
        });
      $httpBackend.flush();
    });
  });

  describe('subscribeStatusesSummary', function () {
    it('should have some specific functions', function () {
      expect(hubOn).not.toHaveBeenCalled();
      USSService.subscribeStatusesSummary('blah', function () {});
      expect(hubOn).toHaveBeenCalled();
    });
  });

  describe('getStatusesForUserInOrg', function () {
    it('should return statuses for a given user in org', function () {
      $httpBackend
        .when('GET', `${rootPath}orgs/456/userStatuses?includeMessages=true&entitled=true&userId=123`)
        .respond({
          userStatuses: [{
            userId: '123',
            orgId: '456',
            serviceId: 'squared-fusion-cal',
            entitled: true,
            state: 'active',
          }],
        });

      USSService.getStatusesForUser('123', '456')
        .then(function (response) {
          expect(response.length).toBe(1);
        });
      $httpBackend.flush();
    });
  });

  describe('getUserProps', function () {
    it('should return props for a given user in org', function () {
      $httpBackend
        .when('GET', `${rootPath}orgs/456/userProps/123`)
        .respond({ userId: '123', resourceGroups: {} });

      USSService.getUserProps('123', '456')
        .then(function (response) {
          expect(response.userId).toBe('123');
        });
      $httpBackend.flush();
    });
  });
});
