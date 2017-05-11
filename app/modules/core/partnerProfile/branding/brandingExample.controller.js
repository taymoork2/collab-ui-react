/* @ngInject */
module.exports = function BrandingExampleCtrl($state, $translate) {
  this.modalType = $state.params.modalType;
  this.name = this.modalType === 'Partner' ? $translate.instant('branding.partner') : $translate.instant('branding.customer');
};
