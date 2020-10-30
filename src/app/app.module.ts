import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { ColorPickerModule } from 'ngx-color-picker';
registerLocaleData(localeIt);

import { AppComponent } from './app.component';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { SchedulerModule } from 'angular-calendar-scheduler';

import { AppService } from './services/app.service';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ColorPickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SchedulerModule.forRoot({locale: 'en', headerDateFormat: 'daysRange', logEnabled: true}),
    MatProgressSpinnerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule
  ],
  providers: [
    AppService,
    { provide: LOCALE_ID, useValue: 'en-US' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
