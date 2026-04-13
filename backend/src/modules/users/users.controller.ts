import { Body, Controller, Get, Param, Patch, Put, Query } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ListUsersDto } from './dto/list-users.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('user:view')
  findAll(@Query() query: ListUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('user:view')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/roles')
  @RequirePermissions('user:assign_roles')
  assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto) {
    return this.usersService.assignRoles(id, dto.roleIds);
  }

  @Patch(':id/status')
  @RequirePermissions('user:update_status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, dto, user.sub);
  }
}
