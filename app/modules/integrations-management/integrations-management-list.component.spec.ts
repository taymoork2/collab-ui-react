import moduleName from './index';
import { IntegrationsManagementListController } from './integrations-management-list.component';

type Test = atlas.test.IComponentTest<IntegrationsManagementListController, {}, {}>;

describe('Component: integrationsManagementList:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<integrations-management-list></integrations-management-list>');
    // this.compileComponent('integrationsManagement', {});
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
