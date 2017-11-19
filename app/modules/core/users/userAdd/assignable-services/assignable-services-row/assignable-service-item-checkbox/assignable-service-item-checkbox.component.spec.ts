import moduleName from './index';

describe('Component: assignableServiceItemCheckbox:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.fakeServiceItemId = 'fake-serviceItemId';
  });

  describe('primary behaviors (view):', () => {
    it('should render an input[cs-input][type="checkbox"]', function () {
      this.compileTemplate(`
        <assignable-service-item-checkbox
          service-item-id="fakeServiceItemId"
          l10n-label="foo">
        </assignable-service-item-checkbox>`);
      expect(this.view.find('input[cs-input][type="checkbox"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][id="fake_serviceItemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][name="fake_serviceItemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][cs-input-label="foo"]').length).toBe(1);
    });

    it('should transclude its contents', function () {
      this.compileTemplate(`
        <assignable-service-item-checkbox
          service-item-id="fakeServiceItemId"
          l10n-label="foo">
          <span>fake-contents</span>
        </assignable-service-item-checkbox>`);
      expect(this.view.find('.sub-content')).toContainText('fake-contents');
    });
  });
});
