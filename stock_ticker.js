/***************************/
/*** Stock Ticker Widget ***/
/***************************/

let stocksInfo = await getStockData()
let widget = await createWidget()

if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentSmall()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(api) {
  
  // Font name and size  
  const FONT_NAME = 'Menlo';
  const FONT_SIZE = 10;
  
  let upticker = SFSymbol.named("chevron.up");
  let downticker = SFSymbol.named("chevron.down");

  let widget = new ListWidget()

  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#29323c"),
    new Color("13233F")
  ]
  widget.backgroundGradient = gradient
  
  /*** Create Each Row ***/
  for(j = 0; j < stocksInfo.length; j++)
  {
    widget.setPadding(0, 15, 0, 10)
    
    let row = widget.addStack();
    row.size = new Size(320, 0)
    
    let currentStock = stocksInfo[j];
    
    /*** Add Stock Symbol ***/
    let stockSymbol = row.addText(currentStock.symbol);
    stockSymbol.textColor = Color.white();
    stockSymbol.font = new Font(FONT_NAME, FONT_SIZE);
    row.addSpacer()
    
    /*** Add Current Price of Ticker ***/
    // Set Spacing
    let symbPriceSpacing = ""
    for(i = 0; i < 7 - currentStock.changepercent.length + 1; i++)  
    {
      symbPriceSpacing = symbPriceSpacing + " "
    }  
    
    // Set Ticker Price
    let symbolPrice = row.addText(currentStock.price + symbPriceSpacing);
    symbolPrice.textColor = Color.white();
    symbolPrice.font = new Font(FONT_NAME, FONT_SIZE);

    /*** Add Percent Change of Ticker Price ***/
    // Set Spacing
    let perChgSpacing = ""
    for(i = 0; i < 8 - currentStock.changevalue.length; i++)  
    {
      perChgSpacing = perChgSpacing + " "
    }
    
    // Set Ticker Price Percent Change
    let percentChange = row.addText(currentStock.changepercent + "%" + perChgSpacing);
    if(currentStock.changepercent < 0) {
      percentChange.textColor = Color.red();    
    } else {
      percentChange.textColor = Color.green();
    }
    percentChange.font = new Font(FONT_NAME, FONT_SIZE);

    /*** Add Dollar Change of Ticker Price ***/
   let changeValue = row.addText(currentStock.changevalue);
    if(currentStock.changevalue < 0) {
      changeValue.textColor = Color.red();
    } else {
      changeValue.textColor = Color.green();
    }
    changeValue.font = new Font(FONT_NAME, FONT_SIZE);

    /*** Add Ticker Icon ***/
    let ticker = null;
    if(currentStock.changevalue < 0){
      ticker = row.addImage(downticker.image);
      ticker.tintColor = Color.red();
    } else {
      ticker = row.addImage(upticker.image);
      ticker.tintColor = Color.green();
    }
    ticker.imageSize = new Size(8,8);
   
  }
  return widget
}

async function getStockData() { 
  let stocks = null;
// Read from WidgetParameter if present or use hardcoded values
// Provide values in Widget Parameter as comma seperated list  
  if(args.widgetParameter == null) {
    stocks = ["AAPL", "TSLA", "FB", "AMZN"];
  } else {
    stocks = args.widgetParameter.split(",");
  }
 
  let stocksdata = [];
  for(i=0; i< stocks.length; i++)
  {
    let stkdata = await queryStockData(stocks[i].trim());
    let price = stkdata.quoteSummary.result[0].price;
    let priceKeys = Object.keys(price);
 
    let data = {};
    data.symbol = price.symbol;
    data.changepercent = (price.regularMarketChangePercent.raw * 100).toFixed(2);
    data.changevalue = price.regularMarketChange.raw.toFixed(2);
    data.price = price.regularMarketPrice.raw.toFixed(2);
    data.high = price.regularMarketDayHigh.raw.toFixed(2);
    data.low = price.regularMarketDayLow.raw.toFixed(2);
    data.prevclose = price.regularMarketPreviousClose.raw.toFixed(2);
    data.name = price.shortName;
    stocksdata.push(data);
   
  }
  return stocksdata;
}

async function queryStockData(symbol) {
  let url = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + symbol + "?modules=price"
  let req = new Request(url)
  return await req.loadJSON()
}