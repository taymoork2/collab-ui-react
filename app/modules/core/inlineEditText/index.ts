import './inlineEditText.scss';

import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    'atlas.templates',
    'collab.ui',
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
