'use strict';

describe('Controller: OverviewCtrl', function () {

  // load the controller's module
  beforeEach(module('Core'));

  var controller, $scope, $q, $state, ReportsService, Orgservice, ServiceDescriptor, ServiceStatusDecriptor, Log, Config, $translate, CannedDataService, WebexReportService, WebExUtilsFact, Authinfo;

  describe('Wire up', function () {
    beforeEach(inject(defaultWireUpFunc));

    it('should define all cards', function () {
      expect(controller.userCard).toBeDefined();
      expect(controller.hybridCard).toBeDefined();
      expect(controller.cards).toBeDefined();

      var cardnames = _.map(controller.cards, function (card) {
        return card.name;
      });
      expect(_.contains(cardnames, 'overview.cards.message.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.meeting.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.roomSystem.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.call.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.undefined.title')).toBeFalsy();
    });
  });

  describe('Callcard with healthStatus Event', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update its status', function () {

      var callCard = _(controller.cards).filter(function (card) {
        return card.name == 'overview.cards.call.title';
      }).first();

      callCard.healthStatusUpdatedHandler({
        components: [{
          name: 'Mobile Clients',
          status: 'error'
        }]
      });

      //TODO this isn't giving the status as expected, its undefined.
      //expect(callCard.healthStatus).toEqual('error');
    });
  });

  describe('HybridCard with hybridStatusEvent', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services', function () {
      var hybridCard = controller.hybridCard;
      hybridCard.hybridStatusEventHandler([{
        name: 'fake.service'
      }]);

      expect(hybridCard.services).toBeDefined();
      expect(_.any(hybridCard.services, function (service) {
        return service.name == 'fake.service';
      })).toBeTruthy();
    });

    it('should set the serviceHealth on each service based on enabled and ack on each service', function () {
      var hybridCard = controller.hybridCard;

      hybridCard.hybridStatusEventHandler([{
        id: 'squared-fusion-mgmt'
      }, {
        id: 'squared-fusion-media'
      }, {
        id: 'fake.service.nostatus'
      }]);

      var serviceMap = {};
      serviceMap['c_mgmt'] = true;
      serviceMap['c_ucmc'] = true;
      serviceMap['c_cal'] = false;

      hybridCard.adminOrgServiceStatusEventHandler(serviceMap);
      expect(hybridCard.services).toBeDefined();

      var testService = function (name, expectedHealth) {
        var serviceInTest = _(hybridCard.services).filter(function (service) {
          return service.id == name;
        }).first();
        expect(serviceInTest).toBeDefined();
        expect(serviceInTest.healthStatus).toEqual(expectedHealth);
      };

      testService('squared-fusion-mgmt', 'success');
      testService('squared-fusion-media', 'warning');
      testService('fake.service.nostatus', 'warning');
      //testService('fake.service', 'warning');

    });
  });

  describe('HybridCard', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services from an hybridStatusEvent', function () {
      var hybridCard = controller.hybridCard;
      hybridCard.hybridStatusEventHandler([{
        id: 'fake.service',
        enabled: true,
        acknowledged: true
      }]);

      expect(hybridCard.services).toBeDefined();
      var fakeService = _(hybridCard.services).filter(function (service) {
        return service.id == 'fake.service';
      }).first();
      expect(fakeService).toBeDefined();
      expect(fakeService.healthStatus).toBeUndefined();
    });
  });

  function defaultWireUpFunc($rootScope, $controller, _$state_, _$stateParams_, _$q_, _Log_, _Config_, _$translate_, _CannedDataService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Log = _Log_;
    Config = _Config_;

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
      getOrg: function (orgEventHandler) {},
      getUnlicensedUsers: function (unlicencedUsersHandler) {},
      getHybridServiceAcknowledged: function () {
        var defer = $q.defer();
        defer.resolve({});
        return defer.promise;
      }
    };

    ReportsService = {
      getPartnerMetrics: function (backendCache) {
        return null;
      },
      getAllMetrics: function (backendCache) {
        return null;
      },
      getOverviewMetrics: function (backendCach) {},
      healthMonitor: function (eventHandler) {}
    };

    var Authinfo = {
      getConferenceServicesWithoutSiteUrl: function () {
        return [{
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
        }];
      },
      getOrgId: function () {
        return '1';
      },
      isPartner: function () {
        return false;
      },
      getLicenses: function () {
        return [{}];
      }
    };

    controller = $controller('OverviewCtrl', {
      $scope: $scope,
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
