import { SearchObject } from './searchObject';
import { QueryParser } from './queryParser';
import { isUndefined } from 'util';
import { NormalizeHelper } from '../../../core/l10n/normalize.helper';
import { SearchTranslator } from './searchTranslator';

export abstract class SearchElement {

  private parent: SearchElement;
  protected _isBeingEdited: boolean;

  public isCollection(): boolean {
    return (this instanceof OperatorAnd) || (this instanceof OperatorOr);
  }

  public getExpressions(): SearchElement[] {
    if (this instanceof OperatorAnd) {
      return this.and;
    }
    if (this instanceof OperatorOr) {
      return this.or;
    }
    return [];
  }

  public replaceWith(newElement: SearchElement) {
    this.parent.getExpressions()[this.parent.getExpressions().indexOf(this)] = newElement;
    newElement.setParent(this.parent);
  }

  public setParent(parent: SearchElement) {
    this.parent = parent;
  }

  public getParent() {
    return this.parent;
  }

  public isMatching(matcher: (value: SearchElement) => boolean) {
    return matcher(this);
  }

  public abstract isEqual(other: SearchElement): boolean;

  public abstract toQuery(translator?: SearchTranslator, toStrings?: IToStrings<string>): string;

  public abstract getCommonField(): string;

  public abstract getCommonMatchOperator(): string;

  public abstract tryFlattenIntoParent();

  public abstract toJSON(): any;

  public isBeingEdited(): boolean {
    return this._isBeingEdited;
  }

  public setBeingEdited(beingEdited: boolean) {
    this._isBeingEdited = beingEdited;
  }

  public getRootPill(): SearchElement {
    const myParent = this.getParent();

    if (!myParent || !myParent.getParent()) {
      return this;
    } else {
      return myParent.getRootPill();
    }
  }

  public removeFromParent() {
    const index = this.parent.getExpressions().indexOf(this, 0);
    if (index > -1) {
      this.parent.getExpressions().splice(index, 1);
      if (this.parent.getExpressions().length === 0 && this.parent.parent) {
        this.parent.removeFromParent();
      }
      if (this.parent.getExpressions().length === 1 && this.parent.parent) {
        this.parent.replaceWith(this.parent.getExpressions()[0]);
      }
    }
  }

  public abstract matches(value: string, field?: string): boolean;
}

export interface IToStrings<T> {
  fieldToString?: (query: FieldQuery) => T;
  collectionToString?: (strings: T[]) => T;
}

export class ToString {
  public static toString(translator?: SearchTranslator) {
    return ( fq: FieldQuery) => {
      const query = fq.toQueryComponents(translator);
      return query.prefix + FieldQuery.addQuotesIfNeeded(query.query);
    };
  }

  public static ToStringWithoutField() {
    return ( fq: FieldQuery) => {
      return fq.toQueryComponents().query;
    };
  }
}

export class SearchMatchers {

  public static FieldEmpty() {
    return (value: FieldQuery) => {
      return value && !value.field;
    };
  }
  public static FieldEqual(field: string) {
    return (value: FieldQuery) => {
      return value && _.isEqual(value.field, field);
    };
  }
  public static FieldEqualOrEmpty(field: string) {
    return (value: FieldQuery) => {
      return value && (!value.field || _.isEqual(value.field, field));
    };
  }

  public static FirstOrNone(fieldMatcher: (value: FieldQuery) => boolean): (value: SearchElement) => boolean {
    return (value) => {
      if (value instanceof FieldQuery) {
        return fieldMatcher(value);
      }
      const first = _.first(value.getExpressions());
      return first instanceof FieldQuery
        && fieldMatcher(first)
        && _.every(value.getExpressions(),
          child => child instanceof FieldQuery && fieldMatcher(child) || child.isMatching(SearchMatchers.FirstOrNone(fieldMatcher)));
    };
  }

  public static FirstAndAll(firstFieldMatching: (value: FieldQuery) => boolean, allFieldsMatching: (value: FieldQuery) => boolean) {
    return (value: SearchElement) => {
      if (value instanceof FieldQuery) {
        return firstFieldMatching(value);
      }
      const first = _.first(value.getExpressions());
      return first instanceof FieldQuery
        && firstFieldMatching(first)
        && _.every(value.getExpressions(),
          child => child instanceof FieldQuery && allFieldsMatching(child) || child.isMatching(SearchMatchers.FirstAndAll(firstFieldMatching, allFieldsMatching)));
    };
  }

