import moduleName from './index';

describe('Component: multiStepModal:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
  });

  describe('primary behaviors:', () => {
    it('should always render a dismiss button', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('button.close[aria-label="common.close"]')).toExist();
    });

    it('should always render a translated header element', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('.modal-header h3.modal-title[translate]')).toExist();

      this.compileTemplate('<multi-step-modal l10n-title="foo.bar"></multi-step-modal>');
      expect(this.view.find('.modal-header h3.modal-title[translate="foo.bar"]')).toExist();
    });

    it('should render button elements if a corresponding attribute is set', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('button.btn')).not.toExist();

      this.compileTemplate('<multi-step-modal cancel="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel')).toExist();

      this.compileTemplate('<multi-step-modal back="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.back')).toExist();

      this.compileTemplate('<multi-step-modal next="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.next')).toExist();

      this.compileTemplate('<multi-step-modal save="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.save')).toExist();

      this.compileTemplate('<multi-step-modal back="_.noop()" save="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn').length).toBe(2);
      expect(this.view.find('button.btn.back')).toExist();
      expect(this.view.find('button.btn.save')).toExist();

      this.compileTemplate('<multi-step-modal cancel="_.noop()" next="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn').length).toBe(2);
      expect(this.view.find('button.btn.cancel')).toExist();
      expect(this.view.find('button.btn.next')).toExist();
    });

    it('should not render button elements if a corresponding attribute is set but the "*-removed" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-removed="true"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel')).not.toExist();
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-removed="false"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel')).toExist();

      // same behavior applies if the bound property on the scope is truthy
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-removed="cancelRemoved"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel')).toExist();
      this.$scope.cancelRemoved = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel')).not.toExist();
      this.$scope.cancelRemoved = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel')).toExist();
    });

    it('should render disabled button elements if a corresponding attribute is set and the "*-disabled" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-disabled="true"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel[disabled]')).toExist();
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-disabled="false"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel[disabled]')).not.toExist();

      // same behavior applies if the bound property on the scope is truthy
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-disabled="cancelDisabled"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel[disabled]')).not.toExist();
      this.$scope.cancelDisabled = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel[disabled]')).toExist();
      this.$scope.cancelDisabled = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel[disabled]')).not.toExist();
    });

    it('should reflect a loading state if a forward-stepping button is set and the "*-loading" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal next="_.noop()" next-loading="true"></multi-step-modal>');
      expect(this.view.find('button.btn.next[loading] > .cs-loading')).toExist();
      this.compileTemplate('<multi-step-modal next="_.noop()" next-loading="false"></multi-step-modal>');
      expect(this.view.find('button.btn.next[loading] > .cs-loading')).not.toExist();

      // same behavior applies if the bound property on the scope is truthy
      this.compileTemplate('<multi-step-modal next="_.noop()" next-loading="nextLoading"></multi-step-modal>');
      expect(this.view.find('button.btn.next[loading] > .cs-loading')).not.toExist();
      this.$scope.nextLoading = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.next[loading] > .cs-loading')).toExist();
      this.$scope.nextLoading = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.next[loading] > .cs-loading')).not.toExist();
    });

    it('should transclude its contents into the modal body', function () {
      this.compileTemplate('<multi-step-modal><span class="foo">fake-content</span></multi-step-modal>');
      expect(this.view.find('.modal-body > span.foo')).toExist();
      expect(this.view.find('.modal-body > span.foo').get(0)).toHaveText('fake-content');
    });

    it('should render a custom finish button with custom l10n label as-needed', function () {
      this.compileTemplate('<multi-step-modal custom-finish="_.noop()" custom-finish-l10n-label="fake.label"></multi-step-modal>');
      expect(this.view.find('button.btn.custom-finish')).toExist();
      expect(this.view.find('button.btn.custom-finish [translate="fake.label"]')).toExist();
    });

    it('should render a warning footer message if one is provided', function () {
      this.compileTemplate('<multi-step-modal l10n-warning-footer="fake.footerMsg" cancel="_.noop()"></multi-step-modal>');
      expect(this.view.find('.modal-footer__warning h6[translate="fake.footerMsg"]')).toExist();
    });
  });
});
