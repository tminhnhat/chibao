//@version=4

study("Algo 4- Auto edit by TIBISHOP-add TP-SL mod for fority", overlay=true)

// FULL ALGO INFORMATION- Coded by Forexcakemix
//add entry price, stoploss, take profit


//LET THE GAMES COMMENCE :p

/////////////////////////////////////////////////

//RB SSL CHANNEL
period=input(title="Period", defval=13)
len=input(title="Period", defval=13)


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



smaHigh=sma(high, len)
smaLow=sma(low, len)
Hlv = 0.0
Hlv := close > smaHigh ? 1 : close < smaLow ? -1 : Hlv[1]
sslDown = Hlv < 0 ? smaHigh: smaLow
sslUp   = Hlv < 0 ? smaLow : smaHigh



plot(sslDown, linewidth=2, color=#FF0000)
plot(sslUp, linewidth=2, color=#00FF00)

ssl_l=crossover(sslUp,sslDown)
ssl_s=crossunder(sslUp,sslDown)


//Conditions For Trades

long= ssl_l 
short=  ssl_s


//Strategy Conditions

//Random number up to 30
f_random_number(_range) =>
    var _return = 1.0 + timenow
    _return := (3.14159 * _return % (bar_index + 1)) % _range

r = f_random_number(30)

//Delay using random number 
i_qtyTimeUnits  = r
i_timeUnits     = input("seconds", "Delay between entries", options = ["seconds", "minutes", "hours", "days", "months", "years"])

int _timeFrom_ = na        
_year_   =  (i_timeUnits == "year"   ? int(i_qtyTimeUnits) : 0)
_month_  =(i_timeUnits == "month"  ? int(i_qtyTimeUnits) : 0)
_day_   =  (i_timeUnits == "day"    ? int(i_qtyTimeUnits) : 0)
_hour_   = (i_timeUnits == "hour"   ? int(i_qtyTimeUnits) : 0)
_minute_ =  (i_timeUnits == "minute" ? int(i_qtyTimeUnits) : 0)
_second_ =  (i_timeUnits == "second"  ? int(i_qtyTimeUnits) : 0)

// Return the resulting time in ms Unix time format.
_timeFrom_ := timestamp(_year_, _month_, _day_, _hour_, _minute_, _second_)

//Delay count 
timeLeft = (time_close - timenow) / 1000 

//New Entry Condtion
// if timeLeft<=i_qtyTimeUnits enter trade 

//Use this to customize the look of the arrows to suit your needs.
plotshape(long, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Buy")
plotshape(short, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Sell")
//plotshape(longclose, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Exit Buy")
//plotshape(shortclose, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Exit Sell")

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



plot(i_qtyTimeUnits, "MA", color.red)
alertcondition(long and timeLeft<=i_qtyTimeUnits, 'Buy Long', 'Long Entry:{{plot("giavaoentrylong")}}-SL:{{plot("giastoplosslong")}}-TP:{{plot("giachotloilong")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
alertcondition(long, 'Buy long 1', 'Buy long 1')
alertcondition(short and timeLeft<=i_qtyTimeUnits, 'Buy Short', 'Short Entry:{{plot("giavaoentryshort")}}-SL:{{plot("giastoplossshort")}}-TP:{{plot("giachotloishort")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
alertcondition(short, 'Buy Short 1', 'Buy Short 1')

