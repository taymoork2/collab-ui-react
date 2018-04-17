import { Device } from '../deviceSearchConverter';
import { List } from 'lodash';

export class SearchResult {
  public aggregations: Aggregations;
  public hits: SearchHits;
  public successfullyRetrievedFromCsdm: boolean;
  public successfullyRetrievedFromCmi: boolean;
}
export class SearchHits {
  public hits: Device[];
  public total: number;
}

export class Aggregations {
  [key: string]: Aggregation
}
export class Aggregation {

  constructor(public buckets: List<IBucketData>) {
  }
}
export class NamedAggregation extends Aggregation {
  public bucketName: string;

  constructor(name, { buckets: buckets }: { buckets: List<IBucketData> }) {
    super(buckets);
    this.bucketName = name;
  }
}

export interface IBucketData {
  key: string;
  docCount: number;
}
