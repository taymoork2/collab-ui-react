import * as _ from 'lodash';
import { ISearchElement, QueryParser } from './queryParser';

enum Aggregate {
  connectionStatus, product, productFamily, activeInterface, errorCodes, upgradeChannel, software,
}

export enum SearchFields {product, software, ip, serial, mac, displayName, any, connectionStatus, errorCodes}

export class SearchObject {

  public static SearchFields: { [x: string]: string } = {
    [SearchFields[SearchFields.product]]: 'Product',
    [SearchFields[SearchFields.software]]: 'Software',
    [SearchFields[SearchFields.ip]]: 'IP',
    [SearchFields[SearchFields.serial]]: 'Serial',
    [SearchFields[SearchFields.mac]]: 'Mac',
    [SearchFields[SearchFields.connectionStatus]]: 'Status',
    [SearchFields[SearchFields.displayName]]: 'DisplayName',
    [SearchFields[SearchFields.errorCodes]]: 'Error',
    tags: 'Tags',
  };


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
  private parsedQuery: ISearchElement;
  private currentFilterValue: string;

  private constructor() {
  }

  public static createWithQuery(query: string): SearchObject {
    const so = new SearchObject();
    so.setQuery(query);
    return so;
  }

  public nextPage() {
    if (!this.from) {
      this.from = 0;
    }
    this.from += 20;
  }

  public setTokenizedQuery(searchField: string, query: string, active: boolean) {
    if (active) {
      _.forEach(this.tokenizedQuery, (t) => t.active = false);
    }
    this.tokenizedQuery[searchField] = { searchField: searchField, query: query, active: active };
    this.updateQuery();
  }

  private updateQuery() {
    this.query = _
      .chain(this.tokenizedQuery)
      .map((v, k) => {
        return (k === 'any' ? '' : k + ':') + v.query;
      })
      .join(',')
      .value();
  }

  public removeToken(searchField: string) {
    delete this.tokenizedQuery[searchField];
    this.updateQuery();
  }

  public setSortOrder(field: string, order: string) {
    this.sortField = field;
    this.sortOrder = order;
    this.from = 0;
  }

  public setQuery(translatedQuery: string) {
    try {
      this.query = translatedQuery;
      this.parsedQuery = QueryParser.parseQueryString(translatedQuery);
      this.hasError = false;
      this.lastGoodQuery = translatedQuery;
    } catch (error) {
      this.hasError = true;
    }
  }

  public setFilterValue(filterValue: string) {
    this.currentFilterValue = filterValue;
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
    const myClone = _.cloneDeep(this);
    myClone.setFilterValue('');
    myClone.size = 0;
    myClone.from = 0;
    return myClone;
  }
}
