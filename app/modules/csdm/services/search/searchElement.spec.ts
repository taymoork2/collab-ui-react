import searchModule from '../index';
import { FieldQuery, OperatorAnd, OperatorOr } from './searchElement';
import { QueryParser } from './queryParser';

describe('searchElement', () => {

  beforeEach(function () {
    this.initModules(searchModule);
  });

  describe('fieldQuery', () => {
    it('blank should always match', function () {
      expect(new FieldQuery('').matches('', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('').matches('')).toBe(true);
    });

    it('something should never match blank', function () {
      expect(new FieldQuery('c', QueryParser.Field_Product).matches('', QueryParser.Field_Product)).toBe(false);
      expect(new FieldQuery('c', QueryParser.Field_Product).matches('')).toBe(false);
      expect(new FieldQuery('c').matches('', QueryParser.Field_Product)).toBe(false);
      expect(new FieldQuery('c').matches('')).toBe(false);
    });

    it('matched in the query should be true', function () {
      expect(new FieldQuery('cis').matches('cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('cis').matches('asdf cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('cis').matches('cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('cis').matches('asdf cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('cis').matches('cisco')).toBe(true);
      expect(new FieldQuery('cis').matches('asdf cisco')).toBe(true);
      expect(new FieldQuery('cis').matches('cisco')).toBe(true);
      expect(new FieldQuery('cis').matches('asdf cisco')).toBe(true);
    });

    it('phrase search should match', function () {
      expect(new FieldQuery('asdf ghjk').matches('asdf ghjk', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('asdf ghjk').matches('jj sasdf Ghjks', QueryParser.Field_Product)).toBe(true);
    });

    it('matches specific field should be true', function () {
      expect(new FieldQuery('ci', QueryParser.Field_Product).matches('cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('ci', QueryParser.Field_Product).matches('cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('ci', QueryParser.Field_Product).matches('cisco', QueryParser.Field_ConnectionStatus)).toBe(false);
      expect(new FieldQuery('cI').matches('cisco', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('cix').matches('cisco', QueryParser.Field_Product)).toBe(false);
    });

    it('matches part of field should be true', function () {
      expect(new FieldQuery('newprod', QueryParser.Field_Product).matches('sdfdf newprod sdfds', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('newprod', QueryParser.Field_Product).matches('sdfdf newprod', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('newprod', QueryParser.Field_Product).matches('newprod sdfds', QueryParser.Field_Product)).toBe(true);
      expect(new FieldQuery('newprod', QueryParser.Field_Product).matches('sdfdfnewprodsdfds', QueryParser.Field_Product)).toBe(true);
    });
  });

  describe('andOperator', () => {
    it('matches blank should always be true', function () {
      expect(new OperatorAnd([]).matches('jhkl', QueryParser.Field_Product)).toBe(true);
    });

    it('matches field should be true', function () {
      expect(new OperatorAnd([new FieldQuery('newprod', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newProd', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newprod')]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
    });

    it('matches only one field should be false', function () {
      expect(new OperatorAnd([new FieldQuery('newprod', QueryParser.Field_Product), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
      expect(new OperatorAnd([new FieldQuery('newProd', QueryParser.Field_Product), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
      expect(new OperatorAnd([new FieldQuery('newprod'), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
      expect(new OperatorAnd([new FieldQuery('newProdX1'), new FieldQuery('newProdX2')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
    });

    it('matches two fields should be true', function () {
      expect(new OperatorAnd([new FieldQuery('newprod', QueryParser.Field_Product), new FieldQuery('newprod', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newProd', QueryParser.Field_Product), new FieldQuery('newprod', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newprod'), new FieldQuery('newprod', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('newPXrod1'), new FieldQuery('newXProd2')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
    });

    it( 'hmm', function () {
      expect(new OperatorAnd([new FieldQuery('spark'), new FieldQuery('v')]).matches('Spark Voice', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('spark'), new FieldQuery('xv')]).matches('Spark Voice', QueryParser.Field_Product)).toBe(false);
    });
  });

  describe('orOperator', () => {
    it('matches blank should always be true', function () {
      expect(new OperatorOr([]).matches('jhkl', QueryParser.Field_Product)).toBe(true);
    });

    it('matches field should be true', function () {
      expect(new OperatorOr([new FieldQuery('newprod', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newProd', QueryParser.Field_Product)]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newprod')]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
    });

    it('matches one field should be true', function () {
      expect(new OperatorOr([new FieldQuery('newprod', QueryParser.Field_Product), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newProd', QueryParser.Field_Product), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newprod'), new FieldQuery('newProdX')]).matches('newprod', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorOr([new FieldQuery('newProdX1'), new FieldQuery('newProdX2')]).matches('newprod', QueryParser.Field_Product)).toBe(false);
    });
  });
});
