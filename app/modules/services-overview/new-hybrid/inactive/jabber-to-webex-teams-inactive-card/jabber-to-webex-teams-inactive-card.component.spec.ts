import moduleName from './index';
import { JabberToWebexTeamsInactiveCardController } from './jabber-to-webex-teams-inactive-card.component';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsInactiveCardController, {
  $state: ng.ui.IStateService,
}, {}>;

describe('Component: jabberToWebexTeamsInactiveCard:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
    );
    spyOn(this.$state, 'go');
  });

  beforeEach(function (this: Test) {
    this.compileComponent('jabberToWebexTeamsInactiveCard', {});
  });

  describe('primary behaviors (view):', () => {
    enum View {
      SETUP_BUTTON = '.inactive-card_footer button[translate="common.setUp"]',
    }

    it('should render a set up button', function (this: Test) {
      expect(this.view.find(View.SETUP_BUTTON)).toExist();
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('openSetUp():', () => {
      it('should transition to the first step of the set up wizard', function (this: Test) {
        this.controller.openSetUp();
        expect(this.$state.go).toHaveBeenCalledWith('jabber-to-webex-teams.modal.confirm-prerequisites');
      });
    });
  });
});
