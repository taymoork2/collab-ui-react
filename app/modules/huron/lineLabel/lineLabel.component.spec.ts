describe('Component: lineLabel', () => {
  const LINE_LABEL_INPUT = 'input#lineLabel';
  const APPLY_TO_ALL_CHECK_BOX = 'input#applyToAllSharedLinesBox';
  const lineLabel = '1234 - someone@some.com';

  beforeEach(function() {
    this.initModules('huron.line-label');
    this.injectDependencies(
      '$q',
      'FeatureToggleService',
      '$scope',
    );

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucLineLabel', {
      onChangeFn: 'onChangeFn(lineLabel, applyToAllSharedLines)',
      lineLabel: 'lineLabel',
      showApplyToAllSharedLines: 'showApplyToAllSharedLines',
      disableCheckBox: 'disableCheckBox',
      applyToAllSharedLines: 'applyToAllSharedLines',
    });

    this.$scope.lineLabel = lineLabel;
    this.$scope.showApplyToAllSharedLines = false;
    this.$scope.applyToAllSharedLines = false;
    this.$scope.disableCheckBox = false;
    this.$scope.$apply();
  }

  describe('exists line label', () => {
    beforeEach(initComponent);

    it('should show line lable input field only', function() {

      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
      expect(this.view.find(LINE_LABEL_INPUT).val()).toEqual('1234 - someone@some.com');
      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).not.toExist();
    });

    it('should show line lable input field and checkbox', function() {
      this.$scope.showApplyToAllSharedLines = true;
      this.$scope.$apply();

      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
      expect(this.view.find(LINE_LABEL_INPUT).val()).toEqual('1234 - someone@some.com');
      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).toExist();
      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).not.toBeChecked();
    });

    it('update line label', function () {
      this.view.find(LINE_LABEL_INPUT).val('new label').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('new label', false);
    });

    it('update line label checkbox disabled', function () {
      this.$scope.showApplyToAllSharedLines = true;
      this.$scope.applyToAllSharedLines = false;
      this.$scope.disableCheckBox = true;
      this.$scope.$apply();

      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).not.toBeChecked();
      this.view.find(APPLY_TO_ALL_CHECK_BOX).click();
      this.view.find(LINE_LABEL_INPUT).val('new label').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('new label', false);
    });

    xit('update line label which enables checkbox then change label again', function () {
      this.$scope.showApplyToAllSharedLines = true;
      this.$scope.applyToAllSharedLines = true;
      this.$scope.disableCheckBox = true;
      this.$scope.$apply();

      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).toBeChecked();
      this.view.find(LINE_LABEL_INPUT).val('new label').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('new label', true);
      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).toBeChecked();
      this.view.find(APPLY_TO_ALL_CHECK_BOX).click();
      expect(this.view.find(APPLY_TO_ALL_CHECK_BOX)).not.toBeChecked();
      this.view.find(LINE_LABEL_INPUT).val('new label2').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('new label2', false);
    });
  });

});
