import { Component, OnInit } from '@angular/core';

import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';

import { SeriesComponent } from '../series/series.component'

@Component({
  providers: [],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent extends SeriesComponent implements OnInit {

  seriesImport: SeriesImportModel;

  //id: number;
  //base: string;

  //seriesImport: SeriesImportModel;

  //constructor(
    //private cms: CmsService,
    //private toastr: ToastrService,
    //private route: ActivatedRoute,
    //private router: Router
  //) { }

  //ngOnInit() {
    //this.loadPodcastImport();
    //this.route.params.forEach(params => {
     //this.id = +params['id'];
     //this.base = '/series/' + (this.id || 'new');
   //});
  //}

  //loadPodcastImport(){

    //this.cms.auth.subscribe(
      //auth => {
        //this.seriesImport = new SeriesImportModel(auth)
      //},
      //err => {
        //if (err.status === 404 && err.name === 'HalHttpError') {
          //this.toastr.error('ERRORZ');
        //} else {
          //throw(err);
        //}
      //}
    //);
  //}

  //save(){
    //let wasNew = this.seriesImport.isNew;
    //this.seriesImport.save().subscribe(() => {
      //this.toastr.success(`SeriesImport ${wasNew ? 'created' : 'saved'}`);
      //if (wasNew) {
        //this.router.navigate(['/']);
        //// TODO
        ////this.router.navigate(['/series-import', this.seriesImport.id]);
      //}
    //});
  //}
}
