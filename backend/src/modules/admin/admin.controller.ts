import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AdminService } from './admin.service';
import { ApproveUserDto } from './dto/approve-user.dto';
import { RejectUserDto } from './dto/reject-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions('dashboard:view')
  dashboard() {
    return this.adminService.getDashboardSummary();
  }

  @Get('pending-approvals')
  @RequirePermissions('user:approve')
  pendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  @Patch('users/:id/approve')
  @RequirePermissions('user:approve')
  approveUser(
    @Param('id') id: string,
    @Body() dto: ApproveUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.approveUser(id, user.sub, dto.note);
  }

  @Patch('users/:id/reject')
  @RequirePermissions('user:approve')
  rejectUser(
    @Param('id') id: string,
    @Body() dto: RejectUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.rejectUser(id, user.sub, dto.note);
  }

  @Post('invite')
  @RequirePermissions('invitation:create')
  inviteUser(@Body() dto: InviteUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.inviteUser(dto, user.sub);
  }

  @Get('invitations')
  @RequirePermissions('invitation:view')
  getInvitations() {
    return this.adminService.getInvitations();
  }

  @Delete('invitations/:id')
  @RequirePermissions('invitation:revoke')
  revokeInvitation(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.revokeInvitation(id, user.sub);
  }
}
