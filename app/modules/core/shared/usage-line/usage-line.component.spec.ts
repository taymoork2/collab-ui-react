import moduleName from './index';

describe('Component: usageLine:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
  });

  describe('primary behaviors (view):', () => {
    it('should render a simple div with a simple text field indicating usage of some quantity over a total', function () {
      this.compileTemplate('<usage-line></usage-line>');
      expect(this.view.find('div[translate="userManage.autoAssignTemplate.edit.usage"]').length).toBe(1);
      // we use a template string here to specify the exact newlines + spacing indent for the CSS selector
      expect(
        this.view.find(`div[translate-values="{
    usage: $ctrl.usage,
    volume: $ctrl.volume,
  }"]`).length).toBe(1);
    });
  });
});
