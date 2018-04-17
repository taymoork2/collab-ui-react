import './hcs-licenses-plm-report.scss';
import { HcsLicensesPlmReportComponent } from './hcs-licenses-plm-report.component';
export default angular
  .module('hcs.licensePlmReport', [])
  .component('hcsLicensesPlmReport', new HcsLicensesPlmReportComponent())
  .name;
