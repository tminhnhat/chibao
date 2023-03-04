//@version=4

strategy("Algo 4- Auto edit by TIBISHOP-add TP-SL", process_orders_on_close=true, overlay=true)

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

strategy.entry("Long", strategy.long, 1000.0, when=long)
strategy.entry("Short", strategy.short, 1000.0, when=short)
strategy.close("Long", when = ssl_s )  
strategy.close("Short", when = ssl_l ) 




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


	

//xac dinh gia entry, stoploss va chot loi




// Pivots


if long
	giavaoentry= low*(1 - stepgiaentry)
	giastoploss=giavaoentry*(1 - tylestoplos/tylemargin)
	giachotloi=giavaoentry*(1 + tylechotloi/tylemargin)

	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "LONG", text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
	
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoploss), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentry), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloi), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	alert("Long Entry:"+ tostring(giavaoentry) + "-SL:"+ tostring(giastoploss) + "-TP:"+ tostring(giachotloi),alert.freq_once_per_bar)
		

if short
	giavaoentry=high*(1 + stepgiaentry)
	giastoploss=giavaoentry*(1 + tylestoplos/tylemargin)
	giachotloi=giavaoentry*(1 - tylechotloi/tylemargin)

	table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 1, "SHORT", text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
		
	table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 2, tostring(giastoploss), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 2, tostring(giavaoentry), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 2, tostring(giachotloi), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 0, 3, "SL", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 1, 3, "Entry", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
	table.cell(TA_Display, 2, 3, "TP", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
	alert("Short Entry:"+ tostring(giavaoentry) + "-SL:"+ tostring(giastoploss) + "-TP:"+ tostring(giachotloi),alert.freq_once_per_bar)
