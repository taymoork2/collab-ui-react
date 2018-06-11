import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import { SectionTitleComponent } from './sectionTitle.component';
import './sectionTitle.scss';

export default angular
  .module('core.section-title', [
    collabUiModuleName,
    ngTranslateModuleName,
  ])
  .component('sectionTitle', new SectionTitleComponent())
  .name;
