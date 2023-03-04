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
    
//-------------------------------------------------------------------
// =======RSX-D [ID: AC-P] v08
    // Author: Auroagwei
        // https://www.tradingview.com/u/auroagwei/
study("RSX-D [ID: AC-P]", shorttitle="RSX-D [ID: AC-P]")
    // Note: Designed for darkmode by default. 
    
//-------------------------------------------------------------------
//---- Input Parameters
length = input(title="RSX: Length", type=input.integer, defval=14)
src = input(title="RSX: Source", type=input.source, defval=hlc3)
obLevel = input(title="RSX: OB Level", type=input.integer, defval=70)
osLevel = input(title="RSX: OS Level", type=input.integer, defval=30)
show_rsx= input(true, "Show RSX?")

highlightBreakouts_ema = input(false, title="Show EMA21/55 Up/Down Fill")
highlightBreakouts = input(title="RSX: Highlight Overbought/Oversold Breakouts?", type=input.bool, defval=true)
showdivs_lib = input(true, title="RSX: Hide Divs? [Libertus Divs]")

if showdivs_lib  == false
    showdivs_lib := true
else
    showdivs_lib := false
piv = input(true, "RSX: Hide pivots? [Libertus Divs]")
shrt = input(true, "RSX: Shorter labels for pivots and Divs? [Libertus Divs]")
xbars = input(90, "RSX: Div lookback period (bars)? [Libertus Divs]", input.integer, minval=1)

showdivs = input(false, title="RSX Divergences [Neobutane Divs]")
showdiv_labels2 = input(true,title="RSX Divergences: Mark Hidden Divs [Neobutane Divs]")
showchan = false //input(false, title="RSX Divergences: Draw Channel [Neobutane Divs]") 
showhidden = input(false, title="RSX Divergences: Show Hidden Divs with low strikerate [Neobutane Divs]")

showdivs2 = input(false, title="LSMA-D Divergences [Neobutane Divs]")
showdiv_labels22 = input(true,title="LSMA-D Divergences: Mark Hidden Divs [Neobutane Divs]")
showchan2 = false //input(false, title="LSMA-D Divergences: Draw Channel [Neobutane Divs]") 
showhidden2 = input(false, title="LSMA-D Divergences: Show Hidden Divs with low strikerate [Neobutane Divs]")

//---- M1/M2, Midline Trend indication/Zones
show_m1 = input(true, title="Show M1 Level Marker")
show_m2 = input(true, title="Show M2 Level Marker")

m1Level = input(title="RSX: M1 Level", type=input.integer, defval=85) //60
m2Level = input(title="RSX: M2 Level", type=input.integer, defval=15) //40

showArrows = input(true, "Show/Hide all zone indication")
showArrowsCenter = input(false, "RSX Midline cross indication")
showArrowsEnter = input(true, "RSX M1/M2 Enter zone indication")
showArrowsExit = input(true, "RSX M1/M2 Exit zone indication")
showArrowsrsx_lsmaD = input(true, "RSX/LSMA-D cross indication")

rsx_lsmaD_obLevel = input(title="RSX/LSMA-D cross: OB Level", type=input.integer, defval=70)
rsx_lsmaD_osLevel = input(title="RSX/LSMA-D cross : OS Level", type=input.integer, defval=30)

//---- LSMA-K and LSMA-D Components
show_lsmaD = input(true,defval=false,type=input.bool,title="Show LSMA-D line?")

length_lsmaA_lsma  = input(minval=2,defval=20,type=input.integer,title="LSMA-D: LSMA-A Length")
length_lsmaB_lsma  = input(minval=2,defval=40,type=input.integer,title="LSMA-D: LSMA-B Length")
length_lsmaC_lsma  = input(minval=2,defval=80,type=input.integer,title="LSMA-D: LSMA-C Length") 
length_lsmaD_lsma = input(minval=2,defval=10,type=input.integer,title="LSMA-D: Length") 

offset_lsmaA =  input(defval=0,type=input.integer,title="LSMA-D: LSMA-A Offset")
offset_lsmaB =  input(defval=0,type=input.integer,title="LSMA-D: LSMA-B Offset")
offset_lsmaC =  input(defval=0,type=input.integer,title="LSMA-D: LSMA-C Offset")
offset_lsmaD = input(defval=-2,type=input.integer,title="LSMA-D: Offset")

//-------------------------------------------------------------------
//---- RSX Component (Everget, Jaggedsoft)
    //---- Note: Probably a solid idea to not touch this section.
f8 = 100 * src
f10 = nz(f8[1])
v8 = f8 - f10

f18 = 3 / (length + 2)
f20 = 1 - f18

f28 = 0.0
f28 := f20 * nz(f28[1]) + f18 * v8

f30 = 0.0
f30 := f18 * f28 + f20 * nz(f30[1])
vC = f28 * 1.5 - f30 * 0.5

f38 = 0.0
f38 := f20 * nz(f38[1]) + f18 * vC

f40 = 0.0
f40 := f18 * f38 + f20 * nz(f40[1])
v10 = f38 * 1.5 - f40 * 0.5

f48 = 0.0
f48 := f20 * nz(f48[1]) + f18 * v10

f50 = 0.0
f50 := f18 * f48 + f20 * nz(f50[1])
v14 = f48 * 1.5 - f50 * 0.5

f58 = 0.0
f58 := f20 * nz(f58[1]) + f18 * abs(v8)

f60 = 0.0
f60 := f18 * f58 + f20 * nz(f60[1])
v18 = f58 * 1.5 - f60 * 0.5

f68 = 0.0
f68 := f20 * nz(f68[1]) + f18 * v18

f70 = 0.0
f70 := f18 * f68 + f20 * nz(f70[1])
v1C = f68 * 1.5 - f70 * 0.5

f78 = 0.0
f78 := f20 * nz(f78[1]) + f18 * v1C

f80 = 0.0
f80 := f18 * f78 + f20 * nz(f80[1])
v20 = f78 * 1.5 - f80 * 0.5

f88_ = 0.0
f90_ = 0.0

f88 = 0.0
f90_ := nz(f90_[1]) == 0 ? 1 : 
   nz(f88[1]) <= nz(f90_[1]) ? nz(f88[1]) + 1 : nz(f90_[1]) + 1
f88 := nz(f90_[1]) == 0 and length - 1 >= 5 ? length - 1 : 5

f0 = f88 >= f90_ and f8 != f10 ? 1 : 0
f90 = f88 == f90_ and f0 == 0 ? 0 : f90_

v4_ = f88 < f90 and v20 > 0 ? (v14 / v20 + 1) * 50 : 50
rsx = v4_ > 100 ? 100 : v4_ < 0 ? 0 : v4_

rsxColor = rsx > obLevel ? #0ebb23 : rsx < osLevel ? #ff0000 : color.white //#512DA8

lsmaA = linreg(rsx,length_lsmaA_lsma,offset_lsmaA)
lsmaB = linreg(rsx,length_lsmaB_lsma,offset_lsmaB) 
lsmaC = linreg(rsx,length_lsmaC_lsma,offset_lsmaC) 
lsmaD = linreg(((lsmaA + lsmaB + lsmaC) / 3), length_lsmaD_lsma,offset_lsmaD)

