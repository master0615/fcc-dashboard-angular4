import { Component, OnInit , OnDestroy, ViewEncapsulation} from '@angular/core';

import { HeaderService, MainPageState, SubPageState } from '../header.service';
import { Subject } from 'rxjs/Subject';
import { ApiService } from 'app/api.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None  
})
export class NotificationsComponent implements OnInit, OnDestroy {

    private componetDestroyed = new Subject();
    loading = false;

    notifications:Array<any>;

    displayedColumns;
    dataSource;
    pageSize = 10;
    pageNumber = 0;
    offSet = 0;
    totalElements = 0;
    current_user;
    columns = [
      { prop: 'No' },
      { prop: 'Type' },
      { prop: 'Date' },
      { prop: 'Comment' }                      
    ];
  constructor(
    private header: HeaderService,
    private apis: ApiService,
    private tokenStorage  : TokenStorage) { }

  ngOnInit() {
    this.header.setPage( MainPageState.Notifications, SubPageState.None );
    this.notifications = []; 
    this.displayedColumns = [ 'No', 'Type', 'Date', 'Comment'];
    this.startLoading();
    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
        user => { 
            this.current_user = user;
            this.apis.getNotification(user.id).takeUntil(this.componetDestroyed).subscribe(
                result => {
                    this.endLoading();
                    let rows = [];
                    result.data.forEach ( ( item, index ) => {
                        rows.push({
                            'id': item.id,
                            'No': index + 1,
                            'Type': item.type,
                            'Date': item.updated_at,
                            'Comment': item.key_info1,
                        });
                    });
                    this.totalElements = rows.length;
                    this.notifications = rows;
                    console.log(this.notifications);

                },
                err => {
                    this.endLoading();       
                    console.log('error');             
                    this.notifications = [];
                }
            );
      });
  }

  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();  
  }
  setPage(pageInfo){
    this.pageNumber = pageInfo.offset;
    let offSetNumber = this.pageNumber * this.pageSize + 1;
    console.log( offSetNumber );
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
