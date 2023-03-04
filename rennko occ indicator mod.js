//@version=4
//

strategy(title = "[STRATEGY]Renko Emulator OCC v1 by JustUncleL", shorttitle = "[STRATEGY]REMOCC v1", overlay = true, precision=5,
  pyramiding = 0, default_qty_type = strategy.percent_of_equity, default_qty_value = 10, calc_on_every_tick=false, process_orders_on_close=true)

//
// Original Author: JustUncleL
// Revision:        1
//
// *** EXPERIMENTAL ***
// *** USE AT YOUR OWN RISK ***
//
// Description:
//  - Strategy based around Renko Bar Chart (ATR) or (Traditional)
//    Open-Close Crossovers.
//
// Setup:
//  - For ATR Renko Method setting the strategy ATR resolution to 3-5x that of 
//    the chart you are viewing tends to yield the good results.
//  - For Traditional Renko Method the resolution of the bricks is taken from
//    the chart timeframe. I recommend use low time frame charts (1 to 15min) 
//    for best Renko Brick resolution.
//  - Optionally can display the Emulated Renko Bricks.
//  - Positions get taken automatically following a crossover.
//  - If you make use of the stops/target profit, be sure to take your time tweaking the values. Cutting it too fine
//    will cost you profits but keep you safer, while letting them loose could lead to more drawdown than you
//    can handle.
//
// Modifications:
//  10-Jan-2020
//      - Converted to Pinescript V4
//      - Added option to select Renko Method.
//      - Added option to select Period of BackTest.
//
// === INPUTS ===
//

renkoMethod = input("ATR", title="Renko Box Assignment Method", options=["ATR", "Traditional"])
atrLen = input(defval=10, minval=1, maxval=100, step=1, type=input.float, title="ATR Length for ATR Renko Method")
boxSz = input(defval=0.001, minval=0.0, type=input.float, title="Box size for Traditional Renko Method")
sRchart = input(false, title="Show Renko Emulated Bricks on Chart")

//uRes   = input(2,minval=1,maxval=2,title="Resolution Input Method: 1 - Fixed, 2 - Multiplier")
// -- Resolution input
// Method 1  - Direct input into string
//renRes1 = input('1D',type=string,title="Fixed Resolution for ATR" )

// Method 2  - A Multiple of current time
intRes2 = input(3, minval=1, title="Mutiplier of current Resolution for ATR Renko Method")

renRes = renkoMethod=="Traditional" ? timeframe.period : 
   timeframe.ismonthly ? tostring(timeframe.multiplier * intRes2, "###M") : 
   timeframe.isweekly ? tostring(timeframe.multiplier * intRes2, "###W") : 
   timeframe.isdaily ? tostring(timeframe.multiplier * intRes2, "###D") : 
   timeframe.isintraday ? tostring(timeframe.multiplier * intRes2, "####") : "1D"

//renRes = uRes==1 ? renRes1 : renRes2

renkoID = renkoMethod == "ATR" ? renko(syminfo.tickerid, style="ATR", param=atrLen) : 
   renko(syminfo.tickerid, style="Traditional", param=boxSz)

renko_close = security(renkoID, renRes, close)
renko_open = security(renkoID, renRes, open)
renko_high = security(renkoID, renRes, high)
renko_low = security(renkoID, renRes, low)

col = renko_close < renko_open ? color.fuchsia : color.lime
//
p1=plot(sRchart?renko_close:na, style=plot.style_circles, linewidth=2, color=col)
p2=plot(sRchart?renko_open:na, style=plot.style_circles, linewidth=2, color=col)
fill(p1, p2, color=col, transp=80)
//
p3 = plot(renko_close, style=plot.style_circles, linewidth=2, color=col)
p4 = plot(renko_open, style=plot.style_circles, linewidth=2, color=col)
fill(p1, p2, color=col, transp=80)
//
longCond = 0
shortCond = 0
longCond := renko_close > renko_open ? nz(longCond[1]) + 1 : 0
shortCond := renko_close < renko_open ? nz(shortCond[1]) + 1 : 0

plotshape(title='RENOCC Buy', series=longCond == 1 ? renko_close : na, text='Buy', style=shape.labeldown, location=location.absolute, color=color.green, textcolor=color.white, offset=0)
plotshape(title='RENOCC Sell', series=shortCond == 1 ? renko_close : na, text='Sell', style=shape.labelup, location=location.absolute, color=color.maroon, textcolor=color.white, offset=0)
// === STRATEGY ===
// stop loss
slPoints    = input(defval = 0, title = "Initial Stop Loss Points (zero to disable)", minval = 0)
tpPoints    = input(defval = 0, title = "Initial Target Profit Points (zero for disable)", minval = 0)

///////////////////////////////////////////////
//* Backtesting Period Selector | Component *//
///////////////////////////////////////////////

//* https://www.tradingview.com/script/eCC1cvxQ-Backtesting-Period-Selector-Component *//
//* https://www.tradingview.com/u/pbergden/ *//
//* Modifications made by JustUncleL*//


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//*** START of COMMENT OUT [Alerts]

testStartYear = input(2018, "Backtest Start Year",minval=1980)
testStartMonth = input(6, "Backtest Start Month",minval=1,maxval=12)
testStartDay = input(1, "Backtest Start Day",minval=1,maxval=31)
testPeriodStart = timestamp(testStartYear,testStartMonth,testStartDay,0,0)

testStopYear =  input(9999, "Backtest Stop Year",minval=1980)
testStopMonth = input(12, "Backtest Stop Month",minval=1,maxval=12)
testStopDay =   input(31, "Backtest Stop Day",minval=1,maxval=31)
testPeriodStop = timestamp(testStopYear,testStopMonth,testStopDay,0,0)

testPeriod = time >= testPeriodStart and time <= testPeriodStop ? true : false

//*** END of COMMENT OUT [Alerts]
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

//
//set up exit parameters
TP = tpPoints>0?tpPoints:na
SL = slPoints>0?slPoints:na

// Make sure we are within the bar range, Set up entries and exit conditions
if (testPeriod)
    strategy.entry("long", strategy.long, when=longCond>=1)
    strategy.entry("short", strategy.short, when=shortCond>=1)
    strategy.exit("XL", from_entry = "long", profit = TP, loss = SL)
    strategy.exit("XS", from_entry = "short", profit = TP, loss = SL)

// === /STRATEGY ===
// eof