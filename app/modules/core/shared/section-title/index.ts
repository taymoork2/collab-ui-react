import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import { SectionTitleComponent } from './section-title.component';
import './section-title.scss';

export default angular
  .module('core.shared.section-title', [
    collabUiModuleName,
    ngTranslateModuleName,
  ])
  .component('sectionTitle', new SectionTitleComponent())
  .name;
