// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © Wilson-IV

//@version=5
strategy("Rebalancing MOD", initial_capital = 1000, currency = currency.USD, format = format.price, default_qty_type = strategy.cash, pyramiding = 5000, commission_type = strategy.commission.percent, commission_value = 0.1, precision = 7, max_labels_count = 500, max_bars_back = 5000, process_orders_on_close = true, calc_on_order_fills = false, calc_on_every_tick = false, overlay = true)



// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 
// ------------------------------------------------------------------------------

//===============================================================================
// --- Discription ---
//===============================================================================

// -  Strategy name                          : Rebalancing
// -  Version                                : 1.0
// -  Developer                              : Wilson-IV

// -  Rebalancing Type                       : Dual coin
// -  Rebalancing Modes                      : Periodic, Treshold
// -  Rebalancing Composition Types          : Equal, Proportion
// -  Rebalancing Exchanges available        : Binance, Coinbase, KuCoin, Kraken
// -  Rebalancing Base currencies            : BTC, USDT
// -  Rebalancing Mian currencies            : ADA, ATOM, BTC, DOGE, ETH, LINK, LTC, QNT, SOL, STRONG, VET, XRP, XLM
// -  Rebalancing Library available          : Yes



//===============================================================================
//=== Import Libraries ===
//===============================================================================

import Wilson-IV/Library_All_In_One/1 as _lib



//===============================================================================
//=== Tooltips, Group- and Inline names ===
//===============================================================================

// --- Inline ---
inline_Date                                                  = "Date"

// --- Group names ---
group_Starting_date                                          = "Starting date"
group_Settings                                               = "Settings"
group_Investment                                             = "Investment"
group_Portfolio                                              = "Portfolio"

// --- Tooltips ---
tooltip_Frequency                                            = "Every hour, 2 hour, 3 hour, ... , daily, weekly and monthly. Note: Rebalance will take place at midnight 0:00 O`clock if Daily, Weekly or Monthly is selected."
tooltip_Exchange_Min_Trade_value                             = "This is the minimum value the trade must have to be executed by the Exchange. Anything below this value will not be executed."
tooltip_Exchange                                             = "Exchange of your choice."
tooltip_Proportion                                           = "Equal is 50% main currency vs 50% base currency, while Proportional is X% main currency vs. (100 - X) % base currency."
tooltip_Mode                                                 = "Periodic: the tradingbot will check for the proportion then rebalance after a fixed interval. \n\nTreshold: rebalancing will take place when the proportion of one or both the currenciess crosses outside the bounds of their desired proportion/allocations."
tooltip_Treshold                                             = "The percentage the proportion may deviate from the initial proportion. If one of the currencies reaches outside this boundary, the rebalance will take place.\n\nNote: This only happens when rebalance mode is set to 'Treshold'."
tooltip_Initial_Investment                                   = "Initial capital."
tooltip_Show_Potential_Rebalance_Momentum                    = "Show the bars where a potential rebalance momentum may take place."



//===============================================================================
//=== Backtest date settings ===
//===============================================================================

startDate                                                    = input.int(title = "Start Date"   , defval = 1    , minval = 1     , maxval = 31    , group = group_Starting_date , inline = inline_Date)
startMonth                                                   = input.int(title = "Start Month"  , defval = 10   , minval = 1     , maxval = 12    , group = group_Starting_date , inline = inline_Date)
startYear                                                    = input.int(title = "Start Year"   , defval = 2021 , minval = 1800  , maxval = 2100  , group = group_Starting_date , inline = inline_Date) 
startHour                                                    = input.int(title = "Start Hour"   , defval = 0    , minval = 0     , maxval = 23    , group = group_Starting_date , inline = inline_Date)
startMinute                                                  = input.int(title = "Start Minute" , defval = 0    , minval = 0     , maxval = 59    , group = group_Starting_date , inline = inline_Date)
startGMT                                                     = input.int(title = "GMT + "       , defval = 2    , minval = 0     , maxval = 12    , group = group_Starting_date , inline = inline_Date)

//=== Start date for Backtesting [Change the GMT setting for your country. E.g.: Amsterdam is GMT+2] ===
Start_backtest                                               = time >= timestamp(("GMT+" + str.tostring(startGMT)), startYear, startMonth, startDate, startHour, startMinute)  ? true : false



//===============================================================================
//=== Variables ===
//===============================================================================

//=== APR === 
var dbl_APR                                                  = 0. 

//=== Determine when to rebalance ===
bln_Potential_Rebalance_Momentum                             = false
bln_Rebalance_Momentum                                       = false

