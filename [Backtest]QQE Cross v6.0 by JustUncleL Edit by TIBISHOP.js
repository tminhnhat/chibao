//@version=3
//

//*** START of COMMENT OUT [Alerts]
strategy(title="[Backtest]QQE Cross v6.0 by JustUncleL Edit by TIBISHOP", shorttitle="[BT]QQEX v6.0-edit by TIBISHOP", overlay=true, 
         pyramiding=0, default_qty_value=1000, commission_value=0.1, 
         commission_type=strategy.commission.percent, initial_capital=10000)
//*** END of COMMENT OUT [Alerts]
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//*** START of COMMENT OUT [BackTest]
//study(title="[Alerts]QQE Cross v6.0 by JustUncleL", shorttitle="[AL]QQEX v6.0", overlay=true,max_bars_back=2000)
//*** END of COMMENT OUT [BackTest]

//
// Author:  JustUncleL
// Date:    10-July-2016
// Version: v6, Major Release Nov-2018
//
// Description:
//  A following indicator is Trend following that uses fast QQE crosses with Moving Averages
//  for trend direction filtering. QQE or Qualitative Quantitative Estimation is based 
//  on the relative strength index (RSI), but uses a smoothing technique as an additional 
//  transformation. Three crosses can be selected (all selected by default): 
//    - Smooth RSI signal crossing ZERO (XZ)
//    - Smooth RSI signal crossing Fast QQE line (XQ), this is like an early warning swing signal.
//    - Smooth RSI signal exiting the RSI Threshhold Channel (XC), this is like a confirmed swing signal.
//      An optimumal Smooth RSI threshold level is between 5% and 10% (default=10), it helps reduce
//      the false swings.
//  These signals can be selected to Open Short/Long and/or Close a trade, default is XC open
//  trade and XQ (or opposite open) to Close trade.
//
//  The (LONG/SHORT) alerts can be optionally filtered by the Moving Average Ribbons:
//    - For LONG alert the Close must be above the fast MA Ribbon and 
//        fast MA Ribbon must be above the slow MA Ribbon.
//    - For SHORT alert the Close must be below the fast MA Ribbon and
//        fast MA Ribbon must be below the slow MA Ribbon.
//  and/or directional filter:
//    - For LONG alert the Close must be above the medium MA and the
//      directional of both MA ribbons must be Bullish.
//    - For SELL alert the Close must be below the medium MA and the
//      directional of both MA ribbons must be Bearish.
//
//  This indicator is designed to be used as a Signal to Signal trading BOT 
//  in automatic or semi-automatic way (start and stop when conditions are suitable).
//  - For LONG and SHORT alerts I recommend you use "Once per Bar" alarm option
//  - For CLOSE alerts I recommend you use "Once per Bar Close" alarm option
//  (* The script has been designed so that long/short signals come at start of candles *)
//  (* and close signals  come at the end of candles                                    *)
//
// Mofidifications:
//  6.0 - Major Release Version
//      - Added second MA ribbon to help filter signals to the trend direction.
//      - Modified Alert filtering to include second MA Ribbon
//      - Change default settings to reflect Signal to Signal BOT parameters.
//      - Removed older redunant alerts.
//
//  5.0 - Development series
//
//  4.1 - Fix bug with painting Buy/Sell arrows when non-repaint shunt mode selected.
//      - Added option to alert just the first Buy/Sell alert after a trend swing
//      - Added Long and Short Alarms. When combined with the "first Buy/Sell" in trend option,
//        It is now possible to use this indicator to interface with AutoView 
//        or ProfitView. I suggest using the "QQEX XZ Alert" alarm to exit Long or Short
//        trade. Use only "Once per bar Close" option for Alarms. This is not a full
//        fledged trading BOT though with TP/SL settings.
//
//      - Changed QQE defaults to be a bit smoother (8, 5, 3) instead of (6, 3, 2.618).
//
//  4.0 - Added implied GPL copyright notice.
//      - Changed defaults to use HullMAs instead of EMAs.
//  3.0 - No repaint on BUY/SELL alert, however, now trades should be taken when the BUY/SELL
//        Alert is displayed. The alarm is still generated on the previous candle so you can
//        still get a pre-warning, this enables you time to analyse the pending alert.
//      - Added option to test success of alerted trades, highlight successful and failed trade bars
//        and show simple stats: success rate and number of trades (out of 5000), this will help
//        tune the settings for timeframe and currency PAIR.
//  2.0 - Added code to use the medium moving average (EMA20) rising/falling for additional
//        trend direction filter.
//      - Remove Moving Average cross over signals and other options not used in this indicator.
//      - Added code to distinguish between the crosses, now only show Thresh Hold crosses as BUY/SELL
//        alerts.
//      - Modidied default settings to more well known MA's and slightly different QQE settings, these
//        work well at lower timeframes.
//      - Added circle plots at bottom of chart to show when actual BUY/SELL alerts occur.
//  1.0 - original
//
// References:
//  Some Code borrowed from:
//  - "Scalp Jockey - MTF MA Cross Visual Strategizer by JayRogers"
//  - "QQE MT4 by glaz"
//  Inspiration from:
//  - http://www.forexstrategiesresources.com/binary-options-strategies-ii/189-aurora-binary-trading/
//  - http://www.forexstrategiesresources.com/metatrader-4-trading-systems-v/652-qqe-smoothed-trading/
//  - http://dewinforex.com/forex-indicators/qqe-indicator-not-quite-grail-but-accurately-defines-trend-and-flat.html
//  - "Binary option trading by two previous bars" by radixvinni
//
//
// -----------------------------------------------------------------------------
// Copyright 2015 Glaz,JayRogers
//
// Copyright 2016,2017,2018 JustUncleL
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// The GNU General Public License can be found here
// <http://www.gnu.org/licenses/>.
//
// -----------------------------------------------------------------------------
//

