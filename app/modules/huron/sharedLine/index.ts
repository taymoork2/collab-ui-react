import { SharedLineComponent } from './sharedLine.component';

export * from './sharedLine';

export default angular
  .module('huron.shared-line', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
  ])
  .component('ucSharedLine', new SharedLineComponent())
  .name;