//=== Determine when Treshold has been reached ===
bln_Rebalance_Treshold_Reached                               = false

//=== Buying or selling ===
blnBuy                                                       = false
blnSell                                                      = false



//===============================================================================
//=== Settings ===
//===============================================================================

//=== Exchange ===
options_Exchange                                             = input.string(title = "Exchange"                           , defval = "BINANCE"    , tooltip = tooltip_Exchange                          , group = group_Settings , options = ["BINANCE", "COINBASE", "KUCOIN", "KRAKEN"])
 
//=== Exchange minimum trade value for trading ===
options_Exchange_Min_Trade_value                             = input.float (title = "Minimum trade value"                , defval = 10           , tooltip = tooltip_Exchange_Min_Trade_value          , group = group_Settings , minval = 10 , maxval = 1000 , step = 1)

//=== Frequency ===
options_Rebalancing_Frequency                                = input.string(title = "Frequency"                          , defval = "1 Hour"     , tooltip = tooltip_Frequency                         , group = group_Settings , options = ["1 Hour", "2 Hour", "3 Hour", "4 Hour", "6 Hour", "8 Hour", "12 Hour", "Daily", "Weekly", "Monthly"]) 

//=== Composition ===
options_Rebalancing_Composition                              = input.string(title = "Composition"                        , defval = "Proportion" , tooltip = tooltip_Proportion                        , group = group_Settings , options = ["Equal", "Proportion"]                      ) 

//=== Mode ===
options_Rebalancing_Mode                                     = input.string(title = "Mode"                               , defval = "Treshold"   , tooltip = tooltip_Mode                              , group = group_Settings , options = ["Periodic", "Treshold"])

//=== Treshold ===
dbl_Rebalancing_Treshold                                     = input.float (title = "Treshold"                           , defval = 0.5          , tooltip = tooltip_Treshold                          , group = group_Settings , minval = 0.25 , maxval = 10 , step = 0.25) * 0.01

//=== Show Potential Rebalance Momentum? ===
blnShow_Potential_Rebalance_Momentum                         = input.bool  (title = "Show Potential Rebalance Momentum?" , defval = true         , tooltip = tooltip_Show_Potential_Rebalance_Momentum , group = group_Settings)


//=== Rebalance will take place at midnight 0:00 O`clock if "Daily", "Weekly" or "Monthly" is selected ===
bln_Midnight                                                 = hour(time) == 0 and minute(time) == 0 ? true : false

//=== Timeframe ===
if Start_backtest

	if options_Rebalancing_Frequency == "1 Hour"
		
		if timeframe.period == "60"
			
			bln_Potential_Rebalance_Momentum := true
			
	if options_Rebalancing_Frequency == "2 Hour"
		
		if timeframe.period == "120"
			
			bln_Potential_Rebalance_Momentum := true

	if options_Rebalancing_Frequency == "3 Hour"
		
		if timeframe.period == "180"
			
			bln_Potential_Rebalance_Momentum := true
			
	if options_Rebalancing_Frequency == "4 Hour"
		
		if timeframe.period == "240"
			
			bln_Potential_Rebalance_Momentum := true

	if options_Rebalancing_Frequency == "6 Hour"
		
		if timeframe.period == "360"
			
			bln_Potential_Rebalance_Momentum := true
			
	if options_Rebalancing_Frequency == "8 Hour"
		
		if timeframe.period == "480"
			
			bln_Potential_Rebalance_Momentum := true

	if options_Rebalancing_Frequency == "12 Hour"
		
		if timeframe.period == "720"
			
			bln_Potential_Rebalance_Momentum := true
			
	if options_Rebalancing_Frequency == "Daily" and bln_Midnight
		
		if timeframe.isdaily
			
			bln_Potential_Rebalance_Momentum := true
	
	else if options_Rebalancing_Frequency == "Weekly" and bln_Midnight
		
		if timeframe.isweekly
			
			bln_Potential_Rebalance_Momentum := true
	
	else if options_Rebalancing_Frequency == "Monthly" and bln_Midnight
		
		if timeframe.ismonthly
			
			bln_Potential_Rebalance_Momentum := true
			


//===============================================================================
//=== Investment ===
//=============================================================================== 

//=== Initial Investment ===
var dbl_Initial_Investment                                   = input.float(title = "Initial Investment"              , defval = 2000 , minval = 0                    , step = 10 , tooltip = tooltip_Initial_Investment             , group = group_Investment)



//===============================================================================
//=== Portfolio ===
//===============================================================================

//=== Base currency ===
options_Base_currency                                        = input.string(title = "Base currency" , defval = "USDT" , options = ["BTC", "USDT"]                                                                         , group = group_Portfolio)
 
