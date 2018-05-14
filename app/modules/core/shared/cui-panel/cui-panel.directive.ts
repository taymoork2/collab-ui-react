export class CuiPanelDirective implements ng.IDirective {
  public restrict = 'E';
  public scope = {
    type: '@type',
  };
  public transclude = true;
  public template = `
    <div class="cui">
      <div class="cui-panel cui-panel--full" ng-class="type === 'form' ? 'cui-panel--form' : 'cui-panel--message'" ng-transclude>
      </div>
    </div>
  `;
}

export const CuiPanelDirectiveFactory: ng.IDirectiveFactory = () =>
  new CuiPanelDirective();
