import { AccountLinkingBannerComponent } from './account-linking-banner.component';
import './account-linking-banner.component.scss';

export default angular
  .module('account-linking.banner', [
    require('@collabui/collab-ui-ng').default,
  ])

  .component('accountLinkingBanner', new AccountLinkingBannerComponent())
  .name;