// Use Alternate Anchor TF for MAs 
anchor     = input(4,minval=0,maxval=100,title="Relative TimeFrame Multiplier for Second MA Ribbon (0=none, max=100)")
//

// - INPUTS START
// Fast MA - type, source, length
showAvgs     = input(true,title="Show Moving Average Lines")
type1   = input(defval="EMA", title="Fast MA Type: ", options=["SMA", "EMA", "WMA", "VWMA", "SMMA", "DEMA", "TEMA", "HullMA", "ZEMA", "TMA", "SSMA"], type=string)
len1    = input(defval=16, title="Fast - Length", minval=1)
gamma1  = 0.33
// Medium Fast MA - type, source, length
type2   = input(defval="EMA", title="Medium MA Type: ", options=["SMA", "EMA", "WMA", "VWMA", "SMMA", "DEMA", "TEMA", "HullMA", "ZEMA", "TMA", "SSMA"], type=string)
len2    = input(defval=21, title="Medium - Length", minval=1)
gamma2  = 0.55
// Slow MA - type, source, length
type3   = input(defval="EMA", title="Slow MA Type: ", options=["SMA", "EMA", "WMA", "VWMA", "SMMA", "DEMA", "TEMA", "HullMA", "ZEMA", "TMA", "SSMA"], type=string)
len3    = input(defval=26, title="Slow Length", minval=1)
gamma3  = 0.77
//
// QQE rsi Length, Smoothing, fast ATR factor, source
RSILen  = input(14,title='RSI Length')
SF      = input(8,title='RSI Smoothing Factor')
QQEfactor  = input(5.0,type=float,title='Fast QQE Factor')
threshhold = input(10, title="RSI Threshhold")
//
sQQEx   = input(true,title="Show QQE Signal crosses")
sQQEz   = input(false,title="Show QQE Zero crosses")
sQQEc   = input(true,title="Show QQE Thresh Hold Channel Exits")
//
tradeSignal = input("XC", title="Select which QQE signal to Buy/Sell", options=["XC","XQ","XZ"])
closeSignal = input("XQ", title="Select which QQE signal to Close Order", options=["XC","XQ","XZ"])
//
xfilter = input(true, title="Filter XQ Buy/Sell Orders by Threshold" )
filter  = input(false,title="Use Moving Average Filter")
dfilter = input(true, title="Use Trend Directional Filter" )
ufirst  = input(false, title="Only Alert First Buy/Sell in a new Trend")
RSIsrc  = input(close,title="Source")

