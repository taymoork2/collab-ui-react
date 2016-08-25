import directoryNumberModule from './directoryNumber.component';

describe('Component: directoryNumber', () => {
  const INTERNAL_LABEL = 'label[for="internalNumber"]';
  const INTERNAL_SELECT = '.csSelect-container[name="internalNumber"]';
  const EXTERNAL_LABEL = 'label[for="externalNumber"]';
  const EXTERNAL_SELECT = '.csSelect-container[name="externalNumber"]';
  const DROPDOWN_FILTER = '.dropdown-menu input.select-filter';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const ESN_NUMBER = '.esn-number-field';

  beforeEach(function () {
    this.initModules(directoryNumberModule);
    this.injectDependencies(
      '$scope',
      '$timeout'
    );
    this.$scope.esnPrefix = '7100';
    this.$scope.internalOptions = [{
      pattern: '12345',
      uuid: '55555',
    }, {
      pattern: '67890',
      uuid: '66666',
    }, {
      pattern: '75023',
      uuid: '77777',
    }];
    this.$scope.internalRefreshFn = jasmine.createSpy('internalRefreshFn');
    this.$scope.externalOptions = [{
      pattern: '+12345',
      uuid: '88888',
    }, {
      pattern: '+67890',
      uuid: '99999',
    }];
    this.$scope.externalRefreshFn = jasmine.createSpy('externalRefreshFn');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucDirectoryNumber', {
      showInternalExtensions: 'showInternalExtensions',
      esnPrefix: 'esnPrefix',
      internalSelected: 'internalSelected',
      internalOptions: 'internalOptions',
      internalRefreshFn: 'internalRefreshFn(filter)',
      externalSelected: 'externalSelected',
      externalOptions: 'externalOptions',
      externalRefreshFn: 'externalRefreshFn(filter)',
      onChangeFn: 'onChangeFn(internalNumber, externalNumber)',
    });
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
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.internalOptions[0],
        undefined
      );
    });

    it('should invoke internalRefreshFn on filter change', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.internalRefreshFn).toHaveBeenCalledWith('search value');
    });

    it('should have an external extension select with options', function () {
      expect(this.view.find(EXTERNAL_LABEL)).toHaveText('directoryNumberPanel.externalNumberLabel');
      expect(this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('+12345');
      expect(this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('+67890');
    });

    it('should invoke onChangeFn with externalNumber on option click', function () {
      this.view.find(EXTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        undefined,
        this.$scope.externalOptions[0]
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
      expect(this.view.find(ESN_NUMBER)).toContainText(this.$scope.esnPrefix + this.$scope.internalOptions[0].pattern);
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
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0).click(); // has matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.internalOptions[0],
        this.$scope.externalOptions[0]
      );

      this.$scope.onChangeFn.calls.reset();
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2).click(); // does not have matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.internalOptions[2],
        this.$scope.externalOptions[0] // not updated because no matching pattern
      );
    });

    it('should invoke onChangeFn with internalNumber and no matching externalNumber on option click', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(2).click(); // does not have matching externalNumber
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
        this.$scope.internalOptions[2],
        undefined // not defined because no matching pattern and never set
      );
    });

    it('should show ESN from hidden externalNumber', function () {
      this.view.find(INTERNAL_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.view.find(ESN_NUMBER)).toContainText(this.$scope.externalOptions[0].pattern);
    });
  });
});