  public static All(fieldMatcher: (value: FieldQuery) => boolean) {
    return (value: SearchElement) => {
      if (value instanceof FieldQuery) {
        return fieldMatcher(value);
      }
      return _.every(value.getExpressions(),
        child => child instanceof FieldQuery && fieldMatcher(child) || child.isMatching(SearchMatchers.All(fieldMatcher)));
    };
  }
}

export abstract class CollectionOperator extends SearchElement {
  private subElements: SearchElement[];

  constructor(subElements: SearchElement[]) {
    super();
    this.subElements = subElements;
  }

  public toQuery(translator?: SearchTranslator, toStrings: IToStrings<string> = {}): string {
    const joinedQuery = _.join(_.map(this.subElements, (e) => e.toQuery(translator, toStrings)), ' ' + this.getOperator() + ' ');

    if (this.getParent()) {
      return '(' + joinedQuery + ')';
    } else {
      return joinedQuery;
    }
  }

  public addSubElement(newElement: SearchElement) {
    this.subElements.push(newElement);
    newElement.setParent(this);
  }

  public abstract containsEffectOf(element: SearchElement): SearchElement | undefined;

  protected abstract getOperator(): string;
}

export class FieldQuery extends SearchElement {
  public static readonly QueryTypeExact: string = 'exact';
  public query: string;
  public field?: string;
  public type?: string;

  constructor(query: string, field?: string, queryType?: string) {
    super();
    this.query = query;
    this.field = field;
    this.type = queryType;
  }

  public getQueryPrefix(translator?: SearchTranslator): string {
    return (this.field) ? (translator ? translator.translateQueryField(
      this.field) : this.field) + this.getCommonMatchOperator() : '';
  }

  public getCommonField(): string {
    return this.field || '';
  }

  public getQueryWithoutField(): string {
    return FieldQuery.addQuotesIfNeeded(this.query);
  }

  public getCommonMatchOperator(): string {
    return this.type === FieldQuery.QueryTypeExact ? '=' : ':';
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof FieldQuery)) {
      return false;
    }
    return this.getCommonMatchOperator() === other.getCommonMatchOperator()
      && _.isEqual(_.toLower(this.field), _.toLower(other.field))
      && _.isEqual(_.toLower(this.query), _.toLower(other.query));
  }

  public tryFlattenIntoParent() {
    const myParent = this.getParent();

    if (this.field && this.type === FieldQuery.QueryTypeExact && myParent instanceof OperatorAnd) {

      if (this.field !== QueryParser.Field_Tag && this.field !== QueryParser.Field_ErrorCodes) {

        const otherSameField = SearchObject.findFirstElementMatching(myParent, (se) => {
          return se !== this && se.getParent() === myParent && se instanceof FieldQuery && _.isEqual(
            _.toLower(se.field), _.toLower(this.field)) && se.type === FieldQuery.QueryTypeExact;
        });

        if (otherSameField) {
          this.removeFromParent();
          const newOrElement = new OperatorOr([otherSameField, this], false);
          otherSameField.replaceWith(newOrElement);
          otherSameField.setParent(newOrElement);
          this.setParent(newOrElement);
        } else {
          const otherSameFieldOr = SearchObject.findFirstElementMatching(myParent, (se) => {
            return se instanceof OperatorOr && se.getParent() === myParent && _.every(se.or,
              (ose) => ose instanceof FieldQuery && _.isEqual(_.toLower(ose.field),
                _.toLower(this.field)) && ose.type === FieldQuery.QueryTypeExact);
          });
          if (otherSameFieldOr instanceof OperatorOr) {
            this.removeFromParent();
            otherSameFieldOr.or.push(this);
            this.setParent(otherSameFieldOr);
          }
        }
      }
    }
  }

  public matches(value: string, field?: string): boolean {

    if (this.field) {
      return (!field || _.isEqual(_.toLower(NormalizeHelper.stripAccents(this.field)),
        _.toLower(NormalizeHelper.stripAccents(field))))
        && _.includes(_.toLower(NormalizeHelper.stripAccents(value)),
          _.toLower(NormalizeHelper.stripAccents(this.query)));
    }
    return _.includes(_.toLower(value), _.toLower(this.query));
  }

  public toQuery(translator?: SearchTranslator,
                 { fieldToString: toString = ToString.toString(translator) }: IToStrings<string> = {}): string {
    return toString(this);
  }

  public toQueryComponents(translator?: SearchTranslator): { prefix: string, query: string } {
    if (translator && this.field && this.type === FieldQuery.QueryTypeExact) {
      return {
        prefix: this.getQueryPrefix(translator),
        query: translator.lookupTranslatedQueryValueDisplayName(this.query, this.field),
      };
    }
    return { prefix: this.getQueryPrefix(translator), query: this.query };
  }

  public toJSON(): any {
    return {
      query: this.query,
      field: this.field,
      type: this.type,
    };
  }

  public static addQuotesIfNeeded(query: string): string {
    if (query.search(/\s|\(/) > 0) {
      return '"' + query + '"';
    }
    return query;
  }
}