src     = RSIsrc // MA source
srcclose= RSIsrc

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
testStartDay = input(12, "Backtest Start Day",minval=1,maxval=31)
testPeriodStart = timestamp(testStartYear,testStartMonth,testStartDay,0,0)

testStopYear = 9999 //input(9999, "Backtest Stop Year",minval=1980)
testStopMonth = 12 // input(12, "Backtest Stop Month",minval=1,maxval=12)
testStopDay = 31 //input(31, "Backtest Stop Day",minval=1,maxval=31)
testPeriodStop = timestamp(testStopYear,testStopMonth,testStopDay,0,0)

testPeriod = time >= testPeriodStart and time <= testPeriodStop ? true : false

//*** END of COMMENT OUT [Alerts]
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

// - INPUTS END


gold = #FFD700
AQUA = #00FFFFFF
BLUE = #0000FFFF
RED  = #FF0000FF
LIME = #00FF00FF
GRAY = #808080FF

// - FUNCTIONS

// - variant(type, src, len, gamma)
// Returns MA input selection variant, default to SMA if blank or typo.

// SuperSmoother filter
// © 2013  John F. Ehlers
variant_supersmoother(src,len) =>
    a1 = exp(-1.414*3.14159 / len)
    b1 = 2*a1*cos(1.414*3.14159 / len)
    c2 = b1
    c3 = (-a1)*a1
    c1 = 1 - c2 - c3
    v9 = 0.0
    v9 := c1*(src + nz(src[1])) / 2 + c2*nz(v9[1]) + c3*nz(v9[2])
    v9
    
variant_smoothed(src,len) =>
    v5 = 0.0
    v5 := na(v5[1]) ? sma(src, len) : (v5[1] * (len - 1) + src) / len
    v5

variant_zerolagema(src,len) =>
    ema1 = ema(src, len)
    ema2 = ema(ema1, len)
    v10 = ema1+(ema1-ema2)
    v10
    
variant_doubleema(src,len) =>
    v2 = ema(src, len)
    v6 = 2 * v2 - ema(v2, len)
    v6

variant_tripleema(src,len) =>
    v2 = ema(src, len)
    v7 = 3 * (v2 - ema(v2, len)) + ema(ema(v2, len), len)               // Triple Exponential
    v7
    
//calc Laguerre
variant_lag(p,g) =>
    L0 = 0.0
    L1 = 0.0
    L2 = 0.0
    L3 = 0.0
    L0 := (1 - g)*p+g*nz(L0[1])
    L1 := -g*L0+nz(L0[1])+g*nz(L1[1])
    L2 := -g*L1+nz(L1[1])+g*nz(L2[1])
    L3 := -g*L2+nz(L2[1])+g*nz(L3[1])
    f = (L0 + 2*L1 + 2*L2 + L3)/6
    f

// return variant, defaults to SMA 
variant(type, src, len, g) =>
    type=="EMA"     ? ema(src,len) : 
      type=="WMA"   ? wma(src,len): 
      type=="VWMA"  ? vwma(src,len) : 
      type=="SMMA"  ? variant_smoothed(src,len) : 
      type=="DEMA"  ? variant_doubleema(src,len): 
      type=="TEMA"  ? variant_tripleema(src,len): 
      type=="LAGMA" ? variant_lag(src,g) :
      type=="HullMA"? wma(2 * wma(src, len / 2) - wma(src, len), round(sqrt(len))) :
      type=="SSMA"  ? variant_supersmoother(src,len) : 
      type=="ZEMA"  ? variant_zerolagema(src,len) : 
      type=="TMA"   ? sma(sma(src,len),len) : 
                      sma(src,len)

// - /variant 

// If have anchor specified, calculate the base multiplier, base on time in mins
//mult  = isintraday ? anchor==0 or interval<=0 or interval>=anchor or anchor>1440? 1 : round(anchor/interval) : 1
//mult := not isintraday?  1 : mult  // Only available Daily or less

