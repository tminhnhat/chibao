// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © SoftKill21
// © despotak

//@version=4


study(title="TA helper", overlay=true)

tick = input(title="Symbol", type=input.symbol, defval="CRYPTOCAP:TOTAL", tooltip="Select the ticker you want to track.")
res = input(title="Resolution", type=input.resolution, defval="", tooltip="Select the resolution you want to track.")
source = security(tick,res,close)


////////////////////////////////////////////////////////////////////////////////
//                              A. Oscillators                                //
////////////////////////////////////////////////////////////////////////////////

//1. Relative Strength Index (14)
RSI(src,per) =>
    len = per
    up = rma(max(change(src), 0), len)
    down = rma(-min(change(src), 0), len)
    rsi = down == 0 ? 100 : up == 0 ? 0 : 100 - 100 / (1 + up / down)
    RSI=rsi
rsi_Sig=RSI(source,14)

//RSI Signal
A1_red =
       rsi_Sig<30
       ?1:0
A1_blue =
       rsi_Sig>70
       ?1:0


//2. Stochastic %K (14, 3, 3)
STOCH(src,perK,perD,perS) =>
    K = perK
    D = perD
    smooth = perS
    hh = highest(security(tick,res,high), K)
    ll = lowest(security(tick,res,low), K)
    k = sma((src - ll) / (hh - ll) * 100, smooth)
    d = sma(k, D)
    STOCH=k
stoch_Sig = STOCH(source,14,3,3)

//STOCH Signal
A2_red =
       stoch_Sig<20
       ?1:0
A2_blue =
       stoch_Sig>80
       ?1:0


//3. Commodity Channel Index (20)
CCI(src,per) =>
    lengthcci1 = per
    macci1 = sma(src, lengthcci1)
    cci1 = (src - macci1) / (0.015 * dev(src, lengthcci1))
    CCI = cci1
cci_Sig=CCI(source,20)

//CCI Signal
A3_red =
       cci_Sig<-100
       ?1:0
A3_blue =
       cci_Sig>100
       ?1:0


//4. Average Directional Index (14)
adxlen = 14
dilen = 14
dirmov(len) =>
    up = change(security(tick,res,high))
    down = -change(security(tick,res,low))
    truerange = rma(security(tick,res,tr), len)
    plus = fixnan(100 * rma(up > down and up > 0 ? up : 0, len) / truerange)
    minus = fixnan(100 * rma(down > up and down > 0 ? down : 0, len) / truerange)
    [plus, minus]

ADX(dilen, adxlen) =>
    [plus, minus] = dirmov(dilen)
    sum = plus + minus
    ADX = 100 * rma(abs(plus - minus) / (sum == 0 ? 1 : sum), adxlen)

adxHigh(dilen, adxlen) =>
    [plus, minus] = dirmov(dilen)
    plus
    
adxLow(dilen, adxlen) =>
    [plus, minus] = dirmov(dilen)
    minus
    
ADX_Sig = ADX(dilen, adxlen)
di_sigHigh = adxHigh(dilen, adxlen)
di_sigLow = adxLow(dilen, adxlen)

//ADX Signal
A4_red =
       di_sigLow>di_sigHigh
       and ADX_Sig>25
       ?1:0
A4_blue =
       di_sigHigh>di_sigLow
       and ADX_Sig>25
       ?1:0


//5. Awesome Oscillator
ao = sma(security(tick,res,hl2),5) - sma(security(tick,res,hl2),34)

//AO Signal
A5_red =
       ao<0
       ?1:0
A5_blue =
       ao>0
       ?1:0


//6. Momentum (10)
mom = source - source[10]

//momentum Signal
A6_red =
       mom<0
       ?1:0
A6_blue =
       mom>0
       ?1:0


//7. MACD Level (12, 26)
fast_ma = ema(source, 12)
slow_ma = ema(source, 26)
macd = fast_ma - slow_ma
signal = ema(macd, 9)
hist = macd - signal

//MACD Signal
A7_red =
       hist < hist[1]
       ?1:0
A7_blue =
       hist > hist[1]
       ?1:0


