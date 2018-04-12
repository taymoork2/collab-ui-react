import { SearchObject } from './searchObject';
import { QueryParser } from './queryParser';
import { isUndefined } from 'util';
import { NormalizeHelper } from '../../../core/l10n/normalize.helper';

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

  public abstract isEqual(other: SearchElement): boolean;

  public abstract toQuery(): string;

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

export abstract class CollectionOperator extends SearchElement {
  private subElements: SearchElement[];

  constructor(subElements: SearchElement[]) {
    super();
    this.subElements = subElements;
  }

  public addSubElement(newElement: SearchElement) {
    this.subElements.push(newElement);
    newElement.setParent(this);
  }

  public abstract containsEffectOf(element: SearchElement): SearchElement | undefined;
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

  public getQueryPrefix(): string {
    return (this.field) ? this.field + this.getCommonMatchOperator() : '';
  }

  public getCommonField(): string {
    return this.field || '';
  }

  public getQueryWithoutField() {
    let innerQuery = this.query;
    if (this.query.search(/\s|\(/) > 0) {
      innerQuery = '"' + innerQuery + '"';
    }
    return innerQuery;
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
          return se !== this && se.getParent() === myParent && se instanceof FieldQuery && _.isEqual(_.toLower(se.field), _.toLower(this.field)) && se.type === FieldQuery.QueryTypeExact;
        });

        if (otherSameField) {
          this.removeFromParent();
          const newOrElement = new OperatorOr([otherSameField, this], false);
          otherSameField.replaceWith(newOrElement);
          otherSameField.setParent(newOrElement);
          this.setParent(newOrElement);
        } else {
          const otherSameFieldOr = SearchObject.findFirstElementMatching(myParent, (se) => {
            return se instanceof OperatorOr && se.getParent() === myParent && _.every(se.or, (ose) => ose instanceof FieldQuery && _.isEqual(_.toLower(ose.field), _.toLower(this.field)) && ose.type === FieldQuery.QueryTypeExact);
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
      return (!field || _.isEqual(_.toLower(NormalizeHelper.stripAccents(this.field)), _.toLower(NormalizeHelper.stripAccents(field))))
        && _.includes(_.toLower(NormalizeHelper.stripAccents(value)), _.toLower(NormalizeHelper.stripAccents(this.query)));
    }
    return _.includes(_.toLower(value), _.toLower(this.query));
  }

  public toQuery(): string {
    return this.getQueryPrefix() + this.getQueryWithoutField();
  }

  public toJSON(): any {
    return {
      query: this.query,
      field: this.field,
      type: this.type,
    };
  }
}

export class OperatorAnd extends CollectionOperator {

  public and: SearchElement[];

  constructor(andedElements: SearchElement[], takeOwnerShip: boolean = true) {
    super(andedElements);
    this.and = andedElements;
    if (takeOwnerShip) {
      _.each(andedElements, s => s.setParent(this));
    }
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

  public toQuery(): string {
    const joinedQuery = _.join(_.map(this.and, (e) => e.toQuery()), ' and ');

    if (this.getParent()) {
      return '(' + joinedQuery + ')';
    } else {
      return joinedQuery;
    }
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
  public or: SearchElement[];

  constructor(oredElements: SearchElement[], takeOwnerShip: boolean = true) {
    super(oredElements);
    this.or = oredElements;
    if (takeOwnerShip) {
      _.each(oredElements, s => s.setParent(this));
    }
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

  public toQuery(): string {
    const joinedQuery = _.join(_.map(this.or, (e) => e.toQuery()), ' or ');

    if (this.getParent()) {
      return '(' + joinedQuery + ')';
    } else {
      return joinedQuery;
    }
  }

  public toJSON(): any {
    return {
      or: this.or,
    };
  }

  public tryFlattenIntoParent() {
  }
}
