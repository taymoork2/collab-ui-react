import testModule from './index';

describe('CsvSimpleExport', () => {

  const ANCHOR_STRING = 'myAnchor';
  const CSV_DATA = [{ name: 'Name Header', value: 'Value Header' }];
  const EXPORT_STRING = 'EXPORT';
  const EXPORTING_STRING = 'EXPORTING';
  const FILENAME_STRING = 'test-filename.csv';

  function init() {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
    );

    this.initComponent = (bindings) => {
      this.compileComponent('csvSimpleExport', _.assignIn({
      }, bindings));
    };

    installPromiseMatchers();
  }

  beforeEach(init);

  /////////////////////////////////

  describe('Component', () => {
    it('should initialize with default values', function () {
      this.initComponent({});

      expect(this.controller.anchorText).toBeUndefined();
      expect(this.controller.filename).toBeUndefined();
      expect(this.controller.exportToolTip).toBeUndefined();
      expect(this.controller.exportingToolTip).toBeUndefined();
      expect(this.controller.icon).toBe('icon-content-share');
      expect(this.controller.tooltipPlacement).toBeUndefined();
      expect(this.controller.onExport()).toBeUndefined();
      expect(this.controller.activeToolTip).toBeUndefined();
      expect(this.controller.exporting).toBe(false);
      expect(this.controller.exportedData).toEqual([]);
      expect(this.controller.stubId).toBe('export-stub');
    });

    it('should initialize with set values', function () {
      this.initComponent({
        filename: FILENAME_STRING,
        exportTooltip: EXPORT_STRING,
        exportingTooltip: EXPORTING_STRING,
      });

      expect(this.controller.activeTooltip).toEqual(EXPORT_STRING);
      expect(this.controller.exporting).toBe(false);
    });

    it('should do an export when csv-simple-export elem clicked', function() {
      const fake = {
        myExport: () => {
          expect(this.controller.exporting).toBe(true);
          return this.$q.resolve(CSV_DATA);
        },
      };
      spyOn(fake, 'myExport').and.callThrough();

      this.initComponent({
        anchorText: ANCHOR_STRING,
        filename: FILENAME_STRING,
        exportTooltip: EXPORT_STRING,
        exportingTooltip: EXPORTING_STRING,
      });

      this.controller.onExport = fake.myExport;
      this.view.find('.csv-simple-export').click().trigger('click');
      this.$scope.$apply();

      expect(this.view.find('span').text().indexOf(ANCHOR_STRING) !== -1).toBe(true); // anchor text present
      expect(fake.myExport).toHaveBeenCalled(); // export attempted
      expect(this.controller.exportedData).toEqual(CSV_DATA); // export data stored
    });
  });
});
