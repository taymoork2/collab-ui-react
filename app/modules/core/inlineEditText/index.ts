import './inlineEditText.scss';
import focusModuleName from 'modules/core/focus';
import csInputModuleName from '@collabui/collab-ui-ng/bundles/directives/input';
import proPackModuleName from 'modules/core/proPack';
import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    require('@collabui/collab-ui-ng').default,
    csInputModuleName,
    focusModuleName,
    proPackModuleName,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
