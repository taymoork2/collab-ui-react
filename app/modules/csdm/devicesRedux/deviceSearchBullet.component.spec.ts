import devicesReduxModule from './index';
import searchModule from '../services/index';
import { DeviceSearchBullet } from './deviceSearchBullet.component';
import { FieldQuery, OperatorOr, SearchElement } from '../services/search/searchElement';
import { QueryParser } from '../services/search/queryParser';
import { SearchTranslator } from '../services/search/searchTranslator';

describe('deviceSearchBullet', () => {
  let translator;

  beforeEach(function () {
    this.initModules(searchModule, devicesReduxModule);
    this.injectDependencies('$translate');
    translator = new SearchTranslator(this.$translate, null);
    spyOn(this.$translate, 'instant').and.callFake(key => 'translated.' + key);
    spyOn(this.$translate, 'proposedLanguage').and.returnValue('nb_NO');
  });

  afterEach(function () {
    translator = null;
  });

  describe('getQueryField', () => {

    describe('for OperatorOr and children', function () {
      it('should show field if it contains a single FieldQuery', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          true);
      });

      it('should show field if it contains two FieldQueries with same field', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          true);
      });
      it('should show field if it contains two FieldQueries with same field of different case', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus.toUpperCase(), FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus.toLowerCase(), FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          true);
      });

      it('should show field if it contains three FieldQueries with same field', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q3', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          true);
      });

      it('should not show field if it contains one FieldQuery with a different field', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q3', QueryParser.Field_Tag, FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          false);
      });

      it('should not show field if it contains one FieldQuery with no field', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q3', '', FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          false);
      });

      it('should not show field if it contains one FieldQuery with not exact', function () {
        expectFieldDisplayForOperatorOR(
          createBullet(new OperatorOr([new FieldQuery('q1', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact),
            new FieldQuery('q2', QueryParser.Field_ConnectionStatus),
            new FieldQuery('q3', QueryParser.Field_ConnectionStatus, FieldQuery.QueryTypeExact)])),
          QueryParser.Field_ConnectionStatus,
          false);
      });

      function createBullet(se: SearchElement): DeviceSearchBullet {
        const bullet = new DeviceSearchBullet(translator);
        bullet.searchElement = se;
        return bullet;
      }

      function expectFieldDisplayForOperatorOR(bullet: DeviceSearchBullet, field: string, expectFieldInOrOnly: boolean) {
        if (expectFieldInOrOnly) {
          expect(_.toLower(bullet.getQueryField())).toEqual(_.toLower(field));
          _.each((<OperatorOr>bullet.searchElement).or, subel => expect(createBullet(subel).getQueryField()).toEqual(''));
        } else {
          expect(bullet.getQueryField()).toEqual('');
          _.each((<OperatorOr>bullet.searchElement).or, subel => ((!(subel instanceof FieldQuery)) || _.isEmpty(subel.field)) && expect(createBullet(subel).getQueryField()).not.toEqual(''));
        }
      }
    });
  });
});
