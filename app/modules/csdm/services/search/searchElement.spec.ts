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

    it('matches two words', function () {
      expect(new OperatorAnd([new FieldQuery('spark'), new FieldQuery('v')]).matches('Spark Voice', QueryParser.Field_Product)).toBe(true);
      expect(new OperatorAnd([new FieldQuery('spark'), new FieldQuery('xv')]).matches('Spark Voice', QueryParser.Field_Product)).toBe(false);
    });

    describe('removeElement on child', () => {

      it('should leave two elements if first of three removed', () => {
        const se = new OperatorAnd([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.and[0].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorAnd).toBe(true);
        expect((<OperatorAnd>firstElem).and.length).toBe(2);
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[0]).query).toEqual('b');
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[1]).query).toEqual('c');
      });

      it('should leave two elements if middle of three removed', () => {
        const se = new OperatorAnd([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.and[1].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorAnd).toBe(true);
        expect((<OperatorAnd>firstElem).and.length).toBe(2);
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[0]).query).toEqual('a');
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[1]).query).toEqual('c');
      });

      it('should leave two elements if last of three removed', () => {
        const se = new OperatorAnd([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.and[2].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorAnd).toBe(true);
        expect((<OperatorAnd>firstElem).and.length).toBe(2);
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[0]).query).toEqual('a');
        expect((<FieldQuery>(<OperatorAnd>firstElem).and[1]).query).toEqual('b');
      });

      it('should replace itself with a fieldQuery if first of two removed.', () => {
        const se = new OperatorAnd([new FieldQuery('a'), new FieldQuery('b')]);
        const root = new OperatorAnd([se]);

        se.and[0].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof FieldQuery).toBe(true);
        expect((<FieldQuery>firstElem).query).toEqual('b');
      });

      it('should replace itself with a fieldQuery if last of two removed.', () => {
        const se = new OperatorAnd([new FieldQuery('a'), new FieldQuery('b')]);
        const root = new OperatorAnd([se]);

        se.and[1].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof FieldQuery).toBe(true);
        expect((<FieldQuery>firstElem).query).toEqual('a');
      });
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

    describe('removeElement on child', () => {

      it('should leave two elements if first of three removed', () => {
        const se = new OperatorOr([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.or[0].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorOr).toBe(true);
        expect((<OperatorOr>firstElem).or.length).toBe(2);
        expect((<FieldQuery>(<OperatorOr>firstElem).or[0]).query).toEqual('b');
        expect((<FieldQuery>(<OperatorOr>firstElem).or[1]).query).toEqual('c');
      });

      it('should leave two elements if middle of three removed', () => {
        const se = new OperatorOr([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.or[1].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorOr).toBe(true);
        expect((<OperatorOr>firstElem).or.length).toBe(2);
        expect((<FieldQuery>(<OperatorOr>firstElem).or[0]).query).toEqual('a');
        expect((<FieldQuery>(<OperatorOr>firstElem).or[1]).query).toEqual('c');
      });

      it('should leave two elements if last of three removed', () => {
        const se = new OperatorOr([new FieldQuery('a'), new FieldQuery('b'), new FieldQuery('c')]);
        const root = new OperatorAnd([se]);

        se.or[2].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof OperatorOr).toBe(true);
        expect((<OperatorOr>firstElem).or.length).toBe(2);
        expect((<FieldQuery>(<OperatorOr>firstElem).or[0]).query).toEqual('a');
        expect((<FieldQuery>(<OperatorOr>firstElem).or[1]).query).toEqual('b');
      });

      it('should replace itself with a fieldQuery if first of two removed.', () => {
        const se = new OperatorOr([new FieldQuery('a'), new FieldQuery('b')]);
        const root = new OperatorAnd([se]);

        se.or[0].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof FieldQuery).toBe(true);
        expect((<FieldQuery>firstElem).query).toEqual('b');
      });

      it('should replace itself with a fieldQuery if last of two removed.', () => {
        const se = new OperatorOr([new FieldQuery('a'), new FieldQuery('b')]);
        const root = new OperatorAnd([se]);

        se.or[1].removeFromParent();
        expect(root.and.length).toBe(1);
        const firstElem = root.and[0];
        expect(firstElem instanceof FieldQuery).toBe(true);
        expect((<FieldQuery>firstElem).query).toEqual('a');
      });
    });
  });
});
