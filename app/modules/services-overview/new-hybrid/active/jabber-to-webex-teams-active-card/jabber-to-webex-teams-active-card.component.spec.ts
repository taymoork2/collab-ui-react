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
  });

  beforeEach(function (this: Test) {
    // this.compileComponent('jabberToWebexTeamsActiveCard', {});
  });

  describe('primary behaviors (view):', () => {
    it('should render a add or edit link', function (this: Test) {
      //TODO : add link check
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
