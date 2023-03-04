//@version=4
//Credit to https://www.tradingview.com/script/p3oqCa56-Pekipek-s-PPO-Divergence-BETA/ (I just changed the visuals and added alerts)
study("PPO Divergence Alerts 3.0 edit by TIBISHOP", overlay=true)

topbots = input(true, title="Show highs & lows (triangles)")

short_term_div = input(true, title="Show Short term divergences (pink)")
long_term_div = input(true, title="Show Long term divergences (purple)")
div_lookback_period = input(55, minval=1, title="> Long term Length")
fastLength = input(12, minval=1, title="PPO Fast")
slowLength = input(26, minval=1, title="PPO Slow")
signalLength = input(9, minval=1, title="PPO Signal")
smoother = input(2, minval=1, title="PPO Smooth")
src = input(title="Source", type=input.source, defval=close)

fastMA = ema(src, fastLength)
slowMA = ema(src, slowLength)
macd = fastMA - slowMA
macd2 = macd / slowMA * 100
d = sma(macd2, smoother)  // smoothing PPO

bullishPrice = low

priceMins = bullishPrice > bullishPrice[1] and bullishPrice[1] < bullishPrice[2] or 
   low[1] == low[2] and low[1] < low and low[1] < low[3] or 
   low[1] == low[2] and low[1] == low[3] and low[1] < low and low[1] < low[4] or 
   low[1] == low[2] and low[1] == low[3] and low[1] and low[1] == low[4] and 
   low[1] < low and low[1] < low[5]  // this line identifies bottoms and plateaus in the price
oscMins = d > d[1] and d[1] < d[2]  // this line identifies bottoms in the PPO

BottomPointsInPPO = oscMins

bearishPrice = high
priceMax = bearishPrice < bearishPrice[1] and bearishPrice[1] > bearishPrice[2] or 
   high[1] == high[2] and high[1] > high and high[1] > high[3] or 
   high[1] == high[2] and high[1] == high[3] and high[1] > high and 
   high[1] > high[4] or 
   high[1] == high[2] and high[1] == high[3] and high[1] and high[1] == high[4] and 
   high[1] > high and high[1] > high[5]  // this line identifies tops in the price
oscMax = d < d[1] and d[1] > d[2]  // this line identifies tops in the PPO

TopPointsInPPO = oscMax

currenttrough4 = valuewhen(oscMins, d[1], 0)  // identifies the value of PPO at the most recent BOTTOM in the PPO
lasttrough4 = valuewhen(oscMins, d[1], 1)  // NOT USED identifies the value of PPO at the second most recent BOTTOM in the PPO
currenttrough5 = valuewhen(oscMax, d[1], 0)  // identifies the value of PPO at the most recent TOP in the PPO
lasttrough5 = valuewhen(oscMax, d[1], 1)  // NOT USED identifies the value of PPO at the second most recent TOP in the PPO

currenttrough6 = valuewhen(priceMins, low[1], 0)  // this line identifies the low (price) at the most recent bottom in the Price
lasttrough6 = valuewhen(priceMins, low[1], 1)  // NOT USED this line identifies the low (price) at the second most recent bottom in the Price
currenttrough7 = valuewhen(priceMax, high[1], 0)  // this line identifies the high (price) at the most recent top in the Price
lasttrough7 = valuewhen(priceMax, high[1], 1)  // NOT USED this line identifies the high (price) at the second most recent top in the Price

delayedlow = priceMins and barssince(oscMins) < 3 ? low[1] : na
delayedhigh = priceMax and barssince(oscMax) < 3 ? high[1] : na

// only take tops/bottoms in price when tops/bottoms are less than 5 bars away
lowest_1 = lowest(currenttrough6, 4)
filter = barssince(priceMins) < 5 ? lowest_1 : na
highest_1 = highest(currenttrough7, 4)
filter2 = barssince(priceMax) < 5 ? highest_1 : na

//delayedbottom/top when oscillator bottom/top is earlier than price bottom/top
y11 = valuewhen(oscMins, delayedlow, 0)
y12 = valuewhen(oscMax, delayedhigh, 0)

// only take tops/bottoms in price when tops/bottoms are less than 5 bars away, since 2nd most recent top/bottom in osc
y2 = valuewhen(oscMax, filter2, 1)  // identifies the highest high in the tops of price with 5 bar lookback period SINCE the SECOND most recent top in PPO
y6 = valuewhen(oscMins, filter, 1)  // identifies the lowest low in the bottoms of price with 5 bar lookback period SINCE the SECOND most recent bottom in PPO

long_term_bull_filt = valuewhen(priceMins, lowest(div_lookback_period), 1)
long_term_bear_filt = valuewhen(priceMax, highest(div_lookback_period), 1)

y3 = valuewhen(oscMax, currenttrough5, 0)  // identifies the value of PPO in the most recent top of PPO 
y4 = valuewhen(oscMax, currenttrough5, 1)  // identifies the value of PPO in the second most recent top of PPO 

y7 = valuewhen(oscMins, currenttrough4, 0)  // identifies the value of PPO in the most recent bottom of PPO
y8 = valuewhen(oscMins, currenttrough4, 1)  // identifies the value of PPO in the SECOND most recent bottom of PPO

y9 = valuewhen(oscMins, currenttrough6, 0)
y10 = valuewhen(oscMax, currenttrough7, 0)

bulldiv = BottomPointsInPPO ? d[1] : na  // plots dots at bottoms in the PPO
beardiv = TopPointsInPPO ? d[1] : na  // plots dots at tops in the PPO

i = currenttrough5 < highest(d, div_lookback_period)  // long term bearish oscilator divergence
i2 = y10 > long_term_bear_filt  // long term bearish top divergence
i3 = delayedhigh > long_term_bear_filt  // long term bearish delayedhigh divergence