//8. Stochastic RSI Fast (3, 3, 14, 14)
rsi1 = rsi(source, 14)
rsik = sma(stoch(rsi1, rsi1, rsi1, 14), 3)
rsid = sma(rsik, 3)
rsih0 = 80
rsih1 = 20

//Stoch RSI Signal
A8_red =
       rsik < rsih1
       ?1:0
A8_blue =
       rsik > rsih0
       ?1:0


//9. Williams Percent Range (14)
upper = highest(source, 14)
lower = lowest(source, 14)
out = 100 * (source - upper) / (upper - lower)
rband1 = -20
rband0 = -80

// %R Signal
A9_red =
       out < rband0
       ?1:0
A9_blue =
       out > rband1
       ?1:0


//10. Bull bear Power
Length = 30
r1=iff(source[1]<security(tick,res,open),max(security(tick,res,high-open)-source[1],security(tick,res,high-low)),security(tick,res,high-low))
r2=iff(source[1]>security(tick,res,open),max(source[1]-security(tick,res,open),security(tick,res,high-low)),security(tick,res,high-low))
bull=iff(source==security(tick,res,open),iff(security(tick,res,high)-source==source-security(tick,res,low),iff(source[1]>security(tick,res,open),max(security(tick,res,high-low),source-security(tick,res,low)),r1),iff(security(tick,res,high)-source>source-security(tick,res,low),iff(source[1]<security(tick,res,open), max(security(tick,res,high)-source[1],source-security(tick,res,low)), security(tick,res,high-open)),r1)),iff(source<security(tick,res,open),iff(source[1]<security(tick,res,open),max(security(tick,res,high)-source[1],source-security(tick,res,low)), max(security(tick,res,high-low),source-security(tick,res,low))),r1))
bear=iff(source==security(tick,res,open),iff(security(tick,res,high)-source==source-security(tick,res,low),iff(source[1]<security(tick,res,open),max(security(tick,res,open-low),security(tick,res,high)-source),r2),iff(security(tick,res,high)-source>source-security(tick,res,low),r2,iff(source[1]>security(tick,res,open),max(source[1]-security(tick,res,low),security(tick,res,high)-source), security(tick,res,open-low)))),iff(source<security(tick,res,open),r2,iff(source[1]>security(tick,res,open),max(source[1]-security(tick,res,low),security(tick,res,high)-source),max(security(tick,res,open-low),security(tick,res,high)-source))))

// Bull bear Signal
A10_red =
       sma(bull-bear,Length)<0
       ?1:0
A10_blue =
       sma(bull-bear,Length)>0
       ?1:0


//11.Ultimate Oscillator (7, 14, 28)
length7 = 7,
length14 = 14,
length28 = 28
average(bp, tr_, length) => sum(bp, length) / sum(tr_, length)
high_ = max(security(tick,res,high), source[1])
low_ = min(security(tick,res,low), source[1])
bp = source - low_
tr_ = high_ - low_
avg7 = average(bp, tr_, length7)
avg14 = average(bp, tr_, length14)
avg28 = average(bp, tr_, length28)
uoout = 100 * (4*avg7 + 2*avg14 + avg28)/7

// UO Signal
A11_red =
       uoout < 30
       ?1:0
A11_blue =
       uoout > 70
       ?1:0

//Sum Signal A
A_red = A1_red + A2_red + A3_red + A4_red + A5_red + A6_red + A7_red + A8_red + A9_red + A10_red + A11_red
A_blue = A1_blue + A2_blue + A3_blue + A4_blue + A5_blue + A6_blue + A7_blue + A8_blue + A9_blue + A10_blue + A11_blue


////////////////////////////////////////////////////////////////////////////////
//                          B. Moving Averages                                //
////////////////////////////////////////////////////////////////////////////////

//1. EMA (5)
B1_red =
       source<ema(source,5)
       ?1:0
B1_blue =
       source>ema(source,5)
       ?1:0

//2. SMA (5)
B2_red =
       source<sma(source,5)
       ?1:0
B2_blue =
       source>sma(source,5)
       ?1:0

//3. EMA (10)
B3_red =
       source<ema(source,10)
       ?1:0
B3_blue =
       source>ema(source,10)
       ?1:0

//4. SMA (10)
B4_red =
       source<sma(source,10)
       ?1:0
B4_blue =
       source>sma(source,10)
       ?1:0

