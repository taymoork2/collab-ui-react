import customerSupportTemplateModule from './customer-support-template-modal.component';

describe('Component: customer support template modal', () => {

  const featureIds = ['chat', 'callback', 'chatPlusCallback'];

  beforeEach(function () {
    this.initModules('Sunlight', customerSupportTemplateModule);
    this.injectDependencies(
      '$modal',
      '$scope',
      'Authinfo',
      '$state',
    );
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.$modal, 'open');
    spyOn(this.$state, 'go');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.Authinfo, 'isSquaredUC').and.returnValue(true);

    this.compileComponent('customer-support-template-modal', {
      dismiss: 'dismiss()',
    });
  });

  it('feature list to have care - chat, callback and chatPlusCallback', function () {
    expect(this.controller.features.length).toEqual(featureIds.length);
  });

  // Test each known featureId
  featureIds.forEach(function (code) {
    it('ok function call for ' + code + ' results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
      this.controller.ok(code);
      expect(this.$scope.dismiss).toHaveBeenCalledWith();
      expect(this.$state.go).toHaveBeenCalledWith('care.setupAssistant', {
        type: code,
      });
    });
  });

});
