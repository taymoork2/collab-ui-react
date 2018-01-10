import { AddSuiteComponent } from './addSuite.component';
import './_addSuite.scss';

export default angular.module('hcs.addSuite', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/config/config').default,
])
.component('addSuiteComponent', new AddSuiteComponent())
.name;
