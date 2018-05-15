import { KeywordsSectionComponent } from './keywords-section.component';

require('./_keywords-section.scss');

export default angular
  .module('Hercules')
  .component('keywordsSection', new KeywordsSectionComponent())
  .name;