//5. EMA (20)
B5_red =
       source<ema(source,20)
       ?1:0
B5_blue =
       source>ema(source,20)
       ?1:0

//6. SMA (20)
B6_red =
       source<sma(source,20)
       ?1:0
B6_blue =
       source>sma(source,20)
       ?1:0

//7. EMA (30)
B7_red =
       source<ema(source,30)
       ?1:0
B7_blue =
       source>ema(source,30)
       ?1:0

//8. SMA (30)
B8_red =
       source<sma(source,30)
       ?1:0
B8_blue =
       source>sma(source,30)
       ?1:0

//9. EMA (50)
B9_red =
       source<ema(source,50)
       ?1:0
B9_blue =
       source>ema(source,50)
       ?1:0
//10. SMA (50)
B10_red =
       source<sma(source,50)
       ?1:0
B10_blue =
       source>sma(source,50)
       ?1:0

//11. EMA (100)
B11_red =
       source<ema(source,100)
       ?1:0
B11_blue =
       source>ema(source,100)
       ?1:0

//12. SMA (100)
B12_red =
       source<sma(source,100)
       ?1:0
B12_blue =
       source>sma(source,100)
       ?1:0

//13. EMA (200)
B13_red =
       source<ema(source,200)
       ?1:0
B13_blue =
       source>ema(source,200)
       ?1:0

//14. SMA (200)
B14_red =
       source<sma(source,200)
       ?1:0
B14_blue =
       source>sma(source,200)
       ?1:0

//15. Ichimoku Cloud Base Line (9, 26, 52, 26)
donchian(len) => avg(lowest(source, len), highest(source, len))
ichi_baseline = donchian(26)
B15_red =
       source<ichi_baseline
       ?1:0
B15_blue =
       source>ichi_baseline
       ?1:0

//16. Volume Weighted Moving Average (20)
B16_red =
       source<vwma(source,20)
       ?1:0
B16_blue =
       source>vwma(source,20)
       ?1:0

//17. Hull Moving Average (9)
hma(src,len) => wma(2*wma(src, len/2)-wma(src, len), round(sqrt(len)))
B17_red =
       source<hma(source,9)
       ?1:0
B17_blue =
       source>hma(source,9)
       ?1:0

//Sum Signal B
B_red = B1_red + B2_red + B3_red + B4_red + B5_red + B6_red + B7_red + B8_red + B9_red + B10_red + B11_red + B12_red + B13_red + B14_red + B15_red + B16_red + B17_red
B_blue = B1_blue + B2_blue + B3_blue + B4_blue + B5_blue + B6_blue + B7_blue + B8_blue + B9_blue + B10_blue + B11_blue + B12_blue + B13_blue + B14_blue + B15_blue + B16_blue + B17_blue


////////////////////////////////////////////////////////////////////////////////
//                              C. Pivot                                      //
////////////////////////////////////////////////////////////////////////////////

///////////////
// FUNCTIONS //
///////////////

// Function outputs 1 when it's the first bar of the D/W/M/Y
is_newbar(res) =>
    ch = 0
    if(res == 'Y')
        t  = year(time('D'))
        ch := change(t) != 0 ? 1 : 0
    else
        t = time(res)
        ch := change(t) != 0 ? 1 : 0
    ch

// Rounding levels to min tick
nround(x) =>
    n = round(x / syminfo.mintick) * syminfo.mintick

////////////
// INPUTS //
////////////

//pp_res = 'D'
pp_res = res

/////////////////////
// Get HLC from HT //

// Calc Open
open_cur = 0.0
open_cur := is_newbar(pp_res) ? security(tick,res,open) : open_cur[1]


popen = 0.0
popen := is_newbar(pp_res) ? open_cur[1] : popen[1]

// Calc High
high_cur = 0.0
high_cur := is_newbar(pp_res) ? security(tick,res,high) : max(high_cur[1], security(tick,res,high))

phigh = 0.0
phigh := is_newbar(pp_res) ? high_cur[1] : phigh[1]

// Calc Low
low_cur = 0.0
low_cur := is_newbar(pp_res) ? security(tick,res,low) : min(low_cur[1], security(tick,res,low))

plow = 0.0
plow := is_newbar(pp_res) ? low_cur[1] : plow[1]

