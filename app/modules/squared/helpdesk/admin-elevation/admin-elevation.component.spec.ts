import adminElevation from './index';

describe('Component: adminElevation', () => {

  beforeEach(function () {
    this.initModules(adminElevation);

    this.injectDependencies(
      '$componentController',
      '$log',
      'AdminElevationService',
      'MetricsService',
      '$state',
      'UrlConfig',
      '$q');
  });

  describe('unhappy cases', () => {

    beforeEach(function () {
      spyOn(this.$state, 'go');
      spyOn(this.MetricsService, 'trackDiagnosticMetric');
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

    it('signature not validated', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      spyOn(this.AdminElevationService, 'validateSignature').and.returnValue(this.$q.reject('not a valid signature'));
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('INVALID_SIGNATURE');
      expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'validateSignature', status: 'failed', error: 'not a valid signature' });

    });

    it('it detects if elevation rejection request fails', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      spyOn(this.AdminElevationService, 'validateSignature').and.returnValue(this.$q.resolve());
      spyOn(this.AdminElevationService, 'invalidateSignature').and.returnValue(this.$q.reject('problems with the reject request'));
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.rejectElevation();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('ERROR');
      expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'rejectElevation', status: 'failed', error: 'problems with the reject request' });

    });

    it('detects if elevation grant request fails', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      spyOn(this.AdminElevationService, 'validateSignature').and.returnValue(this.$q.resolve());
      spyOn(this.AdminElevationService, 'elevateToAdmin').and.returnValue(this.$q.reject('problems with the elevation request'));
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.grantElevation();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('ERROR'); // should it ?
      expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'grantElevation', status: 'failed', error: 'problems with the elevation request' });
    });

  });

  describe('happy cases', () => {

    beforeEach(function () {
      spyOn(this.$state, 'go');
      spyOn(this.MetricsService, 'trackDiagnosticMetric');
      spyOn(this.AdminElevationService, 'validateSignature').and.returnValue(this.$q.resolve({
        helpDeskOperatorName: 'helpDeskOperatorName',
        orgName: 'orgName',
      }));
      this.controller = this.$componentController('helpdeskAdminElevation', {
        $log: this.$log,
        AdminElevationService: this.AdminElevationService,
        $state: this.$state,
      }, {});
    });

    it('checks for valid signature if not missing request params', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.AdminElevationService.validateSignature).toHaveBeenCalled();
      expect(this.controller.state).toEqual('VALID_SIGNATURE');
      //expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'validateSignature', status: 'success' });
    });

    it('will go to rejected state if elevation rejected', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      spyOn(this.AdminElevationService, 'invalidateSignature').and.returnValue(this.$q.resolve());
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.rejectElevation();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('REJECTED');
      expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'rejectElevation', status: 'success' });

    });

    it('will go to granted state if grant given', function() {
      setDummyOrgCustomerAndUserData(this.controller);
      spyOn(this.AdminElevationService, 'elevateToAdmin').and.returnValue(this.$q.resolve());
      this.controller.$onInit();
      this.$scope.$apply();
      this.controller.grantElevation();
      this.$scope.$apply();
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.controller.state).toEqual('ELEVATION_DONE');
      expect(this.controller.MetricsService.trackDiagnosticMetric).toHaveBeenCalledWith( 'atlas_helpdesk_admin_elevation', { type: 'grantElevation', status: 'success' });
    });
  });

  function setDummyOrgCustomerAndUserData(ctrl) {
    ctrl.orgId = 'org';
    ctrl.signature = 'signature';
    ctrl.customerUserId = 'customer';
    ctrl.userId = 'user';
    ctrl.timestamp = 'time';
  }

});