//=== Main currency ===
options_Main_currency                                        = input.string(title = "Main currency" , defval = "BNB" , options = ["BNB", "SRM", "BTC", "DOGE", "ETH", "FTM", "THETA", "CHZ", "SOL", "SAND", "MATIC", "SUSHI", "SHIB"] , group = group_Portfolio) 

//=== Security of the selected Base currency ===
str_Security_Base_Currency                                   = options_Base_currency != "USDT" ? options_Exchange + ":" + options_Base_currency + "USDT" : ""

//=== Source of the selected Base currency === 
dbl_Base_Currency_Source                                     = options_Base_currency == "USDT" ? 1 : request.security(str_Security_Base_Currency , timeframe.period, close) 

//=== Security of the selected Main currency ===
str_Security_Main_Currency                                   = options_Main_currency != options_Base_currency ? options_Exchange + ":" + options_Main_currency + options_Base_currency : ""

//=== Source of the selected Main currency === 
dbl_Main_Currency_Source                                     = options_Main_currency == options_Base_currency ? 1 : request.security(str_Security_Main_Currency , timeframe.period, close) 



//===============================================================================
//=== Proportion of the coins ===
//===============================================================================

//=== Initial Balance which changes during rebalancing ===
var dbl_Balance                                              = 0. 

//=== Snapshot of the Balance ===
var dbl_Balance_Snapshot                                     = 0. 

//=== Quantity of coins ===
var dbl_Base_Currency_qty_of_coins                           = 0.
var dbl_Main_Currency_qty_of_coins                           = 0.

//=== Quantity of coins to buy or sell ===
var dbl_Base_Currency_qty_of_coins_to_buy_or_sell            = 0.
var dbl_Main_Currency_qty_of_coins_to_buy_or_sell            = 0.

//=== Value of the coins to buy or sell ===
var dbl_Base_Currency_value_of_coins_to_buy_or_sell          = 0.
var dbl_Main_Currency_value_of_coins_to_buy_or_sell          = 0.

//=== Proportion in (%) ===
dbl_Proportion_Base_currency                                 = input.float(title = "Proportion(%) Base currency", defval = 10.0, minval = 0, maxval = 100, step = 1, group = "Proportion") * 0.01
dbl_Proportion_Main_currency                                 = input.float(title = "Proportion(%) Main currency", defval = 90.0, minval = 0, maxval = 100, step = 1, group = "Proportion") * 0.01

//=== Current Proportion in (%) ===
dbl_Proportion_Base_currency_Current                        = 0.
dbl_Proportion_Main_currency_Current                        = 0.



//===============================================================================
//=== Rebalance ===
//===============================================================================

//=== Rebalance only when 2 different coins are selected and the sum of the proportions is equal to 100% ===
bln_Rebalance                                                = (options_Main_currency != options_Base_currency ? true : false) and (dbl_Proportion_Main_currency + dbl_Proportion_Base_currency == 1)

