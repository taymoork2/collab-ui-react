import searchModule from '../index';
import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';
import { FieldQuery } from './searchElement';
import { SearchRequestCompressor } from './searchRequestCompressor';

describe('searchRequestCompressor', () => {

  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies(
      'SearchRequestCompressor',
    );
  });

  describe('compressQuery', () => {

    it('the base64 encoder should not change utf8-encoding', function () {
      const compressor = this.SearchRequestCompressor;
      expect(compressor.compress(new FieldQuery('conne🚘atåÜs'))).toBe('ABY29ubmXtoL3tuphhdMOlw5xz'); //This must be "set in stone" (except header)
      expect(compressor.decompress('ABY29ubmXtoL3tuphhdMOlw5xz').toQuery()).toBe('conne🚘atåÜs');
    });

    it('the compressed field representations should not change.', function () {
      const compressor = this.SearchRequestCompressor;
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_ActiveInterface))).toBe('AFa');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Tag))).toBe('AFb');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_ConnectionStatus))).toBe('AFc');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Description))).toBe('AFd');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_ErrorCodes))).toBe('AFe');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Displayname))).toBe('AFf');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_AccountType))).toBe('AFg');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_SipUrl))).toBe('AFh');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_IP))).toBe('AFi');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_CisUUID))).toBe('AFj');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Serial))).toBe('AFk');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Software))).toBe('AFl');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Mac))).toBe('AFm');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_UpgradeChannel))).toBe('AFn');
      expect(compressor.compress(new FieldQuery('', QueryParser.Field_Product))).toBe('AFo');
      expect(compressor.compress(new FieldQuery('', 'nico'))).toBe('AFzGbmljbw');
    });

    it('the compressed field value for connection status should not change.', function () {
      const compressor = this.SearchRequestCompressor;
      expect(compressor.compress(new FieldQuery('CONNECTED_WITH_ISSUES', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcYQ');
      expect(compressor.compress(new FieldQuery('CONNEcted_with_ISSUES', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcYQ');
      expect(compressor.compress(new FieldQuery('DISCONNECTED', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcYg');
      expect(compressor.compress(new FieldQuery('OFFLINE_EXPIRED', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcYw');
      expect(compressor.compress(new FieldQuery('CONNECTED', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcZA');
      expect(compressor.compress(new FieldQuery('UNKNOWN', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcZQ');
      expect(compressor.compress(new FieldQuery('NewUnknown value', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact))).toBe('AHcTmV3VW5rbm93biB2YWx1ZQ');
    });

    it('should compress and decompress connection status values', function () {
      const compressor = this.SearchRequestCompressor;
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=CONNECTED_WITH_ISSUES');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=CONNEcted_with_ISSUES');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=DISCONNECTED');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=OFFLINE_EXPIRED');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=CONNECTED');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=UNKNOWN');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '="NewUnknown value"');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + ':CONNEcted_with_ISSUES');
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + ':CONNECTED');
    });

    it('should compress and decompress', function () {
      const compressor = this.SearchRequestCompressor;
      expectQueryToCompressAndDecompress(compressor, QueryParser.Field_ConnectionStatus + '=CONNECTED_WITH_ISSUES OR '
        + QueryParser.Field_ConnectionStatus + '=OFFLINE_EXPIRED OR ' + QueryParser.Field_ConnectionStatus + '=disconnected');
      expectQueryToCompressAndDecompress(compressor, '"b c"');
      expectQueryToCompressAndDecompress(compressor, 'krypteringsalternativnøkkel or "innebygget ultralyd-høyttaler"');
      expectQueryToCompressAndDecompress(compressor, 'upgradechannel');
      expectQueryToCompressAndDecompress(compressor, 'mac:af and whatsthisfield=233 and (connectionStatus=offline_expired or connectionStatus=disconnected or connectionStatus=connected_with_issues)');
      expectQueryToCompressAndDecompress(compressor, 'conne🚘at🤯us=off🤹🏻‍♀️️line_ex⚓️pired or asdfasd:sdfsdf');
    });

    it('should compress and decompress known lengths', function () {
      const compressor = this.SearchRequestCompressor;

      expect(compressor.getLengthBytes(0)).toBe('A');
      expect(compressor.getLengthBytes(1)).toBe('B');
      expect(compressor.getLengthBytes(62)).toBe('+');
      expect(compressor.getLengthBytes(63)).toBe('/');
      expect(compressor.getLengthBytes(64)).toBe('=A');
      expect(compressor.getLengthBytes(65)).toBe('=B');

      expect(compressor.getLengthFromBytes('A')).toBe(0);
      expect(compressor.getLengthFromBytes('B')).toBe(1);
      expect(compressor.getLengthFromBytes('+')).toBe(62);
      expect(compressor.getLengthFromBytes('/')).toBe(63);
      expect(compressor.getLengthFromBytes('=')).toBe(64); //not really valid, but..
      expect(compressor.getLengthFromBytes('=A')).toBe(64);
      expect(compressor.getLengthFromBytes('=B')).toBe(65);
      expect(compressor.getLengthFromBytes('=C')).toBe(66);
    });

    it('should compress and decompress all lengths', function () {

      //If this fails, verify that  MAX_COUNT_VALUE points to the last in the keyset in the compressor!!
      // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; => '='
      const compressor = this.SearchRequestCompressor;

      for (let i = 1; i < 135; i++) {
        expect(i).toBe(compressor.getLengthFromBytes(compressor.getLengthBytes(i)));
        expect(i).toBe(compressor.getLengthFromBytes(compressor.getLengthHeader(compressor.getLengthBytes(i) + '/fds')));
        expectQueryToCompressAndDecompress(compressor, _.repeat('a', i));
        expectQueryToCompressAndDecompress(compressor, 'b or ' + _.repeat('a', i));
      }
    });

    function expectQueryToCompressAndDecompress(compressor: SearchRequestCompressor, query: string) {

      const searchTranslator = new SearchTranslator(null, null);
      const parsedQuery = new QueryParser(searchTranslator).parseQueryString(query);
      const comp = compressor.compress(parsedQuery);

      expect(_.toLower(compressor.decompress(comp).toQuery())).toBe(_.toLower(query || ''));
    }

    it('should compress any defined field.', function () {
      const compressor = this.SearchRequestCompressor;
      expect(compressor.compress(new FieldQuery('', 'connectionstatus')).length).toBe(3);
      expect(compressor.compress(new FieldQuery('', 'connectionStatus')).length).toBe(3);
      _.each(QueryParser.validFieldNames, fn => expect(compressor.compress(new FieldQuery('', fn)).length).toBe(3));
    });

    it('an empty query should compress to an empty string', function () {
      const compressor = this.SearchRequestCompressor;
      const searchTranslator = new SearchTranslator(null, null);
      const parsedQuery = new QueryParser(searchTranslator).parseQueryString('');
      expect(parsedQuery.toQuery()).toBe('');
      const comp = compressor.compress(parsedQuery);
      expect(comp).toBe('');
    });

    it('an empty compressed query should decompress to an element that renders to an empty string', function () {
      const compressor = this.SearchRequestCompressor;
      const decomp = compressor.decompress('');
      expect(decomp.toQuery()).toBe('');
    });
  });
});

