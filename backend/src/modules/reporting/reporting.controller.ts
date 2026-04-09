import { Controller, Get } from '@nestjs/common';
@Controller('reports')
export class ReportingController {
    @Get('monthly')
    getMonthlyReport() {
        return { data: 'Your mock report payload here' };
    }
}