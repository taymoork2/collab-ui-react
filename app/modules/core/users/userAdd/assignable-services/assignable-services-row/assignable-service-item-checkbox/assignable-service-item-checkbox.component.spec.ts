import moduleName from './index';

describe('Component: assignableServiceItemCheckbox:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.fakeServiceItemId = 'fake-serviceItemId';
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.stateData = {
      items: {
        'fake-serviceItemId': {
          isSelected: false,
          isDisabled: false,
        },
      },
    };
  });

  function initComponent(_transcludeContent) {
    const transcludeContent = _transcludeContent || '';
    this.compileTemplate(`
      <assignable-service-item-checkbox
        service-item-id="fakeServiceItemId"
        l10n-label="fake-label"
        on-update="onUpdate()"
        state-data="stateData">
        ${transcludeContent}
      </assignable-service-item-checkbox>`);
    this.controller = this.view.controller('assignableServiceItemCheckbox');
  }

  describe('primary behaviors (view):', () => {
    it('should render an input[cs-input][type="checkbox"]', function () {
      initComponent.call(this);
      expect(this.view.find('input[cs-input][type="checkbox"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][id="fake_serviceItemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][name="fake_serviceItemId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][cs-input-label="fake-label"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-model="$ctrl.isSelected"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-disabled="$ctrl.isDisabled"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-change="$ctrl.recvChange()"]').length).toBe(1);
    });

    it('should transclude its contents', function () {
      initComponent.apply(this, ['<span>fake-contents</span>']);
      expect(this.view.find('.sub-content')).toContainText('fake-contents');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should initialize its "isSelected" and "isDisabled" properties', function () {
      initComponent.call(this);
      expect(this.controller.isSelected).toBe(false);
      expect(this.controller.isDisabled).toBe(false);

      _.set(this.$scope, 'stateData.items["fake-serviceItemId"].isSelected', true);
      initComponent.call(this);
      expect(this.controller.isSelected).toBe(true);

      _.set(this.$scope, 'stateData.items["fake-serviceItemId"].isDisabled', true);
      initComponent.call(this);
      expect(this.controller.isDisabled).toBe(true);
    });

    describe('recvChange():', () => {
      it('should call "onUpdate()" output binding function', function () {
        initComponent.call(this);
        this.controller.recvChange();
        expect(this.$scope.onUpdate).toHaveBeenCalled();
      });
    });
  });
});
