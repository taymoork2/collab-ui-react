import { HsTestToolResultsTableComponent } from './hs-test-tool-results-table.component';

require('./_hs-test-tool-results-table.scss');

export default angular
  .module('Hercules')
  .component('hsTestToolResultsTable', new HsTestToolResultsTableComponent())
  .name;
