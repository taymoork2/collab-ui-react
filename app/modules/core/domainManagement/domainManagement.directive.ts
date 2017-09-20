class DomainManagementDirective implements ng.IDirective {
  public template = require('./domainManagement.tpl.html');
  public scope = true;
  public restrict = 'E';
}

export const DomainManagementDirectiveFactory: ng.IDirectiveFactory = () => new DomainManagementDirective();