// Calc source
psource = 0.0
psource := is_newbar(pp_res) ? source[1] : psource[1]


////////////////////////////
// CALCULATE Pivot POINTS //
////////////////////////////

PP = 0.0
R1 = 0.0, R2 = 0.0, R3 = 0.0
S1 = 0.0, S2 = 0.0, S3 = 0.0

// Traditional
TR_PP = (phigh + plow + psource) / 3
TR_R1 = TR_PP     + (TR_PP   - plow)
TR_S1 = TR_PP     - (phigh - TR_PP)
TR_R2 = TR_PP     + (phigh - plow)
TR_S2 = TR_PP     - (phigh - plow)
TR_R3 = phigh  + 2 * (TR_PP   - plow)
TR_S3 = plow   - 2 * (phigh - TR_PP)

//Signal

C1_red =
       (source<TR_S1 and not cross(source,TR_S2))
       or
       (source<TR_S2 and not cross(source,TR_S3))
       or
       (source<TR_S3 and not cross(security(tick,res,high),TR_S3))
       ?1:0
 
C1_blue =
       (source>TR_R1 and not cross(source,TR_R2))
       or
       (source>TR_R2 and not cross(source,TR_R3))
       or
       (source>TR_R3 and not cross(security(tick,res,low),TR_R3))
       ?1:0

// Fibonacci
FIB_PP = (phigh + plow + psource) / 3
FIB_R1 = FIB_PP + (phigh - plow) * 0.382
FIB_S1 = FIB_PP - (phigh - plow) * 0.382
FIB_R2 = FIB_PP + (phigh - plow) * 0.618
FIB_S2 = FIB_PP - (phigh - plow) * 0.618
FIB_R3 = FIB_PP + (phigh - plow) * 1.000
FIB_S3 = FIB_PP - (phigh - plow) * 1.000
 
C2_red =
       (source<FIB_S1 and not cross(source,FIB_S2))
       or
       (source<FIB_S2 and not cross(source,FIB_S3))
       or
       (source<FIB_S3 and not cross(security(tick,res,high),FIB_S3))
       ?1:0

C2_blue =
       (source>FIB_R1 and not cross(source,FIB_R2))
       or
       (source>FIB_R2 and not cross(source,FIB_R3))
       or
       (source>FIB_R3 and not cross(security(tick,res,low),FIB_R3))
       ?1:0

// Woodie
WO_PP = (phigh + plow + 2 * popen) / 4
WO_R1 = WO_PP + (WO_PP - plow)
WO_S1 = WO_PP - (phigh - WO_PP)
WO_R2 = WO_PP + (phigh - plow)
WO_S2 = WO_PP - (phigh - plow)
WO_R3 = phigh + 2 * (WO_PP - plow)
WO_S3 = plow  - 2 * (phigh - WO_PP)
    
C3_red =
       (source<WO_S1 and not cross(source,WO_S2))
       or
       (source<WO_S2 and not cross(source,WO_S3))
       or
       (source<WO_S3 and not cross(security(tick,res,high),WO_S3))
       ?1:0

C3_blue =
       (source>WO_R1 and not cross(source,WO_R2))
       or
       (source>WO_R2 and not cross(source,WO_R3))
       or
       (source>WO_R3 and not cross(security(tick,res,low),WO_R3))
       ?1:0


// Camarilla
CA_PP = (phigh + plow + psource) / 3
CA_R1 = psource + (phigh - plow) * 1.1/12
CA_S1 = psource - (phigh - plow) * 1.1/12
CA_R2 = psource + (phigh - plow) * 1.1/6
CA_S2 = psource - (phigh - plow) * 1.1/6
CA_R3 = psource + (phigh - plow) * 1.1/4
CA_S3 = psource - (phigh - plow) * 1.1/4

C4_red =
       (source<CA_S1 and not cross(source,CA_S2))
       or
       (source<CA_S2 and not cross(source,CA_S3))
       or
       (source<CA_S3 and not cross(security(tick,res,high),CA_S3))
       ?1:0

C4_blue =
       (source>CA_R1 and not cross(source,CA_R2))
       or
       (source>CA_R2 and not cross(source,CA_R3))
       or
       (source>CA_R3 and not cross(security(tick,res,low),CA_R3))
       ?1:0


