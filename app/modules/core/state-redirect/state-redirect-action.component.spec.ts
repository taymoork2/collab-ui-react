import moduleName from './index';

describe('Component: StateRedirectAction', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'Auth',
      'PreviousState',
    );

    this.initSpies = (spies: {
      isValid?,
    } = {}) => {
      const {
        isValid = false,
      } = spies;
      spyOn(this.Auth, 'logout');
      spyOn(this.PreviousState, 'isValid').and.returnValue(isValid);
      spyOn(this.PreviousState, 'go');
    };

    this.initComponent = (options: {
      l10nTitle?,
      l10nText?,
      l10nButtonText?,
      isWebexLayout?,
    } = {}) => {
      const {
        l10nTitle = 'title-key',
        l10nText = 'text-key',
        l10nButtonText,
        isWebexLayout = false,
      } = options;

      this.compileComponent('stateRedirectAction', {
        l10nTitle,
        l10nText,
        l10nButtonText,
        isWebexLayout,
      });
    };
  });

  enum View {
    BUTTON = 'button',
    BUTTON_TEXT = 'button span[translate]',
    TITLE = 'h3',
    TEXT = 'h5',
    MESSAGE_BOX = '.message-box',
    CUI_PANEL = '.cui-panel',
  }

  describe('Default', function () {
    testStateRedirectAction();
  });

  describe('With webex layout', function () {
    testStateRedirectAction(true);
  });

  function testStateRedirectAction(testWebexLayout = false) {
    const isWebexLayout = testWebexLayout ? 'true' : undefined;
    describe('initialization', function () {
      beforeEach(function () {
        this.initSpies();
        this.initComponent({
          l10nButtonText: 'button-text-key',
          isWebexLayout,
        });
      });

      it('should use provided title, text, button text, and layout', function () {
        if (testWebexLayout) {
          expect(this.view.find(View.CUI_PANEL)).toExist();
          expect(this.view.find(View.MESSAGE_BOX)).not.toExist();
        } else {
          expect(this.view.find(View.MESSAGE_BOX)).toExist();
          expect(this.view.find(View.CUI_PANEL)).not.toExist();
        }

        expect(this.view.find(View.TITLE)).toHaveAttr('translate', 'title-key');
        expect(this.view.find(View.TITLE)).toHaveText('title-key');
        expect(this.view.find(View.TEXT)).toHaveAttr('translate', 'text-key');
        expect(this.view.find(View.TEXT)).toHaveText('text-key');
        expect(this.view.find(View.BUTTON_TEXT)).toHaveAttr('translate', 'button-text-key');
        expect(this.view.find(View.BUTTON_TEXT)).toHaveText('button-text-key');
      });
    });

    describe('Has a valid previous state', function () {
      beforeEach(function () {
        this.initSpies({
          isValid: true,
        });
        this.initComponent({
          isWebexLayout,
        });
      });

      it('should have default goBackButton button text', function () {
        expect(this.view.find(View.BUTTON_TEXT)).toHaveAttr('translate', 'stateRedirect.goBackButton');
        expect(this.view.find(View.BUTTON_TEXT)).toHaveText('stateRedirect.goBackButton');
      });

      it('should go to previous stack on button click', function () {
        this.view.find(View.BUTTON).click();
        expect(this.PreviousState.go).toHaveBeenCalled();
        expect(this.Auth.logout).not.toHaveBeenCalled();
      });
    });

    describe('Has an invalid previous state', function () {
      beforeEach(function () {
        this.initSpies({
          isValid: false,
        });
        this.initComponent({
          isWebexLayout,
        });
      });

      it('should have default signInButton button text', function () {
        expect(this.view.find(View.BUTTON_TEXT)).toHaveAttr('translate', 'stateRedirect.signInButton');
        expect(this.view.find(View.BUTTON_TEXT)).toHaveText('stateRedirect.signInButton');
      });

      it('should logout on button click', function () {
        this.view.find(View.BUTTON).click();
        expect(this.PreviousState.go).not.toHaveBeenCalled();
        expect(this.Auth.logout).toHaveBeenCalled();
        expect(this.view.find(View.BUTTON)).toBeDisabled();
      });
    });
  }
});