export class OperatorAnd extends CollectionOperator {

  constructor(andedElements: SearchElement[], takeOwnerShip: boolean = true) {
    super(andedElements);
    this.and = andedElements;
    if (takeOwnerShip) {
      _.each(andedElements, s => s.setParent(this));
    }
  }

  public and: SearchElement[];

  protected getOperator(): string {
    return 'and';
  }

  public getCommonField(): string {
    return '';
  }

  public getCommonMatchOperator(): string {
    return '';
  }

  public matches(value: string, field?: string): boolean {
    return _.every(this.and, se => se.matches(value, field));
  }

  public containsEffectOf(element: SearchElement): SearchElement | undefined {
    return _(this.and)
      .map(e => {
        if (e.isEqual(element)) {
          return e;
        }
        if (e instanceof CollectionOperator) {
          return e.containsEffectOf(element);
        }
        return undefined;
      })
      .reject(e => isUndefined(e))
      .head();
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof OperatorAnd)) {
      return false;
    }
    return this.and.length === other.and.length && _.differenceWith(this.and, other.and, (a, b) => {
      return a != null && a.isEqual(b);
    }).length === 0;
  }

  public toJSON(): any {
    return {
      and: this.and,
    };
  }

  public tryFlattenIntoParent() {
    const myParent = this.getParent();
    if (myParent instanceof OperatorAnd) {
      const spliceParams: any[] = [myParent.and.indexOf(this), 1];
      _.each(this.and, s => s.setParent(this.getParent()));
      Array.prototype.splice.apply(myParent.and, spliceParams.concat(this.and));
    }
  }
}

export class OperatorOr extends CollectionOperator {

  constructor(oredElements: SearchElement[], takeOwnerShip: boolean = true) {
    super(oredElements);
    this.or = oredElements;
    if (takeOwnerShip) {
      _.each(oredElements, s => s.setParent(this));
    }
  }

  public or: SearchElement[];

  protected getOperator(): string {
    return 'or';
  }

  public matches(value: string, field?: string): boolean {
    return _.isEmpty(this.or) || _.some(this.or, se => se.matches(value, field));
  }

  public containsEffectOf(element: SearchElement): SearchElement | undefined {
    return _(this.or)
      .map(e => {
        if (e.isEqual(element)) {
          return e;
        }
        if (e instanceof OperatorOr) {
          return e.containsEffectOf(element);
        }
        return undefined;
      })
      .reject(e => isUndefined(e))
      .head();
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof OperatorOr)) {
      return false;
    }
    return this.or.length === other.or.length && _.differenceWith(this.or, other.or, (a, b) => {
      return a != null && a.isEqual(b);
    }).length === 0;
  }

  public getCommonMatchOperator(): string {
    if (this.or.length > 0) {
      const firstSubExpr = this.or[0];
      if (firstSubExpr instanceof FieldQuery) {
        if (_.every(this.or,
          (fq) => {
            return fq instanceof FieldQuery
              && _.isEqual(_.toLower(firstSubExpr.field), _.toLower(fq.field))
              && _.isEqual(firstSubExpr.getCommonMatchOperator(), fq.getCommonMatchOperator());
          })) {
          return firstSubExpr.getCommonMatchOperator();
        }
      }
    }
    return '';
  }

  public getCommonField(): string {
    if (this.or.length > 0) {
      const firstSubExpr = this.or[0];
      if (firstSubExpr instanceof FieldQuery) {
        if (_.every(this.or,
          (fq) => {
            return fq instanceof FieldQuery
              && _.isEqual(_.toLower(firstSubExpr.field), _.toLower(fq.field))
              && _.isEqual(firstSubExpr.getCommonMatchOperator(), fq.getCommonMatchOperator());
          })) {
          return firstSubExpr.field || '';
        }
      }
    }
    return '';
  }

  public toJSON(): any {
    return {
      or: this.or,
    };
  }

  public tryFlattenIntoParent() {
  }
}
