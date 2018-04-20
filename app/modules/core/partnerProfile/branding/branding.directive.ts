// TODO: remove unused code - this directive, partnerProfile.tpl.html, and 'profile' state
class PartnerProfileBrandingDirective implements ng.IDirective {
  public template = require('./branding.tpl.html');
  public scope = true;
  public restrict = 'E';
}

export const PartnerProfileBrandingDirectiveFactory: ng.IDirectiveFactory = () => new PartnerProfileBrandingDirective();
