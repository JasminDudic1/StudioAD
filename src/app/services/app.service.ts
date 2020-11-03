import {Injectable} from '@angular/core';

import * as moment from 'moment';

import {
  CalendarSchedulerEvent,
  CalendarSchedulerEventStatus,
  CalendarSchedulerEventAction
} from 'angular-calendar-scheduler';


@Injectable()
export class AppService {

  events = JSON.parse(localStorage.getItem('events')) || [];
  max = 0;
  initialized = false;

  // tslint:disable-next-line:typedef
  initialize(actions: CalendarSchedulerEventAction[]) {

    this.max = this.events.length ? Math.max(...this.events.map(x => parseInt(x.id, 10))) + 1 : 1;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.events.length; i++) {
      this.events[i].start = new Date(this.events[i].start.toString());
      this.events[i].end = new Date(this.events[i].end.toString());
      this.events[i].actions = actions;
    }

  }

  getEvents(actions: CalendarSchedulerEventAction[]): Promise<CalendarSchedulerEvent[]> {

    if (this.initialized === false) {
      this.initialized = true;
      this.initialize(actions);
    }

    return new Promise(resolve => setTimeout(() => resolve(this.events), 3000));

  }


  // tslint:disable-next-line:typedef
  addNewEvent(event: any) {

    this.events.push(event);
    localStorage.setItem('events', JSON.stringify(this.events));

    this.max++;

  }

  // tslint:disable-next-line:typedef
  removeEvent(id: string) {

    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].id === id) {
        this.events.splice(i, 1);
        localStorage.setItem('events', JSON.stringify(this.events));
        return;
      }
    }


  }

  // tslint:disable-next-line:typedef
  editEvent(id: string, event: any) {

    const eventz = this.events.find(x => x.id === id);


    eventz.start = event.start;
    eventz.end = event.end;
    eventz.title = event.title;
    eventz.content = event.content;
    eventz.person = event.person;
    eventz.color = event.color;
    localStorage.setItem('events', JSON.stringify(this.events));

  }

  // tslint:disable-next-line:typedef
  getMax() {
    return this.max;
  }


}


