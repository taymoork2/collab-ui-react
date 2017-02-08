import { ClassOfServiceComponent } from './cos.component';

export default angular
  .module('huron.class-of-service', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucCosForm', new ClassOfServiceComponent())
  .name;
