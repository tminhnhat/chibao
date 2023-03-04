//@version=4
//

study(title="[INDICATOR]Renko Emulator OCC v1 by JustUncleL mod for fority", shorttitle="[INDICATOR]REMOCC v1 Mod for fority", overlay=true, precision=5)

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
//  - This study project is used to provide Alerts for the TradingView Alerm Sub-System.
//
//  - For ATR Renko Method I have generally found that setting the strategy ATR 
//    resolution to 3-5x that of the chart you are viewing
//    tends to yield the good results, regardless of which chart time used. 
//  - For Traditional Renko Method the resolution of the bricks is taken from
//    the chart timeframe. I recommend use low time frame charts (1 to 15min) 
//    for best Renko Brick resolution.
//  - Positions get taken automatically following THE Renko Bar after a crossover.
//
// Modifications:
//  10-Jan-2020
//      - Converted to Pinescript V4
//      - Added option to select Renko Method.
//      - Added alertconditiona for "BUY" and "SELL" triggers.
//
// === INPUTS ===
//
tylemargin=input(title="Ty le margin", defval=20)
tylestoplos=input(title="Ty le stoploss", defval=0.1)
tylechotloi=input(title="Ty le chot loi", defval=0.3)
stepgiaentry=input(title="Step gia entry", defval=0.001)
sothapphancanlay=input(title="so thap phan", defval=1000)
giatrivaolenh=input(title="gia tri vao lenh ban dau", defval=100)
giathamchieutinhentry = input(close, title="Gia tham chieu tinh entry")
posInput = input(title="Position", defval="Bottom Right", options=["Bottom Left", "Bottom Right", "Top Left", "Top Right"], tooltip="Select where you want the table to draw.")
var pos = posInput == "Bottom Left" ? position.bottom_left : posInput == "Bottom Right" ? position.bottom_right : posInput == "Top Left" ? position.top_left : posInput == "Top Right" ? position.top_right : na
// Adjusts the text size and results in different overall size of the table
txtSizeInput = input(title="Text Size", defval="Normal", options=["Tiny", "Small", "Normal", "Large", "Huge"], tooltip="Select the size of the text. It affects the size of the whole table.")
var txtSize = txtSizeInput == "Tiny" ? size.tiny : txtSizeInput == "Small" ? size.small : txtSizeInput == "Normal" ? size.normal : txtSizeInput == "Large" ? size.large : txtSizeInput == "Huge" ? size.huge : na
// Initiate the table
var table TA_Display = table.new(pos, 13, 4)
// Background color for Pivots, Oscillators, MAs, and Summary
pivBgColor = input(title="Pivots Background Color", type=input.color, defval=color.rgb(10, 10, 10, 25), tooltip="Background color for the Pivots columns.")

renkoMethod = input("ATR", title="Renko Box Assignment Method", options=["ATR", "Traditional"])
atrLen = input(defval=10, minval=1, maxval=100, step=1, type=input.float, title="ATR Length for ATR Renko Method")
boxSz = input(defval=0.001, minval=0.0, type=input.float, title="Box size for Traditional Renko Method")
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
p1 = plot(renko_close, style=plot.style_circles, linewidth=2, color=col)
p2 = plot(renko_open, style=plot.style_circles, linewidth=2, color=col)
fill(p1, p2, color=col, transp=80)
//
longCond = 0
shortCond = 0
longCond := renko_close > renko_open ? nz(longCond[1]) + 1 : 0
shortCond := renko_close < renko_open ? nz(shortCond[1]) + 1 : 0

// === /ALERT conditions.
alert = longCond == 1 or shortCond == 1
alertcondition(alert, title="RENOCC Cross Alert", message="RENOCC Cross Alert")
alertcondition(longCond==1, title="RENOCC BUY", message="RENOCC BUY")
alertcondition(shortCond==1, title="RENOCC SELL", message="RENOCC SELL")

//
plotshape(title='RENOCC Buy', series=longCond == 1 ? renko_close : na, text='Buy', style=shape.labeldown, location=location.absolute, color=color.green, textcolor=color.white, offset=0)
plotshape(title='RENOCC Sell', series=shortCond == 1 ? renko_close : na, text='Sell', style=shape.labelup, location=location.absolute, color=color.maroon, textcolor=color.white, offset=0)

// eof
//xac dinh gia entry, stoploss va chot loi

giavaoentrylong= round((giathamchieutinhentry*(1 - stepgiaentry))*sothapphancanlay)/sothapphancanlay
giastoplosslong=round((giavaoentrylong*(1 - tylestoplos/tylemargin))*sothapphancanlay)/sothapphancanlay
giachotloilong=round((giavaoentrylong*(1 + tylechotloi/tylemargin))*sothapphancanlay)/sothapphancanlay	

giavaoentryshort=round((giathamchieutinhentry*(1 + stepgiaentry))*sothapphancanlay)/sothapphancanlay
giastoplossshort=round((giavaoentryshort*(1 + tylestoplos/tylemargin))*sothapphancanlay)/sothapphancanlay
giachotloishort=round((giavaoentryshort*(1 - tylechotloi/tylemargin))*sothapphancanlay)/sothapphancanlay


//plot
plot(giavaoentrylong, "giavaoentrylong", color=color.yellow)
plot(giastoplosslong, "giastoplosslong", color=color.red)
plot(giachotloilong, "giachotloilong", color=color.green)
plot(giavaoentryshort, "giavaoentryshort", color=color.yellow)
plot(giastoplossshort, "giastoplossshort", color=color.red)
plot(giachotloishort, "giachotloishort", color=color.green)
plot(tylemargin,"tylemargin", color=color.orange)
plot(giatrivaolenh, "giatrivaolenh", color=color.white)

// Table order


if longCond==1


	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "LONG x" + tostring(tylemargin) + " Lam tron:" + tostring(sothapphancanlay), text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
	
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoplosslong), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentrylong), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloilong), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	

if shortCond==1


	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "SHORT x" + tostring(tylemargin) + " Lam tron:"+ tostring(sothapphancanlay), text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
		
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoplossshort), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentryshort), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloishort), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)

alertcondition(longCond==1, 'Buy Long', 'Long Entry:{{plot("giavaoentrylong")}}-SL:{{plot("giastoplosslong")}}-TP:{{plot("giachotloilong")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
//alertcondition(longclose, 'Long Close', 'Long Close')
alertcondition(shortCond==1, 'Buy Short', 'Short Entry:{{plot("giavaoentryshort")}}-SL:{{plot("giastoplossshort")}}-TP:{{plot("giachotloishort")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
//alertcondition(shortclose, 'Short Close', 'Short Close')