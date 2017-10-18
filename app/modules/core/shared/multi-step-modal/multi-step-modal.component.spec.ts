import moduleName from './index';

describe('Component: multiStepModal:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
  });

  describe('primary behaviors:', () => {
    it('should always render a dismiss button', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('button.close[aria-label="common.close"]').length).toBe(1);
    });

    it('should always render a translated header element', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('.modal-header h3.modal-title[translate]').length).toBe(1);

      this.compileTemplate('<multi-step-modal l10n-title="foo.bar"></multi-step-modal>');
      expect(this.view.find('.modal-header h3.modal-title[translate="foo.bar"]').length).toBe(1);
    });

    it('should render button elements if a corresponding attribute is set', function () {
      this.compileTemplate('<multi-step-modal></multi-step-modal>');
      expect(this.view.find('button.btn').length).toBe(0);

      this.compileTemplate('<multi-step-modal cancel="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel').length).toBe(1);

      this.compileTemplate('<multi-step-modal back="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.back').length).toBe(1);

      this.compileTemplate('<multi-step-modal next="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.next').length).toBe(1);

      this.compileTemplate('<multi-step-modal save="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn.save').length).toBe(1);

      this.compileTemplate('<multi-step-modal back="_.noop()" save="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn').length).toBe(2);
      expect(this.view.find('button.btn.back').length).toBe(1);
      expect(this.view.find('button.btn.save').length).toBe(1);

      this.compileTemplate('<multi-step-modal cancel="_.noop()" next="_.noop()"></multi-step-modal>');
      expect(this.view.find('button.btn').length).toBe(2);
      expect(this.view.find('button.btn.cancel').length).toBe(1);
      expect(this.view.find('button.btn.next').length).toBe(1);
    });

    it('should not render button elements if a corresponding attribute is set but the "*-removed" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-removed="true"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel').length).toBe(0);
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-removed="false"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel').length).toBe(1);

      // same behavior applies if the bound property on the controller is truthy
      this.compileTemplate('<multi-step-modal cancel="_.noop()"></multi-step-modal>');
      this.controller = this.view.controller('multi-step-modal');
      expect(this.view.find('button.btn.cancel').length).toBe(1);
      this.controller.cancelRemoved = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel').length).toBe(0);
      this.controller.cancelRemoved = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel').length).toBe(1);
    });

    it('should render disabled button elements if a corresponding attribute is set and the "*-disabled" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-disabled="true"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel[disabled]').length).toBe(1);
      this.compileTemplate('<multi-step-modal cancel="_.noop()" cancel-disabled="false"></multi-step-modal>');
      expect(this.view.find('button.btn.cancel[disabled]').length).toBe(0);

      // same behavior applies if the bound property on the controller is truthy
      this.compileTemplate('<multi-step-modal cancel="_.noop()"></multi-step-modal>');
      this.controller = this.view.controller('multi-step-modal');
      expect(this.view.find('button.btn.cancel[disabled]').length).toBe(0);
      this.controller.cancelDisabled = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel[disabled]').length).toBe(1);
      this.controller.cancelDisabled = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.cancel[disabled]').length).toBe(0);
    });

    it('should reflect a loading state if a forward-stepping button is set and the "*-loading" attribute is truthy', function () {
      this.compileTemplate('<multi-step-modal next="_.noop()" next-loading="true"></multi-step-modal>');
      expect(this.view.find('button.btn.next[loading] > .cs-loading').length).toBe(1);
      this.compileTemplate('<multi-step-modal next="_.noop()" next-loading="false"></multi-step-modal>');
      expect(this.view.find('button.btn.next[loading] > .cs-loading').length).toBe(0);

      // same behavior applies if the bound property on the controller is truthy
      this.compileTemplate('<multi-step-modal next="_.noop()"></multi-step-modal>');
      this.controller = this.view.controller('multi-step-modal');
      expect(this.view.find('button.btn.next[loading] > .cs-loading').length).toBe(0);
      this.controller.nextLoading = true;
      this.$scope.$apply();
      expect(this.view.find('button.btn.next[loading] > .cs-loading').length).toBe(1);
      this.controller.nextLoading = false;
      this.$scope.$apply();
      expect(this.view.find('button.btn.next[loading] > .cs-loading').length).toBe(0);
    });

    it('should transclude its contents into the modal body', function () {
      this.compileTemplate('<multi-step-modal><span class="foo">fake-content</span></multi-step-modal>');
      expect(this.view.find('.modal-body > span.foo').length).toBe(1);
      expect(this.view.find('.modal-body > span.foo').get(0)).toHaveText('fake-content');
    });
  });
});
