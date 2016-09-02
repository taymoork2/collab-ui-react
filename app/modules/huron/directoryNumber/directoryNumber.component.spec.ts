describe('Component: directoryNumber', () => {
  const INTERNAL_LABEL = 'label[for="internalNumber"]';
  const INTERNAL_SELECT = '.csSelect-container[name="internalNumber"]';
  const EXTERNAL_LABEL = 'label[for="externalNumber"]';
  const EXTERNAL_SELECT = '.csSelect-container[name="externalNumber"]';
  const DROPDOWN_FILTER = '.dropdown-menu input.select-filter';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const ESN_NUMBER = '.esn-number-field';

  let internalNumbers: string[] = [
    '12345',
    '67890',
    '75023'
  ];

  let externalNumbers: string[] = [
    '+12345',
    '+67890'
  ];

  beforeEach(function () {
    this.initModules('huron.directory-number');
    this.injectDependencies(
      '$scope',
      '$timeout'
    );
    this.$scope.esnPrefix;
    this.$scope.internalNumbers;
    this.$scope.internalOptions;
    this.$scope.internalSelected;
    this.$scope.internalRefreshFn = jasmine.createSpy('internalRefreshFn');
    this.$scope.externalNumbers;
    this.$scope.externalOptions;
    this.$scope.externalRefreshFn = jasmine.createSpy('externalRefreshFn');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucDirectoryNumber', {
      showInternalExtensions: 'showInternalExtensions',
      esnPrefix: 'esnPrefix',
      internalSelected: 'internalSelected',
      internalNumbers: 'internalNumbers',
      internalRefreshFn: 'internalRefreshFn(filter)',
      externalSelected: 'externalSelected',
      externalNumbers: 'externalNumbers',
      externalRefreshFn: 'externalRefreshFn(filter)',
      onChangeFn: 'onChangeFn(internalNumber, externalNumber)',
    });

    // This simulates values being set after component has been initialized
    // i.e. during asynchronous data fetching.
    this.$scope.internalNumbers = internalNumbers;
    this.$scope.internalSelected = '12345';
    this.$scope.externalNumbers = externalNumbers;
    this.$scope.esnPrefix = '7100';
    this.$scope.$apply(); // triggers $onChanges lifecycle hook.
  }

  describe('with show internal extensions', () => {
    beforeEach(initComponent);

    it('should have an internal extension select with options', function () {
      expect(this.view.find(INTERNAL_LABEL)).toHaveText('directoryNumberPanel.internalNumberExtension');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('12345');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('67890');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('75023');
    });

    it('should invoke onChangeFn with internalNumber on option click', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.controller.internalOptions[1].value,
        this.controller.externalOptions[0].value
      );
    });

    it('should invoke internalRefreshFn on filter change', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.internalRefreshFn).toHaveBeenCalledWith('search value');
    });

    it('should have an external extension select with options', function () {
      expect(this.view.find(EXTERNAL_LABEL)).toHaveText('directoryNumberPanel.externalNumberLabel');
      expect(this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('directoryNumberPanel.none');
      expect(this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('+12345');
      expect(this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('+67890');
    });

    it('should invoke onChangeFn with externalNumber on option click', function () {
      this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.controller.internalOptions[0].value,
        this.controller.externalOptions[1].value
      );
    });

    it('should invoke externalRefreshFn on filter change', function () {
      this.view.find(EXTERNAL_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.externalRefreshFn).toHaveBeenCalledWith('search value');
    });

    it('should show ESN', function () {
      expect(this.view.find(ESN_NUMBER)).toContainText(this.$scope.esnPrefix);
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.view.find(ESN_NUMBER)).toContainText(this.$scope.esnPrefix + this.controller.internalOptions[0].value);
    });
  });

  describe('without show internal extensions', () => {
    beforeEach(function () {
      this.$scope.showInternalExtensions = false;
    });
    beforeEach(initComponent);

    it('should have an internal select (not labeled extension) with options', function () {
      expect(this.view.find(INTERNAL_LABEL)).toHaveText('directoryNumberPanel.externalNumberLabel');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('12345');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('67890');
      expect(this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('75023');
    });

    it('should invoke onChangeFn with internalNumber and matching externalNumber on option click', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1).click(); // has matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.controller.internalOptions[1].value,
        this.controller.externalOptions[2].value
      );

      this.$scope.onChangeFn.calls.reset();
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2).click(); // does not have matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.controller.internalOptions[2].value,
        this.controller.externalOptions[2].value // not updated because no matching pattern
      );
    });

    it('should invoke onChangeFn with internalNumber and no matching externalNumber on option click', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2).click(); // does not have matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.controller.internalOptions[2].value,
        this.controller.externalOptions[0].value // not defined because no matching pattern and never set
      );
    });

    it('should show ESN from hidden externalNumber', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.view.find(ESN_NUMBER)).toContainText(this.controller.externalOptions[2].value);
    });
  });
});
