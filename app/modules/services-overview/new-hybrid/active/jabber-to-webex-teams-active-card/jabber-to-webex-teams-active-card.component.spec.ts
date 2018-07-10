import moduleName from './index';
import { JabberToWebexTeamsActiveCardController } from './jabber-to-webex-teams-active-card.component';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsActiveCardController, {}, {}>;

// TODO (mipark2): add unit-tests
describe('Component: jabberToWebexTeamsActiveCard:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  beforeEach(function (this: Test) {
    // this.compileComponent('jabberToWebexTeamsActiveCard', {});
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
