import { Component,OnInit } from '@angular/core';
import { AppService } from './app.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Rider } from './riders';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  riders: any = [];
  title = 'Angular';
  public rider: Rider = new Rider();
  public selectedId: number=0;

  constructor(private appService: AppService,private modalService: NgbModal) {}


  ngOnInit() {
    this.getAllUsers();
}

onClickSubmit() {
  this.appService.putRider(this.rider,this.selectedId)
    .subscribe((resp: any) => {
      if(!resp.error_code){
        this.riders = resp;
      }
    });
}
open(content:any) {
  this.modalService.open(content, {ariaLabelledBy: 'Edit Rider'});
}

  getAllUsers() {
    this.appService.getRiders()
    .subscribe((resp: any) => {
      if(!resp.error_code){
        this.riders = resp;
      }
    });
  }

}
