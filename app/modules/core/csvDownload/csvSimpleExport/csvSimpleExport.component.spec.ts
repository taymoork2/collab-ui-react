import testModule from './index';

describe('CsvSimpleExport', () => {

  const EXPORT_STRING = 'EXPORT';
  const EXPORTING_STRING = 'EXPORTING';
  const FILENAME_STRING = 'test-filename.csv';

  function init() {
    this.initModules(testModule);
    this.injectDependencies(
    );

    this.initComponent = (bindings) => {
      this.compileComponent('csvSimpleExport', _.assignIn({
      }, bindings));
    };

    initDependencySpies.apply(this);
    installPromiseMatchers();
  }

  function initDependencySpies() {
  }

  beforeEach(init);

  /////////////////////////////////

  describe('Component', () => {

    it('should initialize to waiting for export state', function () {

      this.initComponent({
        filename: FILENAME_STRING,
        exportTooltip: EXPORT_STRING,
        exportingTooltip: EXPORTING_STRING,
      });

      expect(this.controller.activeTooltip).toEqual(EXPORT_STRING);
      expect(this.controller.exporting).toBeFalsy();
    });

  });


});
