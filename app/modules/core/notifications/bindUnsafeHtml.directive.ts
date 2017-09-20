export class BindUnsafeHtml implements ng.IDirective {
  public template = require('modules/core/notifications/bindUnsafeHtml.tpl.html');

  public static directive() {
    return new BindUnsafeHtml();
  }
}
