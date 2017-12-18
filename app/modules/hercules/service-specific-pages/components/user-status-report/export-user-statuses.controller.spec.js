'use strict';

var moduleName = require('./index').default;

describe('ExportUserStatusesController', function () {
  beforeEach(angular.mock.module(moduleName));

  var vm, Authinfo, scope, $httpBackend, $q, $rootScope, UserDetails, USSService, HybridServicesClusterService, ExcelService, ResourceGroupService;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      Authinfo = {
        getServices: function () {
          return [{
            ciName: 'squared-fusion-cal',
            displayName: 'myService',
          }];
        },
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('5632-f806-org'),
      };
      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function ($controller, _$rootScope_, _$httpBackend_, _$q_, _UserDetails_, _ResourceGroupService_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    UserDetails = _UserDetails_;
    ResourceGroupService = _ResourceGroupService_;
    $httpBackend
      .when('GET', '/connectors/')
      .respond({});

    $rootScope = _$rootScope_;
    scope = $rootScope.$new();

    ExcelService = {
      createFile: jasmine.createSpy('createFile'),
      downloadFile: jasmine.createSpy('downloadFile'),
    };

    var userStatusSummary = [{
      serviceId: 'squared-fusion-cal',
      total: 14,
      notActivated: 2,
      activated: 0,
      error: 12,
      deactivated: 0,
      notEntitled: 0,
    }];

    USSService = {
      getAllStatuses: function () {
        return $q.resolve(
          _.range(51).map(function (item, i) {
            return {
              userId: 'DEADBEEF' + i,
              orgId: '0FF1CE',
              connectorId: 'c_cal@aaa',
              clusterId: 'a5140c4a-9f6e-11e5-a58e-005056b12db1',
              serviceId: 'squared-fusion-uc',
              entitled: true,
              state: 'notActivated',
            };
          })
        );
      },
    };
    spyOn(USSService, 'getAllStatuses').and.callThrough();

    HybridServicesClusterService = {
      getAll: function () {
        return $q.resolve([{
          id: 'a5140c4a-9f6e-11e5-a58e-005056b12db1',
          name: 'deadbeef.rd.cisco.com',
          connectors: [{
            id: 'c_cal@aaa',
            hostname: 'deadbeef.rd.cisco.com',
            connectorType: 'c_cal',
          }],
        }]);
      },
    };
    spyOn(HybridServicesClusterService, 'getAll').and.callThrough();

    UserDetails = {
      getUsers: function (stateInfos) {
        return $q.resolve(stateInfos);
      },
      getCSVColumnHeaders: function () {
        return ['whatever', 'foo', 'bar'];
      },
    };
    spyOn(UserDetails, 'getUsers').and.callThrough();

    ResourceGroupService = {
      getAll: function () {
        return $q.resolve([]);
      },
    };

    var $modalInstance = {
      close: jasmine.createSpy('close'),
    };

    vm = $controller('ExportUserStatusesController', {
      $scope: scope,
      $modalInstance: $modalInstance,
      servicesId: ['squared-fusion-cal'],
      userStatusSummary: userStatusSummary,
      Authinfo: Authinfo,
      USSService: USSService,
      UserDetails: UserDetails,
      ExcelService: ExcelService,
      HybridServicesClusterService: HybridServicesClusterService,
      ResourceGroupService: ResourceGroupService,
    });
    vm.statusTypes = [{
      stateType: 'notActivated',
      count: 51,
      selected: true,
    }];
  }));

  it('should have sane default on init', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    expect(vm.exportingUserStatusReport).toBe(false);
    expect(vm.progress.total).toBe(0);
    expect(vm.progress.current).toBe(0);
    expect(vm.progress.exportCanceled).toBe(false);
  });

  it('should cancel exporting when calling cancelExport()', function () {
    vm.selectedServiceId = 'squared-fusion-cal';
    vm.cancelExport();
    expect(vm.progress.exportCanceled).toBe(true);
  });

  describe('exportCSV', function () {
    it('should call USSService.getStatuses', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(USSService.getAllStatuses).toHaveBeenCalled();
    });
    it('should call HybridServicesClusterService.getAll if there at least one clusterId', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
    });
    it('should not call HybridServicesClusterService.getAll if there no clusterIds', function () {
      USSService.getAll = function () {
        return $q.resolve([{
          userId: 'DEADBEEF',
          orgId: '0FF1CE',
          serviceId: 'squared-fusion-uc',
          state: 'error',
        }]);
      };
      vm.exportCSV();
      $rootScope.$apply();
      expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
    });
    it('should call UserDetails.getUsers as much as it has to', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(UserDetails.getUsers.calls.count()).toBe(2);
    });
    it('should call ExcelService.createFile and ExcelService.downloadFile', function () {
      vm.exportCSV();
      $rootScope.$apply();
      expect(ExcelService.createFile).toHaveBeenCalled();
      expect(ExcelService.downloadFile).toHaveBeenCalled();
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
