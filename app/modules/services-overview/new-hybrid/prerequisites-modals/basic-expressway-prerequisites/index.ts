import { BasicExpresswayPrerequisitesComponent } from './basic-expressway-prerequisites.component';

require('./_basic-expressway-prerequisites.scss');

export default angular
  .module('Hercules')
  .component('basicExpresswayPrerequisites', new BasicExpresswayPrerequisitesComponent())
  .name;
