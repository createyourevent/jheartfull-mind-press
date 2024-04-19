import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService } from 'ng-jhipster';
import { ICalbum } from 'app/shared/model/calbum.model';
import { CalbumService } from './calbum.service';
import { ICommunity } from 'app/shared/model/community.model';
import { CommunityService } from 'app/entities/community';
import { AccountService } from 'app/core';

@Component({
    selector: 'jhi-calbum-update',
    templateUrl: './calbum-update.component.html'
})
export class CalbumUpdateComponent implements OnInit {
    calbum: ICalbum;
    isSaving: boolean;

    communities: ICommunity[];
    creationDate: string;

    currentAccount: any;

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected calbumService: CalbumService,
        protected communityService: CommunityService,
        protected accountService: AccountService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ calbum }) => {
            this.calbum = calbum;
            this.creationDate = moment().format(DATE_TIME_FORMAT);
            this.calbum.creationDate = moment(this.creationDate);
        });
        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.myCommunities(this.currentAccount);
        });
        this.communityService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<ICommunity[]>) => mayBeOk.ok),
                map((response: HttpResponse<ICommunity[]>) => response.body)
            )
            .subscribe((res: ICommunity[]) => (this.communities = res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        this.calbum.creationDate = this.creationDate != null ? moment(this.creationDate, DATE_TIME_FORMAT) : null;
        if (this.calbum.id !== undefined) {
            this.subscribeToSaveResponse(this.calbumService.update(this.calbum));
        } else {
            this.subscribeToSaveResponse(this.calbumService.create(this.calbum));
        }
    }

    private myCommunities(currentAccount) {
        const query = {};
        if (this.currentAccount.id != null) {
            query['userId.equals'] = this.currentAccount.id;
        }
        this.communityService.query(query).subscribe(
            (res: HttpResponse<ICommunity[]>) => {
                this.communities = res.body;
                //                console.log('CONSOLOG: M:myCommunities & O: res.body : ', res.body);
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        //        console.log('CONSOLOG: M:myCommunities & O: this.currentAccount.id : ', this.currentAccount.id);
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ICalbum>>) {
        result.subscribe((res: HttpResponse<ICalbum>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackCommunityById(index: number, item: ICommunity) {
        return item.id;
    }
}
