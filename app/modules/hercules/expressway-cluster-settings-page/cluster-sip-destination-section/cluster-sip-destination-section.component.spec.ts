import moduleName from './index';
import { ClusterSipDestinationSectionController } from './cluster-sip-destination-section.component';

type Test = atlas.test.IComponentTest<ClusterSipDestinationSectionController, {}, {}>;

describe('Component: clusterSipDestinationSection:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<cluster-sip-destination-section></cluster-sip-destination-section>');
    // this.compileComponent('clusterSipDestinationSection', {});
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
