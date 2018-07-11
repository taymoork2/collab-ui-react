import moduleName from './index';
import { JabberToWebexTeamsInactiveCardController } from './jabber-to-webex-teams-inactive-card.component';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsInactiveCardController, {}, {}>;

// TODO (mipark2): add unit-tests
describe('Component: jabberToWebexTeamsInactiveCard:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  beforeEach(function (this: Test) {
    // this.compileComponent('jabberToWebexTeamsInactiveCard', {});
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
