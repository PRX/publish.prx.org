export class SearchSeries {
  static ORDERBY_OPTIONS: any[] = [
    {
      id: 'title',
      name: 'Series Title'
    },
    {
      id: 'updated_at',
      name: 'Last Updated'
    }
  ];

  constructor(
    public perPage?: number,
    public text?: string,
    public orderBy = 'updated_at',
    public orderDesc = true
  ) {  }

  fromRouteParams(params) {
    this.perPage = params['perPage'] || 10;
    this.text = params['text'];
    this.orderBy = params['orderBy'] || 'updated_at';
    this.orderDesc = params['orderDesc'] === 'true' || params['orderDesc'] === undefined;
  }
}
