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

  public setBeingEdited(beingEdited: boolean) {
    this._isBeingEdited = beingEdited;
  }

  public isBeingEdited(): boolean {
    return this._isBeingEdited;
  }

  public abstract toJSON(): any;
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
    return (this.field) ? this.field + this.getMatchOperator() : '';
  }

  public getQueryWithoutField() {
    let innerQuery = this.query;
    if (this.query.search(/\s|\(/) > 0) {
      innerQuery = '"' + innerQuery + '"';
    }
    return innerQuery;
  }

  public getMatchOperator(): string {
    return this.type === FieldQuery.QueryTypeExact ? '=' : ':';
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof FieldQuery)) {
      return false;
    }
    return this.getMatchOperator() === other.getMatchOperator()
      && _.isEqual(_.toLower(this.field), _.toLower(other.field))
      && _.isEqual(_.toLower(this.query), _.toLower(other.query));
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

export class OperatorAnd extends SearchElement {
  public and: SearchElement[];

  constructor(andedElements: SearchElement[], takeOwnerShip: boolean = true) {
    super();
    this.and = andedElements;
    if (takeOwnerShip) {
      _.each(andedElements, s => s.setParent(this));
    }
  }

  public contains(element: SearchElement): boolean {
    return _.some(this.and, e => e.isEqual(element));
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof OperatorAnd)) {
      return false;
    }
    return _.every(this.and, e => {
      e.isEqual(other);
    });
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

  public addSubElement(newElement: SearchElement) {
    this.and.push(newElement);
    newElement.setParent(this);
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

export class OperatorOr extends SearchElement {
  public or: SearchElement[];

  constructor(oredElements: SearchElement[], takeOwnerShip: boolean = true) {
    super();
    this.or = oredElements;
    if (takeOwnerShip) {
      _.each(oredElements, s => s.setParent(this));
    }
  }

  public isEqual(other: SearchElement): boolean {
    if (!other || !(other instanceof OperatorOr)) {
      return false;
    }
    return _.every(this.or, e => {
      e.isEqual(other);
    });
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

  public getFieldNameIfAllSubElementsAreSameField() {
    if (this.or.length > 1) {
      const firstSubExpr = this.or[0];
      if (firstSubExpr instanceof FieldQuery) {
        if (_.every(this.or,
            (fq) => {
              return fq instanceof FieldQuery
                && _.isEqual(_.lowerCase(firstSubExpr.field), _.lowerCase(fq.field))
                && _.isEqual(firstSubExpr.getMatchOperator(), fq.getMatchOperator());
            })) {
          return firstSubExpr.getQueryPrefix();
        }
      }
    }
    return '';
  }
}
