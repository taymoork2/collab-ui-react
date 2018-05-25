import adminElevation from './index';

describe('Component: adminElevation', () => {

  beforeEach(function () {
    this.initModules(adminElevation);

    this.injectDependencies(
      '$componentController',
      '$log',
      'AdminElevationService',
      '$state',
      'UrlConfig',
      '$q');
  });

  describe('at startup', () => {

    beforeEach(function () {
      spyOn(this.$state, 'go');
      this.controller = this.$componentController('helpdeskAdminElevation', {
        $log: this.$log,
        AdminElevationService: this.AdminElevationService,
        $state: this.$state,
      }, {});
    });

    it('goes to state 404 if missing request params', function() {
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith('404');
    });

    it('checks for valid signature if not missing request params', function() {
      this.controller.orgId = 'org';
      this.controller.signature = 'signature';
      this.controller.customerUserId = 'customer';
      this.controller.userId = 'user';
      this.controller.timestamp = 'time';
      spyOn(this.AdminElevationService, 'validateSignature').and.returnValue(this.$q.resolve({
        helpDeskOperatorName: 'helpDeskOperatorName',
        orgName: 'orgName',
      }));
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.AdminElevationService.validateSignature).toHaveBeenCalled();
      expect(this.controller.state).toEqual('VALID_SIGNATURE');
    });

    it('will go to rejected state if elevation rejected', function() {
      this.controller.orgId = 'org';
      this.controller.signature = 'signature';
      this.controller.customerUserId = 'customer';
      this.controller.userId = 'user';
      this.controller.timestamp = 'time';
      spyOn(this.AdminElevationService, 'invalidateSignature').and.returnValue(this.$q.resolve());
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.rejectElevation();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('REJECTED');
    });

    it('will go to granted state if grant given', function() {
      this.controller.orgId = 'org';
      this.controller.signature = 'signature';
      this.controller.customerUserId = 'customer';
      this.controller.userId = 'user';
      this.controller.timestamp = 'time';
      spyOn(this.AdminElevationService, 'invalidateSignature').and.returnValue(this.$q.resolve());
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.grantElevation();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('ELEVATION_DONE');
    });
  });
});
