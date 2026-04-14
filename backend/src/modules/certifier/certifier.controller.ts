import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CertifierService } from './certifier.service';
import { CertifyProjectDto } from './dto/certify-project.dto';

class RejectNoteDto {
  note: string;
}

@Controller('certifier')
@UseGuards(RolesGuard)
@Roles('CERTIFIER', 'SUPERADMIN')
export class CertifierController {
  constructor(private readonly certifierService: CertifierService) {}

  @Get('queue')
  getQueue() {
    return this.certifierService.getQueue();
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.certifierService.getDashboardStats(req.user.id);
  }

  @Patch('projects/:id/certify')
  certify(
    @Param('id') id: string,
    @Body() dto: CertifyProjectDto,
    @Req() req: any,
  ) {
    return this.certifierService.certifyProject(id, req.user.id, dto);
  }

  @Patch('projects/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() body: RejectNoteDto,
    @Req() req: any,
  ) {
    return this.certifierService.rejectProject(id, req.user.id, body.note ?? '');
  }

  @Get('projects/:id/batches')
  getBatches(@Param('id') id: string) {
    return this.certifierService.getBatchesForProject(id);
  }
}