// Anchor is a relative multiplier based on current TF.
mult = anchor>0 ? anchor : 1 

// - FUNCTIONS END

 
// - Fast ATR QQE
//
Wilders_Period = RSILen * 2 - 1
//
Rsi = rsi(RSIsrc,RSILen)
RSIndex = ema(Rsi, SF)
AtrRsi = abs(RSIndex[1] - RSIndex)
MaAtrRsi = ema(AtrRsi, Wilders_Period)
DeltaFastAtrRsi = ema(MaAtrRsi,Wilders_Period) * QQEfactor
//
newshortband=  RSIndex + DeltaFastAtrRsi
newlongband= RSIndex - DeltaFastAtrRsi
longband = 0.0
shortband=0.0
trend = 0
longband:=RSIndex[1] > longband[1] and RSIndex > longband[1] ? max(longband[1],newlongband) : newlongband
shortband:=RSIndex[1] < shortband[1] and  RSIndex < shortband[1] ? min(shortband[1],newshortband) : newshortband
trend:=cross(RSIndex, shortband[1])? 1 : cross(longband[1], RSIndex) ? -1 : nz(trend[1],1)
FastAtrRsiTL = trend==1 ? longband : shortband


// - SERIES VARIABLES
// MA's
ma_fast    = variant(type1, srcclose, len1, gamma1)
ma_medium  = variant(type2, srcclose, len2, gamma2)
ma_slow    = variant(type3, srcclose, len3, gamma3)
// MA's
ma_fast_alt    = variant(type1, srcclose, len1*mult, gamma1)
ma_medium_alt  = variant(type2, srcclose, len2*mult, gamma2)
ma_slow_alt    = variant(type3, srcclose, len3*mult, gamma3)

// Get Direction From Medium Moving Average
direction = rising(ma_medium,3) ? 1 : falling(ma_medium,3) ? -1 : 0
altDirection = rising(ma_medium_alt,3) ? 1 : falling(ma_medium_alt,3) ? -1 : 0
//
// Find all the QQE Crosses
QQExlong  = 0, QQExlong := nz(QQExlong[1])
QQExshort = 0, QQExshort := nz(QQExshort[1])
QQExlong  := FastAtrRsiTL< RSIndex ? QQExlong+1 : 0
QQExshort := FastAtrRsiTL> RSIndex ? QQExshort+1 : 0
// Zero cross
QQEzlong  = 0, QQEzlong := nz(QQEzlong[1])
QQEzshort = 0, QQEzshort := nz(QQEzshort[1])
QQEzlong  := RSIndex>=50 ? QQEzlong+1 : 0
QQEzshort := RSIndex<50 ? QQEzshort+1 : 0
//  
// Thresh Hold channel Crosses give the BUY/SELL alerts.
QQEclong  = 0, QQEclong := nz(QQEclong[1])
QQEcshort = 0, QQEcshort := nz(QQEcshort[1])
QQEclong  := RSIndex>(50+threshhold) ? QQEclong+1 : 0
QQEcshort := RSIndex<(50-threshhold) ? QQEcshort+1 : 0

//
// Check Filtering.
QQEflong = mult == 1 ? (not filter or (srcclose>ma_medium and ma_medium>ma_slow and ma_fast>ma_medium)) and (not dfilter or (direction>0 )) :
                       (not filter or (ma_medium>ma_medium_alt and srcclose>ma_fast and ma_fast>ma_medium)) and (not dfilter or (direction>0 and altDirection>0 and srcclose>ma_medium))
QQEfshort = mult == 1 ? (not filter or (srcclose<ma_medium and ma_medium<ma_slow and ma_fast<ma_medium)) and (not dfilter or (direction<0 )) :
                       (not filter or (ma_medium<ma_medium_alt and srcclose<ma_fast and ma_fast<ma_medium)) and (not dfilter or (direction<0 and altDirection<0 and srcclose<ma_medium))
  
