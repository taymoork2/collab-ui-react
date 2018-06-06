import moduleName from './index';

describe('Component: StateRedirectWarning', function () {
  beforeEach(function () {
    this.initModules(moduleName);

    this.initComponent = (options: {
      l10nTitle?,
      l10nText?,
    } = {}) => {
      const {
        l10nTitle = 'title-key',
        l10nText = 'text-key',
      } = options;

      this.compileComponent('stateRedirectWarning', {
        l10nTitle,
        l10nText,
      });
    };
  });

  enum View {
    TITLE = 'h3',
    TEXT = 'h5',
  }

  describe('initialization', function () {
    beforeEach(function () {
      this.initComponent();
    });

    it('should use provided title and text', function () {
      expect(this.view.find(View.TITLE)).toHaveAttr('translate', 'title-key');
      expect(this.view.find(View.TITLE)).toHaveText('title-key');
      expect(this.view.find(View.TEXT)).toHaveAttr('translate', 'text-key');
      expect(this.view.find(View.TEXT)).toHaveText('text-key');
    });
  });
});
