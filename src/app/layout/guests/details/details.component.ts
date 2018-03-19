import { Component, OnInit,OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';
import * as moment from 'moment';

import { Guest } from './../guest';
import { GuestsService } from './../guests.service';

import { ActionsService, ActionState } from 'app/layout/actions.service';

@Component({
  selector: 'app-guests-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class GuestsDetailsComponent implements OnInit, OnDestroy {

  private componetDestroyed = new Subject(); 

  guest: Guest;
  bookings = [];
  loading:boolean = false;

  sizeOfTotalBookings: number;
  sizeOfNoShows: number;
  sizeOfCanceledBookings: number;
  displayedColumns;
  dataSource;
  bookingEditMenu;


  constructor(
    private actions       : ActionsService, 
    private guestService  : GuestsService) {

      this.actions.getGuestAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.Select:
              this.showView( action.param1 as Guest );
              break;
            case ActionState.Export:
              this.export();
              break;
          }
        });

  }

  ngOnInit() {
    this.displayedColumns = ['id', 'date', 'time', 'guests', 'status', 'link'];
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();     
  }

  getBookings() {
    this.startLoading();
    this.guestService.getBookingsByGuest(this.guest).subscribe(
      res => {
        const data:Booking[] = res.data.map(v => {
          return {
            ...v,
            time: moment(v.time, 'hh:mm:ss').format('hh:mm A')
          };
        });
        this.endLoading();
        this.sizeOfTotalBookings = data.length;
        this.sizeOfNoShows = data.filter(booking => booking.status === 'No show').length;
        this.sizeOfCanceledBookings = data.filter(booking => booking.status === 'Cancel').length;
        this.dataSource = new BookingDataSource(data);
      },
      err=>{
        this.endLoading();
      }
    );
  }
  export(){
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      useBom: true,
      headers: ['ID', 'Name', 'Email', 'Phone', 'Company', 'WeChatAccount', 'Blocked', 'VIP', 'Tags']
    };
    const filename = "guest";
    let strTag =  this.guest.tags.map( tag => {return tag.name }).join();

    var data = [{
      Id            : this.guest.id,
      Name          : this.guest.name,
      Email         : this.guest.email,
      Phone         : this.guest.phone,
      Company       : this.guest.company_name ? this.guest.company_name : "",
      WeChatAccount : this.guest.wechat_account ? this.guest.wechat_account : "",
      Blocked       : this.guest.is_block ? 'Yes' : 'No',
      VIP           : this.guest.is_vip ? 'Yes' : 'No',
      Tags          : strTag
    }];
    let genCSV = new Angular2Csv(data, filename, options );  
  }

  showEdit() {
    this.actions.toggleGuestAction( ActionState.Edit, this.guest );
  }

  showView( guest: Guest ){
    if ( guest ){
      this.guest = { ...guest };
      console.log( this.guest );
      this.getBookings();
    } else{
      this.guest = null;
    } 

  }

//------- Spinner start -----------------
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
//------- Spinner start -----------------    

}
export interface Booking {
  id: string;
  booking_number: number,
  date: string;
  time: string;
  number_of_people: number;
  status: string;
  link: string;
}

export class BookingDataSource extends DataSource<any> {
  data: Booking[];
  constructor(data: Booking[]) {
    super();
    this.data = data;
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Booking[]> {
    return of(this.data);
  }

  disconnect() { }
}
