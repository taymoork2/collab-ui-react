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
    return (this.field) ? this.field + FieldQuery.getMatchOperator(this) + ' ' : '';
  }

  public getQueryWithoutField() {
    let innerQuery = this.query;
    if (this.queryType === 'exact' || this.query.search(/\s|\(/) > 0) {
      innerQuery = '"' + innerQuery + '"';
    }
    return innerQuery;
  }

  public static getMatchOperator(fieldQuery: FieldQuery): string {
    return fieldQuery.queryType === 'exact' ? '=' : ':';
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

  constructor(andedElements: SearchElement[]) {
    super();
    this.and = andedElements;
    _.each(andedElements, s => s.setParent(this));
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

  constructor(oredElements: SearchElement[]) {
    super();
    this.or = oredElements;
    _.each(oredElements, s => s.setParent(this));
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

export class QueryParser {

  private static validFieldNames = ['displayname',
    'cisuuid',
    'accounttype',
    'activeinterface',
    'serial',
    'mac',
    'ip',
    'activeinterface',
    'description',
    'productfamily',
    'software',
    'upgradechannel',
    'product',
    'connectionstatus',
    'sipurl',
    'errorcodes',
    'tags'];

  constructor() {
  }

  public static parseQueryString(queryString: string): SearchElement {
    return this.parseElement(queryString.toLowerCase());
  }

  private static parseElement(expression: string, searchField?: string, queryType?: string): SearchElement {

    const searchElements: SearchElement[] = [];
    let curIndex: number = 0;
    let isOrOperator: boolean = false;

    while (curIndex < expression.length) {
      curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

      if (curIndex >= expression.length) {
        break;
      }
      const currentText: string = expression.slice(curIndex);

      if (QueryParser.startsPhrase(currentText)) {
        const endIndex = QueryParser.getQuotationEndIndex(currentText);
        searchElements.push(new FieldQuery(currentText.substring(1, endIndex).trim(), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (QueryParser.startsParenthesis(currentText)) {
        const endIndex = QueryParser.getParenthesisEndIndex(currentText);
        searchElements.push(QueryParser.parseElement(currentText.substring(1, endIndex), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (searchField == null && QueryParser.startsField(currentText)) {
        const fieldOperatorIndex = QueryParser.getOperatorIndex(currentText);
        const fieldQueryType = currentText[fieldOperatorIndex] === '=' ? 'exact' : undefined;
        const fieldName = currentText.substring(0, fieldOperatorIndex).trim();
        curIndex += fieldOperatorIndex + 1;
        curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

        const currentFieldText = expression.substring(curIndex);

        if (QueryParser.startsPhrase(currentFieldText)) {
          const endIndex = QueryParser.getQuotationEndIndex(currentFieldText);
          searchElements.push(new FieldQuery(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else if (QueryParser.startsParenthesis(currentFieldText)) {
          const endIndex = QueryParser.getParenthesisEndIndex(currentFieldText);
          searchElements.push(QueryParser.parseElement(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else {
          //It's a term. Grab the first word
          const endIndex = QueryParser.getFirstWordEndIndex(currentFieldText);
          searchElements.push(new FieldQuery(currentFieldText.substring(0, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        }

      } else {
        const endIndex = QueryParser.getFirstWordEndIndex(currentText);
        const word = currentText.substring(0, endIndex);

        switch (word) {
          case 'or':
            isOrOperator = true;
            break;
          case 'and':
            if (isOrOperator) {
              throw new Error('And and OR not supported without parenthesis');
            }
            break;
          default:
            searchElements.push(new FieldQuery(word, searchField, queryType));
            break;
        }
        curIndex += endIndex + 1;
      }
    }

    return QueryParser.createSearchElement(searchElements, isOrOperator);
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
      throw new Error('Unfinished quotation mark for field');
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

  private static createSearchElement(searchElements: SearchElement[], isOrOperator: boolean): SearchElement {

    if (searchElements.length === 1) {
      return searchElements[0];
    }

    if (isOrOperator) {
      return new OperatorOr(searchElements);
    } else {
      return new OperatorAnd(searchElements);
    }
  }

  private static startsPhrase(expression: string): boolean {
    return _.startsWith(expression, '"');
  }
}
