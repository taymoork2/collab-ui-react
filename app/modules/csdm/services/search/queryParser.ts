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
  public queryType?: string;

  constructor(query: string, field?: string, queryType?: string) {
    super();
    this.query = query;
    this.field = field;
    this.queryType = queryType;
  }

  public getQueryPrefix(): string {
    return (this.field) ? this.field + FieldQuery.getMatchOperator(this) : '';
  }

  public getQueryWithoutField() {
    let innerQuery = this.query;
    if (this.query.search(/\s|\(/) > 0) {
      innerQuery = '"' + innerQuery + '"';
    }
    return innerQuery;
  }

  public static getMatchOperator(fieldQuery: FieldQuery): string {
    return fieldQuery.queryType === FieldQuery.QueryTypeExact ? '=' : ':';
  }

  public toQuery(): string {
    return this.getQueryPrefix() + this.getQueryWithoutField();
  }

  public toJSON(): any {
    return {
      query: this.query,
      field: this.field,
      queryType: this.queryType,
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
}

export class SearchElementBuilder {
  private searchElements: SearchElement[] = [];

  private isOrOperator = false;
  private previousOperatorWasOr = false;

  public add(e: SearchElement) {
    if (this.isOrOperator && !this.previousOperatorWasOr) {
      throw Error('Mixing and/or requires parenthesis');
    }
    this.searchElements.push(e);
    this.previousOperatorWasOr = false;
  }

  public setOperatorAnd() {
    if (this.isOrOperator) {
      throw Error('Mixing and/or requires parenthesis');
    }
  }

  public setOperatorOr() {
    if (!this.isOrOperator && this.searchElements.length > 1) {
      throw Error('Mixing and/or requires parenthesis');
    }
    this.isOrOperator = true;
    this.previousOperatorWasOr = true;
  }

  public createSearchElement(): SearchElement {

    if (this.searchElements.length === 1) {
      return this.searchElements[0];
    }

    if (this.isOrOperator) {
      return new OperatorOr(this.searchElements);
    } else {
      return new OperatorAnd(this.searchElements);
    }
  }
}

export class QueryParser {

  public static readonly Field_ErrorCodes = 'errorcodes';
  public static readonly Field_UpgradeChannel = 'upgradechannel';
  public static readonly Field_ActiveInterface = 'activeinterface';
  public static readonly Field_ConnectionStatus = 'connectionstatus';

  private static validFieldNames = ['displayname',
    'cisuuid',
    'accounttype',
    QueryParser.Field_ActiveInterface,
    'serial',
    'mac',
    'ip',
    'activeinterface',
    'description',
    'productfamily',
    'software',
    QueryParser.Field_UpgradeChannel,
    'product',
    QueryParser.Field_ConnectionStatus,
    'sipurl',
    QueryParser.Field_ErrorCodes,
    'tags'];

  constructor() {
  }

  public static parseQueryString(queryString: string): SearchElement {
    return this.parseElement(queryString.toLowerCase());
  }

  private static parseElement(expression: string, searchField?: string, queryType?: string): SearchElement {

    const builder = new SearchElementBuilder();
    let curIndex: number = 0;

    while (curIndex < expression.length) {
      curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

      if (curIndex >= expression.length) {
        break;
      }
      const currentText: string = expression.slice(curIndex);

      if (QueryParser.startsPhrase(currentText)) {
        const endIndex = QueryParser.getQuotationEndIndex(currentText);
        builder.add(new FieldQuery(currentText.substring(1, endIndex).trim(), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (QueryParser.startsParenthesis(currentText)) {
        const endIndex = QueryParser.getParenthesisEndIndex(currentText);
        builder.add(QueryParser.parseElement(currentText.substring(1, endIndex), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (searchField == null && QueryParser.startsField(currentText)) {
        const fieldOperatorIndex = QueryParser.getOperatorIndex(currentText);
        const fieldQueryType = currentText[fieldOperatorIndex] === '=' ? FieldQuery.QueryTypeExact : undefined;
        const fieldName = currentText.substring(0, fieldOperatorIndex).trim();
        curIndex += fieldOperatorIndex + 1;
        curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

        const currentFieldText = expression.substring(curIndex);

        if (QueryParser.startsPhrase(currentFieldText)) {
          const endIndex = QueryParser.getQuotationEndIndex(currentFieldText);
          builder.add(new FieldQuery(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else if (QueryParser.startsParenthesis(currentFieldText)) {
          const endIndex = QueryParser.getParenthesisEndIndex(currentFieldText);
          builder.add(QueryParser.parseElement(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else {
          //It's a term. Grab the first word
          const endIndex = QueryParser.getFirstWordEndIndex(currentFieldText);
          builder.add(new FieldQuery(currentFieldText.substring(0, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex;
        }

      } else {
        const endIndex = QueryParser.getFirstWordEndIndex(currentText);
        const word = currentText.substring(0, endIndex);

        switch (word) {
          case 'or':
            builder.setOperatorOr();
            break;
          case 'and':
            builder.setOperatorAnd();
            break;
          default:
            builder.add(new FieldQuery(word, searchField, queryType));
            break;
        }
        curIndex += endIndex;
      }
    }
    return builder.createSearchElement();
  }

  private static getOperatorIndex(currentText: string): number {
    for (let i = 0; i < currentText.length; i++) {
      if (currentText[i] === '=' || currentText[i] === ':') {
        return i;
      }
    }
    throw new Error('Field operator not found in search string.');
  }

  private static startsField(searchElement: string): boolean {
    return _.some(QueryParser.validFieldNames, fieldName => _.startsWith(searchElement, fieldName) &&
      (searchElement[fieldName.length] === ':' || searchElement[fieldName.length] === '='));
  }

  private static getParenthesisEndIndex(currentText: string): number {
    let currentIndex = 0;
    let parenthesisStack = 0;
    while (parenthesisStack >= 0) {
      currentIndex++;

      if (currentIndex >= currentText.length) {
        throw new Error('Unfinished parenthesis');
      }

      const currentChar = currentText[currentIndex];

      if (currentChar === '(') {
        parenthesisStack++;
      } else if (currentChar === ')') {
        parenthesisStack--;
      }
    }
    return currentIndex;
  }

  private static startsParenthesis(currentText: string): boolean {
    return _.startsWith(currentText, '(');
  }

  private static getQuotationEndIndex(currentText: string): number {
    const endIndex = currentText.indexOf('\"', 1);
    if (endIndex < 0) {
      throw new Error('Unfinished quotation');
    }
    return endIndex;
  }

  private static getFirstWordEndIndex(currentText: string): number {
    const wordEnd = currentText.search(/\s|\(/);
    if (wordEnd < 0) {
      return currentText.length;
    }
    return wordEnd;
  }

  private static getLeadingWhiteSpaceCount(expression: string, start: number): number {
    let whiteSpaceCount: number = 0;
    while ((start + whiteSpaceCount) < expression.length && expression[start + whiteSpaceCount] === ' ') {
      whiteSpaceCount++;
    }
    return whiteSpaceCount;
  }

  private static startsPhrase(expression: string): boolean {
    return _.startsWith(expression, '"');
  }
}
