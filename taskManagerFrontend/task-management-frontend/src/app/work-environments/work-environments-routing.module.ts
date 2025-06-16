import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkEnvironmentListComponent } from './work-environment-list.component';
import { WorkEnvironmentDetailComponent } from './work-environment-detail/work-environment-detail.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkEnvironmentListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: WorkEnvironmentDetailComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkEnvironmentsRoutingModule { }
