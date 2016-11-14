import bulkEnableVmModule from './index';
describe('Service: BulkEnableVmService', () => {
  beforeEach(function () {
      this.initModules(bulkEnableVmModule);
      this.injectDependencies(
        'HuronConfig',
        'Authinfo',
        'UserListService',
        'BulkEnableVmService',
        '$q',
        '$httpBackend',
      );

      spyOn(this.Authinfo, 'getOrgId').and.returnValue('78901');
  });

  it('can get SparkCallUserCount', function() {
    spyOn(this.UserListService, 'listUsers').and.returnValue(this.$q.when({
      data: {
          tototalResults: '20',
        }}));

    this.BulkEnableVmService.getSparkCallUserCountRetry().then((data: number) => {
      expect(data).toBe(20);
    });
  });

  it('can enableUserVm', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/common/customers/' + this.Authinfo.getOrgId() + '/users/12345')
      .respond(200, '');
    spyOn(this.BulkEnableVmService, 'enableUserVmRetry').and.callThrough();

    this.BulkEnableVmService.enableUserVmRetry('12345', {}).then((response) => {
        expect(response.status).toBe(200);
      },
      () => {
        fail('enableUserVm failed.');
      });
  } );

  it('enableUserVm fail without retry if response is not 429 or 503', function() {
    this.$httpBackend.expectPUT(this.HuronConfig.getCmiUrl() + '/common/customers/' + this.Authinfo.getOrgId() + '/users/12345')
      .respond(404, '');
    spyOn(this.BulkEnableVmService, 'enableUserVmRetry').and.callThrough();

    this.BulkEnableVmService.enableUserVmRetry('12345', {}).then(() => {
        fail('enableUserVm should fail without retry when receiving a non 429 or 503 response');
      },
      (error) => {
        expect(error.status).toBe(404);
        expect(this.BulkEnableVmService.enableUserVmRetry).toHaveBeenCalledTimes(1);
      });
  } );

  it('getUserServices should retry 3 times by default when 503 response is received', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/common/customers/' + this.Authinfo.getOrgId() + '/users/12345')
      .respond(503, '');
    spyOn(this.BulkEnableVmService, 'getUserServicesRetry').and.callThrough();

    this.BulkEnableVmService.getUserServicesRetry('12345').then(() => {
      fail('getUserServicesRetry should fail after retries');
    },
    error => {
      expect(error.status).toBe(503);
      expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(3);
    });
  });

  it('getUserSitetoSiteNumberRetry should retry specified times when 429 response is received', function() {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/12345')
      .respond(429, '');
    spyOn(this.BulkEnableVmService, 'getUserSitetoSiteNumberRetry').and.callThrough();

    this.BulkEnableVmService.getUserSitetoSiteNumberRetry('12345', 5).then(() => {
      fail('getUserSitetoSiteNumberRetry should fail after retries');
    },
    error => {
      expect(error.status).toBe(429);
      expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(5);
    });
  });

});
