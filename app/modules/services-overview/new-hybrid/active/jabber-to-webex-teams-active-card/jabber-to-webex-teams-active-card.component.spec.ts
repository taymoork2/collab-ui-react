import moduleName from './index';
import { JabberToWebexTeamsActiveCardController } from './jabber-to-webex-teams-active-card.component';

type Test = atlas.test.IComponentTest<JabberToWebexTeamsActiveCardController, {
  $state: ng.ui.IStateService,
}, {}>;

// TODO (changlol): add unit-tests
describe('Component: jabberToWebexTeamsActiveCard:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
    );
    spyOn(this.$state, 'go');
  });

  beforeEach(function (this: Test) {
    this.compileComponent('jabberToWebexTeamsActiveCard', {});
  });

  describe('primary behaviors (view):', () => {
    enum View {
      ADD_LINK = '.active-card_action a[translate="servicesOverview.cards.jabberToWebexTeams.add"]',
      EDIT_LINK = '.active-card_action a[translate="servicesOverview.cards.jabberToWebexTeams.edit"]',
    }

    it('should render a add button if hasAtLeastOneProfileSet is false', function (this: Test) {
      this.controller.hasAtLeastOneProfileSet = false;
      this.$scope.$apply();
      expect(this.view.find(View.ADD_LINK)).toExist();
      expect(this.view.find(View.EDIT_LINK)).not.toExist();
    });

    it('should render a edit button if hasAtLeastOneProfileSet is true', function (this: Test) {
      this.controller.hasAtLeastOneProfileSet = true;
      this.$scope.$apply();
      expect(this.view.find(View.ADD_LINK)).not.toExist();
      expect(this.view.find(View.EDIT_LINK)).toExist();
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('addProfile():', () => {
      it('should transition to the add-profile wizard', function (this: Test) {
        this.controller.addProfile();
        expect(this.$state.go).toHaveBeenCalledWith('jabber-to-webex-teams.modal.add-profile');
      });
    });
  });
});
