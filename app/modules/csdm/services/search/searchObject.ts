import * as _ from 'lodash';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';
import { CollectionOperator, FieldQuery, OperatorAnd, SearchElement } from './searchElement';

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
    Aggregate[Aggregate.errorCodes],
    Aggregate[Aggregate.software],
    Aggregate[Aggregate.upgradeChannel],
    Aggregate[Aggregate.tag],
  ];

  public size: number = 20;
  public from: number = 0;
  public sortField: string = Aggregate[Aggregate.product];
  public sortOrder: string = 'asc';
  public hasError: boolean;
  public lastGoodQuery: SearchElement;
  private parsedQuery: SearchElement;
  private workingElementText: string;

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
      elementToRemove.removeFromParent();
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
    const anyElementWithText = SearchObject.findFirstElementMatching(this.parsedQuery,
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
      if (query === '' && !alreadyParsedQuery) {
        this.workingElementText = '';
      }
    } catch (error) {
      this.hasError = true;
    }
  }

  public getWorkingElementText(): string {
    return this.workingElementText;
  }

  public setWorkingElementText(workingElementText: string): boolean {

    if (this.workingElementText === workingElementText) {
      return false;
    }
    this.workingElementText = workingElementText;
    const alreadyEdited = SearchObject.findFirstElementMatching(this.parsedQuery, se => se.isBeingEdited());
    if (_.isEmpty(workingElementText) && alreadyEdited) {
      this.removeSearchElement(alreadyEdited);
    } else {
      try {
        const parsedNewQuery = this.queryParser.parseQueryString(workingElementText);
        this.hasError = false;
        parsedNewQuery.setBeingEdited(true);

        if (alreadyEdited) {
          if (alreadyEdited === this.parsedQuery) {
            this.parsedQuery = parsedNewQuery;
          } else {
            alreadyEdited.replaceWith(parsedNewQuery);
          }
        } else if (workingElementText) {
          this.addParsedSearchElement(parsedNewQuery, false);
        }
        this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);

      } catch (error) {
        this.hasError = true;
      }
    }
    return true;
  }

  public getWorkingElement(): SearchElement | null {
    return SearchObject.findFirstElementMatching(this.parsedQuery, se => se.isBeingEdited());
  }

  public getWorkingElementRawText(): string {
    return this.workingElementText;
  }

  public submitWorkingElement() {
    const alreadyEdited = SearchObject.findFirstElementMatching(this.parsedQuery, se => se.isBeingEdited());
    if (alreadyEdited) {
      this.removeSearchElement(alreadyEdited);
      const duplicate = SearchObject.findFirstElementMatching(this.parsedQuery, se => {
        return se && !se.isBeingEdited() && se.isEqual(alreadyEdited);
      });
      if (!duplicate) {
        alreadyEdited.setBeingEdited(false);
        this.addParsedSearchElement(alreadyEdited, false);
      }
    }
    this.workingElementText = '';
  }

  public containsElement(element: FieldQuery): boolean {
    const found = SearchObject.findFirstElementMatching(this.parsedQuery, se => {
      if (se instanceof CollectionOperator) {
        return !!se.containsEffectOf(element);
      }
      return se.isEqual(element);
    });
    return !!found;
  }

  public static findFirstElementMatching(element: SearchElement, matchFunction: (se: SearchElement) => boolean): SearchElement | null {
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

  public addParsedSearchElement(newElement: SearchElement, toggle: boolean) {
    if (!this.parsedQuery) {
      this.parsedQuery = newElement;
      this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
      return;
    }
    if (this.parsedQuery.isEqual(newElement)) {
      if (toggle) {
        this.parsedQuery = new OperatorAnd([]);
        this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
      }
      return;
    }

    if (this.parsedQuery instanceof CollectionOperator) {
      const equalEffectElement = this.parsedQuery.containsEffectOf(newElement);
      if (equalEffectElement) {
        if (toggle) {
          equalEffectElement.removeFromParent();
          this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
        }
        return;
      }
      this.parsedQuery.addSubElement(newElement);
    } else {
      this.parsedQuery = new OperatorAnd([this.parsedQuery, newElement]);
    }
    if (!newElement.isBeingEdited()) {
      newElement.tryFlattenIntoParent();
    }
    this.setQuery(this.parsedQuery.toQuery(), this.parsedQuery);
  }

  public getTranslatedSearchElement(deviceSearchTranslator: SearchTranslator | null): SearchElement | null {

    const query = (this.lastGoodQuery instanceof OperatorAnd && this.lastGoodQuery.getExpressions().length === 0)
      ? null
      : this.lastGoodQuery;

    return (query && deviceSearchTranslator)
      ? deviceSearchTranslator.translateQuery(query)
      : query;
  }

  public getTranslatedQueryString(deviceSearchTranslator: SearchTranslator | null): string {
    const translatedQuery = this.getTranslatedSearchElement(deviceSearchTranslator);
    return translatedQuery ? translatedQuery.toQuery() : '';
  }

  public equals(other: SearchObject): boolean {
    return other && other.query === (this.query || '')
      && other.from === this.from
      && other.sortField === this.sortField
      && other.sortOrder === this.sortOrder;
  }

  public clone(): SearchObject {
    return _.cloneDeep(this);
  }
}
