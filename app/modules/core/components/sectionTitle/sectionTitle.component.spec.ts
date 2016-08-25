describe('Component: sectionTitle', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$scope'
    );
  })

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
      let actionSelector = 'ul.dropdown-menu li a';
      expect(this.view).toContainElement(actionSelector);
      expect(this.view.find(actionSelector)).toContainText('action.key');
      this.view.find(actionSelector).click();
      expect(this.actionSpy).toHaveBeenCalled();
    });

    it('should hide the actions if showActions is false', function () {
      let actionSelector = 'ul.dropdown-menu li a';
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
});
