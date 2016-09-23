import { ExampleComponent } from './example.component';
import { ExampleService } from './example.service';

export default angular
  .module('atlas.example', [
    'atlas.templates',
    require('angular-resource'),
  ])
  .component('atlasExample', new ExampleComponent())
  .service('ExampleService', ExampleService)
  .name;