i4 = currenttrough4 > lowest(d, div_lookback_period)  // long term bullish osc divergence
i5 = y9 < long_term_bull_filt  // long term bullish bottom div
i6 = delayedlow < long_term_bull_filt  // long term bullish delayedbottom div

//plot(0, color=gray)
//plot(close - (close * d), color=black, title="PPO")
//plot(bulldiv, title = "Bottoms", color=maroon, style=circles, linewidth=3, offset= -1)
//plot(beardiv, title = "Tops", color=green, style=circles, linewidth=3, offset= -1)


bearishdiv1 = short_term_div and y10 > y2 and oscMax and y3 < y4 ? true : false
bearishdiv2 = short_term_div and delayedhigh > y2 and y3 < y4 ? true : false
bearishdiv3 = long_term_div and oscMax and i and i2 ? true : false
bearishdiv4 = long_term_div and i and i3 ? true : false

bullishdiv1 = short_term_div and y9 < y6 and oscMins and y7 > y8 ? true : false
bullishdiv2 = short_term_div and delayedlow < y6 and y7 > y8 ? true : false
bullishdiv3 = long_term_div and oscMins and i4 and i5 ? true : false
bullishdiv4 = long_term_div and i4 and i6 ? true : false

bearish = bearishdiv1 or bearishdiv2
bullish = bullishdiv1 or bullishdiv2
ltbearish = bearishdiv3 or bearishdiv4
ltbullish = bullishdiv3 or bullishdiv4

// greendot = beardiv != 0 ? true : false
// reddot = bulldiv != 0 ? true : false

// hist = po

// //Histogram Color Definitions
// histA_IsUp = hist > hist[1] and hist > 0
// histA_IsDown = hist < hist[1] and hist > 0
// histB_IsDown = hist < hist[1] and hist <= 0
// histB_IsUp = hist > hist[1] and hist <= 0

// hist_plot_color = histA_IsUp ? lime : histA_IsDown ? green : histB_IsDown ? red : histB_IsUp ? maroon : white

//plot(hist, color=hist_plot_color, style=columns, linewidth=2)

plotshape((d >= 1 or d < -0.25) and bearish ? d : na, text='P', style=shape.labeldown, location=location.abovebar, color=color.new(color.fuchsia, 0), textcolor=color.new(color.white, 0), offset=0, title="Bear Divergence", size=size.normal)
plotshape((d <= -1 or d > 0.25) and bullish ? d : na, text='P', style=shape.labelup, location=location.belowbar, color=color.new(color.fuchsia, 0), textcolor=color.new(color.white, 0), offset=0, title="Bull Divergence", size=size.normal)
plotshape((d >= 1 or d < -0.25) and ltbearish ? d : na, text='P', style=shape.labeldown, location=location.abovebar, color=color.new(color.purple, 0), textcolor=color.new(color.white, 0), offset=0, title="Long Term Bear Divergence", size=size.normal)
plotshape((d <= -1 or d > 0.25) and ltbullish ? d : na, text='P', style=shape.labelup, location=location.belowbar, color=color.new(color.purple, 0), textcolor=color.new(color.white, 0), offset=0, title="Long Term Bull Divergence", size=size.normal)

plotshape(bearish ? d : na, text='P', style=shape.labeldown, location=location.abovebar, color=color.new(color.fuchsia, 80), textcolor=color.new(color.white, 0), offset=0, title="Bear Divergence (with Filters)", size=size.normal)
plotshape(bullish ? d : na, text='P', style=shape.labelup, location=location.belowbar, color=color.new(color.fuchsia, 80), textcolor=color.new(color.white, 0), offset=0, title="Bull Divergence (with Filters)", size=size.normal)
plotshape(ltbearish ? d : na, text='P', style=shape.labeldown, location=location.abovebar, color=color.new(color.purple, 90), textcolor=color.new(color.white, 0), offset=0, title="Long Term Bear Divergence (with Filters)", size=size.normal)
plotshape(ltbullish ? d : na, text='P', style=shape.labelup, location=location.belowbar, color=color.new(color.purple, 90), textcolor=color.new(color.white, 0), offset=0, title="Long Term Bull Divergence (with Filters)", size=size.normal)

plotshape(topbots and beardiv ? d : na, text='Short nhẹ', style=shape.triangledown, location=location.abovebar, color=color.red, offset=0, size=size.tiny, title="PPO Top")
plotshape(topbots and bulldiv ? d : na, text='Long nhẹ', style=shape.triangleup, location=location.belowbar, color=color.green, offset=0, size=size.tiny, title="PPO Bottom")

plotshape((d >= 1 or d < -0.25) and topbots and beardiv ? d : na, text='Short', style=shape.triangledown, location=location.abovebar, color=color.red, offset=0, size=size.tiny, title="PPO Top (with Filters)")
plotshape((d <= -1 or d > 0.25) and topbots and bulldiv ? d : na, text='Long', style=shape.triangleup, location=location.belowbar, color=color.green, offset=0, size=size.tiny, title="PPO Bottom (with Filters)")

alertcondition(bearish, title="Bear Divergence", message="PPO Bear Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bullish, title="Bull Divergence", message="PPO Bull Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(ltbearish, title="Long Term Bear Divergence", message="PPO Long Term Bear Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(ltbullish, title="Long Term Bull Divergence", message="PPO Long Term Bull Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(beardiv, title="PPO Top", message="PPO Top: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bulldiv, title="PPO Bottom", message="PPO Bottom: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bearish or bullish or ltbearish or ltbullish or beardiv or bulldiv, title="Any PPO Signal", message="PPO Signal: {{exchange}}:{{ticker}} {{interval}}")