if bln_Rebalance
    
    //=== Overrides!!! (Override the input values of the proportion if set to Equal) ===
    if options_Rebalancing_Composition == "Equal"
        
        dbl_Proportion_Base_currency := 0.5
        dbl_Proportion_Main_currency := 0.5

    //=== Start Rebalancing procedure ===
    if bln_Potential_Rebalance_Momentum
        
        //=== Initial Balance is 0 at the beginning of the strategy ===
        if dbl_Balance == 0
            
            //=== Set Initial Balance equal to the Initial Investment and make a snapshot of it === 
            dbl_Balance := dbl_Initial_Investment
            dbl_Balance_Snapshot := dbl_Balance

            //=== First distribution of the coins ===
            dbl_Base_Currency_qty_of_coins := (dbl_Proportion_Base_currency * dbl_Balance) / dbl_Base_Currency_Source
            dbl_Main_Currency_qty_of_coins := (dbl_Proportion_Main_currency * dbl_Balance) / (dbl_Main_Currency_Source * dbl_Base_Currency_Source)
            
            //=== Current Proportion that changes as the price changes during time ===
            dbl_Proportion_Base_currency_Current := (dbl_Base_Currency_qty_of_coins * dbl_Base_Currency_Source) / dbl_Balance
            dbl_Proportion_Main_currency_Current := (dbl_Main_Currency_qty_of_coins * (dbl_Main_Currency_Source * dbl_Base_Currency_Source)) / dbl_Balance 
            
            //=== First Rebalance momentum ===
            //=== At this stage the Main coins are being bought for the first time. This moment can be considered as the first rebalancing moment. ===
            bln_Rebalance_Momentum := true
            
        else
        
            //=== Adjust Balance according the current marketprice of the Main and Base currency ===
            dbl_Balance := (dbl_Base_Currency_qty_of_coins * dbl_Base_Currency_Source) + (dbl_Main_Currency_qty_of_coins * (dbl_Main_Currency_Source * dbl_Base_Currency_Source))
            
            //=== Current Proportion that changes as the price changes during time ===
            dbl_Proportion_Base_currency_Current := (dbl_Base_Currency_qty_of_coins * dbl_Base_Currency_Source) / dbl_Balance
            dbl_Proportion_Main_currency_Current := (dbl_Main_Currency_qty_of_coins * (dbl_Main_Currency_Source * dbl_Base_Currency_Source)) / dbl_Balance  
            
            //=== Determine when Treshold has been reached ===
            if options_Rebalancing_Mode == "Treshold"
                
                //=== Potentially going SHORT
                if (dbl_Proportion_Main_currency_Current >= dbl_Proportion_Main_currency + dbl_Rebalancing_Treshold) or (dbl_Proportion_Base_currency_Current <= dbl_Proportion_Base_currency - dbl_Rebalancing_Treshold) 

                    bln_Rebalance_Treshold_Reached := true
                
                else
                    
                    //=== Potentially going LONG
                    if (dbl_Proportion_Main_currency_Current <= dbl_Proportion_Main_currency - dbl_Rebalancing_Treshold) or (dbl_Proportion_Base_currency_Current >= dbl_Proportion_Base_currency + dbl_Rebalancing_Treshold) 

                        bln_Rebalance_Treshold_Reached := true
             
            //=== Determine if a rebalance moment should take place ===
            if bln_Rebalance_Treshold_Reached
                
                if (math.abs((dbl_Proportion_Main_currency * dbl_Balance) - (dbl_Main_Currency_qty_of_coins * (dbl_Main_Currency_Source * dbl_Base_Currency_Source))) >= options_Exchange_Min_Trade_value)
                    
                    //=== Next Rebalance momentum ===
                    bln_Rebalance_Momentum := true
        
                    //=== Distribution of the coins according to the new adjusted balance ===
                    dbl_Base_Currency_qty_of_coins := (dbl_Proportion_Base_currency * dbl_Balance) / dbl_Base_Currency_Source
                    dbl_Main_Currency_qty_of_coins := (dbl_Proportion_Main_currency * dbl_Balance) / (dbl_Main_Currency_Source * dbl_Base_Currency_Source)

            else
                    
                if (math.abs((dbl_Proportion_Main_currency * dbl_Balance) - (dbl_Main_Currency_qty_of_coins * (dbl_Main_Currency_Source * dbl_Base_Currency_Source))) >= options_Exchange_Min_Trade_value) and options_Rebalancing_Mode != "Treshold"
                    
                    //=== Next Rebalance momentum ===
                    bln_Rebalance_Momentum := true
        
                    //=== Distribution of the coins according to the new adjusted balance ===
                    dbl_Base_Currency_qty_of_coins := (dbl_Proportion_Base_currency * dbl_Balance) / dbl_Base_Currency_Source
                    dbl_Main_Currency_qty_of_coins := (dbl_Proportion_Main_currency * dbl_Balance) / (dbl_Main_Currency_Source * dbl_Base_Currency_Source)
    
    //=== Quantity of coins to buy or sell ===
    if dbl_Balance[1] == 0
    
        dbl_Base_Currency_qty_of_coins_to_buy_or_sell := 0   
        dbl_Main_Currency_qty_of_coins_to_buy_or_sell := 0
        
        dbl_Base_Currency_value_of_coins_to_buy_or_sell := 0
        dbl_Main_Currency_value_of_coins_to_buy_or_sell := 0
        
    else

        dbl_Base_Currency_qty_of_coins_to_buy_or_sell := dbl_Base_Currency_qty_of_coins - dbl_Base_Currency_qty_of_coins[1]   
        dbl_Main_Currency_qty_of_coins_to_buy_or_sell := dbl_Main_Currency_qty_of_coins - dbl_Main_Currency_qty_of_coins[1]
        
        dbl_Base_Currency_value_of_coins_to_buy_or_sell := math.abs(dbl_Base_Currency_qty_of_coins_to_buy_or_sell * dbl_Base_Currency_Source)
        dbl_Main_Currency_value_of_coins_to_buy_or_sell := math.abs(dbl_Main_Currency_qty_of_coins_to_buy_or_sell * (dbl_Main_Currency_Source * dbl_Base_Currency_Source))
        

    //=== Buy or Sell qty of Main currency coins ===
    if bln_Rebalance_Momentum
        
        //=== Make a snapshot of the Balance at the moment of the Rebalance momentum
        dbl_Balance_Snapshot := dbl_Balance
        
        //=== Sell Main coins because the price increases
        if dbl_Main_Currency_qty_of_coins_to_buy_or_sell < 0 
            
            blnBuy := false
            blnSell := true
        
        //=== Buy Main coins because the price decreases
        else if dbl_Main_Currency_qty_of_coins_to_buy_or_sell > 0    
            
            blnBuy := true
            blnSell := false

    //=== Determine the APR ===
    dbl_APR := dbl_Balance / dbl_Initial_Investment - 1



