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
import { VerifierService } from './verifier.service';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { ReviewDecisionDto } from './dto/review-decision.dto';

@Controller('verifier')
@UseGuards(RolesGuard)
@Roles('VERIFIER', 'SUPERADMIN')
export class VerifierController {
  constructor(private readonly verifierService: VerifierService) {}

  @Get('queue')
  getQueue() {
    return this.verifierService.getQueue();
  }

  @Get('my-projects')
  getMyProjects(@Req() req: any) {
    return this.verifierService.getClaimedProjects(req.user.id);
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.verifierService.getDashboardStats(req.user.id);
  }

  @Patch('projects/:id/claim')
  claim(@Param('id') id: string, @Req() req: any) {
    return this.verifierService.claimProject(id, req.user.id);
  }

  @Patch('projects/:id/checklist')
  updateChecklist(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistDto,
    @Req() req: any,
  ) {
    return this.verifierService.updateChecklist(id, req.user.id, dto);
  }

  @Patch('projects/:id/request-info')
  requestInfo(
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
    @Req() req: any,
  ) {
    return this.verifierService.requestInfo(id, req.user.id, dto);
  }

  @Patch('projects/:id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
    @Req() req: any,
  ) {
    return this.verifierService.approveProject(id, req.user.id, dto);
  }

  @Patch('projects/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
    @Req() req: any,
  ) {
    return this.verifierService.rejectProject(id, req.user.id, dto);
  }

  @Get('projects/:id/review')
  getReview(@Param('id') id: string) {
    return this.verifierService.getReview(id);
  }
}