//-------------------------------------------------------------------
//---- Chassis
transparent = color.new(color.white, 100)
maxLevelPlot = hline(100, title="Max Level", linestyle=hline.style_dotted, color=transparent)
obLevelPlot = hline(obLevel, title="Overbought Level", linestyle=hline.style_dotted)
midline = hline(50, title="Middle Level/Midline", linestyle=hline.style_dotted,color=color.white) //color.silver)
osLevelPlot = hline(osLevel, title="Oversold Level", linestyle=hline.style_dotted)//,color=color.gray)
minLevelPlot = hline(0, title="Min Level", linestyle=hline.style_dotted, color=transparent)

fill(obLevelPlot, osLevelPlot, color=color.purple, transp=100,title="RSX OB <--> OS Fill")

//---- M1/M2 Marker 
    // Custom M1/M2 levels of 40/60 by default
    // Set to transparent to keep out of the way if not using/needed

m1_color =  show_m1 ? color.aqua	 : transparent
m2_color =  show_m2 ? color.orange	: transparent
m1LevelPlot = hline(m1Level, title="RSX: M1 Level", linestyle=hline.style_dotted,color=m1_color) 
m2LevelPlot = hline(m2Level , title="RSX: M2 Level", linestyle=hline.style_dotted,color=m2_color) 
//----

obFillColor = rsx > obLevel and highlightBreakouts ? #008000	 : transparent
osFillColor = rsx < osLevel and highlightBreakouts ? #FF0000	: transparent
fill(maxLevelPlot, obLevelPlot, color=obFillColor, transp=90, title="RSX OB Fill")
fill(minLevelPlot, osLevelPlot, color=osFillColor, transp=90, title="RSX OS Fill")

//////////////////

ema21 = ema(close, 21)  //fib
ema55 = ema(close, 55)  //fib

upEmaFillColor = ema21 > ema55 and highlightBreakouts_ema ? color.orange	 : transparent
downEmaFillColor = ema21 < ema55  and highlightBreakouts_ema ? color.aqua	: transparent

fill(obLevelPlot, m1LevelPlot, color=upEmaFillColor, transp=70,title="EMA 21/55 Up Fill")
fill(osLevelPlot, m2LevelPlot, color=downEmaFillColor, transp=70,title="EMA 21/55 Down Fill")

////////////////

//-------------------------------------------------------------------
plot(show_rsx ? rsx : na , title="RSX", linewidth=2, color=rsxColor, transp=0)
//-------------------------------------------------------------------

// MA of RSX
show_sma = input(false, "SMA of RSX")
show_ema = input(false, "EMA of RSX")

