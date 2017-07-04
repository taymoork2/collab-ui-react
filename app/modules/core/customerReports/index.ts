require('./webexReports/_webex-reports.scss');

export default angular
  .module('core.customer-reports', [
    require('modules/core/scripts/services/authinfo'),
  ])
  .name;