//===============================================================================
//=== Entries ===
//===============================================================================

//=== Execute entries ===
if Start_backtest
    
    //=== Show Entries? ===
    if blnBuy
        
        strategy.entry("LONG", strategy.long, qty = (dbl_Main_Currency_Source * dbl_Base_Currency_Source) * math.abs(dbl_Main_Currency_qty_of_coins - dbl_Main_Currency_qty_of_coins[1]), limit = close, comment = "Rebalancing")
         
    if blnSell
        
        strategy.entry("SHORT", strategy.short, qty = (dbl_Main_Currency_Source * dbl_Base_Currency_Source) * math.abs(dbl_Main_Currency_qty_of_coins - dbl_Main_Currency_qty_of_coins[1]), limit = close, comment = "Rebalancing")
        
    if bln_Rebalance_Momentum and dbl_Balance[1] == 0
        
        strategy.entry("LONG", strategy.long, qty = (dbl_Main_Currency_Source * dbl_Base_Currency_Source) * math.abs(dbl_Main_Currency_qty_of_coins - dbl_Main_Currency_qty_of_coins[1]), limit = close, comment = "Initial Rebalancing")
   
    

//===============================================================================
//=== Table ===
//===============================================================================

intRow = 0
intCol_1_width = 6
intCol_2_width = 6
intCol_3_width = 4
intCol_4_width = 4

var table atrDisplay = table.new(position.middle_right , 4 , 40 , bgcolor = color.gray , frame_width = 1 , frame_color = color.white , border_width = 1 , border_color = color.white)

intRow += 1

table.cell(atrDisplay , 0 , intRow , ""                             , intCol_1_width , 1 , text_color = color.white , bgcolor = color.white)
table.cell(atrDisplay , 1 , intRow , ""                             , intCol_2_width , 1 , text_color = color.white , bgcolor = color.white)

intRow += 1

table.cell(atrDisplay , 0 , intRow , ""                             , intCol_1_width ,     text_color = color.white , bgcolor = color.blue)
table.cell(atrDisplay , 1 , intRow , "Value"                        , intCol_2_width ,     text_color = color.white , bgcolor = color.blue)

intRow += 1

table.cell(atrDisplay , 0 , intRow , ""                             , intCol_1_width , 1 , text_color = color.white , bgcolor = color.white)
table.cell(atrDisplay , 1 , intRow , ""                             , intCol_2_width , 1 , text_color = color.white , bgcolor = color.white)

intRow += 1

table.cell(atrDisplay , 0 , intRow , "APR"                          , intCol_1_width ,     text_color = color.white , bgcolor = color.orange)
table.cell(atrDisplay , 1 , intRow , str.tostring(dbl_APR, "0.00%") , intCol_2_width ,     text_color = color.white , bgcolor = color.green)

intRow += 1

table.cell(atrDisplay , 0 , intRow , ""                             , intCol_1_width , 1 , text_color = color.white , bgcolor = color.white)
table.cell(atrDisplay , 1 , intRow , ""                             , intCol_2_width , 1 , text_color = color.white , bgcolor = color.white)
    


//===============================================================================
//=== Plottings ===
//===============================================================================

//=== Balance ===
plot(dbl_Initial_Investment , title = "Initial Investment" , color = color.new(color.yellow, 100))

//=== Balance ===
plot(dbl_Balance            , title = "Balance"            , color = color.new(color.green, 100))

//=== APR ===
plot(100 * dbl_APR          , title = "APR"                , color = color.new(color.blue, 100)) 

//=== The moment when potentially the rebalancing will take place ===
bgcolor(blnShow_Potential_Rebalance_Momentum and bln_Potential_Rebalance_Momentum ? color.new(color.blue, 80) : na , title = "Potential Rebalance momentum")

// ------------------------------------------------------------------------------
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒



