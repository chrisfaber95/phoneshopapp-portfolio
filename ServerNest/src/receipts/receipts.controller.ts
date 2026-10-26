import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common';
import { ReceiptService } from './receipt.service';

// Public like the old route (the access rules: GET /order/receipt/:id): the reference is the proof, a UUID or the encrypted
// reference of the e-mail links.
@Controller('v1/order/receipt')
export class ReceiptsController {
  constructor(private readonly service: ReceiptService) {}

  @Get(':orderRef')
  async receipt(@Param('orderRef') orderRef: string, @Query('first') first?: string): Promise<StreamableFile> {
    return new StreamableFile(await this.service.receipt(orderRef, first === '1'), { type: 'application/pdf' });
  }
}
