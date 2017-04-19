import './inlineEditText.scss';
import focusModule from 'modules/core/focus';
import csInput from 'collab-ui-ng/dist/directives/input';

import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    require('scripts/app.templates'),
    csInput,
    focusModule,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