//C Point
C_red = C1_red + C2_red + C3_red + C4_red

C_blue = C1_blue + C2_blue + C3_blue + C4_blue

//Sum point
Sum_red=A_red+B_red+C_red
Sum_blue=A_blue+B_blue+C_blue
sell_point=(Sum_red/32)*10
buy_point=(Sum_blue/32)*10

////////////////////////////////////////////////////////////////////////////////

//Market Level
sell =
       Sum_red>Sum_blue
       and sell_point>5
       ?22:na

Strong_sell =
       A_red>A_blue
       and B_red>B_blue
       and C_red>C_blue
       and sell_point>5
       and not crossunder(sell_point,7.5)
       ?22:na

buy =
       Sum_red<Sum_blue
       and buy_point>5
       ?22:na

Strong_buy =
       A_red<A_blue
       and B_red<B_blue
       and C_red<C_blue
       and buy_point>5
       and not crossunder(buy_point,7.5)
       ?22:na

neutral = not sell and not Strong_sell and not buy and not Strong_buy?22:na


////////////////////////////////////////////////////////////////////////////////
//                                Table                                       //
////////////////////////////////////////////////////////////////////////////////

// Set the position of the table
posInput = input(title="Position", defval="Bottom Right", options=["Bottom Left", "Bottom Right", "Top Left", "Top Right"], tooltip="Select where you want the table to draw.")
var pos = posInput == "Bottom Left" ? position.bottom_left : posInput == "Bottom Right" ? position.bottom_right : posInput == "Top Left" ? position.top_left : posInput == "Top Right" ? position.top_right : na

// Adjusts the text size and results in different overall size of the table
txtSizeInput = input(title="Text Size", defval="Normal", options=["Tiny", "Small", "Normal", "Large", "Huge"], tooltip="Select the size of the text. It affects the size of the whole table.")
var txtSize = txtSizeInput == "Tiny" ? size.tiny : txtSizeInput == "Small" ? size.small : txtSizeInput == "Normal" ? size.normal : txtSizeInput == "Large" ? size.large : txtSizeInput == "Huge" ? size.huge : na

// Background color for Pivots, Oscillators, MAs, and Summary
pivBgColor = input(title="Pivots Background Color", type=input.color, defval=color.rgb(10, 10, 10, 25), tooltip="Background color for the Pivots columns.")
oscBgColor = input(title="Oscillators Background Color", type=input.color, defval=color.rgb(40, 40, 40, 25), tooltip="Background color for the Oscillators columns.")
maBgColor = input(title="Moving Averages Background Color", type=input.color, defval=color.rgb(10, 10, 10, 25), tooltip="Background color for the Moving Averages columns.")
sumBgColor = input(title="Summary Background Color", type=input.color, defval=color.rgb(40, 40, 40, 25), tooltip="Background color for the Summary columns.")

// Background color for the final suggestion
ssBgColor = input(title="Strong Sell Background Color", type=input.color, defval=color.rgb(255, 25, 25, 25), tooltip="Background color for the Strong Sell signal.")
sBgColor = input(title="Sell Background Color", type=input.color, defval=color.rgb(255, 82, 82, 25), tooltip="Background color for the Sell signal.")
nBgColor = input(title="Neutral Background Color", type=input.color, defval=color.rgb(120, 123, 134, 25), tooltip="Background color for the Neutral signal.")
bBgColor = input(title="Buy Background Color", type=input.color, defval=color.rgb(76, 175, 80, 25), tooltip="Background color for the Buy signal.")
sbBgColor = input(title="Strong Buy Background Color", type=input.color, defval=color.rgb(19, 200, 25, 25), tooltip="Background color for the Strong Buy signal.")

// Background color for the pseudohistogram
negBgColor = input(title="Sell % Background Color", type=input.color, defval=color.rgb(255, 82, 82, 25), tooltip="Background color for the Sell %.")
netBgColor = input(title="Neutral % Background Color", type=input.color, defval=color.rgb(20, 123, 134, 25), tooltip="Background color for the Neutral %.")
posBgColor = input(title="Buy % Background Color", type=input.color, defval=color.rgb(76, 175, 80, 25), tooltip="Background color for the Buy %.")

