//@version=5
// ══════════════════════════════════════════════════════════════════════════════════════════════════ //
//# * ══════════════════════════════════════════════════════════════════════════════════════════════
//# *
//# * Study       : Technical Analyst
//# * Author      : © dgtrd
//# *
//# * Revision History
//# *  Release    : Jul 11, 2020 
//# *  Update     : May 26, 2021 : introduced new pine table and rgb colors  
//# *  Update     : Nov 22, 2021 : this update fixes pine error caused by pine team apdate of the core functionality 
//# *  Update     : Mar 14, 2022 : new pine functionality, added tooltips   
//# *  Update     : Sep 21, 2022 : table view and content enchacments, new indicator additions  
//# *  Update     : Sep 27, 2022 : plotting of all indicators including oscillatos made avaialable, alerts added for all indicators  
//# *
//# * ══════════════════════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════════════════════════ //
// ---------------------------------------------------------------------------------------------- //
// Functions  ----------------------------------------------------------------------------------- //

f_drawLabelX(_x, _y, _text, _xloc, _yloc, _color, _style, _textcolor, _size, _textalign, _tooltip) =>
    var id = label.new(_x, _y, _text, _xloc, _yloc, _color, _style, _textcolor, _size, _textalign, _tooltip)
    label.set_text(id, _text)
    label.set_tooltip(id, _tooltip)
    label.set_xy(id, _x, _y)
    label.set_textcolor(id, _textcolor)

