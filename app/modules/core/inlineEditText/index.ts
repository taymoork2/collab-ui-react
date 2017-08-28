import './inlineEditText.scss';
import featureToggle from 'modules/core/featureToggle/index';
import focusModule from 'modules/core/focus';
import csInput from 'collab-ui-ng/dist/directives/input';

import { InlineEditTextComponent } from './inlineEditText.component';

export default angular
  .module('core.inline-edit-text', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    csInput,
    featureToggle,
    focusModule,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
