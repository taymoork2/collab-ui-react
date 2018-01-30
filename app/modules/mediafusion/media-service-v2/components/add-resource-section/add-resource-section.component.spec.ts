import moduleName from './index';
import { AddResourceSectionController } from './add-resource-section.component';

type Test = atlas.test.IComponentTest<AddResourceSectionController, {}, {}>;

describe('Component: addResourceSection:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<add-resource-section></add-resource-section>');
    // this.compileComponent('addResourceSection', {});
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
