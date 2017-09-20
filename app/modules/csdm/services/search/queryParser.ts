export interface ISearchElement {
}

export class OperatorAnd implements ISearchElement {
  public and: ISearchElement[];

  constructor(andedElements: ISearchElement[]) {
    this.and = andedElements;
  }
}

export class OperatorOr implements ISearchElement {
  public or: ISearchElement[];

  constructor(oredElements: ISearchElement[]) {
    this.or = oredElements;
  }
}

export class FieldQuery implements ISearchElement {
  public query: string;
  public field?: string;
  public queryType?: string;

  constructor(query: string, field?: string, queryType?: string) {
    this.query = query;
    this.field = field;
    this.queryType = queryType;
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
    'errorcodes'];

  constructor() {
  }

  public static parseQueryString(queryString: string): ISearchElement {
    return this.parseElement(queryString.toLowerCase());
  }

  private static parseElement(expression: string, searchField?: string, queryType?: string): ISearchElement {

    const searchElements: ISearchElement[] = [];
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
    for (let i = 0; i < currentText.length ; i++) {
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
    const wordEnd = currentText.search(/\s+/);
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

  private static createSearchElement(searchElements: ISearchElement[], isOrOperator: boolean): ISearchElement {

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
