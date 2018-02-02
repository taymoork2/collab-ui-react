import moduleName from './index';
import { AssignableUserEntitlementCheckboxController } from './assignable-user-entitlement-checkbox.component';

type Test = atlas.test.IComponentTest<AssignableUserEntitlementCheckboxController, {}, {}>;

describe('Component: assignableUserEntitlementCheckbox:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<assignable-user-entitlement-checkbox></assignable-user-entitlement-checkbox>');
    // this.compileComponent('assignableUserEntitlementCheckbox', {});
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
