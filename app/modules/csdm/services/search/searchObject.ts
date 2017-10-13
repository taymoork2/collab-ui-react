import * as _ from 'lodash';
import { SearchElement, QueryParser, OperatorAnd } from './queryParser';
import { SearchTranslator } from './searchTranslator';

enum Aggregate {
  connectionStatus, product, productFamily, activeInterface, errorCodes, upgradeChannel, software,
}

export class SearchObject {

  public query: string;
  public tokenizedQuery: { [key: string]: { searchField: string, query: string, active: boolean } };
  public aggregates?: string = _.join([
    Aggregate[Aggregate.product],
    Aggregate[Aggregate.connectionStatus],
    Aggregate[Aggregate.productFamily],
    Aggregate[Aggregate.activeInterface],
    Aggregate[Aggregate.errorCodes],
    Aggregate[Aggregate.software],
    Aggregate[Aggregate.upgradeChannel],
  ], ',');

  public size: number = 20;
  public from: number = 0;
  public sortField: string = Aggregate[Aggregate.connectionStatus];
  public sortOrder: string = 'asc';
  public hasError: boolean;
  public lastGoodQuery: string;
  private parsedQuery: SearchElement;
  public currentFilterValue: string;

  private constructor() {
  }

  public static createWithQuery(query: string): SearchObject {
    const so = new SearchObject();
    so.setQuery(query);
    return so;
  }

  public nextPage() {
    this.from += 20;
  }

  public removeBullet(bullet: SearchElement) {
    if (!this.parsedQuery) {
      return;
    }

    if (!bullet) {
      return;
    }

    if (bullet.getParent() && bullet.getParent().getExpressions()) {
      const index = bullet.getParent().getExpressions().indexOf(bullet, 0);
      if (index > -1) {
        bullet.getParent().getExpressions().splice(index, 1);
      }

      this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
    } else {
      this.setQuery('');
    }
  }

  public getBullets(): SearchElement[] {
    if (!this.parsedQuery) {
      return [];
    }
    if (this.parsedQuery instanceof OperatorAnd) {
      return this.parsedQuery.getExpressions();
    }
    return [this.parsedQuery];
  }

  public setSortOrder(field: string, order: string) {
    this.sortField = field;
    this.sortOrder = order;
    this.from = 0;
  }

  public setQuery(query: string, alreadyParsedQuery?: SearchElement) {
    try {
      this.query = query;
      this.parsedQuery = alreadyParsedQuery || QueryParser.parseQueryString(query);
      this.from = 0;
      this.hasError = false;
      this.lastGoodQuery = query;
    } catch (error) {
      this.hasError = true;
    }
  }

  public setWorkingElementText(translatedQuery: string) {
    try {

      const parsedNewQuery = QueryParser.parseQueryString(translatedQuery);
      this.hasError = false;
      parsedNewQuery.setBeingEdited(true);

      const alreadyEdited = SearchObject.findEditedElement(this.parsedQuery);
      if (alreadyEdited) {
        if (alreadyEdited === this.parsedQuery) {
          this.parsedQuery = parsedNewQuery;
        } else {
          alreadyEdited.replaceWith(parsedNewQuery);
        }
      } else {
        this.addParsedSearchElement(parsedNewQuery);
      }
      this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
    } catch (error) {
      this.hasError = true;
    }
  }

  public clearWorkingElement() {
    const alreadyEdited = SearchObject.findEditedElement(this.parsedQuery);
    if (alreadyEdited) {
      alreadyEdited.setBeingEdited(false);
    }
    if (alreadyEdited instanceof OperatorAnd) {
      alreadyEdited.tryFlattenIntoParent();
    }
  }

  private static findEditedElement(element: SearchElement): SearchElement | null {
    if (!element) {
      return null;
    }
    if (element.isBeingEdited()) {
      return element;
    }
    if (element.getExpressions().length < 1) {
      return null;
    }
    return _.first(_.map(element.getExpressions(), (e) => {
      return SearchObject.findEditedElement(e);
    }).filter(e => e != null));
  }

  public addSearchElement(translatedQuery: string) {
    const parsedNewQuery = QueryParser.parseQueryString(translatedQuery);
    this.addParsedSearchElement(parsedNewQuery);
    this.setQuery(translatedQuery, this.parsedQuery);
  }

  private addParsedSearchElement(newElement: SearchElement) {
    if (!this.parsedQuery) {
      this.parsedQuery = newElement;
    } else if (this.parsedQuery instanceof OperatorAnd) {
      this.parsedQuery.addSubElement(newElement);
    } else {
      this.parsedQuery = new OperatorAnd([this.parsedQuery, newElement]);
    }
    this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
  }

  public setFilterValue(filterValue: string) {
    this.currentFilterValue = filterValue;
    this.from = 0;
  }

  public getSearchQuery(): string {
    if (this.currentFilterValue) {
      if (this.lastGoodQuery) {
        return '(' + this.lastGoodQuery + ') AND ' + this.currentFilterValue;
      } else {
        return this.currentFilterValue;
      }
    } else {
      return this.lastGoodQuery || '';
    }
  }

  public equals(other: SearchObject): boolean {
    return other && other.query === (this.query || '')
      && other.currentFilterValue === this.currentFilterValue
      && other.from === this.from
      && other.sortField === this.sortField
      && other.sortOrder === this.sortOrder;
  }

  public cloneWithoutFilters(): SearchObject {
    const myClone = this.clone();
    myClone.setFilterValue('');
    myClone.size = 0;
    myClone.from = 0;
    return myClone;
  }

  public clone(): SearchObject {
    return _.cloneDeep(this);
  }

  public translate(DeviceSearchTranslator: SearchTranslator): SearchObject {
    //TODO: use this.parsedQuery.translate() instead!
    const myClone = this.clone();
    myClone.lastGoodQuery = DeviceSearchTranslator.translate(myClone.lastGoodQuery);
    return myClone;
  }
}
