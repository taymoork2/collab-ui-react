import moduleName from './index';

describe('Component: crCollapsibleRow:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  beforeEach(function () {
    this.$scope.fakeRowId = 'fake-rowId';
    this.$scope.showContent = true;
    this.compileComponent('crCollapsibleRow', {
      rowId: 'fakeRowId',
      showContent: 'showContent',
    });
  });

  describe('primary behaviors (view):', () => {
    it('should have a viewable content area toggled by an icon', function () {
      expect(this.view.find('.row__header .icon.toggle').length).toBe(1);
      expect(this.view.find('.row__header .icon.toggle')).toHaveClass('icon-chevron-up');
      expect(this.view.find('.row__content')).not.toHaveClass('ng-hide');
      this.view.find('.row__header .icon.toggle').click();
      expect(this.view.find('.row__header .icon.toggle')).toHaveClass('icon-chevron-down');
      expect(this.view.find('.row__content')).toHaveClass('ng-hide');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should initialize "rowTitle" as "rowId" if not set', function () {
      expect(this.controller.rowTitle).toBe('fake-rowId');
    });

    describe('toggleContent', () => {
      it('should toggle "showContent" property', function () {
        expect(this.controller.showContent).toBe(true);
        this.controller.toggleContent();
        expect(this.controller.showContent).toBe(false);
      });

      it('should call "onUpdate()" output binding', function () {
        expect(this.controller.showContent).toBe(true);
        spyOn(this.controller, 'onUpdate');
        this.controller.toggleContent();
        expect(this.controller.onUpdate).toHaveBeenCalledWith({
          $event: {
            itemId: 'fake-rowId',
            item: {
              showContent: false,
            },
          },
        });
      });
    });
  });
});
