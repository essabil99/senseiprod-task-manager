import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkEnvironmentDetailComponent } from './work-environment-detail.component';

describe('WorkEnvironmentDetailComponent', () => {
  let component: WorkEnvironmentDetailComponent;
  let fixture: ComponentFixture<WorkEnvironmentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkEnvironmentDetailComponent]
    });
    fixture = TestBed.createComponent(WorkEnvironmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
