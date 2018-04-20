import moduleName from './index';
import { CrIconInfoController } from './cr-icon-info.component';

type Test = atlas.test.IComponentTest<CrIconInfoController, {}, {}>;

describe('Component: crIconInfo:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies();
  });

  describe('primary behaviors (view):', () => {
    enum View {
      ICON = '.icon.icon-info',
    }

    it('should render an info icon with default attributes', function (this: Test) {
      this.compileComponent('crIconInfo', {
        l10nTooltip: 'fake-l10n-key',
      });
      expect(this.view.find(View.ICON).length).toBe(1);

      // both 'tooltip' and 'aria-label' apply the 'l10nTooltip' binding value
      expect(this.view.find(`${View.ICON}[tooltip="fake-l10n-key"]`).length).toBe(1);
      expect(this.view.find(`${View.ICON}[aria-label="fake-l10n-key"]`).length).toBe(1);

      // other defaults
      expect(this.view.find(`${View.ICON}[tooltip-trigger="focus mouseenter"]`).length).toBe(1);
      expect(this.view.find(`${View.ICON}[tooltip-placement="top"]`).length).toBe(1);
      expect(this.view.find(`${View.ICON}[tabindex="0"]`).length).toBe(1);
    });

    it('should allow overriding "tooltip-*" bindings', function (this: Test) {
      this.compileComponent('crIconInfo', {
        l10nTooltip: 'fake-l10n-key',
        tooltipTrigger: 'fake-tooltip-trigger-value',
        tooltipPlacement: 'fake-tooltip-placement-value',
      });
      expect(this.view.find(`${View.ICON}[tooltip-trigger="fake-tooltip-trigger-value"]`).length).toBe(1);
      expect(this.view.find(`${View.ICON}[tooltip-placement="fake-tooltip-placement-value"]`).length).toBe(1);
    });
  });
});
