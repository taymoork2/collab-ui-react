import { FieldQuery, OperatorAnd, OperatorOr, SearchElement } from '../services/search/queryParser';
import { SearchTranslator } from '../services/search/searchTranslator';

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
  constructor(private DeviceSearchTranslator: SearchTranslator) {
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

  public getQueryField(): string {
    const searchElement = this.searchElement;
    if (searchElement instanceof FieldQuery) {
      const parent = searchElement.getParent();
      if (parent instanceof OperatorOr) {
        return parent.getFieldNameIfAllSubElementsAreSameField() ? '' : searchElement.getQueryPrefix();
      }
      return searchElement.field + '';
    }
    if (this.searchElement instanceof OperatorOr) {
      return this.searchElement.getFieldNameIfAllSubElementsAreSameField();
    }
    return '';
  }

  public getTranslatedQueryValue() {
    const searchElement = this.searchElement;
    if (searchElement instanceof FieldQuery) {
      return this.DeviceSearchTranslator.translateQueryValue(searchElement.field + '', searchElement.getQueryWithoutField());
    }
    return '';
  }

  public getTranslatedQueryPrefix(): string {
    const searchElement = this.searchElement;

    if (!(searchElement instanceof FieldQuery) || _.isEmpty(searchElement.field)) {
      return '';
    }

    return this.DeviceSearchTranslator.translateQueryField(searchElement.field + '') + searchElement.getMatchOperator();
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
