import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('role:view')
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('role:create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('role:update')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('role:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Put(':id/permissions')
  @RequirePermissions('role:assign_permissions')
  replacePermissions(@Param('id') id: string, @Body() dto: ReplaceRolePermissionsDto) {
    return this.rolesService.replacePermissions(id, dto.permissionIds);
  }
}