f_getColor(_cycle) =>
    if _cycle >= 73
        #006400
    else if _cycle >= 0 and _cycle < 73
        color.from_gradient(_cycle, 0,  73, color.gray, #006400)
    else if _cycle < 0 and _cycle >= -41
        color.from_gradient(_cycle, -41, 0, #910000, color.gray)
    else if _cycle < -41
        #910000

ma(_source, _length, _type) => 
    switch _type
        "SMA"  => ta.sma (_source, _length)
        "EMA"  => ta.ema (_source, _length)
        "RMA"  => ta.rma (_source, _length)
        "WMA"  => ta.wma (_source, _length)
        "VWMA" => ta.vwma(_source, _length)

alarm(_indi, _message) => 
    alert('the analyst : ' + syminfo.ticker + ' price (' + str.tostring(close, format.mintick) + ') : ' + _indi + ' - ' + _message , alert.freq_once_per_bar_close)

f_round(_src) =>
    str.tostring(_src, format.mintick)

indicator('Technical Analyst by DGT', 'ANALYST ʙʏ DGT ☼☾', true, max_bars_back=500, max_lines_count = 500, max_boxes_count = 500)

group_report = ' !!! Technical Analyst\'s Real-Time Report !!! '
i_hideDesc   = input.bool(true, 'Show Summary View', inline='oth3', group=group_report, tooltip = 'Hides the Description Column\n* Descriptions are made available under each Cell info\n* Due to space limit \'Summary View\' includes more indicators')
i_bullColor  = input.color(color.rgb(38, 166, 154), 'Color : Bullish', inline='COLOR', group=group_report)
i_bearColor  = input.color(color.rgb(240, 83, 80), 'Bearish', inline='COLOR', group=group_report)
i_neutColor  = input.color(color.rgb(61, 72, 73), 'Neutral', inline='COLOR', group=group_report)
bgColor      = #00000000//input.color(color.teal, 'Background', inline='COLOR', group=group_report)
tblPos       = input.string('Right', 'Position ', options=['Right', 'Left'], inline='oth', group=group_report)
i_textSize   = input.string('Small', 'Text Size', options=['Tiny', 'Small', 'Normal', 'Large'], inline='oth', group=group_report)
textSize     = i_textSize == 'Small' ? size.small : i_textSize == 'Normal' ? size.normal : i_textSize == 'Large' ? size.large : size.tiny

tooltip_ma   = 'A Moving Average is a good way to gauge momentum as well as to confirm trends, and define areas of support and resistance'
group_ma     = 'Trend : Moving Average Settings'
maType       = input.string("SMA", "Moving Average : Type", options=["SMA", "EMA", "RMA", "WMA", "VWMA"], group=group_ma)
fastLength   = input.int(20, title='Moving Average : Fast Length', minval=2, maxval=50, group=group_ma)
slowLength   = input.int(200, title='Moving Average : Slow Length', minval=50, group=group_ma)
maPlot       = input.bool(false, title='Enable Moving Average Visualization', group=group_ma)
maAlert      = input.bool(true, title='Enable Moving Average Alerts', group=group_ma)

tooltip_dmi  = 'Directional Movement (DMI) is a collection of three separate indicators combined into one. DMI consists of the Average Directional Index (ADX), Plus Directional Indicator (+DI) and Minus Directional Indicator (-DI)\n' + 
               'ADX\'s purposes is to define whether or not there is a trend present\n' +
               'The other two indicators (+DI and -DI) serve the purpose of determining trend direction'
group_dmi    = 'Trend : Directional Movement Index Settings'
adxSmoothing = input.int(14, title='DMI : ADX Smoothing', minval=1, group=group_dmi)
diLength     = input.int(14, title='DMI : DI Length', minval=1, group=group_dmi)
strongTrend  = input.int(25, title='DMI : Strong Trend Theshold', group=group_dmi)
weakTrend    = input.int(17, title='DMI : Weak Trend Theshold', group=group_dmi)
dmiPlot      = input.bool(false, title='Enable ADX Colored DMI Line Visualization', group=group_dmi, tooltip='◁ how to read adx colored dmi line ▷\n* triangle shapes:\n  ▲- bullish : diplus >= diminus\n  ▼- bearish : diplus < diminus\n* colors:\n  green - bullish trend : adx >= strongTrend and di+ > di-\n  red - bearish trend : adx >= strongTrend and di+ < di- \n  gray - no trend : weakTrend < adx < strongTrend\n  yellow - weak trend : adx < weakTrend\n* color density:\n  darker : adx growing\n  lighter : adx falling ')
dmiAlert     = input.bool(true, title='Enable Directional Movement Alerts', group=group_dmi)

tooltip_ichi = 'The Ichimoku Cloud is a package of multiple technical indicators that signal support, resistance, market trend, and market momentum. It is one of the few indicators out there that attempts to convey a number of meaningful insights into one'
group_ichi   = 'Trend : Ichimoku Cloud Settings'
conversionPeriods = input.int(9, minval=1, title='Ichimoku Cloud : Conversion Line Periods', group=group_ichi)
basePeriods  = input.int(26, minval=1, title='Ichimoku Cloud : Base Line Periods', group=group_ichi)
laggingSpan2Periods = input.int(52, minval=1, title='Ichimoku Cloud : Lagging Span 2 Periods', group=group_ichi)
displacement = input.int(26, minval=1, title='Ichimoku Cloud : Displacement', group=group_ichi)
ichiPlot     = input.bool(false, title='Enable Ichimoku Cloud Visualization', group=group_ichi)
ichiAlert    = input.bool(true, title='Enable Ichimoku Cloud Alerts', group=group_ichi)

tooltip_st   = 'Supertrend is a trend-following indicator based on Average True Range (ATR). The calculation of its single line combines trend detection and volatility. It can be used to detect changes in trend direction and to position stops'
group_st     = 'Trend : Dual SuperTrend Settings'
stMultIchi   = input.int(2 , 'SuperTrend 1 : Multiplier Factor'    , minval=1, group = group_st)
stLengthIchi = input.int(14, 'SuperTrend 1 : Length of ATR Periods', minval=1, group = group_st)
stMultDMI    = input.int(3 , 'SuperTrend 2 : Multiplier Factor'         , minval=1, group = group_st)
stLengthDMI  = input.int(14, 'SuperTrend 2 : Length of ATR Periods'     , minval=1, group = group_st)
stPlot       = input.bool(false, title='Enable Dual SuperTrend Visualization', group=group_st)
stAlert      = input.bool(true, title='Enable SuperTrend Alerts', group=group_st)

tooltip_rsi   = 'The Relative Strength Index (RSI) is a well versed momentum based oscillator which is used to measure the speed (velocity) as well as the change (magnitude) of directional price movements'
group_rsi     = 'Oscillator : Relative Strength Index Settings'
rsiLength     = input.int(14, title='RSI : Length', minval=1, group=group_rsi)
rsiOversold   = input.int(30, title='RSI : OverSold Theshold', minval=1, group=group_rsi)
rsiOverbought = input.int(70, title='RSI : OverBought Theshold', minval=1, group=group_rsi)
rsiPlot       = input.bool(false, title='Enable Relative Strength Index Visualization', group=group_rsi)
rsiSmoothing  = input.bool(false, 'Smoothing Line', inline = 'RSI', group=group_rsi)
rsiMaType     = input.string("EMA", "", options=["SMA", "EMA", "RMA", "WMA", "VWMA"], inline = 'RSI', group=group_rsi)
rsiMaLength   = input.int(14, "", inline = 'RSI', group=group_rsi)
rsiVOffset    = input.float(2., 'Vertical Offset', step=.1, inline = 'DISP', group=group_rsi)
rsiHight      = input.float(2., 'Hight', step=.1, inline = 'DISP', group=group_rsi)
rsiAlert      = input.bool(true, title='Enable Relative Strength Index Alerts', group=group_rsi)

tooltip_stoch   = 'The Stochastic Oscillator (STOCH) is a range bound momentum oscillator. Typically, the Stochastic Oscillator is used for three things; Identifying overbought and oversold levels, spotting divergences and also identifying bull and bear set ups or signals.'
group_stoch     = 'Oscillator : Stochastic Settings'
stochLengthK    = input.int(14, title='Stochastic : %K', minval=1, group=group_stoch)
stochLengthD    = input.int(3, title='Stochastic : %D', minval=1, group=group_stoch)
stochSmoothingK = input.int(3, title='Stochastic : Smoothing', minval=1, group=group_stoch)
stochOversold   = input.int(20, title='Stochastic : OverSold Theshold', minval=1, group=group_stoch)
stochOverbought = input.int(80, title='Stochastic : OverBought Theshold', minval=1, group=group_stoch)
stochPlot       = input.bool(false, title='Enable Stochastic Visualization', group=group_stoch)
stochVOffset    = input.float(1.1, 'Vertical Offset', step=.1, inline = 'DISP', group=group_stoch)
stochHight      = input.float(1., 'Hight', step=.1, inline = 'DISP', group=group_stoch)
stochAlert      = input.bool(true, title='Enable Stochastic Alerts', group=group_stoch)

tooltip_macd   = 'MACD can be used to identify aspects of a security\'s overall trend. Most notably these aspects are momentum, as well as trend direction and duration'
group_macd     = 'Oscillator : MACD Settings'
macdFastLength = input.int(12, title='MACD : Fast Length', minval=1, group=group_macd)
macdSlowLength = input.int(26, title='MACD : Slow Length', minval=1, group=group_macd)
macdSignalLength = input.int(9, title='MACD : Signal Smoothing Length', minval=1, group=group_macd)
macdPlot       = input.bool(false, title='Enable MACD Visualization', group=group_macd)
macdVOffset    = input.float(.5, 'Vertical Offset', step=.1, inline = 'DISP', group=group_macd)
macdHight      = input.float(.7, 'Hight', step=.1, inline = 'DISP', group=group_macd)
macdAlert      = input.bool(true, title='Enable MACD Alerts', group=group_macd)

tooltip_bbp  = 'Elder’s Bull Bear Power\nMeasures the strength of the bulls and bears in the market'
group_bbp    = 'Pressure : Elder’s Bull Bear Power Settings'
bbpLength    = input.int(13, title='BBP : Length', minval=1, group=group_bbp)
bbpPlot      = input.string('None', 'Enable Elder’s Bull Bear Power Visualization', options=['Bull and Bear Power', 'Sum of Bull and Bear Power', 'None'], group = group_bbp)
bbpVOffset   = input.float(.6, 'Vertical Offset', step=.1, inline = 'DISP', group=group_bbp)
bbpHight     = input.float(.7, 'Hight', step=.1, inline = 'DISP', group=group_bbp)
bbpPlot2     = input.bool(false, title='Enable Bull Bear Consensus Line Visualization', group=group_bbp)
bbpAlert     = input.bool(true, title='Enable Elder’s Bull Bear Power Alerts', group=group_bbp)

tooltip_tdpr = 'DeMark’s Pressure\nDetermines the buying/selling pressure on the market by measuring the speed of changing in the trading volume along with the speed of price changes'
group_tdpr   = 'Pressure : DeMark’s Pressure Settings'
dprLength    = input.int(13, 'DPR : Pressure Length', minval=1, group=group_tdpr)
upperBand    = input.int(75, 'DPR : Pressure Upper Band', minval=50, maxval=99, group=group_tdpr)
lowerBand    = input.int(25, 'DPR : Pressure Lower Band', minval=1 , maxval=49, group=group_tdpr)
dprPlot      = input.bool(false, title='Enable DeMark’s Pressure Visualization', group=group_tdpr)
dprSmoothing = input.bool(false, 'Smoothing Line', inline = 'DPR', group=group_tdpr)
dprMaType    = input.string("EMA", "", options=["SMA", "EMA", "RMA", "WMA", "VWMA"], inline = 'DPR', group=group_tdpr)
dprMaLength  = input.int(13, '', inline = 'DPR', group=group_tdpr)
dprVOffset   = input.float(1.7, 'Vertical Offset', step=.1, inline = 'DISP', group=group_tdpr)
dprHight     = input.float(1.2, 'Hight', step=.1, inline = 'DISP', group=group_tdpr)
dprAlert     = input.bool(true, title='Enable DeMark’s Pressure Alerts', group=group_tdpr)

tooltip_vol  = 'The Volume indicator is used to measure how much of a given financial asset has traded in a specific period of time'
group_vol    = 'Volume Settings'
volLength    = input.int(21, title='Volume : Average Length', minval=1, group=group_vol)
volHigh      = input.float(1.618, 'Volume : Higher Threshold Length', minval=1., step=.1, group=group_vol)
volLow       = input.float(0.618, 'Volume : Lower Threshold Length', minval=.1, step=.1, group=group_vol)
vwcbPlot     = input.bool(false, title='Enable Volume Weighted Bar Visualization', group=group_vol)
volumeHist   = input.string('None', 'Enable Volume Histogram Visualization', options=['Buying/Selling Volume', 'Regular Volume', 'None'], group = group_vol)
volumeMA     = input.bool(true, 'Include Volume MA Visualization',group = group_vol)
volVOffset   = input.float(1.8, 'Vertical Offset', step=.1, inline = 'DISP', group=group_vol)
volHight     = input.float(.6, 'Hight', step=.1, inline = 'DISP', group=group_vol)
volAlert     = input.bool(true, title='Enable Volume Alerts', group=group_vol)

group_fg     = 'Fear & Greed Index Settings'
tooltip_fg   = 'Market psychology is the idea that the movements of a market reflect the emotional state of its participants\n\nWarren Buffett’s quote; \n\"buy when others are fearful, and sell when others are greedy\"'
fgPlot       = input.bool(false, 'Enable Fear & Greed Index Visualization',  group = group_fg, tooltip = 'Visualization of F&G Index is shown as color codes applied to candles.\nto observe plotting\n -hover over the report\n or\n -adjust chart settings (visual order -> sent to back)')
fgAlert      = input.bool(true, title='Enable Fear & Greed Alerts', group=group_fg)

textColor    = color.rgb(255, 255, 255)

// -Calculations ================================================================================ //

source   = close
nzVolume = nz(volume)
    
//------------------------------------------------------------------------------
// Trend : Moving Averagres

maFast  = ma(source, fastLength, maType)
maSlow  = ma(source, slowLength, maType)
maCross = bar_index - ta.valuewhen(ta.cross(maFast, maSlow), bar_index, 0)
pmaFast = (source / maFast - 1) * 100
pmaSlow = (source / maSlow - 1) * 100

plot(maPlot ? maFast : na, color=color.new(#008080, 0), title='Fast MA')
plot(maPlot ? maSlow : na, color=color.new(#FFA500, 0), title='Slow MA')

if maAlert and ta.cross(maFast, maSlow)
    alarm('MAs', (maFast > maSlow ? 'bullish' : 'bearish') + ' fast / slow MA cross detected')

//------------------------------------------------------------------------------
// Trend : Directional Movement Index

[diplus, diminus, adxValue] = ta.dmi(diLength, adxSmoothing)
diCross = bar_index - ta.valuewhen(ta.cross(diplus, diminus), bar_index, 0)
adxChg = ta.change(adxValue) > 0 ? 'adx growing (previous adx(' + str.tostring(adxValue[1], '#.##') + ')' : 'adx falling (previous adx(' + str.tostring(adxValue[1], '#.##') + ')'

dmiBull = diplus >= diminus and adxValue >= strongTrend
dmiBear = diplus  < diminus and adxValue >= strongTrend
dmiWeak = adxValue < strongTrend and adxValue > weakTrend

dmiColor = dmiBull ? adxValue > adxValue[1] ? #006400 : color.green : dmiBear ? adxValue > adxValue[1] ? #910000 : color.red : dmiWeak ? adxValue > adxValue[1] ? color.black : color.gray : adxValue > adxValue[1] ? #FFC40C : color.yellow

plotshape(dmiPlot and diplus >= diminus, 'ADX & +DI > -DI', shape.triangleup  , location.top, dmiColor)
plotshape(dmiPlot and diplus  < diminus, 'ADX & +DI < -DI', shape.triangledown, location.top, dmiColor)

if dmiAlert
    if dmiBull and not dmiBull[1]
        alarm('DMI', 'strong bullish trend detected')
    
    if dmiBear and not dmiBear[1]
        alarm('DMI', 'strong bearish trend detected')

    if ta.cross(diplus, diminus) and adxValue > weakTrend
        alarm('DMI', (diplus > diminus ? 'bullish' : 'bearish') + ' +di / -di cross detected' + (dmiBull[1] ? ' in bullish zone' : dmiBear[1] ? ' in bearish zone' : ''))
        
//------------------------------------------------------------------------------
// Trend : Ichimoku Cloud

donchian(len) =>
    math.avg(ta.lowest(len), ta.highest(len))

conversionLine = donchian(conversionPeriods)
baseLine  = donchian(basePeriods)
leadLine1 = math.avg(conversionLine, baseLine)
leadLine2 = donchian(laggingSpan2Periods)

aboveCloud = close > leadLine1[displacement - 1] and close > leadLine2[displacement - 1]
belowCloud = close < leadLine1[displacement - 1] and close < leadLine2[displacement - 1]
inCloud    = close > leadLine1[displacement - 1] and close < leadLine2[displacement - 1] or close < leadLine1[displacement - 1] and close > leadLine2[displacement - 1]

tkCross = bar_index - ta.valuewhen(ta.cross(conversionLine, baseLine), bar_index, 0)

plot(ichiPlot ? conversionLine : na, color=color.new(#2962ff, 0), title='Conversion Line')
plot(ichiPlot ? baseLine : na, color=color.new(#b71c1c, 0), title='Base Line')
plot(ichiPlot ? close : na, offset=-displacement + 1, color=color.new(#43a047, 0), title='Lagging Span')
p1 = plot(ichiPlot ? leadLine1 : na, offset=displacement - 1, color=color.new(#a5d6a7, 0), title='Lead 1', display=display.none)
p2 = plot(ichiPlot ? leadLine2 : na, offset=displacement - 1, color=color.new(#ef9a9a, 0), title='Lead 2', display=display.none)
fill(p1, p2, color=leadLine1 > leadLine2 ? color.new(#43a047, 75) : color.new(#f44336, 75))

if ichiAlert
    if aboveCloud and not aboveCloud[1]
        alarm('Ichimoku Cloud', 'trading activity crossed above the ichimoku cloud')

    if inCloud and not inCloud[1]
        alarm('Ichimoku Cloud', 'trading activity switched within the ichimoku cloud')

    if belowCloud and not belowCloud[1]
        alarm('Ichimoku Cloud', 'trading activity crossed below the ichimoku cloud')
    
    if ta.cross(conversionLine, baseLine)
        alarm('Ichimoku Cloud', (conversionLine > baseLine ? 'bullish' : 'bearish') + ' tenkan-sen / kijun-sen cross detected, price action ' + (belowCloud ? 'below' : aboveCloud ? 'above' : 'within' ) + ' the ichimoku cloud')


//------------------------------------------------------------------------------
// Trend : SuperTrends
[superTrendIchi, dirIchi] = ta.supertrend(stMultIchi, stLengthIchi)
[superTrendDMI , dirDMI]  = ta.supertrend(stMultDMI , stLengthDMI )

stColorIchi = dirIchi == dirIchi[1] ? color.aqua : na
stColorDMI  = dirDMI  == dirDMI[1]  ? color.orange  : na

bearST = source < superTrendIchi and source < superTrendDMI
bullST = source > superTrendIchi and source > superTrendDMI

st1 = plot(stPlot ? superTrendIchi : na, 'SuperTrend 1', stColorIchi, 1)
st2 = plot(stPlot ? superTrendDMI  : na, 'SuperTrend 2', stColorDMI , 1)
fill(st1, st2, bullST ? color.new(color.aqua, 75) : bearST ? color.new(color.orange, 75) : na, 'SuperTrend Trending Cloud')

if stAlert
    if bearST and bearST != bearST[1]
        alarm('Dual SuperTrend', 'bearish supertrend breakout')

    if bullST and bullST != bullST[1]
        alarm('Dual SuperTrend', 'bullish supertrend breakout')

//------------------------------------------------------------------------------
// Momentum : Relative Strength Index (RSI)

rsiValue = ta.rsi(source, rsiLength)
rsiChg = ta.change(rsiValue) > 0 ? ') and growing (previous rsi(' + str.tostring(rsiValue[1], '#.##') + ')' : ') and falling (previous rsi(' + str.tostring(rsiValue[1], '#.##') + ')'
rsiSmooth = rsiSmoothing ? ma(rsiValue, rsiMaLength, rsiMaType) : na

if rsiAlert
    if rsiSmoothing and ta.cross(rsiValue, rsiSmooth)
        alarm('RSI',  (rsiValue > rsiSmooth ? 'bullish' : 'bearish') + ' smoothing line cross detected')

    if  ta.cross(rsiValue, rsiOverbought)
        alarm('RSI',  (rsiValue > rsiOverbought ? 'watch out, cross above' : 'probable short trade opportunity, cross below') + ' overbought line detected') 

    if  ta.cross(rsiValue, rsiOversold)
        alarm('RSI', (rsiValue > rsiOversold ? 'probable long trade opportunity, cross above' : 'watch out, cross below') + ' oversold line detected') 

//------------------------------------------------------------------------------
// Momentum : Stochastic Oscillator

var stochText = ''
stochK = ta.sma(ta.stoch(close, high, low, stochLengthK), stochSmoothingK)
stochD = ta.sma(stochK, stochLengthD)
stochCross = bar_index - ta.valuewhen(ta.cross(stochK, stochD), bar_index, 0)
stochChg = ta.change(stochK) > 0 ? 'stoch growing  (previous stoch %k(' + str.tostring(stochK[1], '#.##') + ')' : 'stoch falling (previous stoch %k(' + str.tostring(stochK[1], '#.##') + ')'

if stochAlert
    if  ta.cross(stochK, stochD)
        alarm('Stochastic',  (stochK > stochD ? 'bullish' : 'bearish') + ' signal line cross detected')
    
    if  ta.cross(stochK, stochOverbought)
        alarm('Stochastic', (stochK > stochOverbought ? 'watch out, cross above' : 'probable short trade opportunity, cross below') + ' overbought line detected' ) 

    if  ta.cross(stochK, stochOversold)
        alarm('Stochastic',  (stochK > stochOversold ? 'probable long trade opportunity, cross above' : 'watch out, cross below') + ' oversold line detected') 

//------------------------------------------------------------------------------
// Momentum : MACD Oscillator

[macdLine, signalLine, histLine] = ta.macd(source, macdFastLength, macdSlowLength, macdSignalLength)
histColor = histLine >= 0 ? histLine[1] < histLine ? #26A69A : #B2DFDB : histLine[1] < histLine ? #FFCDD2 : #FF5252
signalCross = bar_index - ta.valuewhen(ta.cross(macdLine, signalLine), bar_index, 0)
macdChg = ta.change(histLine) > 0 ? 'momentum growing (current/previous(' + f_round(histLine) + '/' + f_round(histLine[1]) + ')' : 'momentum falling (current/previous(' + f_round(histLine) + '/' + f_round(histLine[1]) + ')'

if macdAlert
    if  ta.cross(macdLine, signalLine)
        alarm('MACD', (macdLine > signalLine ? 'bullish' : 'bearish') + ' signal line cross detected')

    if  ta.cross(macdLine, 50)
        alarm('MACD', (macdLine > 50 ? 'bullish' : 'bearish') + ' center line cross detected') 
    
    //if  ta.cross(ta.change(histLine), 0)
    //    alarm('MACD', 'momentum change detected')

//------------------------------------------------------------------------------
// Pressure : Elder-Ray Indicator (Bull and Bear Power)
ema13 = ta.ema(source, bbpLength)
bull = high - ema13
bear = low  - ema13
bbp  = bull + bear

bbpCross = bar_index - ta.valuewhen(ta.cross(bull, -bear), bar_index, 0)
plot(bbpPlot2 ? ema13 : na, 'Bull Bear Consensus Line')

if bbpAlert and ta.cross(bull, -bear)
    alarm('BBP',  (bull > -bear ? 'bullish' : 'bearish') + ' bull / bear power line cross detected')

//------------------------------------------------------------------------------
// Pressure : Demark Pressure Ratio (DPR)

buyPressure  = 0.
sellPressure = 0.
priceDelta   = 0.
priceRange   = 0.
dpr          = 0.
dominance    = 0.

if nzVolume
    for i = 0 to dprLength
        priceDelta := close[i] - open[i]
        priceRange := high[i]  - low[i]
    
        if priceDelta > 0
            buyPressure += priceDelta / priceRange * nzVolume[i]

        if priceDelta < 0
            sellPressure += priceDelta / priceRange * nzVolume[i]

    dominance := buyPressure + math.abs(sellPressure)
        
    if dominance != 0.
        dpr := 100 * (buyPressure / dominance)
    else
        dpr := 50

dprChg = ta.change(dpr) > 0 ? ') and growing (previous dpr(' + str.tostring(dpr[1], '#.##') + ')' : ') and falling (previous dpr(' + str.tostring(dpr[1], '#.##') + ')'
dprSmooth = dprSmoothing ? ma(dpr, dprMaLength, dprMaType) : na

if dprAlert
    if dprSmoothing and ta.cross(dpr, dprSmooth)
        alarm('DPR',  (dpr > dprSmooth ? 'bullish' : 'bearish') + ' smoothing line cross detected')
    
    if  ta.cross(dpr, upperBand)
        alarm('DPR', (dpr > upperBand ? 'watch out, cross above' : 'probable short trade opportunity, cross below') + ' overbought line detected' ) 

    if  ta.cross(dpr, lowerBand)
        alarm('DPR',  (dpr > lowerBand ? 'probable long trade opportunity, cross above' : 'watch out, cross below') + ' oversold line detected') 

//------------------------------------------------------------------------------
// Volume

volMa = ta.sma(nzVolume, volLength)
volStat = bar_index - ta.valuewhen(volMa < volMa[1], bar_index, 0)

vwcbCol = nzVolume > volMa * volHigh ? close > open ? #006400 : #910000 : nzVolume < volMa * volLow ? close < open ? #FF9800 : #7FFFD4 : na

B = nzVolume * (close - low) / (high - low)
S = nzVolume * (high - close) / (high - low)

barcolor(vwcbPlot and nzVolume ? vwcbCol : na, title='Volume Weighted Colored Bars')

if volAlert and ta.cross(nzVolume, volMa * volHigh)
    alert('the analyst : ' + syminfo.ticker + ' price (' + str.tostring(close, format.mintick) + ') : high trading volume detected') 

if volAlert and ta.cross(nzVolume, volMa * 4.669)
    alert('the analyst : ' + syminfo.ticker + ' price (' + str.tostring(close, format.mintick) + ') : watch out, volume spike detected, may be a sign of exhaustion')

//------------------------------------------------------------------------------
// Trading Psychology - Fear & Greed Index by DGT 
// https://www.tradingview.com/script/HfNGbuRt-Trading-Psychology-Fear-Greed-Index-by-DGT/

pmacd = (close / ta.ema(close, 144) - 1) * 100
ror = ta.change(close, 144) / close[144] * 100
accDist = close == high and close == low or high == low ? 0 : (2 * close - low - high) / (high - low)
fgVol = nz(volume)
moneyFlow = math.sum(accDist * fgVol, 21) / math.sum(fgVol, 21) * 100
vix = request.security('VIX', timeframe.period, -(close / ta.ema(close, 144) - 1) * 100, barmerge.gaps_off, barmerge.lookahead_on)
gold = request.security('GOLD', timeframe.period, -(1 - close[21] / close) * 100, barmerge.gaps_off, barmerge.lookahead_on)
avg = fgVol ? math.avg(pmacd, ror, vix, gold, moneyFlow) : math.avg(pmacd, ror, vix, gold)
feargreed = ta.rma(avg, 5)

fgColor = fgPlot ? f_getColor(feargreed) : na
plotcandle(open, high, low, close, 'Psychology of The Market Cycle', fgColor, fgColor, bordercolor = fgColor)

if fgAlert
    if ta.crossover(feargreed, 73)
        alarm('Fear & Greed', 'market entered to extreame greed zone')

    if ta.crossover(feargreed, 33) and feargreed < 73
        alarm('Fear & Greed', 'market entered to greed zone')

    if ta.crossunder(feargreed, -25) and feargreed > -41
        alarm('Fear & Greed', 'market entered to fear zone')

    if ta.crossunder(feargreed, -41)
        alarm('Fear & Greed', 'market entered to extreame fear zone')

//------------------------------------------------------------------------------
// Report

//table.merge_cells(table_id, start_column, start_row, end_column, end_row)
//table.cell(table_id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family)
header = 'Technical Analysis Report\n' + syminfo.description + ' - TimeFrame (' + timeframe.period + ')'
var table taTable = na
if i_hideDesc
    taTable := table.new(tblPos == 'Right' ? position.top_right : position.bottom_left, 4, 37, border_width = 2) 
else
    taTable := table.new(tblPos == 'Right' ? position.top_right : position.bottom_left, 4, 37, frame_color=bgColor, frame_width=2) 

if barstate.islast

    if not i_hideDesc
        table.cell(taTable, 0, 0, bgcolor=bgColor)
        table.cell(taTable, 1, 0, bgcolor=bgColor)
        table.cell(taTable, 2, 0, header, text_color=chart.fg_color, text_halign=text.align_right, text_size=textSize, bgcolor=bgColor)

        table.cell(taTable, 0, 1, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 1, height=1, bgcolor=bgColor)
        table.cell(taTable, 2, 1, height=1, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Trend 

    table.cell(taTable, 1, 2, bgcolor=bgColor)
    table.cell(taTable, 0, 2, 'TREND', text_color=chart.fg_color, text_halign=text.align_center, text_size=textSize, bgcolor=bgColor)
    table.merge_cells(taTable, 0, 2, 1, 2)

    if not i_hideDesc
        table.cell(taTable, 2, 2, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Trend : Moving Averagres

    [ma_bias, ma_bias_color, ma_cell_color, ma_desc] = if source > maSlow
        if source > maFast
            ['strong bullish', color.new(i_bullColor, 30), color.new(i_bullColor, 30), 'price action - ' + f_round(close) + '\nabove both fast(' + f_round(maFast) + ') and slow(' + f_round(maSlow) + ')']
        else
            ['bullish*', color.new(i_bullColor, 10), color.new(i_bearColor, 10), 'price action - ' + f_round(close) + '\nin between *fast(' + f_round(maFast) + ') and slow(' + f_round(maSlow) + ')']
    else if source < maSlow
        if source < maFast
            ['strong bearish', color.new(i_bearColor, 30), color.new(i_bearColor, 30), 'price action - ' + f_round(close) + '\nbelow both fast(' + f_round(maFast) + ') and slow(' + f_round(maSlow) + ')']
        else
            ['bearish*', color.new(i_bearColor, 10), color.new(i_bullColor, 10), 'price action - ' + f_round(close) + '\nin between *fast(' + f_round(maFast) + ') and slow(' + f_round(maSlow) + ')']

    if not i_hideDesc
        table.cell(taTable, 0, 3, 'MAs', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 1, 3, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 2, 3, ma_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 0, 4, ' fast(' + str.tostring(fastLength) + ')', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_cell_color)
    
    if i_hideDesc
        table.cell(taTable, 0, 4, 'MAs', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color, tooltip = tooltip_ma)

    table.cell(taTable, 1, 4, ma_bias, text_color=color.white, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color, tooltip = ma_desc + '\nprice distance to fast(' + str.tostring(pmaFast, '#.##') + '%) and to slow(' + str.tostring(pmaSlow, '#.##') + '%)\nlast ma cross ' + str.tostring(maCross) + ' bar(s) before')
    if not i_hideDesc
        table.cell(taTable, 2, 4, 'price distance to fast(' + str.tostring(pmaFast, '#.##') + '%) and to slow(' + str.tostring(pmaSlow, '#.##') + '%)', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 0, 5, ' slow(' + str.tostring(slowLength) + ')', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 1, 5, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)
        table.cell(taTable, 2, 5, 'last ma cross ' + str.tostring(maCross) + ' bar(s) before', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ma_bias_color)

    if not i_hideDesc
        table.cell(taTable, 0, 6, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 6, height=1, bgcolor=bgColor)
        table.cell(taTable, 2, 6, height=1, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Trend : Directional Movement Index

    [dmi_bias, dmi_color, dmi_cell_color, dmi_desc] = if diplus >= diminus and adxValue >= strongTrend
        ['strong bullish', color.new(i_bullColor, 30), color.new(i_bullColor, 30), 'adx(' + str.tostring(adxValue, '#.##') + ') > strong trend(' + str.tostring(strongTrend) + ')\ndiplus(' + str.tostring(diplus, '#.##') + ') > diminus(' + str.tostring(diminus, '#.##') + ')']
    else if diplus < diminus and adxValue >= strongTrend
        ['strong bearish', color.new(i_bearColor, 30), color.new(i_bearColor, 30), 'adx(' + str.tostring(adxValue, '#.##') + ') > strong trend(' + str.tostring(strongTrend) + ')\ndiplus(' + str.tostring(diplus, '#.##') + ') < diminus(' + str.tostring(diminus, '#.##') + ')']
    else if adxValue < strongTrend and adxValue > weakTrend
        if diplus < diminus
            ['bearish', color.new(i_bearColor, 10), color.new(i_bearColor, 10), 'adx(' + str.tostring(adxValue, '#.##') + ') between strong(' + str.tostring(strongTrend) + ') and weak(' + str.tostring(weakTrend) + ') trend\ndiplus(' + str.tostring(diplus, '#.##') + ') < diminus(' + str.tostring(diminus, '#.##') + ')']
        else
            ['bullish', color.new(i_bullColor, 10), color.new(i_bullColor, 10), 'adx(' + str.tostring(adxValue, '#.##') + ') between strong(' + str.tostring(strongTrend) + ') and weak(' + str.tostring(weakTrend) + ') trend\ndiplus(' + str.tostring(diplus, '#.##') + ') > diminus(' + str.tostring(diminus, '#.##') + ')']
    else if adxValue <= weakTrend
        ['trendless', color.new(i_neutColor, 30), color.new(i_neutColor, 30), 'adx(' + str.tostring(adxValue, '#.##') + ') < weak trend(' + str.tostring(weakTrend) + ')']


    if not i_hideDesc
        table.cell(taTable, 0, 7, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
        table.cell(taTable, 1, 7, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
        table.cell(taTable, 2, 7, adxChg, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
    
    table.cell(taTable, 0, 8, 'DMI', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color, tooltip = tooltip_dmi)
    table.cell(taTable, 1, 8, dmi_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color, tooltip = adxChg + '\n' + dmi_desc + '\nlast di cross ' + str.tostring(diCross) + ' bar(s) before')
    if not i_hideDesc
        table.cell(taTable, 2, 8, dmi_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
        table.cell(taTable, 0, 9, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
        table.cell(taTable, 1, 9, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)
    
        table.cell(taTable, 2, 9, 'last di cross ' + str.tostring(diCross) + ' bar(s) before', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dmi_color)

        table.cell(taTable, 0, 10, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 10, height=1, bgcolor=bgColor)
        table.cell(taTable, 2, 10, height=1, bgcolor=bgColor)
        
    //------------------------------------------------------------------------------
    // Trend : Ichimoku Cloud

    [ichi_bias, ichi_color, ichi_cell_color, ichi_desc, ichi_desc2] = if source > leadLine1[displacement - 1] and source > leadLine2[displacement - 1]
        if conversionLine >= baseLine
            ['strong bullish', color.new(i_bullColor, 30), color.new(i_bullColor, 30), 'price action above kumo cloud', 'tenkan-sen(' + f_round(conversionLine) + ') >= kijun-sen(' + f_round(baseLine) + ')']
        else
            ['bullish*', color.new(i_bullColor, 10), color.new(i_bearColor, 10), 'price action above kumo cloud', '*bearish sign\n tenkan-sen(' + f_round(conversionLine) + ') < kijun-sen(' + f_round(baseLine) + ')']
    else if source < leadLine1[displacement - 1] and source < leadLine2[displacement - 1]
        if conversionLine >= baseLine
            ['bearish*', color.new(i_bearColor, 10), color.new(i_bullColor, 10), 'price action below kumo cloud', '*bullish sign\n tenkan-sen(' + f_round(conversionLine) + ') >= kijun-sen(' + f_round(baseLine) + ')']
        else
            ['strong bearish', color.new(i_bearColor, 30), color.new(i_bearColor, 30), 'price action below kumo cloud', 'tenkan-sen(' + f_round(conversionLine) + ') < kijun-sen(' + f_round(baseLine) + ')']
    else if source > leadLine1[displacement - 1] and source < leadLine2[displacement - 1] or source < leadLine1[displacement - 1] and source > leadLine2[displacement - 1]
        if conversionLine >= baseLine
            ['trendless', i_neutColor, color.new(i_bullColor, 10), 'price action in kumo cloud', 'tenkan-sen(' + f_round(conversionLine) + ') >= kijun-sen(' + f_round(baseLine) + ')']
        else
            ['trendless', i_neutColor, color.new(i_bearColor, 30), 'price action in kumo cloud', 'tenkan-sen(' + f_round(conversionLine) + ') < kijun-sen(' + f_round(baseLine) + ')']

    if not i_hideDesc
        table.cell(taTable, 0, 11, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)
        table.cell(taTable, 1, 11, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)
        table.cell(taTable, 2, 11, ichi_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)
    
    table.cell(taTable, 0, 12, 'ICHI', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color, tooltip = tooltip_ichi)
    table.cell(taTable, 1, 12, ichi_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color, tooltip = ichi_desc + '\n' + ichi_desc2 + '\nlast tk cross ' + str.tostring(tkCross) + ' bar(s) before')
    
    if not i_hideDesc
        table.cell(taTable, 2, 12, ichi_desc2, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_cell_color)
        table.cell(taTable, 0, 13, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)
        table.cell(taTable, 1, 13, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)
        table.cell(taTable, 2, 13, 'last tk cross ' + str.tostring(tkCross) + ' bar(s) before', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=ichi_color)

    [stText, stColor, stDesc]  = if source > superTrendIchi and source > superTrendDMI
        ['bullish', color.new(i_bullColor, 10), 'price action above both SuperTrends\nST1 (' + f_round(superTrendIchi) + ') and ST2 (' + f_round(superTrendDMI) + ')' ] 
    else if source < superTrendIchi and source < superTrendDMI
        ['bearish', color.new(i_bearColor, 10), 'price action below both SuperTrends\nST1 (' + f_round(superTrendIchi) + ') and ST2 (' + f_round(superTrendDMI) + ')' ]
    else if source < superTrendIchi and source > superTrendDMI or source > superTrendIchi and source < superTrendDMI
        ['trendless' , i_neutColor, 'trendless or transitioning\nprice action in between SuperTrends\nST1 (' + f_round(superTrendIchi) + ') and ST2 (' + f_round(superTrendDMI) + ')' ]

    if i_hideDesc
        table.cell(taTable, 0, 13, 'DUAL ST', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stColor, tooltip = tooltip_st)
        table.cell(taTable, 1, 13, stText, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stColor, tooltip = stDesc)

    //------------------------------------------------------------------------------
    // Momentum
    
    table.cell(taTable, 0, 14, 'MOMENTUM', text_color=chart.fg_color, text_halign=text.align_center, text_size=textSize, bgcolor=bgColor)
    table.cell(taTable, 1, 14, bgcolor=bgColor)
    table.merge_cells(taTable, 0, 14, 1, 14)

    if not i_hideDesc
        table.cell(taTable, 2, 14, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Momentum : Relative Strength Index (RSI)

    [rsi_bias, rsi_color] = if rsiValue >= 50
        if rsiValue > rsiOverbought
            ['bullish (overbought)', color.new(i_bullColor, 30)]
        else if rsiValue > 60
            ['bullish', color.new(i_bullColor, 10)]
        else
            ['neutral', i_neutColor]
    else
        if rsiValue < rsiOversold
            ['bearish (oversold)', color.new(i_bearColor, 30)]
        else if rsiValue < 40
            ['bearish', color.new(i_bearColor, 10)]
        else
            ['neutral', i_neutColor]

    table.cell(taTable, 0, 15, 'RSI', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=rsi_color, tooltip = tooltip_rsi)
    table.cell(taTable, 1, 15, rsi_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=rsi_color, tooltip = 'rsi(' + str.tostring(rsiValue, '#.##') + rsiChg)
    if not i_hideDesc
        table.cell(taTable, 2, 15, 'rsi(' + str.tostring(rsiValue, '#.##') + rsiChg, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=rsi_color)

        table.cell(taTable, 0, 16, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 16, height=1, bgcolor=bgColor)
        table.cell(taTable, 2, 16, height=1, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Momentum : Stochastic Oscillator

    [stoch_bias, stoch_color, stoch_cell_color, stoch_desc] = if stochK > stochOverbought
        if stochK > stochD
            ['bullish (overbought)', color.new(i_bullColor, 30), color.new(i_bullColor, 30), 'stoch %k(' + str.tostring(stochK, '#.##') + ') > stoch %d(' + str.tostring(stochD, '#.##') + ')']
        else
            ['bearish (overbought)*', i_hideDesc ? color.new(i_bearColor, 30) : color.new(i_bullColor, 30), color.new(i_bearColor, 10), '*bearish sign\n stoch %k(' + str.tostring(stochK, '#.##') + ') < stoch %d(' + str.tostring(stochD, '#.##') + ')']
    else if stochK < stochOversold
        if stochK > stochD
            ['bullish (oversold)*', i_hideDesc ? color.new(i_bullColor, 30) : color.new(i_bearColor, 30), color.new(i_bullColor, 10), '*bullish sign\n stoch %k(' + str.tostring(stochK, '#.##') + ') > stoch %d(' + str.tostring(stochD, '#.##') + ')']
        else
            ['bearish (oversold)', color.new(i_bearColor, 30), color.new(i_bearColor, 30), 'stoch %k(' + str.tostring(stochK, '#.##') + ') < stoch %d(' + str.tostring(stochD, '#.##') + ')']
    else if stochK > stochOversold and stochK < stochOverbought
        if stochK > stochD
            if stochK > 50
                ['bullish', color.new(i_bullColor, 10), color.new(i_bullColor, 10), 'stoch %k(' + str.tostring(stochK, '#.##') + ') > stoch %d(' + str.tostring(stochD, '#.##') + ')']
            else
                ['bullish*', i_hideDesc ? color.new(i_bullColor, 10) : color.new(i_bearColor, 10), color.new(i_bullColor, 10), '*bullish in bear zone\n stoch %k(' + str.tostring(stochK, '#.##') + ') > stoch %d(' + str.tostring(stochD, '#.##') + ')']
        else
            if stochK > 50
                ['bearish*', i_hideDesc ? color.new(i_bearColor, 10) : color.new(i_bullColor, 10), color.new(i_bearColor, 10), '*bearish in bull zone\n stoch %k(' + str.tostring(stochK, '#.##') + ') < stoch %d(' + str.tostring(stochD, '#.##') + ')']
            else
                ['bearish', color.new(i_bearColor, 10), color.new(i_bearColor, 10), 'stoch %k(' + str.tostring(stochK, '#.##') + ') < stoch %d(' + str.tostring(stochD, '#.##') + ')']

    if not i_hideDesc
        table.cell(taTable, 0, 17, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)
        table.cell(taTable, 1, 17, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)
        table.cell(taTable, 2, 17, stoch_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_cell_color)
    
    table.cell(taTable, 0, 18, 'STOCH', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color, tooltip = tooltip_stoch)
    table.cell(taTable, 1, 18, stoch_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color, tooltip = stoch_desc + '\n' + stochChg + '\nlast cross ' + str.tostring(stochCross) + ' bar(s) before')
    
    if not i_hideDesc
        table.cell(taTable, 2, 18, stochChg, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)
        table.cell(taTable, 0, 19, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)
        table.cell(taTable, 1, 19, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)
        table.cell(taTable, 2, 19, 'last cross ' + str.tostring(stochCross) + ' bar(s) before', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=stoch_color)

        table.cell(taTable, 0, 20, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 20, height=1, bgcolor=bgColor) 
        table.cell(taTable, 2, 20, height=1, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Momentum : MACD Oscillator

    [macd_bias, macd_color, macd_desc] = if macdLine > signalLine
        if macdLine > 0
            ['strong bullish', color.new(i_bullColor, 30), 'macd(' + f_round(macdLine) + ') > signal(' + f_round(signalLine) + ')']
        else
            ['bullish*', color.new(i_bullColor, 10), '*bullish in bear zone\nmacd(' + f_round(macdLine) + ') > signal(' + f_round(signalLine) + ')']
    else

        if macdLine > 0
            ['bearish*', color.new(i_bearColor, 10), '*bearish in bull zone\nmacd(' + f_round(macdLine) + ') < signal(' + f_round(signalLine) + ')']
        else
            ['strong bearish', color.new(i_bearColor, 30), 'macd(' + f_round(macdLine) + ') < signal(' + f_round(signalLine) + ')']
    
    if not i_hideDesc
        table.cell(taTable, 0, 21, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
        table.cell(taTable, 1, 21, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
        table.cell(taTable, 2, 21, macd_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
    
    table.cell(taTable, 0, 22, 'MACD', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color, tooltip = tooltip_macd)
    table.cell(taTable, 1, 22, macd_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color, tooltip = macd_desc + '\n' + macdChg + '\nlast signal cross ' + str.tostring(signalCross) + ' bar(s) before')
    
    if not i_hideDesc
        table.cell(taTable, 2, 22, macdChg, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
        table.cell(taTable, 0, 23, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
        table.cell(taTable, 1, 23, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)
        table.cell(taTable, 2, 23, 'last signal cross ' + str.tostring(signalCross) + ' bar(s) before', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=macd_color)

        table.cell(taTable, 0, 24, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 24, height=1, bgcolor=bgColor)
        table.cell(taTable, 2, 24, height=1, bgcolor=bgColor)
    
    //------------------------------------------------------------------------------
    // Pressure
    if i_hideDesc
        table.cell(taTable, 0, 25, 'PRESSURE', text_color=chart.fg_color, text_halign=text.align_center, text_size=textSize, bgcolor=bgColor)
        table.cell(taTable, 1, 25, bgcolor=bgColor)
        table.merge_cells(taTable, 0, 25, 1, 25)
    //------------------------------------------------------------------------------
    // Pressure : Bull Bear Power
    
    [bbpText, bbpColor, bbpDesc] = if bbp > 0
        if close > ema13
            ['bullish', color.new(i_bullColor, 10), 'buyers are capable of pushing prices above the average consensus value('+ f_round(ema13) +')\nbull power (' + f_round(bull) + ') > bear power (' + f_round(-bear) + ')\nlast bull/bear power cross ' + str.tostring(bbpCross) + ' bar(s) before']
        else
            ['neutral*', i_neutColor, '*bull power (' + f_round(bull) + ') > bear power (' + f_round(-bear) + ')\nlast bull/bear power cross ' + str.tostring(bbpCross) + ' bar(s) before']
    else
        if close > ema13
            ['neutral*', i_neutColor, '*bull power (' + f_round(bull) + ') < bear power (' + f_round(-bear) + ')\nlast bull/bear power cross ' + str.tostring(bbpCross) + ' bar(s) before']
        else
            ['bearish', color.new(i_bearColor, 10), 'sellers are capable of pushing prices below the average consensus value('+ f_round(ema13) +')\nbull power (' + f_round(bull) + ') < bear power (' + f_round(-bear) + ')\nlast bull/bear power cross ' + str.tostring(bbpCross) + ' bar(s) before']

    if i_hideDesc
        table.cell(taTable, 0, 26, 'BBP', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=bbpColor, tooltip = tooltip_bbp )
        table.cell(taTable, 1, 26, bbpText, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=bbpColor, tooltip = bbpDesc)
    
    if nzVolume
    //------------------------------------------------------------------------------
    // Pressure : DeMark Pressure Ratio (DPR)
        if i_hideDesc

            [dprBias, dprColor] = if dpr >= 50
                if dpr > upperBand
                    ['bullish (overbought)', color.new(i_bullColor, 30)]
                else if dpr > 60
                    ['bullish', color.new(i_bullColor, 10)]
                else
                    ['neutral', i_neutColor]
            else
                if dpr < lowerBand
                    ['bearish (oversold)', color.new(i_bearColor, 30)]
                else if dpr < 40
                    ['bearish', color.new(i_bearColor, 10)]
                else
                    ['neutral', i_neutColor]

            table.cell(taTable, 0, 27, 'DPR', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dprColor, tooltip = tooltip_tdpr)
            table.cell(taTable, 1, 27, dprBias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=dprColor, tooltip = 'dpr(' + str.tostring(dpr, '#.##') + dprChg)
    
    //------------------------------------------------------------------------------
    // Pressure : Volume
        if i_hideDesc
            [volText, volColor1] = if B > S
                if B / nzVolume * 100 > upperBand
                    ['bullish', color.new(i_bullColor, 30)]
                else
                    ['bullish', color.new(i_bullColor, 10)]
            else
                if S / nzVolume * 100 > upperBand
                    ['bearish', color.new(i_bearColor, 30)]
                else
                    ['bearish', color.new(i_bearColor, 10)]
            
            table.cell(taTable, 0, 28, 'VOL', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=volColor1, tooltip = 'Last Bar\'s Buying / Selling Volume Pressure')
            table.cell(taTable, 1, 28, volText, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=volColor1, tooltip = 'buying volume : ' + str.tostring(B / (B + S) * 100, '#.##') + '%\nselling volume : ' + str.tostring(S / (B + S) * 100, '#.##') + '%')
    
    //------------------------------------------------------------------------------
    // Volume

        table.cell(taTable, 0, 29, 'VOLUME', text_color=chart.fg_color, text_halign=text.align_center, text_size=textSize, bgcolor=bgColor)
        table.cell(taTable, 1, 29, bgcolor=bgColor)
        table.merge_cells(taTable, 0, 29, 1, 29)

        if not i_hideDesc
            table.cell(taTable, 2, 29, bgcolor=bgColor)

        [vol_color, vol_desc] = if nzVolume
            if nzVolume > volMa * volHigh
                [source > open ? color.new(i_bullColor, 30) : color.new(i_bearColor, 30), 'high - volume(' + str.tostring(nzVolume, format.volume) + ')\n grater than' + str.tostring(volLength) + '-period avg volume(' + str.tostring(volMa, format.volume) + ')']
            else if nzVolume >= volMa * volLow and nzVolume <= volMa * volHigh
                [source > open ? color.new(i_bullColor, 10) : color.new(i_bearColor, 10), 'average - volume(' + str.tostring(nzVolume, format.volume) + ')\n in range with ' + str.tostring(volLength) + '-period avg volume(' + str.tostring(volMa, format.volume) + ')']
            else
                [i_neutColor, 'low - volume(' + str.tostring(nzVolume, format.volume) + ')\n less tahn ' + str.tostring(volLength) + '-period avg volume(' + str.tostring(volMa, format.volume) + ')']
        else
            [i_neutColor, 'no volume data provided for ' + syminfo.description]

        table.cell(taTable, 0, 30, 'LAST / AVG', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=vol_color, tooltip = tooltip_vol)
        table.cell(taTable, 1, 30, i_hideDesc ? str.tostring(nzVolume, format.volume) + ' / ' + str.tostring(volMa, format.volume) + ' ' : '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=vol_color, tooltip = vol_desc + '\n\naveage volume is greater than any previous aveage volume for ' + str.tostring(volStat) + ' bars back')
    
        if not i_hideDesc
            table.cell(taTable, 2, 30, vol_desc, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=vol_color)

            table.cell(taTable, 0, 31, height=1, bgcolor=bgColor)
            table.cell(taTable, 1, 31, height=1, bgcolor=bgColor)
            table.cell(taTable, 2, 31, height=1, bgcolor=bgColor)

    //------------------------------------------------------------------------------
    // Fear & Greed

    table.cell(taTable, 0, 32, 'FEAR & GREED', text_color=chart.fg_color, text_halign=text.align_center, text_size=textSize, bgcolor=bgColor)
    table.cell(taTable, 1, 32, bgcolor=bgColor)
    table.merge_cells(taTable, 0, 32, 1, 32)
    
    if not i_hideDesc
        table.cell(taTable, 2, 32, bgcolor=bgColor)

    [fg_bias, fg_color, fg_cell_color] = if feargreed > 73
        ['extreame greed', color.new(i_bullColor, 30), color.new(i_bullColor, 30)]
    else if feargreed > 33
        ['greed', color.new(i_bullColor, 10), color.new(i_bullColor, 10)]
    else if feargreed < -25
        ['fear', color.new(i_bearColor, 10), color.new(i_bearColor, 10)]
    else if feargreed < -41
        ['extreame fear', color.new(i_bearColor, 30), color.new(i_bearColor, 30)]
    else
        ['neutral', color.new(i_neutColor, 10), color.new(i_neutColor, 10)]

    fg_bias += ' (' + str.tostring(math.round(feargreed)) + '%)'

    fg_desc1 = 'Price Convergence/Divergence to/from its Moving Average (' + str.tostring(144) + ') ' + str.tostring(math.round(pmacd, 2)) + '%' + '\nRate of Return (Momentum/RoC), Length (' + str.tostring(144) + ') ' + str.tostring(math.round(ror, 2)) + '%'
    fg_desc2 = 'Chaikin Money Flow, Length (' + str.tostring(21) + ') ' + str.tostring(math.round(moneyFlow, 2)) + '%'
    fg_desc3 = 'VIX - Volatility (Fear) Index, Length (' + str.tostring(144) + ') ' + str.tostring(math.round(vix, 2)) + '%' + '\nSafe Haven Demand - Gold Demand, Length (' + str.tostring(21) + ') ' + str.tostring(math.round(gold, 2)) + '%'

    if not i_hideDesc
        table.cell(taTable, 0, 33, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
        table.cell(taTable, 1, 33, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
        table.cell(taTable, 2, 33, fg_desc1, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
    
    table.cell(taTable, 0, 34, 'F & G', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=color.new(f_getColor(feargreed), 30), tooltip = tooltip_fg)
    table.cell(taTable, 1, 34, fg_bias, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=color.new(f_getColor(feargreed), 30), tooltip = fg_desc1 + '\n' + fg_desc2 + '\n' + fg_desc3)
    
    if not i_hideDesc
        table.cell(taTable, 2, 34, fg_desc2, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
        table.cell(taTable, 0, 35, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
        table.cell(taTable, 1, 35, '', text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)
        table.cell(taTable, 2, 35, fg_desc3, text_color=textColor, text_halign=text.align_left, text_size=textSize, bgcolor=fg_color)

        table.cell(taTable, 0, 36, height=1, bgcolor=bgColor)
        table.cell(taTable, 1, 36, height=1, bgcolor=bgColor) 
        table.cell(taTable, 2, 36, height=1, bgcolor=bgColor)

// ---------------------------------------------------------------------------------------------- //
// Overlay Indies ------------------------------------------------------------------------------- //

var a_lines       = array.new_line()
var a_hist        = array.new_box()

oscLookbackLength = 50
priceHighest      = ta.highest(high, oscLookbackLength)
priceLowest       = ta.lowest (low , oscLookbackLength)
priceChangeRate   = (priceHighest - priceLowest) / priceHighest

oscHighest        = 100//ta.highest(osc, oscLookbackLength)
macdHighest       = ta.highest(macdLine, oscLookbackLength) - ta.lowest(macdLine, oscLookbackLength)
bbpHighest        = bbpPlot == 'Bull and Bear Power' ? math.max(ta.highest(bull, oscLookbackLength), ta.highest(-bear, oscLookbackLength)) - math.min(ta.lowest(bull, oscLookbackLength), ta.lowest(-bear, oscLookbackLength)) : ta.highest(bull + bear, oscLookbackLength) - ta.lowest(bull + bear, oscLookbackLength)

volumeMARate      = nzVolume / volMa
volumeHighest     = ta.highest(nzVolume, oscLookbackLength)
bullCandle        = close > open

if barstate.islast 
    if array.size(a_lines) > 0
        for i = 1 to array.size(a_lines)
            line.delete(array.shift(a_lines))
    
    if array.size(a_hist) > 0
        for i = 1 to array.size(a_hist)
            box.delete(array.shift(a_hist))

    if rsiPlot
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiOverbought / oscHighest * priceChangeRate * rsiHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiOverbought / oscHighest * priceChangeRate * rsiHight), color.new(color.red  , 75), 3))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 +            50 / oscHighest * priceChangeRate * rsiHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 +            50 / oscHighest * priceChangeRate * rsiHight), color.new(color.gray , 75), 1))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiOversold   / oscHighest * priceChangeRate * rsiHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiOversold   / oscHighest * priceChangeRate * rsiHight), color.new(color.green, 75), 3))
        f_drawLabelX(bar_index + 3,                                priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 +            50 / oscHighest * priceChangeRate * rsiHight), 'RSI', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center, str.tostring(rsiValue, '#.##'))

    if stochPlot
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochOverbought / oscHighest * priceChangeRate * stochHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochOverbought / oscHighest * priceChangeRate * stochHight), color.new(color.red  , 75), 3))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 +              50 / oscHighest * priceChangeRate * stochHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * stochVOffset) * (1 +              50 / oscHighest * priceChangeRate * stochHight), color.new(color.gray , 75), 1))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 +   stochOversold / oscHighest * priceChangeRate * stochHight), 
                                     bar_index                   , priceHighest * (1 + priceChangeRate * stochVOffset) * (1 +   stochOversold / oscHighest * priceChangeRate * stochHight), color.new(color.green, 75), 3))
        f_drawLabelX(bar_index + 3,                                priceHighest * (1 + priceChangeRate * stochVOffset) * (1 +              50 / oscHighest * priceChangeRate * stochHight), 'STOCH', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center, '%k : ' + str.tostring(stochK, '#.##') + '\n%d : ' + str.tostring(stochD, '#.##'))

    if nzVolume and dprPlot
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + upperBand / oscHighest * priceChangeRate * dprHight), 
                                     bar_index                   , priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + upperBand / oscHighest * priceChangeRate * dprHight), color.new(color.red  , 75), 3))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceLowest * (1 - priceChangeRate * dprVOffset) * (1 +        50 / oscHighest * priceChangeRate * dprHight), 
                                     bar_index                   , priceLowest * (1 - priceChangeRate * dprVOffset) * (1 +        50 / oscHighest * priceChangeRate * dprHight), color.new(color.gray , 75), 1))
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + lowerBand / oscHighest * priceChangeRate * dprHight), 
                                     bar_index                   , priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + lowerBand / oscHighest * priceChangeRate * dprHight), color.new(color.green, 75), 3))
        f_drawLabelX(bar_index + 3,                                priceLowest * (1 - priceChangeRate * dprVOffset) * (1 +        50 / oscHighest * priceChangeRate * dprHight), 'DPR', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center, str.tostring(dpr, '#.##'))

    if macdPlot
        f_drawLabelX(bar_index + 3,  priceHighest * (1 + priceChangeRate * macdVOffset), 'MACD', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center, '')//'macd : ' + str.tostring(macdLine, '#.##') + '\nsignal : ' + str.tostring(signalLine, '#.##'))
    
    if bbpPlot != 'None'
        f_drawLabelX(bar_index + 3,  priceLowest * (1 - priceChangeRate * bbpVOffset), 'BBP', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center,  '' )//bbpPlot == 'Bull and Bear Power' ? 'bull : ' + str.tostring(bull, '#.##') + '\nbear : ' + str.tostring(-bear, '#.##') : str.tostring((bull + bear), '#.##') )

    if bbpPlot == 'Sum of Bull and Bear Power'
        array.push(a_hist , box.new (bar_index[oscLookbackLength], priceLowest * (1 - priceChangeRate * bbpVOffset), 
                                     bar_index                   , priceLowest * (1 - priceChangeRate * bbpVOffset), color.new(color.gray , 75), 1))

    if volumeHist != 'None' 
        f_drawLabelX(bar_index + 3,  priceLowest * (1 - priceChangeRate * volVOffset) * (1 - nzVolume     / volumeHighest * priceChangeRate * volHight / volumeMARate), 'VOL', xloc.bar_index, yloc.price, #00000000, label.style_label_left, chart.fg_color, size.normal, text.align_center, 'buying volume : ' + str.tostring(B / (B + S) * 100, '#.##') + '%\nselling volume : ' + str.tostring(S / (B + S) * 100, '#.##') + '%\nlast volume : ' + str.tostring(nzVolume, format.volume) + '\naverage volume : ' + str.tostring(volMa, format.volume))

    for barIndex = 0 to oscLookbackLength - 1
        if array.size(a_lines) < 500
          
            if rsiPlot
                array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiValue[barIndex]        / oscHighest * priceChangeRate * rsiHight), 
                                         bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiValue[barIndex + 1]    / oscHighest * priceChangeRate * rsiHight), xloc.bar_index, extend.none, #7e57c2   , line.style_solid, 1))
                if rsiSmoothing
                    array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiSmooth[barIndex]   / oscHighest * priceChangeRate * rsiHight), 
                                             bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * rsiVOffset) * (1 + rsiSmooth[barIndex + 1]   / oscHighest * priceChangeRate * rsiHight), xloc.bar_index, extend.none, color.yellow   , line.style_solid, 1))

            if stochPlot
                array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochK[barIndex]     / oscHighest * priceChangeRate * stochHight), 
                                         bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochK[barIndex + 1] / oscHighest * priceChangeRate * stochHight), xloc.bar_index, extend.none, #2962FF   , line.style_solid, 1))
                array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochD[barIndex]     / oscHighest * priceChangeRate * stochHight), 
                                         bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * stochVOffset) * (1 + stochD[barIndex + 1] / oscHighest * priceChangeRate * stochHight), xloc.bar_index, extend.none, #FF6D00   , line.style_solid, 1))

            if macdPlot
                array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * macdVOffset) * (1 + macdLine[barIndex]       / macdHighest * priceChangeRate * macdHight ), 
                                         bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * macdVOffset) * (1 + macdLine[barIndex + 1]   / macdHighest * priceChangeRate * macdHight ), xloc.bar_index, extend.none, #2962FF   , line.style_solid, 1))
                array.push(a_lines, line.new(bar_index[barIndex], priceHighest * (1 + priceChangeRate * macdVOffset) * (1 + signalLine[barIndex]     / macdHighest * priceChangeRate * macdHight ), 
                                         bar_index[barIndex + 1], priceHighest * (1 + priceChangeRate * macdVOffset) * (1 + signalLine[barIndex + 1] / macdHighest * priceChangeRate * macdHight ), xloc.bar_index, extend.none, #FF6D00   , line.style_solid, 1))

                array.push(a_hist , box.new (bar_index[barIndex], priceHighest * (1 + priceChangeRate * macdVOffset), 
                                             bar_index[barIndex], priceHighest * (1 + priceChangeRate * macdVOffset) * (1 + histLine[barIndex] / macdHighest * priceChangeRate * macdHight), histColor[barIndex], 2))

            if bbpPlot == 'Bull and Bear Power'
                array.push(a_lines, line.new(bar_index[barIndex], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + bull[barIndex]      / bbpHighest * priceChangeRate * bbpHight ), 
                                         bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + bull[barIndex + 1]  / bbpHighest * priceChangeRate * bbpHight ), xloc.bar_index, extend.none, color.green   , line.style_solid, 1))
                array.push(a_lines, line.new(bar_index[barIndex], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + -bear[barIndex]     / bbpHighest * priceChangeRate * bbpHight ), 
                                         bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + -bear[barIndex + 1] / bbpHighest * priceChangeRate * bbpHight ), xloc.bar_index, extend.none, color.red   , line.style_solid, 1))

            if bbpPlot == 'Sum of Bull and Bear Power'
                array.push(a_lines, line.new(bar_index[barIndex], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + (bull[barIndex] + bear[barIndex])         / bbpHighest * priceChangeRate * bbpHight ), 
                                         bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * bbpVOffset) * (1 + (bull[barIndex + 1] + bear[barIndex + 1]) / bbpHighest * priceChangeRate * bbpHight ), xloc.bar_index, extend.none, (bull[barIndex] + bear[barIndex]) > 0 ? color.green : color.red  , line.style_solid, 1))
            if nzVolume
                if dprPlot
                    array.push(a_lines, line.new(bar_index[barIndex]    , priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + dpr[barIndex]       / oscHighest * priceChangeRate * dprHight ), 
                                                 bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + dpr[barIndex + 1]   / oscHighest * priceChangeRate * dprHight ), xloc.bar_index, extend.none, #2962FF   , line.style_solid, 1))
                    if dprSmoothing
                        array.push(a_lines, line.new(bar_index[barIndex]    , priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + dprSmooth[barIndex]       / oscHighest * priceChangeRate * dprHight ), 
                                                     bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * dprVOffset) * (1 + dprSmooth[barIndex + 1]   / oscHighest * priceChangeRate * dprHight ), xloc.bar_index, extend.none, color.yellow   , line.style_solid, 1))
                
                if volumeHist != 'None' 
                    array.push(a_hist , box.new (bar_index[barIndex],  priceLowest * (1 - priceChangeRate * volVOffset), 
                                                 bar_index[barIndex],  priceLowest * (1 - priceChangeRate * volVOffset) * (1 - nzVolume[barIndex] / volumeHighest * priceChangeRate * volHight), volumeHist == 'Buying/Selling Volume' ? color.new(#26a69a, 30) : bullCandle[barIndex] ? color.new(#26a69a, 30) : color.new(#ef5350, 30), 2, bgcolor = volumeHist == 'Buying/Selling Volume' ? color.new(#26a69a, 30) : bullCandle[barIndex] ? color.new(#26a69a, 30) : color.new(#ef5350, 30)))
                    
                    if volumeHist == 'Buying/Selling Volume'
                        array.push(a_hist , box.new (bar_index[barIndex],   priceLowest * (1 - priceChangeRate * volVOffset), 
                                                     bar_index[barIndex],   priceLowest * (1 - priceChangeRate * volVOffset) * (1 - S[barIndex]            / volumeHighest * priceChangeRate * volHight), color.new(#ef5350, 30), 2, bgcolor = color.new(#ef5350, 30)))
                    if volumeMA
                        array.push(a_hist, box.new(bar_index[barIndex],     priceLowest * (1 - priceChangeRate * volVOffset) * (1 - nzVolume[barIndex]     / volumeHighest * priceChangeRate * volHight / volumeMARate[barIndex]), 
                                                   bar_index[barIndex + 1], priceLowest * (1 - priceChangeRate * volVOffset) * (1 - nzVolume[barIndex + 1] / volumeHighest * priceChangeRate * volHight / volumeMARate[barIndex + 1]), #2962ff, 1, bgcolor = #2962ff))

// Overlay Indies ---------------------------------------------------------------------------------- //

var table logo = table.new(position.bottom_right, 1, 1)
if barstate.islast
    table.cell(logo, 0, 0, '☼☾  ', text_size=size.normal, text_color=color.teal)