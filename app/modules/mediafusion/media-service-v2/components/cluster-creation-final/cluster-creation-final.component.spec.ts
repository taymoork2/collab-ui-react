import moduleName from './index';
import { ClusterCreationFinalController } from './cluster-creation-final.component';

type Test = atlas.test.IComponentTest<ClusterCreationFinalController, {}, {}>;

describe('Component: clusterCreationFinal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<cluster-creation-final></cluster-creation-final>');
    // this.compileComponent('clusterCreationFinal', {});
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
