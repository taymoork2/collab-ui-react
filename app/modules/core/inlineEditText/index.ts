import './inlineEditText.scss';
import focusModule from 'modules/core/focus';

import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    'atlas.templates',
    'collab.ui',
    focusModule,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
