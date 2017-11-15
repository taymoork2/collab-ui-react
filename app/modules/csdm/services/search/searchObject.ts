import * as _ from 'lodash';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';
import { FieldQuery, OperatorAnd, SearchElement } from './searchElement';

enum Aggregate {
  connectionStatus, product, productFamily, activeInterface, errorCodes, upgradeChannel, software, tag,
}

export class SearchObject {

  public query: string;
  public aggregates?: string[] = [
    Aggregate[Aggregate.product],
    Aggregate[Aggregate.connectionStatus],
    Aggregate[Aggregate.productFamily],
    Aggregate[Aggregate.activeInterface],
    // Aggregate[Aggregate.errorCodes],
    Aggregate[Aggregate.software],
    Aggregate[Aggregate.upgradeChannel],
  ];

  public size: number = 20;
  public from: number = 0;
  public sortField: string = Aggregate[Aggregate.connectionStatus];
  public sortOrder: string = 'asc';
  public hasError: boolean;
  public lastGoodQuery: SearchElement;
  private parsedQuery: SearchElement;
  public currentFilterValue: string;

  private constructor(private queryParser: QueryParser) {
  }

  public static createWithQuery(queryParser: QueryParser, query: string): SearchObject {
    const so = new SearchObject(queryParser);
    so.setQuery(query);
    return so;
  }

  public nextPage() {
    this.from += 20;
  }

  public removeSearchElement(elementToRemove: SearchElement) {
    if (!this.parsedQuery) {
      return;
    }

    if (!elementToRemove) {
      return;
    }

    if (elementToRemove.getParent() && elementToRemove.getParent().getExpressions()) {
      const index = elementToRemove.getParent().getExpressions().indexOf(elementToRemove, 0);
      if (index > -1) {
        elementToRemove.getParent().getExpressions().splice(index, 1);
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

  public hasAnyBulletOrEditedText(): boolean {
    const anyElementWithText =  SearchObject.findFirstElementMatching(this.parsedQuery,
        se => se instanceof FieldQuery && se.toQuery().length > 0);

    return anyElementWithText != null;
  }

  public setSortOrder(field: string, order: string) {
    this.sortField = field;
    this.sortOrder = order;
    this.from = 0;
  }

  public setQuery(query: string, alreadyParsedQuery?: SearchElement) {
    try {
      this.query = query;
      this.parsedQuery = alreadyParsedQuery || this.queryParser.parseQueryString(query);
      this.from = 0;
      this.hasError = false;
      this.lastGoodQuery = _.cloneDeep(this.parsedQuery);
    } catch (error) {
      this.hasError = true;
    }
  }

  public setWorkingElementText(translatedQuery: string) {
    const alreadyEdited =  SearchObject.findFirstElementMatching(this.parsedQuery, se => se.isBeingEdited());
    if (_.isEmpty(translatedQuery) && alreadyEdited) {
      this.removeSearchElement(alreadyEdited);
    } else {
      try {
        const parsedNewQuery = this.queryParser.parseQueryString(translatedQuery);
        this.hasError = false;
        parsedNewQuery.setBeingEdited(true);

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
  }

  public submitWorkingElement() {
    const alreadyEdited =  SearchObject.findFirstElementMatching(this.parsedQuery, se => se.isBeingEdited());
    if (alreadyEdited) {
      alreadyEdited.setBeingEdited(false);
    }
    if (alreadyEdited instanceof OperatorAnd) {
      alreadyEdited.tryFlattenIntoParent();
    }
  }

  private static findFirstElementMatching(element: SearchElement, matchFunction: (se: SearchElement) => boolean): SearchElement | null {
    if (!element) {
      return null;
    }
    if (matchFunction(element)) {//element.isBeingEdited()) {
      return element;
    }
    if (element.getExpressions().length < 1) {
      return null;
    }
    return _.first(_.map(element.getExpressions(), (e) => {
      return SearchObject.findFirstElementMatching(e, matchFunction);
    }).filter(e => e != null));
  }

  public addSearchElement(translatedQuery: string) {
    const parsedNewQuery = this.queryParser.parseQueryString(translatedQuery);
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

  public getTranslatedSearchElement(deviceSearchTranslator: SearchTranslator | null): SearchElement | null {

    const query = (this.lastGoodQuery instanceof OperatorAnd && this.lastGoodQuery.getExpressions().length === 0)
      ? null
      : this.lastGoodQuery;

    const translatedQuery = (query && deviceSearchTranslator)
      ? deviceSearchTranslator.translateQuery(query)
      : query;

    if (this.currentFilterValue) {
      const parsedFilter = this.queryParser.parseQueryString(this.currentFilterValue);
      if (translatedQuery) {
        return new OperatorAnd([translatedQuery, parsedFilter]);
      } else {
        return this.queryParser.parseQueryString(this.currentFilterValue);
      }
    } else {
      return translatedQuery;
    }
  }

  public getTranslatedQueryString(deviceSearchTranslator: SearchTranslator | null): string {
    const translatedQuery = this.getTranslatedSearchElement(deviceSearchTranslator);
    return translatedQuery ? translatedQuery.toQuery() : '';
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
}
