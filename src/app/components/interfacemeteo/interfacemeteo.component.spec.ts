import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfacemeteoComponent } from './interfacemeteo.component';

describe('InterfacemeteoComponent', () => {
  let component: InterfacemeteoComponent;
  let fixture: ComponentFixture<InterfacemeteoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfacemeteoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfacemeteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
