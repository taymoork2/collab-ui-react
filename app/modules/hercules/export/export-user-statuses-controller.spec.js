'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('Hercules'));

  var vm, Authinfo, scope, $httpBackend, $q, $rootScope, UserDetails, USSService2, ClusterService, ExcelService;

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

  beforeEach(inject(function ($controller, _$rootScope_, _$httpBackend_, _$q_, _UserDetails_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    UserDetails = _UserDetails_;
    $httpBackend
      .when('GET', '/connectors/')
      .respond({});

    $rootScope = _$rootScope_;
    scope = $rootScope.$new();

    ExcelService = {
      createFile: sinon.stub(),
      downloadFile: sinon.stub()
    };

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
          // 51 to be over numberOfUsersPrCiRequest (which should be 50)
          userStatuses: _.range(51).map(function (item, i) {
            return {
              userId: 'DEADBEEF' + i,
              orgId: '0FF1CE',
              connectorId: 'c_cal@aaa',
              serviceId: 'squared-fusion-uc',
              entitled: true,
              state: 'notActivated'
            };
          }),
          paging: {
            pages: 1
          }
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
      $scope: scope,
      serviceId: 'squared-fusion-cal',
      Authinfo: Authinfo,
      USSService2: USSService2,
      UserDetails: UserDetails,
      ExcelService: ExcelService,
      ClusterService: ClusterService
    });
  }));

  it('should have sane default on init', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    expect(vm.exportingUserStatusReport).toBe(false);
    expect(vm.exportCanceled).toBe(false);
    expect(vm.result).toEqual([]);
  });

  it('should cancel exporting when calling cancelExport()', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    vm.cancelExport();
    expect(vm.exportCanceled).toBe(true);
  });

  describe('exportCSV', function () {
    it('should call USSService2.getStatuses', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(USSService2.getStatuses.called).toBe(true);
    });
    it('should call ClusterService.getConnector if there at least one connectorId', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(ClusterService.getConnector.called).toBe(true);
    });
    it('should call UserDetails.getUsers as much as it has to', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(UserDetails.getUsers.callCount).toBe(2);
    });
    it('should call ExcelService.createFile and ExcelService.downloadFile', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(ExcelService.createFile.called).toBe(true);
      expect(ExcelService.downloadFile.called).toBe(true);
    });
    it('should populate vm.result', function () {
      vm.exportCSV();
      $rootScope.$apply();
      // 51 statuses
      expect(vm.result.length).toBe(51);
    });
    it('should not actually finish export when exportCanceled is true', function () {
      vm.exportCanceled = true;
      vm.exportCSV()
        .catch(function (err) {
          expect(err).toEqual('User Status Report download canceled');
        });
      $rootScope.$apply();
    });
    it('should call set exportingUserStatusReport to false when finished', function () {
      vm.exportCSV();
      expect(vm.exportingUserStatusReport).toBe(true);
      $rootScope.$apply();
      expect(vm.exportingUserStatusReport).toBe(false);
    });
  });
});
