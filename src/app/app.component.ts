import {Component, OnInit, Inject, LOCALE_ID, HostListener, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import { ElementRef} from '@angular/core';


import * as moment from 'moment';

import {
  endOfDay,
  addMonths
} from 'date-fns';
import {
  DAYS_IN_WEEK,
  SchedulerViewDay,
  SchedulerViewHour,
  SchedulerViewHourSegment,
  CalendarSchedulerEvent,
  CalendarSchedulerEventAction,
  startOfPeriod,
  endOfPeriod,
  addPeriod,
  subPeriod,
  SchedulerDateFormatter,
  SchedulerEventTimesChangedEvent, CalendarSchedulerEventStatus
} from 'angular-calendar-scheduler';
import {
  CalendarView,
  CalendarDateFormatter,
  DateAdapter
} from 'angular-calendar';

import {AppService} from './services/app.service';
import {OwlDateTimeComponent} from 'ng-pick-datetime';
import {convertSpeedFactorToDuration} from '@angular/material/schematics/ng-update/migrations/misc-ripples-v7/ripple-speed-factor';
import {OwlDateTime} from 'ng-pick-datetime/date-time/date-time.class';
import {ColorPickerService, Cmyk} from 'ngx-color-picker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: CalendarDateFormatter,
    useClass: SchedulerDateFormatter
  }]
})
export class AppComponent implements OnInit {

  public static loggedIn: string = null;

  title: string = 'Angular Calendar Scheduler Demo';
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  viewDays: number = DAYS_IN_WEEK;
  forceViewDays: number = DAYS_IN_WEEK;
  refresh: Subject<any> = new Subject();
  locale: string = 'en';
  hourSegments: number = 6;
  weekStartsOn: number = 1;
  startsWithToday: boolean = false;
  activeDayIsOpen: boolean = true;
  excludeDays: number[] = []; // [0];
  dayStartHour: number = 6;
  dayEndHour: number = 22;

  dayModifier: Function;
  hourModifier: Function;
  segmentModifier: Function;
  eventModifier: Function;
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

  actions: CalendarSchedulerEventAction[] = [
    {
      when: 'enabled',
      label: '<span class="valign-center"><i class="material-icons md-18 md-red-500">cancel</i></span>',
      title: 'Delete',
      onClick: (event: CalendarSchedulerEvent): void => {
        if (AppComponent.loggedIn) {
          if (confirm('Delete?')) {
            this.appService.removeEvent(event.id);
            console.log('removed2 and is ' + this.events.length);
            this.refresh.next();
          } else {
            return;
          }
        }

      }
    },
    {
      when: 'enabled',
      label: '<span class="valign-center"><i class="material-icons md-18 md-orange-600">edit</i></span>',
      title: 'Edit',
      onClick: (event: CalendarSchedulerEvent): void => {
        if (AppComponent.loggedIn) {
          this.editEvent(event);
        }
      }
    }
  ];

  events: CalendarSchedulerEvent[];


  @ViewChild('dt') dt;
  @ViewChild('dt1') dt1;
  startDate: Date;
  endDate: Date;

  titleInput: any;
  details: any;

  endDateModel: any;
  startDateModel: any;

  public values: number[] = [1, 2, 4, 6];
  public start: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public end: number[] = [16, 17, 18, 19, 20, 21, 22];

  editingEvent: string;
  passwordInput: any;
  color: string = '#b6b3ad';


  constructor(@Inject(LOCALE_ID) locale: string, private appService: AppService, private dateAdapter: DateAdapter) {

    /*Date.prototype.toJSON = function () {
      return moment(this).format();
    };*/


    this.locale = locale;

    this.dayModifier = ((day: SchedulerViewDay): void => {
      day.cssClass = '';
    }).bind(this);

    this.hourModifier = ((hour: SchedulerViewHour): void => {
      hour.cssClass = '';
    }).bind(this);

    this.segmentModifier = ((segment: SchedulerViewHourSegment): void => {
      segment.isDisabled = false;
    }).bind(this);

    this.eventModifier = ((event: CalendarSchedulerEvent): void => {
      event.isDisabled = false;
    }).bind(this);

    this.dateOrViewChanged();
  }

  ngOnInit(): void {

    this.appService.getEvents(this.actions)
      .then((events: CalendarSchedulerEvent[]) => this.events = events);

    
  }

  viewDaysOptionChanged(viewDays: number): void {
    console.log('viewDaysOptionChanged', viewDays);
    this.forceViewDays = viewDays;
  }

  changeDate(date: Date): void {
    console.log('changeDate', date);
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarView): void {
    console.log('changeView', view);
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    if (this.startsWithToday) {
      this.prevBtnDisabled = false;
      this.nextBtnDisabled = false;
    } else {
      this.prevBtnDisabled = false;
      this.nextBtnDisabled = false;
    }

  }

