import './inlineEditText.scss';
import focusModule from 'modules/core/focus';

import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    focusModule,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
