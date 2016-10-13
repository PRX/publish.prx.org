export class SearchStory {
  static ORDERBY_OPTIONS: any[] = [
    {
      id: 'title',
      name: 'Story Title'
    },
    {
      id: 'updated_at',
      name: 'Last Updated'
    },
    {
      id: 'published_at',
      name: 'When Published'
    }
  ];

  constructor(
    public perPage?: number,
    public text?: string,
    public seriesId?: number,
    public orderBy?: string,
    public orderDesc?: boolean
  ) {  }

  fromRouteParams(params) {
    this.perPage = params['perPage'] || 12;
    this.seriesId = params['seriesId'] ? +params['seriesId'] : undefined;
    this.text = params['text'];
    this.orderBy = params['orderBy'] || 'updated_at';
    this.orderDesc = params['orderDesc'] === 'true' || params['orderDesc'] === undefined;
  }
}
