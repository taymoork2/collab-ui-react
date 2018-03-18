import './cr-table.scss';

export class CrTableController implements ng.IComponentController {
}

export class CrTableComponent implements ng.IComponentOptions {
  public controller = CrTableController;
  public template = require('./cr-table.html');
  public bindings = {
    tableRecords: '<',
    tableFields: '<',
  };
}
