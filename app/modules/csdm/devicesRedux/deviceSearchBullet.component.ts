import { FieldQuery, OperatorAnd, OperatorOr, SearchElement } from '../services/search/queryParser';

export interface IBulletContainer {
  removeBullet(bullet: SearchElement);

  editBullet(bullet: SearchElement);
}

export class DeviceSearchBullet implements ng.IComponentController {

  //bindings
  public searchElement: SearchElement;
  public bulletContainer: IBulletContainer;
  public isSubLevel: boolean;

  /* @ngInject */
  constructor() {
  }

  public subElements(): SearchElement[] {
    return this.searchElement.getExpressions();
  }

  public collectionOperator(): string {
    if (this.searchElement instanceof OperatorOr) {
      return 'or';
    }
    if (this.searchElement instanceof OperatorAnd) {
      return 'and';
    }
    return '';
  }

  public getQueryPrefix(): string {
    if (this.searchElement instanceof FieldQuery) {
      const parent = this.searchElement.getParent();
      if (parent instanceof OperatorOr) {
        return parent.fieldIfAllSubElementsAreSameField() ? '' : this.searchElement.getQueryPrefix();
      }
      return this.searchElement.getQueryPrefix();
    }
    if (this.searchElement instanceof OperatorOr) {
      return this.searchElement.fieldIfAllSubElementsAreSameField();
    }
    return '';
  }
}

export class DeviceSearchBulletComponent implements ng.IComponentOptions {
  public controller = DeviceSearchBullet;
  public bindings = {
    searchElement: '<',
    bulletContainer: '<',
    isSubLevel: '=',
  };
  public controllerAs = 'bctrl';
  public template = require('modules/csdm/devicesRedux/deviceSearchBullet.html');
}
