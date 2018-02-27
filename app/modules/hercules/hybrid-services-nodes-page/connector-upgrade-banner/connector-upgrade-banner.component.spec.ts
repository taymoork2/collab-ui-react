import moduleName from './index';
import { ConnectorUpgradeBannerController } from './connector-upgrade-banner.component';

type Test = atlas.test.IComponentTest<ConnectorUpgradeBannerController, {}, {}>;

describe('Component: connectorUpgradeBanner:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<connector-upgrade-banner></connector-upgrade-banner>');
    // this.compileComponent('connectorUpgradeBanner', {});
  });

  describe('primary behaviors (view):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });

  describe('primary behaviors (controller):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });
});