len_sma = input(9, minval=1, title="SMA of RSX Length")
len_ema = input(45, minval=1, title="EMA of RSX Length") 
smaRSX = ema(rsx,len_sma )
emaRSX = ema(rsx,len_ema )
plot(show_sma ? smaRSX : na, title="SMA of RSX", style=plot.style_line, linewidth=2, color=#26c6da,transp=0)
plot(show_ema ? emaRSX : na, title="EMA of RSX", style=plot.style_line, linewidth=2, color=#008000	,transp=0)
//
plot(show_lsmaD ? lsmaD : na, color=color.fuchsia, linewidth=2,title="LSMA-D",transp=0)

//-------------------------------------------------------------------
//---- Pivots and Libertus Divergences Component
hb = abs(highestbars(rsx, xbars))  // Finds bar with highest value in last X bars
lb = abs(lowestbars(rsx, xbars))  // Finds bar with lowest value in last X bars
max = float(na)
max_rsi = float(na)
min = float(na)
min_rsi = float(na)
pivoth = bool(na)
pivotl = bool(na)
divbear = bool(na)
divbull = bool(na)

// If bar with lowest / highest is current bar, use it's value
max := hb == 0 ? close : na(max[1]) ? close : max[1]
max_rsi := hb == 0 ? rsx : na(max_rsi[1]) ? rsx : max_rsi[1]
min := lb == 0 ? close : na(min[1]) ? close : min[1]
min_rsi := lb == 0 ? rsx : na(min_rsi[1]) ? rsx : min_rsi[1]

// Compare high of current bar being examined with previous bar's high
// If curr bar high is higher than the max bar high in the lookback window range
if close > max  // we have a new high
    max := close  // change variable "max" to use current bar's high value
    max
if rsx > max_rsi  // we have a new high
    max_rsi := rsx  // change variable "max_rsi" to use current bar's RSI value
    max_rsi
if close < min  // we have a new low
    min := close  // change variable "min" to use current bar's low value
    min
if rsx < min_rsi  // we have a new low
    min_rsi := rsx  // change variable "min_rsi" to use current bar's RSI value
    min_rsi

// Finds pivot point with at least 2 right candles with lower value
pivoth := max_rsi == max_rsi[2] and max_rsi[2] != max_rsi[3] ? true : na
pivotl := min_rsi == min_rsi[2] and min_rsi[2] != min_rsi[3] ? true : na

// Detects divergences between price and indicator with 1 candle delay so it filters out repeating divergences
if max[1] > max[2] and rsx[1] < max_rsi and rsx <= rsx[1]
    divbear := true
    divbear
if min[1] < min[2] and rsx[1] > min_rsi and rsx >= rsx[1]
    divbull := true
    divbull

//-------------------------------------------------------------------
//---- Pivots and Libertus Divergences plotting with offset
// Longer labels
plotshape(showdivs_lib ? (shrt ? na : divbear ? rsx[1] + 1 : na) : na, location=location.absolute, style=shape.labeldown, color=#FF0000, size=size.tiny, text="Bear", textcolor=color.white, transp=0, offset=-1)
plotshape(showdivs_lib  ? (shrt ? na : divbull ? rsx[1] - 1 : na) : na, location=location.absolute, style=shape.labelup, color=#008000	, size=size.tiny, text="Bull", textcolor=color.white, transp=0, offset=-1)
plotshape(piv ? na : shrt ? na : pivoth ? max_rsi + 1 : na, location=location.absolute, style=shape.labeldown, color=color.blue, size=size.tiny, text="Pivot", textcolor=color.white, transp=0, offset=-2)
plotshape(piv ? na : shrt ? na : pivotl ? min_rsi - 1 : na, location=location.absolute, style=shape.labelup, color=color.blue, size=size.tiny, text="Pivot", textcolor=color.white, transp=0, offset=-2)

// Shorter labels
plotshape(showdivs_lib ? (shrt ? divbear ? rsx[1] + 3 : na : na) : na, location=location.absolute, style=shape.triangledown, color=#FF0000, size=size.tiny, transp=0, offset=-1)
plotshape(showdivs_lib ? (shrt ? divbull ? rsx[1] - 3 : na : na) : na, location=location.absolute, style=shape.triangleup, color=#008000	, size=size.tiny, transp=0, offset=-1)
plotshape(piv ? na : shrt ? pivoth ? max_rsi + 3 : na : na, location=location.absolute, style=shape.triangledown, color=#0000FF	, size=size.tiny, transp=0, offset=-2)
plotshape(piv ? na : shrt ? pivotl ? min_rsi - 3 : na : na, location=location.absolute, style=shape.triangleup, color=#0000FF	, size=size.tiny, transp=0, offset=-2)

//-------------------------------------------------------------------
//---- Secondary Divergence Component for RSX + LSMA-D (Neobutane Divergences)
k=rsx
k2=lsmaD

//----
uselog = true //  input(true, title="Log")
//@RicardoSantos' Divergence Script (https://www.tradingview.com/script/3oeDh0Yq-RS-Price-Divergence-Detector-V2/)
f_top_fractal(_src)=>_src[4] < _src[2] and _src[3] < _src[2] and _src[2] > _src[1] and _src[2] > _src[0]
f_bot_fractal(_src)=>_src[4] > _src[2] and _src[3] > _src[2] and _src[2] < _src[1] and _src[2] < _src[0]
f_fractalize(_src)=>f_top_fractal(_src) ? 1 : f_bot_fractal(_src) ? -1 : 0
//----
fractal_top = f_fractalize(k) > 0 ? k[2] : na
fractal_bot = f_fractalize(k) < 0 ? k[2] : na

fractal_top2 = f_fractalize(k2) > 0 ? k2[2] : na
fractal_bot2 = f_fractalize(k2) < 0 ? k2[2] : na

high_prev = valuewhen(fractal_top, k[2], 0)[2]
high_price = valuewhen(fractal_top, high[2], 0)[2]
low_prev = valuewhen(fractal_bot, k[2], 0)[2]
low_price = valuewhen(fractal_bot, low[2], 0)[2]

high_prev2 = valuewhen(fractal_top2, k2[2], 0)[2]
high_price2 = valuewhen(fractal_top2, high[2], 0)[2]
low_prev2 = valuewhen(fractal_bot2, k2[2], 0)[2]
low_price2 = valuewhen(fractal_bot2, low[2], 0)[2]

regular_bearish_div = fractal_top and high[2] > high_price and k[2] < high_prev
hidden_bearish_div = fractal_top and high[2] < high_price and k[2] > high_prev
regular_bullish_div = fractal_bot and low[2] < low_price and k[2] > low_prev
hidden_bullish_div = fractal_bot and low[2] > low_price and k[2] < low_prev

regular_bearish_div2 = fractal_top2 and high[2] > high_price2 and k[2] < high_prev2
hidden_bearish_div2 = fractal_top2 and high[2] < high_price2 and k[2] > high_prev2
regular_bullish_div2 = fractal_bot2 and low[2] < low_price2 and k[2] > low_prev2
hidden_bullish_div2 = fractal_bot2 and low[2] > low_price2 and k[2] < low_prev2

col1 = regular_bearish_div ? #FF0000	 : hidden_bearish_div and showhidden ? #FF0000		: na
col2 = regular_bullish_div ? #00FF00 : hidden_bullish_div and showhidden ? #00FF00 : na
col3 = regular_bearish_div ? #FF0000	 : hidden_bearish_div and showhidden ? #FF0000	 : showchan ? color.gray : na
col4 = regular_bullish_div ? #00FF00 : hidden_bullish_div and showhidden ? #00FF00 : showchan ? color.gray : na

col12 = regular_bearish_div2 ? #FF0000	 : hidden_bearish_div2 and showhidden2 ? #FF0000		: na
col22 = regular_bullish_div2 ? #00FF00 : hidden_bullish_div2 and showhidden2 ? #00FF00 : na
col32 = regular_bearish_div2 ? #FF0000	 : hidden_bearish_div2 and showhidden2 ? #FF0000	 : showchan ? color.gray : na
col42 = regular_bullish_div2 ? #00FF00 : hidden_bullish_div2 and showhidden2 ? #00FF00 : showchan ? color.gray : na
//-------------------------
// ---- Neobutane Divergences Plot component
// plot(showchan?fractal_top:na, title="RSX Divergences: Top Div Channel", offset=-2, color=color.gray,linewidth=2)
// plot(showchan?fractal_bot:na, title="RSX Divergences: Bottom Div Channel", offset=-2, color=color.gray,linewidth=2)

plot(title='RSX Divergences: H F', series=showdivs and fractal_top ? k[2] : na, color=col1, linewidth=2, offset=-2,transp=20)
plot(title='RSX Divergences: L F', series=showdivs and fractal_bot ? k[2] : na, color=col2, linewidth=2, offset=-2,transp=20)
plot(title='RSX Divergences: H D', series=showdivs and fractal_top ? k[2] : na, style=plot.style_circles, color=col3, linewidth=3, offset=-2,transp=20)
plot(title='RSX Divergences: L D', series=showdivs and fractal_bot ? k[2] : na, style=plot.style_circles, color=col4, linewidth=3, offset=-2,transp=20)

// plot(showchan2?fractal_top2:na, title="LSMA-D Divergences: Top Div Channel", offset=-2, color=color.gray,linewidth=2)
// plot(showchan2?fractal_bot2:na, title="LSMA-D Divergences: Bottom Div Channel", offset=-2, color=color.gray,linewidth=2)

plot(title='LSMA-D Divergences: H F', series=showdivs2 and fractal_top2 ? k2[2] : na, color=col12, linewidth=2, offset=-2,transp=20)
plot(title='LSMA-D Divergences: L F', series=showdivs2 and fractal_bot2 ? k2[2] : na, color=col22, linewidth=2, offset=-2,transp=20)
plot(title='LSMA-D Divergences: H D', series=showdivs2 and fractal_top2 ? k2[2] : na, style=plot.style_circles, color=col32, linewidth=3, offset=-2,transp=20)
plot(title='LSMA-D Divergences: L D', series=showdivs2 and fractal_bot2 ? k2[2] : na, style=plot.style_circles, color=col42, linewidth=3, offset=-2,transp=20)

// plotshape(title='+Regular Bearish Div Label', series=showdivs and showdiv_labels and regular_bearish_div ? k[2] : na, text='R', style=shape.labeldown, location=location.absolute, color=red, textcolor=white, offset=-2)
// plotshape(title='+Hidden Bearish Div Label', series=showdivs and showdiv_labels and hidden_bearish_div and showhidden ? k[2] : na, text='H', style=shape.labeldown, location=location.absolute, color=red, textcolor=white, offset=-2)
// plotshape(title='-Regular Bullish Div Label', series=showdivs and showdiv_labels and regular_bullish_div ? k[2] : na, text='R', style=shape.labelup, location=location.absolute, color=green, textcolor=white, offset=-2)
// plotshape(title='-Hidden Bearish Div Label', series=showdivs and showdiv_labels and hidden_bullish_div  and showhidden ? k[2] : na, text='H', style=shape.labelup, location=location.absolute, color=green, textcolor=white, offset=-2)

plotshape(title='RSX Divergences: Hidden Bearish Div', series=showdivs and showdiv_labels2 and hidden_bearish_div and showhidden ? k[2] : na,
  style=shape.square, location=location.absolute, color=#FF0000		, offset=-2,size=size.tiny)
plotshape(title='RSX Divergences: Hidden Bullish Div', series=showdivs and showdiv_labels2 and hidden_bullish_div  and showhidden ? k[2] : na,
  style=shape.square, location=location.absolute, color=#00FF00	, offset=-2,size=size.tiny)

plotshape(title='LSMA-D Divergences: Hidden Bearish Div', series=showdivs2 and showdiv_labels22 and hidden_bearish_div2 and showhidden2 ? k2[2] : na,
  style=shape.square, location=location.absolute, color=#FF0000		, offset=-2,size=size.tiny)
plotshape(title='LSMA-D Divergences: Hidden Bullish Div', series=showdivs2 and showdiv_labels22 and hidden_bullish_div2  and showhidden2 ? k2[2] : na,
  style=shape.square, location=location.absolute, color=#00FF00	, offset=-2,size=size.tiny)

//-------------------------------------------------------------------
//---- Alerts

// Libertus Div Alerts, RSX
    // [L] Suffix
alertcondition(divbear, title='RSX: Bear div [L]', message='RSX: Bear div [L]')
alertcondition(divbull, title='RSX: Bull div [L]', message='RSX: Bull div [L]')

//---- Neobutane Div Alerts, RSX
    // [NB] Suffix
alertcondition(regular_bearish_div, "RSX Regular Bear Div [NB]", "RSX Regular Bear Div [NB]") 
alertcondition(regular_bullish_div, "RSX Regular Bull Div [NB]", "RSX Regular Bull Div [NB]") 
alertcondition(hidden_bearish_div, "RSX Hidden Bear Div [NB]", "RSX Hidden Bear Div [NB]") 
alertcondition(hidden_bullish_div, "RSX Hidden Bull Div [NB]", "RSX Hidden Bull Div [NB]") 

//---- Neobutane Div Alerts, LSMA-D
    // [NB] Suffix
alertcondition(regular_bearish_div2, "LSMA-D Regular Bear Div [NB]", "LSMA-D Regular Bear Div [NB]") 
alertcondition(regular_bullish_div2, "LSMA-D Regular Bull Div [NB]", "LSMA-D Regular Bull Div [NB]") 
alertcondition(hidden_bearish_div2, "LSMA-D Hidden Bear Div [NB]", "LSMA-D Hidden Bear Div [NB]") 
alertcondition(hidden_bullish_div2, "LSMA-D Hidden Bull Div [NB]", "LSMA-D Hidden Bull Div [NB]") 
//-------------------------------------------------------------------

//---- M1/M2 and Trending Signal Alert componenent [Daveatt CCI Stoch]
// showArrows = true
// showArrowsEnter = true
// showArrowsExit = true
// showArrowsCenter = true
trend_enter = if showArrowsEnter
    if crossunder(rsx, m2Level)
        1
    else
        if crossover(rsx, m1Level)
            -1
    
trend_exit = if showArrowsExit
    if crossunder(rsx, m1Level)
        -1
    else
        if crossover(rsx, m2Level)
            1

trend_center = if showArrowsCenter
    if crossunder(rsx, 50)
        -1
    else
        if crossover(rsx, 50)
            1

rsx_lsmaD_cu = rsx >= rsx_lsmaD_obLevel and crossunder(rsx, lsmaD)
rsx_lsmaD_co = rsx <= rsx_lsmaD_osLevel and crossover(rsx, lsmaD)


plotshape((showArrows and showArrowsCenter and trend_center == -1 ) ? 65 : na,
  color=color.white, transp=20, style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU Midline")
plotshape((showArrows and showArrowsCenter and trend_center == 1 ) ? 35 : na,
  color=color.white, transp=20, style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO Midline")

plotshape((showArrows and showArrowsExit and trend_exit == -1) ? 100 : na,
  color=color.aqua, transp=20, style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU M1")
plotshape((showArrows and showArrowsEnter and trend_enter == -1) ? 100 : na,
  color=color.aqua, transp=85, style=shape.triangledown, size=size.tiny, location=location.absolute, title="+RSX CO M1")
   
plotshape((showArrows and showArrowsEnter and trend_enter == 1) ? 0 : na,
  color=color.orange, transp=85, style=shape.triangleup, size=size.tiny,  location=location.absolute, title="-RSX CU M2")
plotshape((showArrows and showArrowsExit and trend_exit == 1) ? 0 : na,
  color=color.orange, transp=20, style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO M2")

// rsx/LSMA-D CU/CO
plotshape((showArrows and showArrowsrsx_lsmaD and rsx_lsmaD_cu) ? 105 : na,
  color=color.fuchsia, transp=20, style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU LSMA-D")
plotshape((showArrows and showArrowsrsx_lsmaD and rsx_lsmaD_co) ? -5 : na,
  color=color.fuchsia, transp=20, style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO LSMA-D")
   
//----

alertcondition((showArrowsCenter and trend_center == 1), message="+RSX CO Midline", title="+RSX CO Midline")
alertcondition((showArrowsCenter and trend_center == -1), message="-RSX CU Midline", title="-RSX CU Midline")

alertcondition((showArrowsExit and trend_exit == -1), message="-RSX CU M1", title="-RSX CU M1")
alertcondition((showArrowsEnter and trend_enter == -1), message="+RSX CO M1", title="+RSX CO M1")

alertcondition((showArrowsEnter and trend_enter == 1), message="-RSX CU M2", title="-RSX CU M2")
alertcondition((showArrowsExit and trend_exit == 1), message="+RSX CO M2", title="+RSX CO M2")

alertcondition((rsx_lsmaD_cu), message="-RSX CU LSMA-D", title="-RSX CU LSMA-D")
alertcondition((rsx_lsmaD_co), message="+RSX CO LSMA-D", title="+RSX CO LSMA-D")

   

// VuManChu B Divergences
// PARAMETERS {

// WaveTrend
wtShow = input(true, title = 'Show WaveTrend', type = input.bool)
wtBuyShow = input(true, title = 'Show Buy dots', type = input.bool)
wtGoldShow = input(true, title = 'Show Gold dots', type = input.bool)
wtSellShow = input(true, title = 'Show Sell dots', type = input.bool)
wtDivShow = input(true, title = 'Show Div. dots', type = input.bool)
vwapShow = input(true, title = 'Show Fast WT', type = input.bool)
wtChannelLen = input(9, title = 'WT Channel Length', type = input.integer)
wtAverageLen = input(12, title = 'WT Average Length', type = input.integer)
wtMASource = input(hlc3, title = 'WT MA Source', type = input.source)
wtMALen = input(3, title = 'WT MA Length', type = input.integer)

// WaveTrend Overbought & Oversold lines
obLevel = input(53, title = 'WT Overbought Level 1', type = input.integer)
obLevel2 = input(60, title = 'WT Overbought Level 2', type = input.integer)
obLevel3 = input(100, title = 'WT Overbought Level 3', type = input.integer)
osLevel = input(-53, title = 'WT Oversold Level 1', type = input.integer)
osLevel2 = input(-60, title = 'WT Oversold Level 2', type = input.integer)
osLevel3 = input(-75, title = 'WT Oversold Level 3', type = input.integer)

// Divergence WT
wtShowDiv = input(true, title = 'Show WT Regular Divergences', type = input.bool)
wtShowHiddenDiv = input(false, title = 'Show WT Hidden Divergences', type = input.bool)
showHiddenDiv_nl = input(true, title = 'Not apply OB/OS Limits on Hidden Divergences', type = input.bool)
wtDivOBLevel = input(45, title = 'WT Bearish Divergence min', type = input.integer)
wtDivOSLevel = input(-65, title = 'WT Bullish Divergence min', type = input.integer)

// Divergence extra range
wtDivOBLevel_addshow = input(true, title = 'Show 2nd WT Regular Divergences', type = input.bool)
wtDivOBLevel_add = input(15, title = 'WT 2nd Bearish Divergence', type = input.integer)
wtDivOSLevel_add = input(-40, title = 'WT 2nd Bullish Divergence 15 min', type = input.integer)

// RSI+MFI
rsiMFIShow = input(true, title = 'Show MFI', type = input.bool)
rsiMFIperiod = input(60,title = 'MFI Period', type = input.integer)
rsiMFIMultiplier = input(150, title = 'MFI Area multiplier', type = input.float)
rsiMFIPosY = input(2.5, title = 'MFI Area Y Pos', type = input.float)

// RSI
rsiShow = input(false, title = 'Show RSI', type = input.bool)
rsiSRC = input(close, title = 'RSI Source', type = input.source)
rsiLen = input(14, title = 'RSI Length', type = input.integer)
rsiOversold = input(30, title = 'RSI Oversold', minval = 50, maxval = 100, type = input.integer)
rsiOverbought = input(60, title = 'RSI Overbought', minval = 0, maxval = 50, type = input.integer)

// Divergence RSI
rsiShowDiv = input(false, title = 'Show RSI Regular Divergences', type = input.bool)
rsiShowHiddenDiv = input(false, title = 'Show RSI Hidden Divergences', type = input.bool)
rsiDivOBLevel = input(60, title = 'RSI Bearish Divergence min', type = input.integer)
rsiDivOSLevel = input(30, title = 'RSI Bullish Divergence min', type = input.integer)

// RSI Stochastic
stochShow = input(true, title = 'Show Stochastic RSI', type = input.bool)
stochUseLog = input(true, title=' Use Log?', type = input.bool)
stochAvg = input(false, title='Use Average of both K & D', type = input.bool)
stochSRC = input(close, title = 'Stochastic RSI Source', type = input.source)
stochLen = input(14, title = 'Stochastic RSI Length', type = input.integer)
stochRsiLen = input(14, title = 'RSI Length ', type = input.integer)
stochKSmooth = input(3, title = 'Stochastic RSI K Smooth', type = input.integer)
stochDSmooth = input(3, title = 'Stochastic RSI D Smooth', type = input.integer)

// Divergence stoch
stochShowDiv = input(false, title = 'Show Stoch Regular Divergences', type = input.bool)
stochShowHiddenDiv = input(false, title = 'Show Stoch Hidden Divergences', type = input.bool)

// Schaff Trend Cycle
tcLine = input(false, title="Show Schaff TC line", type=input.bool)
tcSRC = input(close, title = 'Schaff TC Source', type = input.source)
tclength = input(10, title="Schaff TC", type=input.integer)
tcfastLength = input(23, title="Schaff TC Fast Lenght", type=input.integer)
tcslowLength = input(50, title="Schaff TC Slow Length", type=input.integer)
tcfactor = input(0.5, title="Schaff TC Factor", type=input.float)

// Sommi Flag
sommiFlagShow = input(false, title = 'Show Sommi flag', type = input.bool)
sommiShowVwap = input(false, title = 'Show Sommi F. Wave', type = input.bool)
sommiVwapTF = input('720', title = 'Sommi F. Wave timeframe', type = input.string)
sommiVwapBearLevel = input(0, title = 'F. Wave Bear Level (less than)', type = input.integer)
sommiVwapBullLevel = input(0, title = 'F. Wave Bull Level (more than)', type = input.integer)
soomiFlagWTBearLevel = input(0, title = 'WT Bear Level (more than)', type = input.integer) 
soomiFlagWTBullLevel = input(0, title = 'WT Bull Level (less than)', type = input.integer) 
soomiRSIMFIBearLevel = input(0, title = 'Money flow Bear Level (less than)', type = input.integer) 
soomiRSIMFIBullLevel = input(0, title = 'Money flow Bull Level (more than)', type = input.integer) 

// Sommi Diamond
sommiDiamondShow = input(false, title = 'Show Sommi diamond', type = input.bool)
sommiHTCRes = input('60', title = 'HTF Candle Res. 1', type = input.string)
sommiHTCRes2 = input('240', title = 'HTF Candle Res. 2', type = input.string)
soomiDiamondWTBearLevel = input(0, title = 'WT Bear Level (More than)', type = input.integer)
soomiDiamondWTBullLevel = input(0, title = 'WT Bull Level (Less than)', type = input.integer)

// macd Colors
macdWTColorsShow = input(false, title = 'Show MACD Colors', type = input.bool)
macdWTColorsTF = input('240', title = 'MACD Colors MACD TF', type = input.string)

darkMode = input(false, title = 'Dark mode', type = input.bool)


// Colors
colorRed = #ff0000
colorPurple = #e600e6
colorGreen = #3fff00
colorOrange = #e2a400
colorYellow = #ffe500
colorWhite = #ffffff
colorPink = #ff00f0
colorBluelight = #31c0ff

colorWT1 = #90caf9
colorWT2 = #0d47a1

colorWT2_ = #131722

colormacdWT1a = #4caf58
colormacdWT1b = #af4c4c
colormacdWT1c = #7ee57e
colormacdWT1d = #ff3535

colormacdWT2a = #305630
colormacdWT2b = #310101
colormacdWT2c = #132213
colormacdWT2d = #770000

// } PARAMETERS


// FUNCTIONS {
  
// Divergences 
f_top_fractal(src) => src[4] < src[2] and src[3] < src[2] and src[2] > src[1] and src[2] > src[0]
f_bot_fractal(src) => src[4] > src[2] and src[3] > src[2] and src[2] < src[1] and src[2] < src[0]
f_fractalize(src) => f_top_fractal(src) ? 1 : f_bot_fractal(src) ? -1 : 0

f_findDivs(src, topLimit, botLimit, useLimits) =>
    fractalTop = f_fractalize(src) > 0 and (useLimits ? src[2] >= topLimit : true) ? src[2] : na
    fractalBot = f_fractalize(src) < 0 and (useLimits ? src[2] <= botLimit : true) ? src[2] : na
    highPrev = valuewhen(fractalTop, src[2], 0)[2]
    highPrice = valuewhen(fractalTop, high[2], 0)[2]
    lowPrev = valuewhen(fractalBot, src[2], 0)[2]
    lowPrice = valuewhen(fractalBot, low[2], 0)[2]
    bearSignal = fractalTop and high[2] > highPrice and src[2] < highPrev
    bullSignal = fractalBot and low[2] < lowPrice and src[2] > lowPrev
    bearDivHidden = fractalTop and high[2] < highPrice and src[2] > highPrev
    bullDivHidden = fractalBot and low[2] > lowPrice and src[2] < lowPrev
    [fractalTop, fractalBot, lowPrev, bearSignal, bullSignal, bearDivHidden, bullDivHidden]
        
// RSI+MFI
f_rsimfi(_period, _multiplier, _tf) => security(syminfo.tickerid, _tf, sma(((close - open) / (high - low)) * _multiplier, _period) - rsiMFIPosY)
   
// WaveTrend
f_wavetrend(src, chlen, avg, malen, tf) =>
    tfsrc = security(syminfo.tickerid, tf, src)
    esa = ema(tfsrc, chlen)
    de = ema(abs(tfsrc - esa), chlen)
    ci = (tfsrc - esa) / (0.015 * de)
    wt1 = security(syminfo.tickerid, tf, ema(ci, avg))
    wt2 = security(syminfo.tickerid, tf, sma(wt1, malen))
    wtVwap = wt1 - wt2
    wtOversold = wt2 <= osLevel
    wtOverbought = wt2 >= obLevel
    wtCross = cross(wt1, wt2)
    wtCrossUp = wt2 - wt1 <= 0
    wtCrossDown = wt2 - wt1 >= 0
    wtCrosslast = cross(wt1[2], wt2[2])
    wtCrossUplast = wt2[2] - wt1[2] <= 0
    wtCrossDownlast = wt2[2] - wt1[2] >= 0
    [wt1, wt2, wtOversold, wtOverbought, wtCross, wtCrossUp, wtCrossDown, wtCrosslast, wtCrossUplast, wtCrossDownlast, wtVwap]

// Schaff Trend Cycle
f_tc(src, length, fastLength, slowLength) =>
    ema1 = ema(src, fastLength)
    ema2 = ema(src, slowLength)
    macdVal = ema1 - ema2	
    alpha = lowest(macdVal, length)
    beta = highest(macdVal, length) - alpha
    gamma = (macdVal - alpha) / beta * 100
    gamma := beta > 0 ? gamma : nz(gamma[1])
    delta = gamma
    delta := na(delta[1]) ? delta : delta[1] + tcfactor * (gamma - delta[1])
    epsilon = lowest(delta, length)
    zeta = highest(delta, length) - epsilon
    eta = (delta - epsilon) / zeta * 100
    eta := zeta > 0 ? eta : nz(eta[1])
    stcReturn = eta
    stcReturn := na(stcReturn[1]) ? stcReturn : stcReturn[1] + tcfactor * (eta - stcReturn[1])
    stcReturn

// Stochastic RSI
f_stochrsi(_src, _stochlen, _rsilen, _smoothk, _smoothd, _log, _avg) =>
    src = _log ? log(_src) : _src
    rsi = rsi(src, _rsilen)
    kk = sma(stoch(rsi, rsi, rsi, _stochlen), _smoothk)
    d1 = sma(kk, _smoothd)
    avg_1 = avg(kk, d1)
    k = _avg ? avg_1 : kk
    [k, d1]

// MACD
f_macd(src, fastlen, slowlen, sigsmooth, tf) =>
    fast_ma = security(syminfo.tickerid, tf, ema(src, fastlen))
    slow_ma = security(syminfo.tickerid, tf, ema(src, slowlen))
    macd = fast_ma - slow_ma,
    signal = security(syminfo.tickerid, tf, sma(macd, sigsmooth))
    hist = macd - signal
    [macd, signal, hist]

// MACD Colors on WT    
f_macdWTColors(tf) =>
    hrsimfi = f_rsimfi(rsiMFIperiod, rsiMFIMultiplier, tf)
    [macd, signal, hist] = f_macd(close, 28, 42, 9, macdWTColorsTF)
    macdup = macd >= signal
    macddown = macd <= signal
    macdWT1Color = macdup ? hrsimfi > 0 ? colormacdWT1c : colormacdWT1a : macddown ? hrsimfi < 0 ? colormacdWT1d : colormacdWT1b : na
    macdWT2Color = macdup ? hrsimfi < 0 ? colormacdWT2c : colormacdWT2a : macddown ? hrsimfi < 0 ? colormacdWT2d : colormacdWT2b : na 
    [macdWT1Color, macdWT2Color]
    
// Get higher timeframe candle
f_getTFCandle(_tf) => 
    _open  = security(heikinashi(syminfo.tickerid), _tf, open, barmerge.gaps_off, barmerge.lookahead_on)
    _close = security(heikinashi(syminfo.tickerid), _tf, close, barmerge.gaps_off, barmerge.lookahead_on)
    _high  = security(heikinashi(syminfo.tickerid), _tf, high, barmerge.gaps_off, barmerge.lookahead_on)
    _low   = security(heikinashi(syminfo.tickerid), _tf, low, barmerge.gaps_off, barmerge.lookahead_on)
    hl2   = (_high + _low) / 2.0
    newBar = change(_open)
    candleBodyDir = _close > _open
    [candleBodyDir, newBar]

// Sommi flag
f_findSommiFlag(tf, wt1, wt2, rsimfi, wtCross, wtCrossUp, wtCrossDown) =>    
    [hwt1, hwt2, hwtOversold, hwtOverbought, hwtCross, hwtCrossUp, hwtCrossDown, hwtCrosslast, hwtCrossUplast, hwtCrossDownlast, hwtVwap] = f_wavetrend(wtMASource, wtChannelLen, wtAverageLen, wtMALen, tf)      
    
    bearPattern = rsimfi < soomiRSIMFIBearLevel and
                   wt2 > soomiFlagWTBearLevel and 
                   wtCross and 
                   wtCrossDown and 
                   hwtVwap < sommiVwapBearLevel
                   
    bullPattern = rsimfi > soomiRSIMFIBullLevel and 
                   wt2 < soomiFlagWTBullLevel and 
                   wtCross and 
                   wtCrossUp and 
                   hwtVwap > sommiVwapBullLevel
    
    [bearPattern, bullPattern, hwtVwap]
    
f_findSommiDiamond(tf, tf2, wt1, wt2, wtCross, wtCrossUp, wtCrossDown) =>
    [candleBodyDir, newBar] = f_getTFCandle(tf)
    [candleBodyDir2, newBar2] = f_getTFCandle(tf2)
    bearPattern = wt2 >= soomiDiamondWTBearLevel and
                   wtCross and
                   wtCrossDown and
                   not candleBodyDir and
                   not candleBodyDir2                   
    bullPattern = wt2 <= soomiDiamondWTBullLevel and
                   wtCross and
                   wtCrossUp and
                   candleBodyDir and
                   candleBodyDir2 
    [bearPattern, bullPattern]
 
// } FUNCTIONS  

// CALCULATE INDICATORS {

// RSI
rsi = rsi(rsiSRC, rsiLen)
rsiColor = rsi <= rsiOversold ? colorGreen : rsi >= rsiOverbought ? colorRed : colorPurple

// RSI + MFI Area
rsiMFI = f_rsimfi(rsiMFIperiod, rsiMFIMultiplier, timeframe.period)
rsiMFIColor = rsiMFI > 0 ? #3ee145 : #ff3d2e

// Calculates WaveTrend
[wt1, wt2, wtOversold, wtOverbought, wtCross, wtCrossUp, wtCrossDown, wtCross_last, wtCrossUp_last, wtCrossDown_last, wtVwap] = f_wavetrend(wtMASource, wtChannelLen, wtAverageLen, wtMALen, timeframe.period)
 
// Stochastic RSI
[stochK, stochD] = f_stochrsi(stochSRC, stochLen, stochRsiLen, stochKSmooth, stochDSmooth, stochUseLog, stochAvg)

// Schaff Trend Cycle
tcVal = f_tc(tcSRC, tclength, tcfastLength, tcslowLength)

// Sommi flag
[sommiBearish, sommiBullish, hvwap] = f_findSommiFlag(sommiVwapTF, wt1, wt2, rsiMFI, wtCross,  wtCrossUp, wtCrossDown)

//Sommi diamond
[sommiBearishDiamond, sommiBullishDiamond] = f_findSommiDiamond(sommiHTCRes, sommiHTCRes2, wt1, wt2, wtCross, wtCrossUp, wtCrossDown)

// macd colors
[macdWT1Color, macdWT2Color] = f_macdWTColors(macdWTColorsTF)

// WT Divergences
[wtFractalTop, wtFractalBot, wtLow_prev, wtBearDiv, wtBullDiv, wtBearDivHidden, wtBullDivHidden] = f_findDivs(wt2, wtDivOBLevel, wtDivOSLevel, true)
    
[wtFractalTop_add, wtFractalBot_add, wtLow_prev_add, wtBearDiv_add, wtBullDiv_add, wtBearDivHidden_add, wtBullDivHidden_add] =  f_findDivs(wt2, wtDivOBLevel_add, wtDivOSLevel_add, true)
[wtFractalTop_nl, wtFractalBot_nl, wtLow_prev_nl, wtBearDiv_nl, wtBullDiv_nl, wtBearDivHidden_nl, wtBullDivHidden_nl] =  f_findDivs(wt2, 0, 0, false)

wtBearDivHidden_ = showHiddenDiv_nl ? wtBearDivHidden_nl : wtBearDivHidden
wtBullDivHidden_ = showHiddenDiv_nl ? wtBullDivHidden_nl : wtBullDivHidden

wtBearDivColor = (wtShowDiv and wtBearDiv) or (wtShowHiddenDiv and wtBearDivHidden_) ? colorRed : na
wtBullDivColor = (wtShowDiv and wtBullDiv) or (wtShowHiddenDiv and wtBullDivHidden_) ? colorGreen : na

wtBearDivColor_add = (wtShowDiv and (wtDivOBLevel_addshow and wtBearDiv_add)) or (wtShowHiddenDiv and (wtDivOBLevel_addshow and wtBearDivHidden_add)) ? #9a0202 : na
wtBullDivColor_add = (wtShowDiv and (wtDivOBLevel_addshow and wtBullDiv_add)) or (wtShowHiddenDiv and (wtDivOBLevel_addshow and wtBullDivHidden_add)) ? #1b5e20 : na

// RSI Divergences
[rsiFractalTop, rsiFractalBot, rsiLow_prev, rsiBearDiv, rsiBullDiv, rsiBearDivHidden, rsiBullDivHidden] = f_findDivs(rsi, rsiDivOBLevel, rsiDivOSLevel, true)
[rsiFractalTop_nl, rsiFractalBot_nl, rsiLow_prev_nl, rsiBearDiv_nl, rsiBullDiv_nl, rsiBearDivHidden_nl, rsiBullDivHidden_nl] = f_findDivs(rsi, 0, 0, false)

rsiBearDivHidden_ = showHiddenDiv_nl ? rsiBearDivHidden_nl : rsiBearDivHidden
rsiBullDivHidden_ = showHiddenDiv_nl ? rsiBullDivHidden_nl : rsiBullDivHidden

rsiBearDivColor = (rsiShowDiv and rsiBearDiv) or (rsiShowHiddenDiv and rsiBearDivHidden_) ? colorRed : na
rsiBullDivColor = (rsiShowDiv and rsiBullDiv) or (rsiShowHiddenDiv and rsiBullDivHidden_) ? colorGreen : na
 
// Stoch Divergences
[stochFractalTop, stochFractalBot, stochLow_prev, stochBearDiv, stochBullDiv, stochBearDivHidden, stochBullDivHidden] = f_findDivs(stochK, 0, 0, false)

stochBearDivColor = (stochShowDiv and stochBearDiv) or (stochShowHiddenDiv and stochBearDivHidden) ? colorRed : na
stochBullDivColor = (stochShowDiv and stochBullDiv) or (stochShowHiddenDiv and stochBullDivHidden) ? colorGreen : na


// Small Circles WT Cross
signalColor = wt2 - wt1 > 0 ? color.red : color.lime

// Buy signal.
buySignal = wtCross and wtCrossUp and wtOversold

buySignalDiv = (wtShowDiv and wtBullDiv) or 
               (wtShowDiv and wtBullDiv_add) or 
               (stochShowDiv and stochBullDiv) or 
               (rsiShowDiv and rsiBullDiv)
    
buySignalDiv_color = wtBullDiv ? colorGreen : 
                     wtBullDiv_add ? color.new(colorGreen, 60) : 
                     rsiShowDiv ? colorGreen : na

// Sell signal
sellSignal = wtCross and wtCrossDown and wtOverbought
             
sellSignalDiv = (wtShowDiv and wtBearDiv) or 
               (wtShowDiv and wtBearDiv_add) or
               (stochShowDiv and stochBearDiv) or
               (rsiShowDiv and rsiBearDiv)
                    
sellSignalDiv_color = wtBearDiv ? colorRed : 
                     wtBearDiv_add ? color.new(colorRed, 60) : 
                     rsiBearDiv ? colorRed : na

// Gold Buy 
lastRsi = valuewhen(wtFractalBot, rsi[2], 0)[2]
wtGoldBuy = ((wtShowDiv and wtBullDiv) or (rsiShowDiv and rsiBullDiv)) and
           wtLow_prev <= osLevel3 and
           wt2 > osLevel3 and
           wtLow_prev - wt2 <= -5 and
           lastRsi < 30           
          
// } CALCULATE INDICATORS


// DRAW {
bgcolor(darkMode ? color.new(#000000, 80) : na)
zLine = plot(0, color = color.new(colorWhite, 50))

//  MFI BAR
rsiMfiBarTopLine = plot(rsiMFIShow ? -95 : na, title = 'MFI Bar TOP Line', transp = 100)
rsiMfiBarBottomLine = plot(rsiMFIShow ? -99 : na, title = 'MFI Bar BOTTOM Line', transp = 100)
fill(rsiMfiBarTopLine, rsiMfiBarBottomLine, title = 'MFI Bar Colors', color = rsiMFIColor, transp = 75)

// WT Areas
plot(wtShow ? wt1 : na, style = plot.style_area, title = 'WT Wave 1', color = macdWTColorsShow ? macdWT1Color : colorWT1, transp = 0)
plot(wtShow ? wt2 : na, style = plot.style_area, title = 'WT Wave 2', color = macdWTColorsShow ? macdWT2Color : darkMode ? colorWT2_ : colorWT2 , transp = 20)

// VWAP
plot(vwapShow ? wtVwap : na, title = 'VWAP', color = colorYellow, style = plot.style_area, linewidth = 2, transp = 45)

// MFI AREA
rsiMFIplot = plot(rsiMFIShow ? rsiMFI: na, title = 'RSI+MFI Area', color = rsiMFIColor, transp = 20)
fill(rsiMFIplot, zLine, rsiMFIColor, transp = 40)

// WT Div

plot(series = wtFractalTop ? wt2[2] : na, title = 'WT Bearish Divergence', color = wtBearDivColor, linewidth = 2, offset = -2)
plot(series = wtFractalBot ? wt2[2] : na, title = 'WT Bullish Divergence', color = wtBullDivColor, linewidth = 2, offset = -2)

// WT 2nd Div
plot(series = wtFractalTop_add ? wt2[2] : na, title = 'WT 2nd Bearish Divergence', color = wtBearDivColor_add, linewidth = 2, offset = -2)
plot(series = wtFractalBot_add ? wt2[2] : na, title = 'WT 2nd Bullish Divergence', color = wtBullDivColor_add, linewidth = 2, offset = -2)

// RSI
plot(rsiShow ? rsi : na, title = 'RSI', color = rsiColor, linewidth = 2, transp = 25)

// RSI Div
plot(series = rsiFractalTop ? rsi[2] : na, title='RSI Bearish Divergence', color = rsiBearDivColor, linewidth = 1, offset = -2)
plot(series = rsiFractalBot ? rsi[2] : na, title='RSI Bullish Divergence', color = rsiBullDivColor, linewidth = 1, offset = -2)

// Stochastic RSI
stochKplot = plot(stochShow ? stochK : na, title = 'Stoch K', color = color.new(#21baf3, 0), linewidth = 2)
stochDplot = plot(stochShow ? stochD : na, title = 'Stoch D', color = color.new(#673ab7, 60), linewidth = 1)
stochFillColor = stochK >= stochD ? color.new(#21baf3, 75) : color.new(#673ab7, 60)
fill(stochKplot, stochDplot, title='KD Fill', color=stochFillColor)

// Stoch Div
plot(series = stochFractalTop ? stochK[2] : na, title='Stoch Bearish Divergence', color = stochBearDivColor, linewidth = 1, offset = -2)
plot(series = stochFractalBot ? stochK[2] : na, title='Stoch Bullish Divergence', color = stochBullDivColor, linewidth = 1, offset = -2)

// Schaff Trend Cycle
plot(tcLine ? tcVal : na, color = color.new(#673ab7, 25), linewidth = 2, title = "Schaff Trend Cycle 1")
plot(tcLine ? tcVal : na, color = color.new(colorWhite, 50), linewidth = 1, title = "Schaff Trend Cycle 2")


// Draw Overbought & Oversold lines
//plot(obLevel, title = 'Over Bought Level 1', color = colorWhite, linewidth = 1, style = plot.style_circles, transp = 85)
plot(obLevel2, title = 'Over Bought Level 2', color = colorWhite, linewidth = 1, style = plot.style_stepline, transp = 85)
plot(obLevel3, title = 'Over Bought Level 3', color = colorWhite, linewidth = 1, style = plot.style_circles, transp = 95)

//plot(osLevel, title = 'Over Sold Level 1', color = colorWhite, linewidth = 1, style = plot.style_circles, transp = 85)
plot(osLevel2, title = 'Over Sold Level 2', color = colorWhite, linewidth = 1, style = plot.style_stepline, transp = 85)

// Sommi flag
plotchar(sommiFlagShow and sommiBearish ? 108 : na, title = 'Sommi bearish flag', char='⚑', color = colorPink, location = location.absolute, size = size.tiny, transp = 0)
plotchar(sommiFlagShow and sommiBullish ? -108 : na, title = 'Sommi bullish flag', char='⚑', color = colorBluelight, location = location.absolute, size = size.tiny, transp = 0)
plot(sommiShowVwap ? ema(hvwap, 3) : na, title = 'Sommi higher VWAP', color = colorYellow, linewidth = 2, style = plot.style_line, transp = 15)

// Sommi diamond
plotchar(sommiDiamondShow and sommiBearishDiamond ? 108 : na, title = 'Sommi bearish diamond', char='◆', color = colorPink, location = location.absolute, size = size.tiny, transp = 0)
plotchar(sommiDiamondShow and sommiBullishDiamond ? -108 : na, title = 'Sommi bullish diamond', char='◆', color = colorBluelight, location = location.absolute, size = size.tiny, transp = 0)

// Circles
plot(wtCross ? wt2 : na, title = 'Buy and sell circle', color = signalColor, style = plot.style_circles, linewidth = 3, transp = 15)

plotchar(wtBuyShow and buySignal ? -107 : na, title = 'Buy circle', char='·', color = colorGreen, location = location.absolute, size = size.small, transp = 50)
plotchar(wtSellShow and sellSignal ? 105 : na , title = 'Sell circle', char='·', color = colorRed, location = location.absolute, size = size.small, transp = 50)

plotchar(wtDivShow and buySignalDiv ? -106 : na, title = 'Divergence buy circle', char='•', color = buySignalDiv_color, location = location.absolute, size = size.small, offset = -2, transp = 15)
plotchar(wtDivShow and sellSignalDiv ? 106 : na, title = 'Divergence sell circle', char='•', color = sellSignalDiv_color, location = location.absolute, size = size.small, offset = -2, transp = 15)

plotchar(wtGoldBuy and wtGoldShow ? -106 : na, title = 'Gold  buy gold circle', char='•', color = colorOrange, location = location.absolute, size = size.small, offset = -2, transp = 15)

// } DRAW


// ALERTS {
  
// BUY
alertcondition(buySignal, 'Buy (Big green circle)', 'Green circle WaveTrend Oversold')
alertcondition(buySignalDiv, 'Buy (Big green circle + Div)', 'Buy & WT Bullish Divergence & WT Overbought')
alertcondition(wtGoldBuy, 'GOLD Buy (Big GOLDEN circle)', 'Green & GOLD circle WaveTrend Overbought')
alertcondition(sommiBullish or sommiBullishDiamond, 'Sommi bullish flag/diamond', 'Blue flag/diamond')
alertcondition(wtCross and wtCrossUp, 'Buy (Small green dot)', 'Buy small circle')

// SELL
alertcondition(sommiBearish or sommiBearishDiamond, 'Sommi bearish flag/diamond', 'Purple flag/diamond')
alertcondition(sellSignal, 'Sell (Big red circle)', 'Red Circle WaveTrend Overbought')
alertcondition(sellSignalDiv, 'Sell (Big red circle + Div)', 'Buy & WT Bearish Divergence & WT Overbought')
alertcondition(wtCross and wtCrossDown, 'Sell (Small red dot)', 'Sell small circle')

// } ALERTS

