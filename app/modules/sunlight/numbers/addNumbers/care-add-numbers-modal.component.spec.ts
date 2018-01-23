import careAddNumbersModalModule from './index';

describe('Component: care add numbers modal', () => {

  beforeEach(function () {
    this.initModules('Sunlight', careAddNumbersModalModule);
    this.injectDependencies(
      '$timeout',
      'Notification',
      'Authinfo',
      '$translate',
      'PhoneNumberService',
      'Orgservice',
      '$q',
      'HuronSettingsOptionsService',
      'HuronSettingsService',
      'ModalService',
      'PstnModel',
      'PstnWizardService',
      'PstnProvidersService',
    );
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('test-id');
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('test-org-name');
    spyOn(this.Authinfo, 'getCustomerAdminEmail').and.returnValue('test-org-name@domain.com');

    spyOn(this.PstnWizardService, 'init').and.returnValue(this.$q.resolve(true));
    spyOn(this.PstnProvidersService, 'getCarriers').and.returnValue(this.$q.resolve(true));
    spyOn(this.HuronSettingsOptionsService, 'getOptions').and.returnValue(this.$q.resolve(true));

    spyOn(this.PstnWizardService, 'finalizeImport').and.returnValue(this.$q.resolve(true));
    spyOn(this.HuronSettingsService, 'save').and.returnValue(this.$q.resolve(true));
    spyOn(this.Notification, 'success').and.returnValue(this.$q.resolve(true));

    this.compileComponent('care-add-numbers-modal', {
      dismiss: 'dismiss()',
    });
  });

  it('should set the customer details in PstnModel and initialize Pstn data', function () {
    this.$scope.$apply();
    expect(this.PstnModel.getCustomerId()).toBe('test-id');
    expect(this.PstnModel.getCustomerName()).toBe('test-org-name');
    expect(this.PstnModel.getCustomerEmail()).toBe('test-org-name@domain.com');

    expect(this.PstnWizardService.init).toHaveBeenCalled();
    expect(this.PstnProvidersService.getCarriers).toHaveBeenCalled();
    expect(this.HuronSettingsOptionsService.getOptions).toHaveBeenCalled();
    expect(this.controller).toBeDefined();
  });

  it('should save HuronSettings when saveHuronSettings is called', function () {
    this.$scope.$apply();
    this.controller.saveHuronSettings();
    this.$scope.$apply();

    expect(this.PstnWizardService.finalizeImport).toHaveBeenCalled();
    expect(this.HuronSettingsService.save).toHaveBeenCalled();
    expect(this.Notification.success).toHaveBeenCalled();
  });

});