  viewDaysChanged(viewDays: number): void {
    console.log('viewDaysChanged', viewDays);
    this.viewDays = viewDays;
  }

  dayHeaderClicked(day: SchedulerViewDay): void {
    console.log('dayHeaderClicked Day', day);
  }

  hourClicked(hour: SchedulerViewHour): void {
    console.log('hourClicked Hour', hour);
  }

  segmentClicked(action: string, segment: SchedulerViewHourSegment): void {
    console.log('segmentClicked Action', action);
    console.log('segmentClicked Segment', segment);
  }

  eventClicked(action: string, event: CalendarSchedulerEvent): void {
    console.log('eventClicked Action', action);
    console.log('eventClicked Event', event);
  }

  eventTimesChanged({event, newStart, newEnd, type}: SchedulerEventTimesChangedEvent): void {
    console.log('eventTimesChanged Type', type);
    console.log('eventTimesChanged Event', event);
    console.log('eventTimesChanged New Times', newStart, newEnd);
    const ev: CalendarSchedulerEvent = this.events.find(e => e.id === event.id);
    ev.start = newStart;
    ev.end = newEnd;
    this.refresh.next();
  }

  addNew() {

    if (this.dt == null || this.dt1 == null || this.title == null || this.details == null) {
      console.log('Sth is null');
      return;
    }

    if (this.dt.startAt == null || this.dt1.startAt == null || this.titleInput.value === '' || this.details.value === '') {
      console.log('is empty');
      return;
    }

    this.startDate = this.dt.startAt;
    this.endDate = this.dt1.startAt;
    this.endDate.setDate(this.startDate.getDate());
    this.endDate.setMonth(this.startDate.getMonth());

    if (this.startDate >= this.endDate) {
      confirm('End time is before begin time!' + this.startDate + '\n' + this.endDate);
      return;
    }

    let event = <CalendarSchedulerEvent>{
      id: this.appService.getMax() + '',
      start: this.startDate,
      end: this.endDate,
      person: AppComponent.loggedIn,
      title: this.titleInput,
      content: this.details,
      color: {primary: this.color, secondary: this.color},
      actions: this.actions,
      status: 'dajana' as CalendarSchedulerEventStatus,
      isClickable: true,
      isDisabled: false,
      draggable: false,
      resizable: {
        beforeStart: false,
        afterEnd: false
      }
    };

    if (AppComponent.loggedIn === 'dajana') {
      console.log(AppComponent.loggedIn);
      event.status = 'ok' as CalendarSchedulerEventStatus;
    } else if (AppComponent.loggedIn === 'arnesa') {
      console.log(AppComponent.loggedIn);
      event.status = 'warning' as CalendarSchedulerEventStatus;
    }

    if (this.editingEvent == null) {
      this.appService.addNewEvent(event);
    } else {
      this.appService.editEvent(this.editingEvent, event);
      this.editingEvent = null;
    }

    this.refresh.next();
    this.endDateModel = null;
    this.startDateModel = null;
    this.titleInput = null;
    this.details = null;
    this.dt1.startAt = null;
    this.dt.startAt = null;
    this.color = '#b6b3ad';

  }

  hourChanged(deviceValue) {
    this.hourSegments = deviceValue;
  }

  startChanged(deviceValue) {
    this.dayStartHour = deviceValue;

  }

  endChanged(deviceValue) {
    this.dayEndHour = deviceValue;
  }

  editEvent(event) {

    this.startDateModel = event.start;
    this.endDateModel = event.end;
    this.details = event.content;
    this.titleInput = event.title;
    this.color = event.color.secondary;
    this.editingEvent = event.id;

    document.getElementById('content').scrollIntoView();

  }

  cancel() {
    this.endDateModel = null;
    this.startDateModel = null;
    this.titleInput = null;
    this.details = null;
    this.dt1.startAt = null;
    this.dt.startAt = null;
    this.editingEvent = null;
  }

  passwordChanged($event: Event) {

    if (this.passwordInput === '5ladybug5') {
      AppComponent.loggedIn = 'dajana';
    } else if (this.passwordInput === 'buba8mara8') {
      AppComponent.loggedIn = 'arnesa';
    } else {
      AppComponent.loggedIn = null;
      this.endDateModel = null;
      this.startDateModel = null;
      this.titleInput = null;
      this.details = null;
      this.dt1.startAt = null;
      this.dt.startAt = null;
      this.color = '#b6b3ad';
    }
    this.refresh.next();

  }

  isLoggedIn() {
    return AppComponent.loggedIn != null;
  }

}
