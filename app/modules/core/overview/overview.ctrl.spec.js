'use strict';

describe('Controller: OverviewCtrl', function () {

  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var controller, $rootScope, $scope, $q, $state, ReportsService, Orgservice, ServiceDescriptor, ServiceStatusDecriptor, Log, Config, $translate, Authinfo, FeatureToggleService;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var services = getJSONFixture('squared/json/services.json');

  describe('Wire up', function () {
    beforeEach(inject(defaultWireUpFunc));

    it('should define all cards', function () {
      expect(controller.cards).toBeDefined();

      var cardnames = _.map(controller.cards, function (card) {
        return card.name;
      });
      expect(_.contains(cardnames, 'overview.cards.message.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.meeting.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.roomSystem.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.call.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.hybrid.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.users.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.undefined.title')).toBeFalsy();
    });
  });

  describe('Callcard with healthStatus Event', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update its status', function () {

      var callCard = getCard('overview.cards.call.title');

      callCard.healthStatusUpdatedHandler({
        components: [{
          name: 'Spark Call',
          status: 'error',
          id: 'gfg7cvjszyw0'
        }]
      });

      expect(callCard.healthStatus).toEqual('danger');
    });
  });

  describe('HybridCard with hybridStatusEvent', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services', function () {

      var hybridCard = getCard('overview.cards.hybrid.title');

      hybridCard.hybridStatusEventHandler('', [{
        name: 'fake.service',
        id: 'squared-fusion-cal',
        enabled: true
      }]);

      expect(hybridCard.services).toBeDefined();
      expect(_.any(hybridCard.services, function (service) {
        return service.name == 'fake.service';
      })).toBeTruthy();
    });

    var testService = function (hybridCard, id, expectedHealth) {
      var serviceInTest = _(hybridCard.services).filter(function (service) {
        return service.id == id;
      }).first();
      expect(serviceInTest).toBeDefined();
      expect(serviceInTest.healthStatus).toEqual(expectedHealth);
    };

    it('with service calendar having error should report cal as danger', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-cal',
        status: 'error',
        name: 'fake.service.errorstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-cal', 'danger');
    });

    it('with uc warning and ec ok should report uc as warning', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'ok',
        name: 'fake.service.okstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'warn',
        name: 'fake.service.warnstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'warning');
    });

    it('with uc warning and ec error should report uc as danger', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'error',
        name: 'fake.service.errorstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'warn',
        name: 'fake.service.warnstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'danger');
    });

    it('with uc ok and ec ok should report uc as success', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'ok',
        name: 'fake.service.okstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'ok',
        name: 'fake.service.okec',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'success');
    });

    it('should set the serviceHealth on each service based on enabled and ack on each service', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');

      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-mgmt',
        status: 'ok',
        enabled: true
      }, {
        id: 'squared-fusion-uc',
        status: 'warn',
        enabled: true
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
        name: 'fake noe status'
      }]);

      expect(hybridCard.services).toBeDefined();

      testService(hybridCard, 'squared-fusion-mgmt', 'success');
      testService(hybridCard, 'squared-fusion-uc', 'warning');
      testService(hybridCard, 'squared-fusion-cal', 'warning');
      //testService('fake.service.errorstatus', 'danger');
      //testService('fake.service', 'warning');

    });
  });

  describe('HybridCard', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services from an hybridStatusEvent', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-cal',
        name: 'fake.service',
        enabled: true,
        acknowledged: true
          //status:'ok'  undefined status
      }]);

      expect(hybridCard.services).toBeDefined();
      var fakeService = _(hybridCard.services).filter(function (service) {
        return service.id == 'squared-fusion-cal';
      }).first();
      expect(fakeService).toBeDefined();
      expect(fakeService.healthStatus).toBeDefined();
      expect(fakeService.healthStatus).toEqual('warning'); //warn when undefined status
    });
  });

  describe('Cloud SIP URI Notification', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should set flags to prevent display of notification', function () {
      controller.isCloudSipUriSet = false;
      controller.setSipUriNotification();
      expect(controller.isCloudSipUriSet).toEqual(true);
    });

    it('should set flags to dismiss SIP URI Notification on DISMISS_SIP_NOTIFICATION event', function () {
      controller.isSipUriAcknowledged = false;
      $rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
      expect(controller.isSipUriAcknowledged).toEqual(true);
    });
  });

  describe('Cloud SIP URI Notification', function () {
    beforeEach(inject(defaultWireUpFunc));
    beforeEach(function () {
      Orgservice.getOrg = jasmine.createSpy().and.callFake(function (callback, oid, disableCache) {
        callback({
          orgSettings: {}
        }, 200);
      });
    });

    it('should set flags to display notification', function () {
      controller.isCloudSipUriSet = false;
      controller.setSipUriNotification();
      expect(controller.isCloudSipUriSet).toEqual(false);
    });
  });

  function getCard(filter) {
    return _(controller.cards).filter(function (card) {
      return card.name == filter;
    }).first();
  }

  function defaultWireUpFunc(_$rootScope_, $controller, _$state_, _$stateParams_, _$q_, _Log_, _Config_, _$translate_, _Orgservice_, _Authinfo_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Log = _Log_;
    Config = _Config_;
    Authinfo = _Authinfo_;

    ServiceDescriptor = {
      services: function (eventHandler) {}
    };

    ServiceStatusDecriptor = {
      servicesInOrgWithStatus: function () {
        var defer = $q.defer();
        defer.resolve(null);
        return defer.promise;
      }
    };
    Orgservice = {
      getAdminOrg: function (orgEventHandler) {},
      getUnlicensedUsers: function (unlicencedUsersHandler) {},
      getOrg: jasmine.createSpy().and.callFake(function (callback, status) {
        callback(orgServiceJSONFixture.getOrg, 200);
      }),
      getHybridServiceAcknowledged: function () {
        var defer = $q.defer();
        defer.resolve({});
        return defer.promise;
      }
    };

    ReportsService = {
      getOverviewMetrics: function (backendCach) {},
      healthMonitor: function (eventHandler) {}
    };

    spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
      license: {
        siteUrl: 'fakesite1'
      }
    }, {
      license: {
        siteUrl: 'fakesite2'
      }
    }, {
      license: {
        siteUrl: 'fakesite3'
      }
    }]);
    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(Authinfo, 'isPartner').and.returnValue(false);
    spyOn(Authinfo, 'getLicenses').and.returnValue([{}]);
    spyOn(Authinfo, 'hasAccount').and.returnValue(true);
    spyOn(Authinfo, 'getServices').and.returnValue(services);

    controller = $controller('OverviewCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      Log: Log,
      Authinfo: Authinfo,
      $translate: $translate,
      $state: $state,
      ReportsService: ReportsService,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor,
      ServiceStatusDecriptor: ServiceStatusDecriptor,
      Config: Config
    });
    $scope.$apply();
  }
});
