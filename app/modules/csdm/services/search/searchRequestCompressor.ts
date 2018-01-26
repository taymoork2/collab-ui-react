import { CollectionOperator, FieldQuery, OperatorAnd, OperatorOr, SearchElement } from './searchElement';
import { QueryParser } from './queryParser';

export class SearchRequestCompressor {

  /* @ngInject */
  constructor(private Utils) {
    this.keyset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    this.MAX_COUNT_VALUE = this.keyset.charAt(this.keyset.length - 1);
    this.encodingChunkSize = 4;

    this.fieldCompressionMap[QueryParser.Field_ActiveInterface] = 'a';
    this.fieldCompressionMap[QueryParser.Field_Tag] = 'b';
    this.fieldCompressionMap[QueryParser.Field_ConnectionStatus] = 'c';
    this.fieldCompressionMap[QueryParser.Field_Description] = 'd';
    this.fieldCompressionMap[QueryParser.Field_ErrorCodes] = 'e';
    this.fieldCompressionMap[QueryParser.Field_Displayname] = 'f';
    this.fieldCompressionMap[QueryParser.Field_AccountType] = 'g';
    this.fieldCompressionMap[QueryParser.Field_SipUrl] = 'h';
    this.fieldCompressionMap[QueryParser.Field_IP] = 'i';
    this.fieldCompressionMap[QueryParser.Field_CisUUID] = 'j';
    this.fieldCompressionMap[QueryParser.Field_Serial] = 'k';
    this.fieldCompressionMap[QueryParser.Field_Software] = 'l';
    this.fieldCompressionMap[QueryParser.Field_Mac] = 'm';
    this.fieldCompressionMap[QueryParser.Field_UpgradeChannel] = 'n';
    this.fieldCompressionMap[QueryParser.Field_Product] = 'o';

    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus] = {};
    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus]['CONNECTED_WITH_ISSUES'] = 'a';
    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus]['DISCONNECTED'] = 'b';
    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus]['OFFLINE_EXPIRED'] = 'c';
    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus]['CONNECTED'] = 'd';
    this.fieldValueCompressionMap[QueryParser.Field_ConnectionStatus]['UNKNOWN'] = 'e';
  }

  private readonly encodingChunkSize = 4;
  private readonly MAX_COUNT_VALUE: string;
  private readonly keyset: string;
  private myVersion = 0;

  private readonly fieldCompressionMap: { [key: string]: string } = {};
  private readonly fieldValueCompressionMap: { [key: string]: { [key: string]: string } } = {};

  public compress(query: SearchElement): string {
    if (!query || query instanceof OperatorAnd && query.and.length === 0) {
      return '';
    }
    return this.keyset.charAt(this.myVersion) + this.compressElement(query);
  }

  public decompress(payload: string): SearchElement {
    if (this.keyset.indexOf(payload.charAt(0)) !== this.myVersion) {
      throw new SearchLinExpiredkError();
    }
    return this.decompressElement(payload.substr(1));
  }

  private compressElement(query: SearchElement): string {
    if (query instanceof FieldQuery) {
      return this.compressFieldQuery(query);
    }
    if (query instanceof CollectionOperator) {
      return this.compressCollectionOperator(query);
    }
    return '';
  }

  private decompressElement(payload: string): SearchElement {
    const headerFlags = Number(payload.charCodeAt(0) - 48).toString(2); //To align with start of '0' in ASCII
    if (this.isFlagSet(headerFlags, 0)) {
      return this.deCompressFieldQuery(this.isFlagSet(headerFlags, 1), this.isFlagSet(headerFlags, 2), payload.substr(1));
    }
    const subCountHeader = this.getLengthHeader(payload.substr(1));
    const subCount = this.getLengthFromBytes(subCountHeader);

    return this.deCompressCollectionOperator(this.isFlagSet(headerFlags, 1), subCount, payload.substr(1 + subCountHeader.length));
  }

  private isFlagSet(headerFlags: string, pos: number): boolean {
    return headerFlags.length > pos && (headerFlags[headerFlags.length - 1 - pos] === '1');
  }

  private compressFieldQuery(fq: FieldQuery): string {
    const header = ((1 + (fq.type === FieldQuery.QueryTypeExact ? 2 : 0) + (fq.field ? 4 : 0)) + '') || '0';
    return header + (fq.field ? (this.compressField(fq.field) + ':') : '') + this.compressQueryval(fq);
  }

  private compressQueryval(fq: FieldQuery): string {
    const queryVal = (fq.field && fq.query && fq.type === FieldQuery.QueryTypeExact && this.fieldValueCompressionMap[fq.field.toLowerCase()]
      && this.fieldValueCompressionMap[fq.field.toLowerCase()][fq.query.toUpperCase()])
      || fq.query;

    return this.Utils.Base64.encode((queryVal || '')).replace(/\=+$/, '');
  }

  private deCompressQueryval(compressedQueryVal: string, uncompressedField: string | undefined, isExact: boolean): string {
    const lenMod = (compressedQueryVal.length % this.encodingChunkSize);
    const reintroducedBase64EndPad = _.repeat('=', (lenMod > 0 ? this.encodingChunkSize : 0) - lenMod);
    const base64Query = compressedQueryVal + reintroducedBase64EndPad;
    const decodedQueryVal = this.Utils.Base64.decode(base64Query);

    return (uncompressedField && isExact && this.fieldValueCompressionMap[uncompressedField.toLowerCase()]
      && _.findKey(this.fieldValueCompressionMap[uncompressedField.toLowerCase()], cFieldVal => cFieldVal === decodedQueryVal))
      || decodedQueryVal;
  }

  private compressField(field: string): string {
    return this.fieldCompressionMap[field.toLowerCase()] || field;
  }

  private deCompressField(compressedField: string): string {
    return _.findKey(this.fieldCompressionMap, cField => cField === compressedField) || compressedField;
  }

  private deCompressFieldQuery(isExact: boolean, hasField: boolean, payload: string): SearchElement {
    const field = hasField ? this.deCompressField(payload.split(':')[0]) : undefined;
    const compressedQueryVal = hasField ? payload.split(':')[1] : payload || '';
    const queryVal = this.deCompressQueryval(compressedQueryVal, field, isExact);
    return new FieldQuery(queryVal,
      field,
      isExact ? FieldQuery.QueryTypeExact : undefined);
  }

  private compressCollectionOperator(coll: CollectionOperator): string {
    const header = (((coll instanceof OperatorAnd) ? 2 : 0) + '') || '0';
    const subCount = this.getLengthBytes(coll.getExpressions().length);

    return header + subCount + _.map(coll.getExpressions(), e => this.addLength(this.compressElement(e))).join('');
  }

  private addLength(payload: string): string {
    return this.getLengthBytes(payload.length) + payload;
  }

  public getLengthFromBytes(lengthBytes: string) {
    if (lengthBytes && lengthBytes.length === 0) {
      return 0;
    }
    return (this.keyset.length - 1) * Math.max(0, lengthBytes.length - 1) + Math.max(0, _.indexOf(this.keyset, _.last(lengthBytes)));
  }

  public getLengthBytes(l: number): string {
    const maxHeader = _.repeat(this.MAX_COUNT_VALUE, Math.floor(l / (this.keyset.length - 1)));
    const remainderHeader = this.keyset.charAt(l % (this.keyset.length - 1));
    return maxHeader + remainderHeader;
  }

  public getLengthHeader(payload: string): string {
    let maxLenHeader = '';
    let lenindex = 0;
    while (payload.charAt(lenindex) === this.MAX_COUNT_VALUE) {
      maxLenHeader += this.MAX_COUNT_VALUE;
      lenindex++;
    }
    return maxLenHeader + payload.charAt(lenindex);
  }

  private deCompressCollectionOperator(isAnd: boolean, subCount: number, payload: string): CollectionOperator {
    let charPos = 0;
    const subElementCollection: SearchElement[] = [];

    for (let subPos = 0; subPos < subCount; subPos++) {
      const subPayloadLenHeader = this.getLengthHeader(payload.substr(charPos));
      const payloadLen = this.getLengthFromBytes(subPayloadLenHeader);
      if (payloadLen > 0) {
        subElementCollection.push(this.decompressElement(payload.substr(charPos + subPayloadLenHeader.length, payloadLen)));
      }
      charPos += subPayloadLenHeader.length + payloadLen;
    }

    return isAnd ? new OperatorAnd(subElementCollection) : new OperatorOr(subElementCollection);
  }
}

class SearchLinExpiredkError extends Error {
  public messageKey = 'spacesPage.searchlinkExpired';
}
