export class CrActionCardsContainerController implements ng.IComponentController {
}

export class CrActionCardsContainerComponent implements ng.IComponentOptions {
  public controller = CrActionCardsContainerController;
  public template = require('./cr-action-cards-container.html');
  public transclude = true;
}
