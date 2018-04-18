class HcsEditSwprofileDirective implements ng.IDirective {
  public template = require('./hcs-edit-swprofile.html');
  public scope = true;
  public restrict = 'E';
}

export const HcsEditSwprofileDirectiveFactory: ng.IDirectiveFactory = () => new HcsEditSwprofileDirective();
