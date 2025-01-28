import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataConsultationComponent } from './data-consultation.component';

describe('DataConsultationComponent', () => {
  let component: DataConsultationComponent;
  let fixture: ComponentFixture<DataConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
