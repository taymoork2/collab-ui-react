import {
  CsdmSearchService, SearchFields, SearchObject, SearchResult,
} from '../services/csdmSearch.service';
import { Device } from '../services/deviceSearchConverter';

export class DeviceSearch implements ng.IComponentController, ISearchHandler {
  public searchField: string;
  private currentSearchObject: SearchObject;
  public currentBullet: Bullet;
  private inputActive: boolean;

  //bindings
  private searchResultChanged: (e: { result?: SearchResult }) => {};
  private searchChanged: (e: { search: SearchObject }) => {};
  public searchObject: SearchObject;
  private searchInteraction: SearchInteraction;
  public search: string;
  public searchResult: Device[];

  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService) {
    this.currentSearchObject = SearchObject.create('');
    this.currentBullet = new Bullet(this.currentSearchObject);
  }

  get searching(): boolean {
    return this.inputActive || !!this.search;
  }

  public $onInit(): void {
    this.performSearch(SearchObject.create(''));
    this.searchInteraction.receiver = this;
  }

  private updateSearchResult(result?: SearchResult) {
    this.searchResultChanged({ result: result });
  }

  public addToSearch(field: string, query: string) {
    this.currentSearchObject.setTokenizedQuery(field, query, false);
    this.searchChanged2();
  }

  public setCurrentSearch(search: string) {
    this.currentSearchObject = SearchObject.create(search);
    this.searchChanged2();
  }

  public searchChanged2() {
    // const prev = (this.search || '');
    // const searchField = (this.searchField || '');
    // // if(prev.length > 0 && searchField> 0) {
    // let s = prev;
    // if (searchField.length > 0) {
    //   s = prev.length > 0 ? prev + ',' + searchField : searchField;
    // }
    // const search = SearchObject.create(s);
    const search = _.cloneDeep(this.currentSearchObject);

    this.performSearch(search); //TODO avoid at now
    // this.searchObject = search;
    this.searchChanged({ search: search });
  }

  private performSearch(search: SearchObject) {
    this.CsdmSearchService.search(search).then((response) => {
      if (response && response.data) {
        this.updateSearchResult(response.data);
        return;
      }
      this.updateSearchResult();
    });
  }

  public getTokens() {
    return _.filter(this.currentSearchObject.tokenizedQuery, (t) => !t.active);
  }

  public removeBullet(bullet: Bullet) {
    this.currentSearchObject.removeToken(bullet.searchField);
    this.searchChanged2();
  }

  // public getFinishedTokens() {
  //   return _.
  //   chain(this.currentSearchObject.tokenizedQuery)
  //     .map((v,k)=>{return {}})
  //   _.filter(this.currentSearchObject.tokenizedQuery, (__, k) => this.currentBullet.isCurrentField(k || ''));
  // }
}

class Bullet {
  private _text = '';
  public searchField = '';
  public active = false;

  get searchfieldWithPrefix() {
    return this.searchField.length > 0 ? this.searchField + ':' : this.searchField;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    const tokens = Bullet.createTokens(this.searchfieldWithPrefix + (value || ''));
    const token = tokens.pop();
    if (!token) {
      return;
    }
    tokens.forEach((t) => {
      this.searchObject.setTokenizedQuery(t.searchField, t.query, false);
    });

    if (token.valid) {
      this._text = token.query;
      this.searchField = token.searchField;
      this.active = true;
      const anyField = this.searchObject.tokenizedQuery[SearchFields[SearchFields.any]];
      if (anyField && anyField.active && token.searchField.search(anyField.query) >= 0) {
        this.searchObject.removeToken(anyField.searchField);
      }
      this.searchObject.setTokenizedQuery(token.searchField, token.query, true);
    } else {
      this.searchField = '';
      this._text = token.query || '';
      if (tokens.length === 0 || this._text.length > 0) {
        this.searchObject.setTokenizedQuery('any', token.query, true);
      }
    }
  }

  constructor(private searchObject: SearchObject) {
  }

  public static createTokens(search: string) {
    const splitted = _.split(search, ',');
    const token = _.map(splitted, (s) => Bullet.createToken(s));
    return token;
  }

  public static createToken(search: string): { searchField: string, query: string, valid: boolean } {
    const splitted = _.split(search, ':');
    if (splitted.length === 2) {
      if (_.some(_.keys(SearchObject.SearchFields)), (a) => splitted === a) {
        return { searchField: splitted[0], query: splitted[1], valid: true };
      }
      return { searchField: SearchFields[SearchFields.any], query: splitted[1], valid: false };
    }
    return { searchField: SearchFields[SearchFields.any], query: search, valid: false };
  }

  public isCurrentField(field: string) {
    return (this.searchField || 'any') === (field || 'any');
  }
}
interface ISearchHandler {
  addToSearch(field: string, query: string);
}
export class SearchInteraction implements ISearchHandler {
  public receiver: ISearchHandler;

  public addToSearch(field: string, query: string) {
    if (this.receiver) {
      this.receiver.addToSearch(field, query);
    }
  }
}

export class DeviceSearchComponent implements ng.IComponentOptions {
  public controller = DeviceSearch;
  public bindings = {
    search: '=',
    searchInteraction: '<',
    searchResultChanged: '&',
    searchObject: '=',
    searchChanged: '&',
    clearSearch: '&',
  };
  public controllerAs = 'dctrl';
  public templateUrl = 'modules/csdm/devicesRedux/deviceSearch.html';
}
