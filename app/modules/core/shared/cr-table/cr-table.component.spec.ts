import moduleName from './index';
import { CrTableController } from './cr-table.component';

type Test = atlas.test.IComponentTest<CrTableController, {}, {}>;

describe('Component: crTable:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies();
  });

  describe('primary behaviors (view):', () => {
    enum View {
      TABLE = '.cr-table',
    }
    const tableMetadata = [{
      fieldName: 'field1',
      fieldL10nLabel: 'field1',
    }, {
      fieldName: 'field2',
      fieldL10nLabel: 'field2',
    }];

    const tableRecords = [{
      field1: 'field 10',
      field2: 'field 20',
    }, {
      field1: 'field 11',
      field2: 'field 22',
    }];

    beforeEach(function (this: Test) {
      this.compileComponent('crTable', {
        tableRecords: tableRecords,
        tableFields: tableMetadata,
      });
    });

    it('should render a table with two rows and two columns', function (this: Test) {
      expect(this.view.find(View.TABLE).length).toBe(1);
      expect(this.view.find('.cr-table .cr-table__column--header').length).toBe(2);
      expect(angular.element(this.view.find('.cr-table .cr-table__column--header')[0])[0].innerText).toBe('field1');
      expect(angular.element(this.view.find('.cr-table .cr-table__column--header')[1])[0].innerText).toBe('field2');
      //two rows
      const secondRow = angular.element(this.view.find('.cr-table .cr-table__body .cr-table__row').get(1));
      expect(secondRow.find('.cr-table__column').length).toBe(2);
    });

    it('should display the values and assign column classes correctly', function (this: Test) {
      const secondRow = angular.element(this.view.find('.cr-table .cr-table__body .cr-table__row').get(1));
      expect(secondRow.find('.cr-table__column').get(1).innerHTML).toBe('field 22');
      expect(secondRow.find('.cr-table__column').get(1).classList).toContain('cr-table__column-not-first');
      expect(secondRow.find('.cr-table__column').get(1).classList).not.toContain('cr-table__column-first');
      expect(secondRow.find('.cr-table__column').get(1).classList).toContain('cr-table__column-1');
      expect(secondRow.find('.cr-table__column').get(0).classList).not.toContain('cr-table__column-not-first');
      expect(secondRow.find('.cr-table__column').get(0).classList).toContain('cr-table__column-first');
      expect(secondRow.find('.cr-table__column').get(0).classList).toContain('cr-table__column-0');
    });
  });
});
