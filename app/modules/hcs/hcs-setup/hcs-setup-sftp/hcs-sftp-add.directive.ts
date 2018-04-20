class HcsSftpAddDirective implements ng.IDirective {
  public template = require('./hcs-sftp-add.html');
  public scope = true;
  public restrict = 'E';
}

export const HcsSftpAddDirectiveFactory: ng.IDirectiveFactory = () => new HcsSftpAddDirective();
