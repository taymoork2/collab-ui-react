import moduleName from './index';

describe('Component: crCheckboxItem:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.itemId = 'fake-itemId';
    this.$scope.isSelected = true;
    this.$scope.isDisabled = false;
  });

  function initComponent(_transcludeContent) {
    const transcludeContent = _transcludeContent || '';
    this.compileTemplate(`
      <cr-checkbox-item
        item-id="itemId"
        is-selected="isSelected"
        is-disabled="isDisabled"
        l10n-label="fake-label"
        on-update="onUpdate($event)">
        ${transcludeContent}
      </cr-checkbox-item>`);
    this.controller = this.view.controller('crCheckboxItem');
  }

  describe('primary behaviors (view):', () => {
    it('should render an input[cs-input][type="checkbox"]', function () {
      initComponent.call(this);
      expect(this.view.find('input[cs-input][type="checkbox"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][id="fake_itemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][name="fake_itemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][cs-input-label="fake-label"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-model="$ctrl.isSelected"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-disabled="$ctrl.isDisabled"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-change="$ctrl.recvChange()"]').length).toBe(1);
    });

    it('should transclude its contents', function () {
      initComponent.call(this, '<span>fake-contents</span>');
      expect(this.view.find('.assignable_item_checkbox__description')).toContainText('fake-contents');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should have properties as bound through input bindings', function () {
      initComponent.call(this);
      expect(this.controller.itemId).toBe('fake-itemId');
      expect(this.controller.isSelected).toBe(true);
      expect(this.controller.isDisabled).toBe(false);
      expect(this.controller.l10nLabel).toBe('fake-label');
    });

    describe('recvChange():', () => {
      it('should call "onUpdate()" output binding function', function () {
        initComponent.call(this);
        this.controller.recvChange();
        expect(this.$scope.onUpdate).toHaveBeenCalledWith({
          itemId: 'fake-itemId',
          item: {
            isSelected: true,
            isDisabled: false,
          },
        });
      });
    });
  });
});
