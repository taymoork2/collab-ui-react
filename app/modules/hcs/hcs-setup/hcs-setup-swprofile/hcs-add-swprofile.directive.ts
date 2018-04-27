class HcsAddSwprofileDirective implements ng.IDirective {
  public template = require('./hcs-add-swprofile.html');
  public scope = true;
  public restrict = 'E';
}

export const HcsAddSwprofileDirectiveFactory: ng.IDirectiveFactory = () => new HcsAddSwprofileDirective();
