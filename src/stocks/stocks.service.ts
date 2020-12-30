import { HttpService, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

// This is the structure of the stock data we recieve
export interface StockData {
  rank?: number; // 1 - 20 rank
  company: string;
  lastPrice: number;
  change: number;
  percentChange: number;
}

@Injectable()
export class StocksService {
  private logger = new Logger(StocksService.name);
  constructor(private httpService: HttpService) {}

  async getStocks() {
    const url =
      'https://www.tadawul.com.sa/wps/portal/tadawul/markets/equities?locale=en'; // URL we're scraping

    // Send an async HTTP Get request to the url
    const response = await this.httpService.get(url).toPromise();
    const html = response.data; // Get the HTML from the HTTP request
    const $ = cheerio.load(html); // Load the HTML string into cheerio
    // Top Gainers
    const gainersTable = $('#gainersTable > tbody > tr'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
    const topGainers: StockData[] = [];

    gainersTable.each((i, elem) => {
      const tds = $(elem).find('td');
      const company = $(tds[0]).text().replace(/\t/g, '').replace(/\n/g, '');
      const lastPrice = Number($(tds[1]).text());
      const change = Number($(tds[2]).text());
      const percentChange = Number($(tds[3]).text());
      topGainers.push({
        rank: ++i,
        company,
        lastPrice,
        change,
        percentChange,
      });
    });

    // Top Losers
    const losersTable = $('#losersTable > tbody > tr'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
    const topLosers: StockData[] = [];

    losersTable.each((i, elem) => {
      const tds = $(elem).find('td');
      const company = $(tds[0]).text().replace(/\t/g, '').replace(/\n/g, '');
      const lastPrice = Number($(tds[1]).text());
      const change = Number($(tds[2]).text());
      const percentChange = Number($(tds[3]).text());
      topLosers.push({
        rank: ++i,
        company,
        lastPrice,
        change,
        percentChange,
      });
    });

    return { topGainers, topLosers };
  }

  async getStockInformation(stockCode: string) {
    const url = `https://www.tadawul.com.sa/wps/portal/tadawul/market-participants/issuers/issuers-directory/company-details/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zi_Tx8nD0MLIy83V1DjA0czVx8nYP8PI0MDAz0I4EKzBEKDEJDLYEKjJ0DA11MjQzcTfXDyzJTy_XDCSkryE4yBQA8k2I6/?companySymbol=${stockCode}`; // URL we're scraping

    // Send an async HTTP Get request to the url
    const response = await this.httpService.get(url).toPromise();
    const html = response.data; // Get the HTML from the HTTP request
    const $ = cheerio.load(html); // Load the HTML string into cheerio
    const company = $('#index_head > div > h2').text();
    const lastPrice = Number(
      $(
        '#chart_tab1 > div:nth-child(1) > div:nth-child(1) > div.col-xs-14.col-sm-3.col-md-3.col-lg-3 > dl > dd',
      ).text(),
    );
    const changeDD = $(
      '#chart_tab1 > div:nth-child(1) > div:nth-child(1) > div.col-xs-14.col-sm-5.col-md-7.col-lg-10 > dl > dd',
    ).text();
    const changeNumber = changeDD.slice(0, changeDD.indexOf('('));
    let changePercent = changeDD
      .slice(changeDD.indexOf('(') + 1, changeDD.length - 1)
      .trim();
    changePercent = changePercent.slice(0, changePercent.length - 1);
    const change = Number(changeNumber);
    const percentChange = Number(changePercent);

    const stockData: StockData = {
      company,
      lastPrice,
      change,
      percentChange,
    };
    return stockData;
  }
}
