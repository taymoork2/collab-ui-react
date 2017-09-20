import { Device } from '../deviceSearchConverter';
import { List } from 'lodash';

export class SearchResult {
  public aggregations: Aggregations;
  public hits: SearchHits;
}
export class SearchHits {
  public hits: Device[];
  public total: number;
}

export class Aggregations {
  [key: string]: Aggregation
}
export class Aggregation {

  constructor(public buckets: List<BucketData>) {
  }
}
export class NamedAggregation extends Aggregation {
  public bucketName: string;

  constructor(name, { buckets: buckets }: { buckets: List<BucketData> }) {
    super(buckets);
    this.bucketName = name;
  }
}

export class BucketData {
  public key: string;
  public docCount: number;
}
