export class CrTotalTileContainerDirective implements ng.IDirective {
  public restrict = 'E';
  public scope = true;
  public template = require('./cr-total-tile-container.html');
  public transclude = true;
}

export const CrTotalTileContainerDirectiveFactory: ng.IDirectiveFactory  = () => new CrTotalTileContainerDirective();
