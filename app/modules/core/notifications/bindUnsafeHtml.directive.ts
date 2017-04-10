export class BindUnsafeHtml implements ng.IDirective {
  public templateUrl = 'modules/core/notifications/bindUnsafeHtml.tpl.html';

  public static directive() {
    return new BindUnsafeHtml();
  }
}
