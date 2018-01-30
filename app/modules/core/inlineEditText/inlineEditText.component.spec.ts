import inlineEditTextModule from './index';

describe('Component: InlineEditText', () => {
  beforeEach(function () {
    this.initModules(inlineEditTextModule);
    this.injectDependencies(
      '$q',
      '$scope',
    );

    this.ESCAPE_KEY = jQuery.Event('keyup', {
      keyCode: 27,
    });
    this.DISPLAY_TEXT = '.read-only-text';
    this.EDIT_ICON = '.icon-edit';
    this.CHECK_ICON = '.icon-check';
    this.REMOVE_ICON = '.icon-remove';
    this.SUBMIT_BUTTON = 'button[type="submit"]';
    this.CANCEL_BUTTON = 'button[type="button"]';
    this.INPUT = 'input';
    this.INPUT_MESSAGES = '.cs-input__messages';

    this.originalValue = 'original value';
    this.newValue = 'new value';
    this.$scope.initialValue = this.originalValue;
    this.$scope.saveValue = jasmine.createSpy('saveValue');

    this.initComponent = (componentBindings) => {
      this.compileComponent('crInlineEditText', _.assignIn({
        value: 'initialValue',
        onSave: 'saveValue(newValue)',
        validators: 'myValidators',
        validationMessages: 'myValidationMessages',
      }, componentBindings));
    };
  });

  describe('display mode', () => {
    beforeEach(function() {
      this.initComponent();
    });

    it('should display the text value', function () {
      expect(this.view.find(this.DISPLAY_TEXT)).toHaveText(this.originalValue);
      expect(this.view.find(this.DISPLAY_TEXT)).toBeMatchedBy('span');
      expect(this.view.find(this.EDIT_ICON)).toExist();

      expect(this.view.find(this.INPUT)).not.toExist();
      expect(this.view.find(this.CANCEL_BUTTON).find(this.REMOVE_ICON)).not.toExist();
      expect(this.view.find(this.SUBMIT_BUTTON).find(this.CHECK_ICON)).not.toExist();
    });
  });

  describe('showProPackIcon', () => {
    it('should not show pro pack icon if not bound to component', function () {
      this.initComponent();
      expect(this.view.find('cr-pro-pack-icon')).not.toExist();
    });

    it('should not show pro pack icon if bound and false', function () {
      this.$scope.shouldShowProPackIcon = false;
      this.initComponent({
        showProPackIcon: 'shouldShowProPackIcon',
      });
      expect(this.view.find('cr-pro-pack-icon')).not.toExist();
    });

    it('should show pro pack icon if bound and true', function () {
      this.$scope.shouldShowProPackIcon = true;
      this.initComponent({
        showProPackIcon: 'shouldShowProPackIcon',
      });
      expect(this.view.find('cr-pro-pack-icon .pro-pack-icon')).toExist(); // find child element compiled from crProPackIcon component
    });
  });

  describe('display mode with onTextClick', () => {
    beforeEach(function () {
      this.$scope.clickMyText = jasmine.createSpy('clickMyText');
    });

    it('without conditional isTextClickable should always show text as link', function () {
      this.initComponent({
        onTextClick: 'clickMyText()',
      });
      expect(this.view.find(this.DISPLAY_TEXT)).toBeMatchedBy('a');
      this.view.find(this.DISPLAY_TEXT).click();

      expect(this.$scope.clickMyText).toHaveBeenCalled();
    });

    it('with isTextClickable should conditionally show text as link', function () {
      this.$scope.isMyTextClickable = false;
      this.initComponent({
        isTextClickable: 'isMyTextClickable',
        onTextClick: 'clickMyText()',
      });
      expect(this.view.find(this.DISPLAY_TEXT)).toBeMatchedBy('span');
      this.view.find(this.DISPLAY_TEXT).click();

      expect(this.$scope.clickMyText).not.toHaveBeenCalled();

      this.$scope.isMyTextClickable = true;
      this.$scope.$apply();

      expect(this.view.find(this.DISPLAY_TEXT)).toBeMatchedBy('a');
      this.view.find(this.DISPLAY_TEXT).click();

      expect(this.$scope.clickMyText).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(function () {
      this.initComponent();
      this.view.find(this.EDIT_ICON).click();
    });

    it('should show input and buttons instead of text', function () {
      expect(this.view.find(this.DISPLAY_TEXT)).not.toExist();
      expect(this.view.find(this.EDIT_ICON)).not.toExist();

      expect(this.view.find(this.INPUT)).toExist();
      expect(this.view.find(this.CANCEL_BUTTON).find(this.REMOVE_ICON)).toExist();
      expect(this.view.find(this.SUBMIT_BUTTON).find(this.CHECK_ICON)).toExist();
    });

    it('should save new value after hitting enter', function () {
      this.view.find(this.INPUT).val(this.newValue).change().submit();

      expect(this.$scope.saveValue).toHaveBeenCalledWith(this.newValue);
      expect(this.view.find(this.DISPLAY_TEXT)).toHaveText(this.newValue);
    });

    it('should save new value after clicking submit button', function () {
      this.view.find(this.INPUT).val(this.newValue).change().submit();
      this.view.find(this.SUBMIT_BUTTON).click();

      expect(this.$scope.saveValue).toHaveBeenCalledWith(this.newValue);
      expect(this.view.find(this.DISPLAY_TEXT)).toHaveText(this.newValue);
    });

    it('should remain in edit mode if save fails', function () {
      // when using rejects and views, use callFake instead of returnValue to avoid PURs...
      this.$scope.saveValue.and.callFake(() => {
        return this.$q.reject();
      });
      this.view.find(this.INPUT).val(this.newValue).change().submit();
      this.view.find(this.SUBMIT_BUTTON).click();

      expect(this.$scope.saveValue).toHaveBeenCalledWith(this.newValue);
      expect(this.view.find(this.INPUT).val()).toBe(this.newValue);
    });

    it('should restore original value after hitting escape', function () {
      this.view.find(this.INPUT).val(this.newValue).change();
      this.view.find(this.INPUT).trigger(this.ESCAPE_KEY);

      expect(this.$scope.saveValue).not.toHaveBeenCalled();
      expect(this.view.find(this.DISPLAY_TEXT)).toHaveText(this.originalValue);
    });

    it('should restore original value after clicking cancel button', function () {
      this.view.find(this.INPUT).val(this.newValue).change();
      this.view.find(this.CANCEL_BUTTON).click();

      expect(this.$scope.saveValue).not.toHaveBeenCalled();
      expect(this.view.find(this.DISPLAY_TEXT)).toHaveText(this.originalValue);
    });
  });

  describe('with validation', () => {
    beforeEach(function () {
      this.initComponent();
      const invalidText = 'not allowed';
      this.validationMessage = 'Test validation message';
      this.$scope.myValidators = {
        testValidation: (value) => {
          return value !== invalidText;
        },
      };
      this.$scope.myValidationMessages = {
        testValidation: this.validationMessage,
      };
      this.$scope.$apply();

      this.view.find(this.EDIT_ICON).click();
      this.view.find(this.INPUT).val(invalidText).change();
    });

    it('should show an error class for invalid input', function () {
      expect(this.view.find(this.INPUT)).toHaveClass('ng-invalid-test-validation');
    });

    it('should show an error message for validation', function () {
      expect(this.view.find(this.INPUT_MESSAGES)).toHaveText(this.validationMessage);

      this.view.find(this.INPUT).val(this.newValue).change();
      expect(this.view.find(this.INPUT_MESSAGES)).not.toHaveText(this.validationMessage);
    });

    it('should disable save when invalid', function () {
      expect(this.view.find(this.SUBMIT_BUTTON)).toBeDisabled();

      this.view.find(this.INPUT).val(this.newValue).change();
      expect(this.view.find(this.SUBMIT_BUTTON)).not.toBeDisabled();
    });
  });
});
