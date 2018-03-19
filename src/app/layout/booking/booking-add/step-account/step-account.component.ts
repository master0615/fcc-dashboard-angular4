import { Component, OnInit } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { Guest } from 'app/layout/guests/guest';
import { GuestsService } from 'app/layout/guests/guests.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-step-account',
  templateUrl: './step-account.component.html',
  styleUrls: ['./step-account.component.scss']
})
export class StepAccountComponent implements OnInit {
    loading: boolean = false;
    state = false;
    guests: Guest[];
    private componetDestroyed = new Subject(); 
    searchText:string;

    constructor(
        private actionService:ActionsService,
        private guestService: GuestsService
    ) { 

    }

    ngOnInit() {
        this.searchText = '';
        this.search( this.searchText ); // Get list of all guests
    }

    addNewGuest() {
        this.state = true;
        this.actionService.toggleBookingAction( BookingAction.BookingStaff,  new Guest());        
    }

    next() {
        // this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 3);
    }

    prev() {
        if (this.state)
            this.state = false;
        else {
            this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 2);
        }
    }
    private startLoading() {
        this.loading = true;
    }
    private endLoading() {
        this.loading = false;
    }
    search(term: string): void {
        this.startLoading();
        this.guestService.searchGuests(term).takeUntil(this.componetDestroyed).subscribe(
          res => {
            this.endLoading();        
            this.guests = res.data;
          },
          err => {
            this.endLoading();
            this.guests = [];        
          }
        );
    }
    
    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }

    selectGuest(guest: Guest) {
        this.actionService.toggleBookingAction( BookingAction.BookingStaff,  guest);
        this.state = true;
    }
}
