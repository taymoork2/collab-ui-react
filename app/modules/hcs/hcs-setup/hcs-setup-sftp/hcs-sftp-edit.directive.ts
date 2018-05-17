class HcsSftpEditDirective implements ng.IDirective {
  public template = require('./hcs-sftp-edit.html');
  public scope = true;
  public restrict = 'E';
}

export const HcsSftpEditDirectiveFactory: ng.IDirectiveFactory = () => new HcsSftpEditDirective();
