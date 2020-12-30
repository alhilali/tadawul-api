import { Controller, Get, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  getStocks() {
    return this.stocksService.getStocks();
  }

  @Get(':stockCode')
  getStockInformation(@Param('stockCode') stockCode: string) {
    return this.stocksService.getStockInformation(stockCode);
  }
}
