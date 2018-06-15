import moduleName from './index';

describe('Component: sectionTitle', () => {
  afterEach(function () {
    if (this.view) {
      this.view.remove();
    }
  });
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  describe('asButton attribute', () => {

    beforeEach(function () {
      this.actionSpy = jasmine.createSpy('actionFunction');
      this.actionSpy2 = jasmine.createSpy('actionFunction');

      this.$scope.actionList = [{
        actionKey: 'action.key',
        actionFunction: this.actionSpy,
      },
      {
        actionKey: 'action.key.2',
        actionFunction: this.actionSpy2,
      }];
    });

    it('should default to dropdown menu when not defined', function () {
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
      });

      expect(this.controller.asButton).toBe(false);
      expect(this.view).toContainElement('.section-title-row button.actions-button');
      expect(this.view).not.toContainElement('.section-title-row a.as-button');
    });

    it('should display dropdown menu if asButton evaluates to false', function () {
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        asButton: 'false',
      });
      expect(this.controller.asButton).toBe(false);
      expect(this.view).toContainElement('.section-title-row button.actions-button');
      expect(this.view).not.toContainElement('.section-title-row a.as-button');

      // make sure clicking things works as expcected
      this.view.find('.section-title-row button.actions-button').click();
      this.view.find('.section-title-row a.as-button').click();
      expect(this.actionSpy).not.toHaveBeenCalled();
      expect(this.actionSpy2).not.toHaveBeenCalled();
    });

    it('should display button with first action if asButton evaluates to true', function () {
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        asButton: 'true',
      });

      expect(this.controller.asButton).toBe(true);
      expect(this.view).not.toContainElement('.section-title-row button.actions-button');
      expect(this.view).toContainElement('.section-title-row a.as-button');
      expect(this.view.find('.section-title-row a.as-button')).toHaveText('action.key');

      // make sure the action is called when the button is clicked
      this.view.find('.section-title-row a.as-button').click();
      expect(this.actionSpy).toHaveBeenCalled();
      expect(this.actionSpy2).not.toHaveBeenCalled();
    });

    it('should support different ways of setting asButton', function () {
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        asButton: 'true',
      });
      expect(this.controller.asButton).toBe(true);

      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        asButton: 'FALSE',
      });
      expect(this.controller.asButton).toBe(false);

      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        asButton: '',
      });
      expect(this.controller.asButton).toBe(false);
    });
  });

  describe('without an actionList', () => {
    beforeEach(function () {
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
      });
    });

    it('should have a section title', function () {
      expect(this.view.find('.section-title-row .section-name')).toHaveText('custom.key');
    });

    it('should not have an actions-menu', function () {
      expect(this.view).not.toContainElement('.actions-menu');
    });
  });

  describe('with an actionList', () => {
    beforeEach(function () {
      this.actionSpy = jasmine.createSpy('actionFunction');
      this.$scope.actionList = [{
        actionKey: 'action.key',
        actionFunction: this.actionSpy,
      }];
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        actionList: 'actionList',
        showActions: 'showActions',
      });
    });

    it('should have a section title', function () {
      expect(this.view.find('.section-title-row .section-name')).toHaveText('custom.key');
    });

    it('should have an actions-menu', function () {
      expect(this.view).toContainElement('.actions-menu');
    });

    it('should have a dropdown action', function () {
      const actionSelector = 'ul.dropdown-menu li a';
      expect(this.view).toContainElement(actionSelector);
      expect(this.view.find(actionSelector)).toContainText('action.key');
      this.view.find(actionSelector).click();
      expect(this.actionSpy).toHaveBeenCalled();
    });

    it('should hide the actions if showActions is false', function () {
      const actionSelector = 'ul.dropdown-menu li a';
      // this.$scope.showActions is undefined
      expect(this.view).toContainElement(actionSelector);

      this.$scope.showActions = false;
      this.$scope.$apply();
      expect(this.view).not.toContainElement(actionSelector);

      this.$scope.showActions = true;
      this.$scope.$apply();
      expect(this.view).toContainElement(actionSelector);
    });
  });

  describe('with an action', () => {
    beforeEach(function () {
      this.$scope.actionSpy = jasmine.createSpy('actionFunction');
      this.compileComponent('sectionTitle', {
        titleKey: 'custom.key',
        onActionClick: 'actionSpy()',
      });
    });

    it('should have a section title', function () {
      expect(this.view.find('.section-title-row .section-name')).toHaveText('custom.key');
    });

    it('should have an arrow icon and execute action', function () {
      expect(this.view).toContainElement('.icon-arrow-next');
      this.view.find('.icon-arrow-next').click();
      expect(this.$scope.actionSpy).toHaveBeenCalled();
    });
  });
});
