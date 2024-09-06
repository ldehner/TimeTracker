import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeCalendarTrackerComponent } from './time-calendar-tracker.component';

describe('TimeCalendarTrackerComponent', () => {
  let component: TimeCalendarTrackerComponent;
  let fixture: ComponentFixture<TimeCalendarTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeCalendarTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeCalendarTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
