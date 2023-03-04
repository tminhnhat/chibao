//@version=4
study("Renko Reversal alert edit by TIBISHOP-add TP-S bot for Froty", overlay=true) 
//Buy entry if a bearish renko brick is followed by a bullish brick
//Sell entry if a bullish brick is followed by a bearish brick
////add entry price, stoploss, take profit
//long = close > open[1] and close[1] < open[2]
long = close > open[1] and close[1] > open[2] and close[2] < open[3]
longclose = close < open[1] and close[1] > open[2]
//short = close < open[1] and close[1] > open[2] 
short = close < open[1] and close[1] < open[2] and close[2] > open[3]
shortclose = close > open[1] and close[1] < open[2]

tylemargin=input(title="Ty le margin", defval=20)
tylestoplos=input(title="Ty le stoploss", defval=0.1)
tylechotloi=input(title="Ty le chot loi", defval=0.3)
stepgiaentry=input(title="Step gia entry", defval=0.001)
sothapphancanlay=input(title="so thap phan", defval=1000)
giatrivaolenh=input(title="gia tri vao lenh ban dau", defval=100)
giathamchieutinhentry = input(close, title="Gia tham chieu tinh entry")
// Set the position of the table
posInput = input(title="Position", defval="Bottom Right", options=["Bottom Left", "Bottom Right", "Top Left", "Top Right"], tooltip="Select where you want the table to draw.")
var pos = posInput == "Bottom Left" ? position.bottom_left : posInput == "Bottom Right" ? position.bottom_right : posInput == "Top Left" ? position.top_left : posInput == "Top Right" ? position.top_right : na
// Adjusts the text size and results in different overall size of the table
txtSizeInput = input(title="Text Size", defval="Normal", options=["Tiny", "Small", "Normal", "Large", "Huge"], tooltip="Select the size of the text. It affects the size of the whole table.")
var txtSize = txtSizeInput == "Tiny" ? size.tiny : txtSizeInput == "Small" ? size.small : txtSizeInput == "Normal" ? size.normal : txtSizeInput == "Large" ? size.large : txtSizeInput == "Huge" ? size.huge : na
// Initiate the table
var table TA_Display = table.new(pos, 13, 4)
// Background color for Pivots, Oscillators, MAs, and Summary
pivBgColor = input(title="Pivots Background Color", type=input.color, defval=color.rgb(10, 10, 10, 25), tooltip="Background color for the Pivots columns.")


	


//Use this to customize the look of the arrows to suit your needs.
plotshape(long, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Buy")
plotshape(short, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Sell")
plotshape(longclose, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Exit Buy")
plotshape(shortclose, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Exit Sell")

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


if long


	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "LONG x" + tostring(tylemargin) + " Lam tron:" + tostring(sothapphancanlay), text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
	
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoplosslong), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentrylong), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloilong), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
//	alert("Long Entry:"+ tostring(giavaoentrylong) + "-SL:"+ tostring(giastoplosslong) + "-TP:"+ tostring(giachotloilong),alert.freq_once_per_bar)
	

if short


	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "SHORT x" + tostring(tylemargin) + " Lam tron:"+ tostring(sothapphancanlay), text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
		
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoplossshort), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentryshort), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloishort), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
//	alert("Short Entry:"+ tostring(giavaoentryshort) + "-SL:"+ tostring(giastoplossshort) + "-TP:"+ tostring(giachotloishort),alert.freq_once_per_bar)

alertcondition(long, 'Buy Long', 'Long Entry:{{plot("giavaoentrylong")}}-SL:{{plot("giastoplosslong")}}-TP:{{plot("giachotloilong")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
alertcondition(longclose, 'Long Close', 'Long Close')
alertcondition(short, 'Buy Short', 'Short Entry:{{plot("giavaoentryshort")}}-SL:{{plot("giastoplossshort")}}-TP:{{plot("giachotloishort")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
alertcondition(shortclose, 'Short Close', 'Short Close')

//Use these alerts to create server-side alerts (right-click on one of the buy or sell arrows on the chart and choose "add alert")
