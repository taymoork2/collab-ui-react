import './inlineEditText.scss';
import focusModule from 'modules/core/focus';
import csInput from 'collab-ui-ng/dist/directives/input';
import ProPackModule from 'modules/core/proPack';
import { InlineEditTextComponent } from './inlineEditText.component';


export default angular
  .module('core.inline-edit-text', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    csInput,
    focusModule,
    ProPackModule,
  ])
  .component('crInlineEditText', new InlineEditTextComponent())
  .name;
