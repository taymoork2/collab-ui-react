import routingPrefixLengthModalModule from './index';

describe('Component: extensionPrefix', () => {
  const PREFIX_INPUT = 'input#routingPrefix';
  const INPUT_TEXT_CLASS = 'div.cs-input-group.cs-input-text';
  const ERROR = 'error';

  beforeEach(function() {
    this.initModules(routingPrefixLengthModalModule);
    this.injectDependencies(
      '$scope',
      'FeatureToggleService',
      'CustomerConfigService',
      'Orgservice',
      '$q',
    );
    this.initComponent = () => {
      this.compileComponent('ucRoutingPrefixLengthModal', {
        newRoutingPrefixLength: 'newRoutingPrefixLength',
        oldRoutingPrefixLength: 'oldRoutingPrefixLength',
        close: 'close()',
        dismiss: 'dismiss()',
      });
    };
  });

  describe('increase extension length from 3 to 7', () => {
    beforeEach(function() {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      this.$scope.oldRoutingPrefixLength = '3';
      this.$scope.newRoutingPrefixLength = '7';
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
      spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ status: 200 }));
      this.initComponent();
      this.$scope.$apply();
    });

    it('should have called customerConfig', function() {
      this.view.find('#routingPrefix').val(1).change();
      this.view.find('button.btn.btn-primary').click();
      expect(this.CustomerConfigService.createCompanyLevelCustomerConfig).toHaveBeenCalled();
    });
  });

});
