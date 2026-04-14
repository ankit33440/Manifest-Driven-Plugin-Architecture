import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ForceStatusDto } from './dto/force-status.dto';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('SUPERADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  listUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listUsers(role, status);
  }

  @Patch('users/:id/approve')
  approveUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.approveUser(id, req.user.id);
  }

  @Patch('users/:id/reject')
  rejectUser(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @Req() req: any,
  ) {
    return this.adminService.rejectUser(id, req.user.id, body.note);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.suspendUser(id, req.user.id);
  }

  @Patch('users/:id/reactivate')
  reactivateUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.reactivateUser(id, req.user.id);
  }

  @Patch('users/:id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.changeUserRole(id, req.user.id, dto);
  }

  @Get('audit-logs')
  getAuditLogs(@Query() filter: AuditFilterDto) {
    return this.adminService.getAuditLogs(filter);
  }

  @Patch('projects/:id/force-status')
  forceStatus(
    @Param('id') id: string,
    @Body() dto: ForceStatusDto,
    @Req() req: any,
  ) {
    return this.adminService.forceProjectStatus(id, req.user.id, dto);
  }
}
