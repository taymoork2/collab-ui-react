export class CrActionCardController implements ng.IComponentController {
}

export class CrActionCardComponent implements ng.IComponentOptions {
  public controller = CrActionCardController;
  public template = require('./cr-action-card.html');
  public transclude = {
    header: 'crActionCardHeader',
    section: 'crActionCardSection',
    footer: '?crActionCardFooter',
  };
}
