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
    this.fieldCompressionMap[QueryParser.Field_SipUrls] = 'h';
    this.fieldCompressionMap[QueryParser.Field_IP] = 'i';
    this.fieldCompressionMap[QueryParser.Field_CisUUID] = 'j';
    this.fieldCompressionMap[QueryParser.Field_Serial] = 'k';
    this.fieldCompressionMap[QueryParser.Field_Software] = 'l';
    this.fieldCompressionMap[QueryParser.Field_Mac] = 'm';
    this.fieldCompressionMap[QueryParser.Field_UpgradeChannel] = 'n';
    this.fieldCompressionMap[QueryParser.Field_Product] = 'o';
    this.fieldCompressionMap[QueryParser.Field_PrimarySipUrl] = 'p';
    this.fieldCompressionMap[QueryParser.Field_Url] = 'q';
    this.fieldCompressionMap[SearchRequestCompressor.CUSTOM_FIELD] = 'z';

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
  private static readonly CUSTOM_FIELD = 'custom';
  private static readonly HEADER_FLAG_ISFIELDQUERY = 0;
  private static readonly HEADER_FLAG_FIELDQUERY_EXACT = 1;
  private static readonly HEADER_FLAG_FIELDQUERY_HASFIELD = 2;
  private static readonly HEADER_FLAG_COLLECTION_ISAND = 1;

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
      throw new SearchLinkExpiredkError();
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
    if (this.isFlagSet(payload, SearchRequestCompressor.HEADER_FLAG_ISFIELDQUERY)) {
      return this.deCompressFieldQuery(this.isFlagSet(payload, SearchRequestCompressor.HEADER_FLAG_FIELDQUERY_EXACT),
        this.isFlagSet(payload, SearchRequestCompressor.HEADER_FLAG_FIELDQUERY_HASFIELD), payload.substr(1));
    }
    const subCountHeader = this.getLengthHeader(payload.substr(1));
    const subCount = this.getLengthFromBytes(subCountHeader);

    return this.deCompressCollectionOperator(this.isFlagSet(payload, SearchRequestCompressor.HEADER_FLAG_COLLECTION_ISAND), subCount, payload.substr(1 + subCountHeader.length));
  }

  private isFlagSet(header: string, pos: number): boolean {
    const headerFlags = this.getLengthFromBytes(header.charAt(0)).toString(2);
    //const headerFlags = Number(header.charCodeAt(0) - 48).toString(2); //To align with start of '0' in ASCII
    return headerFlags.length > pos && (headerFlags[headerFlags.length - 1 - pos] === '1');
  }

  private getFlagVal(flagPos: number): number {
    return Math.pow(2, flagPos);
  }

  private compressFieldQuery(fq: FieldQuery): string {
    const headerVal = this.getFlagVal(SearchRequestCompressor.HEADER_FLAG_ISFIELDQUERY)
      + (fq.type === FieldQuery.QueryTypeExact ? (this.getFlagVal(SearchRequestCompressor.HEADER_FLAG_FIELDQUERY_EXACT)) : 0)
      + (fq.field ? this.getFlagVal(SearchRequestCompressor.HEADER_FLAG_FIELDQUERY_HASFIELD) : 0);
    const header = this.getLengthBytes(headerVal);

    return header + (fq.field ? (this.compressField(fq.field)) : '') + this.compressQueryVal(fq);
  }

  private compressQueryVal(fq: FieldQuery): string {
    const queryVal = (fq.field && fq.query && fq.type === FieldQuery.QueryTypeExact && this.fieldValueCompressionMap[fq.field.toLowerCase()]
      && this.fieldValueCompressionMap[fq.field.toLowerCase()][fq.query.toUpperCase()])
      || fq.query;

    return this.encodeUTF8(queryVal);
  }

  private deCompressQueryVal(compressedQueryVal: string, uncompressedField: string | undefined, isExact: boolean): string {

    const decodedQueryVal = this.decodeUTF8(compressedQueryVal);

    return (uncompressedField && isExact && this.fieldValueCompressionMap[uncompressedField.toLowerCase()]
      && _.findKey(this.fieldValueCompressionMap[uncompressedField.toLowerCase()], cFieldVal => cFieldVal === decodedQueryVal))
      || decodedQueryVal;
  }

  private compressField(field: string): string {
    return this.fieldCompressionMap[field.toLowerCase()]
      || (this.fieldCompressionMap[SearchRequestCompressor.CUSTOM_FIELD] + this.wrapInLengthHeader(this.encodeUTF8(field)));
  }

  private deCompressField(compressedField: string): string {
    return _.findKey(this.fieldCompressionMap, cField => cField === compressedField) || this.decodeUTF8(compressedField);
  }

  private deCompressFieldQuery(isExact: boolean, hasField: boolean, payload: string): SearchElement {
    let compressedFieldByteCount = 0;
    let field: string | undefined;

    if (hasField) {
      const compressedFieldChar = payload.charAt(0);
      compressedFieldByteCount = 1;

      if (compressedFieldChar === SearchRequestCompressor.CUSTOM_FIELD) {
        const fieldLengthHeader = this.getLengthHeader(payload.substr(1));
        compressedFieldByteCount += fieldLengthHeader.length;
        const fieldLength = this.getLengthFromBytes(fieldLengthHeader);
        field = this.decodeUTF8(payload.substr(2, fieldLength));
        compressedFieldByteCount += field.length;
      } else {
        field = this.deCompressField(compressedFieldChar);
      }
    }

    const compressedQueryVal = payload.substr(compressedFieldByteCount);
    const queryVal = this.deCompressQueryVal(compressedQueryVal, field, isExact);
    return new FieldQuery(queryVal,
      field,
      isExact ? FieldQuery.QueryTypeExact : undefined);
  }

  private compressCollectionOperator(coll: CollectionOperator): string {
    const headerVal = (coll instanceof OperatorAnd) ? this.getFlagVal(SearchRequestCompressor.HEADER_FLAG_COLLECTION_ISAND) : 0;
    const header = this.getLengthBytes(headerVal);
    const subCount = this.getLengthBytes(coll.getExpressions().length);

    return header + subCount + _.map(coll.getExpressions(), e => this.wrapInLengthHeader(this.compressElement(e))).join('');
  }

  private wrapInLengthHeader(payload: string): string {
    return this.getLengthBytes(payload.length) + payload;
  }

  public getLengthFromBytes(lengthBytes: string): number {
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

  private encodeUTF8(queryVal: string): string {
    return this.Utils.Base64.encode((queryVal || '')).replace(/\=+$/, '');
  }

  private decodeUTF8(compressedQueryVal: string): string {
    const lenMod = (compressedQueryVal.length % this.encodingChunkSize);
    const reintroducedBase64EndPad = _.repeat('=', (lenMod > 0 ? this.encodingChunkSize : 0) - lenMod);
    const base64Query = compressedQueryVal + reintroducedBase64EndPad;
    return this.Utils.Base64.decode(base64Query);
  }
}

export class SearchLinkExpiredkError extends Error {
  public messageKey = 'spacesPage.searchLinkExpired';
}