QQExfilter = (not xfilter or  RSIndex>(50+threshhold) or RSIndex<(50-threshhold))
//
// Get final BUY / SELL alert determination
buy_ = 0, buy_ := nz(buy_[1])
sell_ = 0, sell_ := nz(sell_[1])

// Make sure Buy/Sell are non-repaint and occur after close signal.
buy_  := tradeSignal=="XC"? (QQEclong[1]==1 and QQEflong[1] ? buy_+1 : 0) :
         tradeSignal=="XQ"? (QQExlong[1]==1 and QQEflong[1] and QQExfilter[1]? buy_+1 : 0) :
         tradeSignal=="XZ"? (QQEzlong[1]==1 and QQEflong[1] ? buy_+1 : 0) :  0
sell_ := tradeSignal=="XC"? (QQEcshort[1]==1 and QQEfshort[1] ? sell_+1 : 0) : 
         tradeSignal=="XQ"? (QQExshort[1]==1 and QQEfshort[1] and QQExfilter[1]? sell_+1 : 0) : 
         tradeSignal=="XZ"? (QQEzshort[1]==1 and QQEfshort[1] ? sell_+1 : 0) : 0
//
// Find the first Buy/Sell in trend swing.
Buy = 0, Buy := nz(Buy[1])
Sell = 0, Sell := nz(Sell[1])
Buy := sell_>0 ? 0 : buy_==1 or Buy>0  ? Buy+1 : Buy
Sell := buy_>0 ? 0 : sell_==1 or Sell>0 ? Sell+1 : Sell

// Select First or all buy/sell alerts.
buy = ufirst ? Buy : buy_
sell = ufirst ? Sell : sell_

closeLong = 0, closeLong := nz(closeLong[1])
closeShort = 0, closeShort := nz(closeShort[1])
closeLong  := closeSignal=="XC" ? (QQEcshort==1 ? closeLong+1 : 0)  :
              closeSignal=="XQ" ? tradeSignal=="XQ" ? (QQExshort==1 ? closeLong+1 : 0) : ((QQExshort==1 or QQEzshort or QQEcshort) ? closeLong+1 : 0)  :
              closeSignal=="XZ" ? (QQEzshort==1 ? closeLong+1 : 0)  : 0
closeShort := closeSignal=="XC" ? (QQEclong==1 ? closeShort+1 : 0)  :
              closeSignal=="XQ" ? tradeSignal=="XQ" ? (QQExlong==1 ? closeShort+1 : 0) : ((QQExlong==1  or QQEzlong or QQEclong==1) ? closeShort+1 : 0)  :
              closeSignal=="XZ" ? (QQEzlong==1 ? closeShort+1 : 0)  : 0


tradestate = 0, tradestate := nz(tradestate[1])
tradestate := tradestate==0 ? (buy==1 ? 1 : sell==1 ? 2 : 0) : (tradestate==1 and closeLong==1) or (tradestate==2 and closeShort==1)? 0 : tradestate 

isLong  = change(tradestate) and tradestate==1
isShort =  change(tradestate) and tradestate==2
isCloseLong =  change(tradestate) and tradestate==0 and nz(tradestate[1])==1
isCloseShort =  change(tradestate) and tradestate==0 and nz(tradestate[1])==2

// - SERIES VARIABLES END

