import { HuntGroupCallsToSparkAppComponent } from './hunt-group-calls-to-spark-app.component';

export default angular
  .module('huron.hunt-group-calls-to-spark-app', [
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucHuntGroupCallsToSparkApp', new HuntGroupCallsToSparkAppComponent())
  .name;
