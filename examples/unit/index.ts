import * as ngResource from 'angular-resource';

import { ExampleComponent } from './example.component';
import { ExampleService } from './example.service';

export default angular
  .module('atlas.example', [
    ngResource,
  ])
  .component('atlasExample', new ExampleComponent())
  .service('ExampleService', ExampleService)
  .name;
