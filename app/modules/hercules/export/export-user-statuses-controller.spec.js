'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('Hercules'));

  var vm, Authinfo, scope, $httpBackend, $q, $rootScope, UiStats, UserDetails, USSService2, ClusterService;

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getServices: function () {
          return [{
            ciName: 'squared-fusion-cal',
            displayName: 'myService'
          }];
        },
        getOrgId: sinon.stub().returns('5632-f806-org')
      };
      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function ($controller, _$rootScope_, _$httpBackend_, _$q_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', '/connectors/')
      .respond({});

    $rootScope = _$rootScope_;
    scope = $rootScope.$new();

    USSService2 = {
      getStatusesSummary: function () {
        return [{
          serviceId: 'squared-fusion-cal',
          total: 14,
          notActivated: 2,
          activated: 0,
          error: 12,
          deactivated: 0,
          notEntitled: 0
        }];
      },
      getStatuses: function () {
        return $q.when({
          userStatuses: [{
            userId: 'DEADBEEF',
            orgId: '0FF1CE',
            connectorId: 'c_cal@aaa',
            serviceId: 'squared-fusion-uc',
            entitled: false,
            state: 'notActivated'
          }]
        });
      }
    };
    sinon.spy(USSService2, 'getStatuses');

    ClusterService = {
      getConnector: function (id) {
        return $q.when({
          id: id,
          cluster_id: 'a5140c4a-9f6e-11e5-a58e-005056b12db1',
          display_name: 'Calendar Connector',
          host_name: 'deadbeef.rd.cisco.com',
          cluster_name: 'deadbeef.rd.cisco.com',
          connector_type: 'c_cal',
        });
      }
    };
    sinon.spy(ClusterService, 'getConnector');

    UiStats = {
      initStats: sinon.spy(),
      insertServiceInfo: function () {},
      noneSelected: sinon.spy(),
      updateProgress: function () {}
    };

    UserDetails = {
      getUsers: function (stateInfos, orgId, callback) {
        callback(stateInfos);
      },
      getCSVColumnHeaders: function () {
        return ['whatever', 'foo', 'bar'];
      }
    };
    sinon.spy(UserDetails, 'getUsers');

    vm = $controller('ExportUserStatusesController', {
      serviceId: 'squared-fusion-cal',
      Authinfo: Authinfo,
      UiStats: UiStats,
      USSService2: USSService2,
      UserDetails: UserDetails,
      ClusterService: ClusterService,
      $scope: scope
    });

    sinon.spy(vm, 'getUsersBatch');
  }));

  it('should have sane default on init', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    expect(vm.nothingToExport).toBe(true);
    expect(vm.exportingUserStatusReport).toBe(false);
    expect(vm.exportCanceled).toBe(false);
  });

  it('should cancel exporting when calling cancelExport()', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    vm.cancelExport();
    expect(vm.exportCanceled).toBe(true);
  });

  it('should call UiStats.noneSelected() when selectedStateChanged() is called', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    vm.selectedStateChanged();
    expect(UiStats.noneSelected.called).toBe(true);
  });

  describe('getUsersBatch', function () {
    it('should call UserDetails.getUsers', function () {
      vm.getUsersBatch([], 0);
      $rootScope.$apply();
      expect(UserDetails.getUsers.called).toBe(true);
    });

    it('should call itself when userStatuses.length is bigger than numberOfUsersPrCiRequest', function () {
      // default numberOfUsersPrCiRequest should be 25
      var minimumValidArray = _.range(40).map(function () {
        return {
          state: 'null',
          details: 'details'
        };
      });
      vm.getUsersBatch(minimumValidArray, 0);
      $rootScope.$apply();
      expect(vm.getUsersBatch.callCount).toEqual(2);
    });
  });

  describe('exportCSV', function () {
    it('should call UiStats.initStats', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(UiStats.initStats.called).toBe(true);
    });
    it('should have the default CSV "header"', function (done) {
      var excelSeperator = 'sep=,';
      var columnHeaders = UserDetails.getCSVColumnHeaders();
      vm.exportCSV()
        .then(function (response) {
          expect(response[0][0]).toBe(excelSeperator);
          expect(response[1]).toEqual(columnHeaders);
          done();
        });
      $rootScope.$apply();
    });
    it('should call USSService2.getStatuses', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(USSService2.getStatuses.called).toBe(true);
    });
    it('should not actually finish export when exportCanceled is true', function () {
      vm.exportCanceled = true;
      vm.exportCSV()
        .catch(function (err) {
          expect(err).toEqual('User Status Report download canceled');
        });
      $rootScope.$apply();
    });
    it('should call ClusterService.getConnector if there at least one connectorIds', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(ClusterService.getConnector.called).toBe(true);
    });
    it('should call vm.getUsersBatch', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(vm.getUsersBatch.called).toBe(true);
    });
  });
});
