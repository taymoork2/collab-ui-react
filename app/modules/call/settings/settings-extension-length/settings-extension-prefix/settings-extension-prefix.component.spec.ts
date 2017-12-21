import extensionPrefixModule from './index';

describe('Component: extensionPrefix', () => {
  const PREFIX_INPUT = 'input#extensionPrefix';
  const INPUT_TEXT_CLASS = 'div.cs-input-group.cs-input-text';
  const ERROR = 'error';

  beforeEach(function() {
    this.initModules(extensionPrefixModule);
    this.injectDependencies(
      '$scope',
      'Authinfo',
      'CustomerConfigService',
      'ExtensionLengthService',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      '$httpBackend',
      '$q',
    );

    this.$scope.onChangeFn = jasmine.createSpy('close');
    this.$scope.onChangeFn = jasmine.createSpy('dismiss');

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    //this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);

    this.initComponent = () => {
      this.compileComponent('ucExtensionPrefixModal', {
        newExtensionLength: 'newExtensionLength',
        oldExtensionLength: 'oldExtensionLength',
        close: 'close()',
        dismiss: 'dismiss()',
      });
    };
  });

  describe('increase extension length from 3 to 7', () => {
    beforeEach(function() {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      this.$scope.oldExtensionLength = '3';
      this.$scope.newExtensionLength = '7';
      this.initComponent();
      this.$scope.$apply();
    });

    it('should have an input box', function() {
      expect(this.view).toContainElement(PREFIX_INPUT);
      expect(this.controller.prefixLength).toBe(4);  // newExt - oldExt
    });

    it('should display an error when less than 4 digits are entered', function() {
      this.view.find(PREFIX_INPUT).val('2').change().blur();
      expect(this.view.find(INPUT_TEXT_CLASS).first()).toHaveClass(ERROR);
    });

  });

  describe('customerConfig for Toggle ON', () => {
    beforeEach(function() {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      spyOn(this.CustomerConfigService, 'createCompanyLevelCustomerConfig');
    });

    it('should have called customerConfig and test resolve ExtensionLength', function() {
      spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({status: 200}));
      spyOn(this.ExtensionLengthService, 'saveExtensionLength').and.returnValue(this.$q.resolve());
      spyOn(this.Notification, 'success');
      this.initComponent();
      this.$scope.$apply();
      this.view.find('#extensionPrefix').val(1).change();
      this.view.find('button.btn.btn-primary').click();
      expect(this.CustomerConfigService.createCompanyLevelCustomerConfig).toHaveBeenCalledWith(undefined, undefined, 'US');
      expect(this.controller.countryCode).toBe('US');
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.controller.processing).toBe(false);
    });

    it('should use org countryCode if provided and test reject ExtensionLength', function() {
      spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({data: {countryCode: 'myCountry'}, status: 200}));
      spyOn(this.Notification, 'errorWithTrackingId');
      this.initComponent();
      this.$scope.$apply();
      this.view.find('#extensionPrefix').val(1).change();
      this.view.find('button.btn.btn-primary').click();
      spyOn(this.ExtensionLengthService, 'saveExtensionLength').and.returnValue(this.$q.reject());
      expect(this.CustomerConfigService.createCompanyLevelCustomerConfig).toHaveBeenCalledWith(undefined, undefined, 'myCountry');
      expect(this.controller.countryCode).toBe('myCountry');
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

});