// - PLOTTING
// Ma's
tcolor = direction<0?red:green
ma1=plot(showAvgs?ma_fast:na, title="MA Fast", color=tcolor, linewidth=1, transp=0)
ma2=plot(showAvgs?ma_medium:na, title="MA Medium Fast", color=tcolor, linewidth=2, transp=0)
ma3=plot(showAvgs?ma_slow:na, title="MA Slow", color=tcolor, linewidth=1, transp=0)
fill(ma1,ma3,color=tcolor,transp=90)
// Ma's
altTcolor=altDirection<0?blue:aqua
ma4=plot(showAvgs and mult>1?ma_fast_alt:na, title="MA Fast", color=altTcolor, linewidth=1, transp=0)
ma5=plot(showAvgs and mult>1?ma_medium_alt:na, title="MA Medium Fast", color=altTcolor, linewidth=2, transp=0)
ma6=plot(showAvgs and mult>1?ma_slow_alt:na, title="MA Slow", color=altTcolor, linewidth=1, transp=0)
fill(ma4,ma6,color=altTcolor,transp=90)
// QQE exit from Thresh Hold Channel
plotshape(sQQEc and QQEclong==1 and not isLong, title="QQE X Over Channel", style=shape.triangleup, location=location.belowbar, text="XC", color=olive, transp=20, size=size.tiny)
plotshape(sQQEc and QQEcshort==1 and not isShort, title="QQE X Under Channel", style=shape.triangledown, location=location.abovebar, text="XC", color=red, transp=20, size=size.tiny)
// QQE crosses
plotshape(sQQEx and QQExlong==1 and QQEclong!=1 and not isLong, title="QQE Cross Over", style=shape.triangleup, location=location.belowbar, text="XQ", color=blue, transp=20, size=size.tiny)
plotshape(sQQEx and QQExshort==1 and QQEcshort!=1 and not isShort, title="QQE Cross Under", style=shape.triangledown, location=location.abovebar, text="XQ", color=black, transp=20, size=size.tiny)
// Signal crosses zero line
plotshape(sQQEz and QQEzlong==1 and QQEclong!=1 and not isLong and QQExlong!=1, title="QQE Zero Cross Over", style=shape.triangleup, location=location.belowbar, text="XZ", color=aqua, transp=20, size=size.tiny)
plotshape(sQQEz and QQEzshort==1 and QQEcshort!=1 and not isShort and QQExshort!=1, title="QQE Zero Cross Under", style=shape.triangledown, location=location.abovebar, text="XZ", color=fuchsia, transp=20, size=size.tiny)
//
//*** START of COMMENT OUT [BackTest]
//plotshape(isLong, title="QQEX Long", style=shape.arrowup, location=location.belowbar, text="Open\nLONG", color=lime, textcolor=green, transp=0, size=size.small)
//plotshape(isShort, title="QQEX Short", style=shape.arrowdown, location=location.abovebar, text="Open\nSHORT", color=red, textcolor=maroon, transp=0, size=size.small)
//plotshape(isCloseLong, title="QQEX Close Long", style=shape.arrowdown, location=location.abovebar, text="Close\nLONG", color=gray, textcolor=gray, transp=0, size=size.small)
//plotshape(isCloseShort, title="QQEX Close Short", style=shape.arrowup, location=location.belowbar, text="Close\nSHORT", color=gray, textcolor=gray, transp=0, size=size.small)
//*** END of COMMENT OUT [BackTest]

// - PLOTTING END

// - ALERTING

//*** START of COMMENT OUT [Alerts]
if testPeriod
    strategy.entry("Long", 1, when=isLong)
    strategy.close("Long", when=isCloseLong )
    strategy.entry("Short", 0,  when=isShort)
    strategy.close("Short", when=isCloseShort )
//end if
//*** END of COMMENT OUT [Alerts]

//*** START of COMMENT OUT [BackTest]
//
// Signal to Signal BOT Alerts.
//
//alertcondition(isLong,  title="QQEX Long", message="QQEX LONG")  // use "Once per Bar" option
//alertcondition(isShort, title="QQEX Short", message="QQEX SHORT") // use "Once per Bar" option
//alertcondition(isCloseLong, title="QQEX Close Long", message="QQEX CLOSE LONG") // use "Once per Bar Close" option
//alertcondition(isCloseShort, title="QQEX Close Short", message="QQEX CLOSE SHORT") // use "Once per Bar Close" option
//
//*** END of COMMENT OUT [BackTest]

// show only when alert condition is met and bar closed.
plotshape(isLong or isShort,title= "Cross Alert Completed", location=location.bottom, color=isShort?red:green, transp=0, style=shape.circle,size=size.auto,offset=0)
plotshape(isCloseShort[1] or isCloseLong[1],title= "Close Order", location=location.top, color=isCloseShort[1]?red:green, transp=0, style=shape.square,size=size.auto,offset=-1)

// - ALERTING END


//EOF