// Initiate the table
var table TA_Display = table.new(pos, 13, 4)


// Final suggestion
if barstate.isrealtime
    if sell and not Strong_sell
        for i=0 to 12
            table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=sBgColor)
        table.cell_set_text(TA_Display, 6, 0, "SELL")
    if Strong_sell
        for i=0 to 12
            table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=ssBgColor)
        table.cell_set_text(TA_Display, 6, 0, "STRONG SELL")
    if buy and not Strong_buy
        for i=0 to 12
            table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=bBgColor)
        table.cell_set_text(TA_Display, 6, 0, "BUY")
    if Strong_buy
        for i=0 to 12
            table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=sbBgColor)
        table.cell_set_text(TA_Display, 6, 0, "STRONG BUY")
    if neutral
        for i=0 to 12
            table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=nBgColor)
        table.cell_set_text(TA_Display, 6, 0, "NEUTRAL")
    

// Pivots
if barstate.islast
    table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 1, 1, "Pivots", text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 0, 2, tostring(C_red), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 1, 2, tostring(4-(C_red+C_blue)), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 2, 2, tostring(C_blue), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 0, 3, "Sell", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 1, 3, "Neutral", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
    table.cell(TA_Display, 2, 3, "Buy", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
    

// Oscillators
if barstate.islast
    table.cell(TA_Display, 3, 1, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 4, 1, "Oscillators", text_color=color.white, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 5, 1, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 3, 2, tostring(A_red), text_color=color.red, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 4, 2, tostring(11-(A_red+A_blue)), text_color=color.gray, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 5, 2, tostring(A_blue), text_color=color.green, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 3, 3, "Sell", text_color=color.red, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 4, 3, "Neutral", text_color=color.gray, text_size=txtSize, bgcolor=oscBgColor)
    table.cell(TA_Display, 5, 3, "Buy", text_color=color.green, text_size=txtSize, bgcolor=oscBgColor)


// Moving Averages
if barstate.islast
    table.cell(TA_Display, 7, 1, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 8, 1, "MAs", text_color=color.white, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 9, 1, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 7, 2, tostring(B_red), text_color=color.red, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 8, 2, tostring(17-(B_red+B_blue)), text_color=color.gray, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 9, 2, tostring(B_blue), text_color=color.green, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 7, 3, "Sell", text_color=color.red, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 8, 3, "Neutral", text_color=color.gray, text_size=txtSize, bgcolor=maBgColor)
    table.cell(TA_Display, 9, 3, "Buy", text_color=color.green, text_size=txtSize, bgcolor=maBgColor)


// Summary
if barstate.islast
    table.cell(TA_Display, 10, 1, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 11, 1, "Summary", text_color=color.white, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 12, 1, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 10, 2, tostring(Sum_red), text_color=color.red, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 11, 2, +tostring(32-(Sum_red+Sum_blue)), text_color=color.gray, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 12, 2, tostring(Sum_blue), text_color=color.green, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 10, 3, "Sell", text_color=color.red, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 11, 3, "Neutral", text_color=color.gray, text_size=txtSize, bgcolor=sumBgColor)
    table.cell(TA_Display, 12, 3, "Buy", text_color=color.green, text_size=txtSize, bgcolor=sumBgColor)

// Pseudohistogram
if barstate.isrealtime
    if sell_point > buy_point
        table.cell(TA_Display, 6, 1, tostring(sell_point*10) + "%", text_color=color.white, text_size=txtSize, bgcolor=negBgColor)
        table.cell(TA_Display, 6, 3, tostring(buy_point*10) + "%", text_color=color.white, text_size=txtSize, bgcolor=posBgColor)
    else
        table.cell(TA_Display, 6, 1, tostring(buy_point*10) + "%", text_color=color.white, text_size=txtSize, bgcolor=posBgColor)
        table.cell(TA_Display, 6, 3, tostring(sell_point*10) + "%", text_color=color.white, text_size=txtSize, bgcolor=negBgColor)
    
    table.cell(TA_Display, 6, 2, tostring((10-sell_point-buy_point)*10) + "%", text_color=color.white, text_size=txtSize, bgcolor=netBgColor)

//EOF