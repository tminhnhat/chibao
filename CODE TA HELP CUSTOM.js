// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © SoftKill21
// © despotak

//@version=4


strategy(title="Custom chi bao-backtest", process_orders_on_close=true, max_bars_back = 2000, overlay=false)

tick = syminfo.tickerid
res = input(title="Resolution", type=input.resolution, defval="", tooltip="Select the resolution you want to track.")
source = security(tick,res,close)

hesoalgo=input(title="He so Algo", defval=1)
hesorsx=input(title="He so RSX", defval=1)
hesosuppertrendpivot=input(title="He so SuperTrend Pivot", defval=1)
hesoMACD=input(title="He so MACD", defval=1)
hesofeargreed=input(title="He so Fear Greed", defval=1)
hesotahelp=input(title="He so TA Help", defval=1)
hesopivotdaochieu = input(title="He so pivot dao chieu", defval=1)
diembuy=input(title="Diem buy", defval=2)
diemsell=input(title="Diem Sell", defval=-2)
lenhbuy=input(title="Lenh cai order long", defval="")
lenhsell=input(title="Lenh cai order short", defval="")

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


//EOF


//-------------code rsx-d


// RSX-D [ID: AC-P] v08
    // Author: Auroagwei
        // https://www.tradingview.com/u/auroagwei/

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

fill(obLevelPlot, osLevelPlot, color=color.new(color.purple, transp=100),title="RSX OB <--> OS Fill")

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
fill(maxLevelPlot, obLevelPlot, color=color.new(obFillColor, transp=90), title="RSX OB Fill")
fill(minLevelPlot, osLevelPlot, color=color.new(osFillColor, transp=90), title="RSX OS Fill")

//////////////////

ema21 = ema(close, 21)  //fib
ema55 = ema(close, 55)  //fib

upEmaFillColor = ema21 > ema55 and highlightBreakouts_ema ? color.orange	 : transparent
downEmaFillColor = ema21 < ema55  and highlightBreakouts_ema ? color.aqua	: transparent

fill(obLevelPlot, m1LevelPlot, color=color.new(upEmaFillColor, transp=70),title="EMA 21/55 Up Fill")
fill(osLevelPlot, m2LevelPlot, color=color.new(downEmaFillColor, transp=70),title="EMA 21/55 Down Fill")

////////////////

//-------------------------------------------------------------------
//plot(show_rsx ? rsx : na , title="RSX", linewidth=2, color.new(rsxColor, transp=0))
//-------------------------------------------------------------------

// MA of RSX
show_sma = input(false, "SMA of RSX")
show_ema = input(false, "EMA of RSX")

len_sma = input(9, minval=1, title="SMA of RSX Length")
len_ema = input(45, minval=1, title="EMA of RSX Length") 
smaRSX = ema(rsx,len_sma )
emaRSX = ema(rsx,len_ema )
//plot(show_sma ? smaRSX : na, title="SMA of RSX", style=plot.style_line, linewidth=2, color=color.new(#26c6da,transp=0))
//plot(show_ema ? emaRSX : na, title="EMA of RSX", style=plot.style_line, linewidth=2, color=color.new(#008000,transp=0))
//
//plot(show_lsmaD ? lsmaD : na, linewidth=2,title="LSMA-D", color=color.new(color.fuchsia, transp=0))

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
//plotshape(showdivs_lib ? (shrt ? na : divbear ? rsx[1] + 1 : na) : na, location=location.absolute, style=shape.labeldown, color=color.new(#FF0000, transp=0), size=size.tiny, text="Bear", textcolor=color.white, offset=-1)
//plotshape(showdivs_lib  ? (shrt ? na : divbull ? rsx[1] - 1 : na) : na, location=location.absolute, style=shape.labelup, color=color.new(#008000, transp=0), size=size.tiny, text="Bull", textcolor=color.white, offset=-1)
//plotshape(piv ? na : shrt ? na : pivoth ? max_rsi + 1 : na, location=location.absolute, style=shape.labeldown, color=color.new(color.blue, transp=0), size=size.tiny, text="Pivot", textcolor=color.white, offset=-2)
//plotshape(piv ? na : shrt ? na : pivotl ? min_rsi - 1 : na, location=location.absolute, style=shape.labelup, color=color.new(color.blue, transp=0), size=size.tiny, text="Pivot", textcolor=color.white, offset=-2)

// Shorter labels
//plotshape(showdivs_lib ? (shrt ? divbear ? rsx[1] + 3 : na : na) : na, location=location.absolute, style=shape.triangledown, color=color.new(#FF0000, transp=0), size=size.tiny, offset=-1)
//plotshape(showdivs_lib ? (shrt ? divbull ? rsx[1] - 3 : na : na) : na, location=location.absolute, style=shape.triangleup, color=color.new(#008000, transp=0), size=size.tiny, offset=-1)
//plotshape(piv ? na : shrt ? pivoth ? max_rsi + 3 : na : na, location=location.absolute, style=shape.triangledown, color=color.new(#0000FF, transp=0), size=size.tiny, offset=-2)
//plotshape(piv ? na : shrt ? pivotl ? min_rsi - 3 : na : na, location=location.absolute, style=shape.triangleup, color=color.new(#0000FF, transp=0), size=size.tiny, offset=-2)

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

//plot(title='RSX Divergences: H F', series=showdivs and fractal_top ? k[2] : na, color=color.new(col1,transp=20), linewidth=2, offset=-2)
//plot(title='RSX Divergences: L F', series=showdivs and fractal_bot ? k[2] : na, color=color.new(col2,transp=20), linewidth=2, offset=-2)
//plot(title='RSX Divergences: H D', series=showdivs and fractal_top ? k[2] : na, style=plot.style_circles, color=color.new(col3,transp=20), linewidth=3, offset=-2)
//plot(title='RSX Divergences: L D', series=showdivs and fractal_bot ? k[2] : na, style=plot.style_circles, color=color.new(col4,transp=20), linewidth=3, offset=-2)

// plot(showchan2?fractal_top2:na, title="LSMA-D Divergences: Top Div Channel", offset=-2, color=color.gray,linewidth=2)
// plot(showchan2?fractal_bot2:na, title="LSMA-D Divergences: Bottom Div Channel", offset=-2, color=color.gray,linewidth=2)

//plot(title='LSMA-D Divergences: H F', series=showdivs2 and fractal_top2 ? k2[2] : na, color=color.new(col12,transp=20), linewidth=2, offset=-2)
//plot(title='LSMA-D Divergences: L F', series=showdivs2 and fractal_bot2 ? k2[2] : na, color=color.new(col22,transp=20), linewidth=2, offset=-2)
//plot(title='LSMA-D Divergences: H D', series=showdivs2 and fractal_top2 ? k2[2] : na, style=plot.style_circles, color=color.new(col32,transp=20), linewidth=3, offset=-2)
//plot(title='LSMA-D Divergences: L D', series=showdivs2 and fractal_bot2 ? k2[2] : na, style=plot.style_circles, color=color.new(col42,transp=20), linewidth=3, offset=-2)

// plotshape(title='+Regular Bearish Div Label', series=showdivs and showdiv_labels and regular_bearish_div ? k[2] : na, text='R', style=shape.labeldown, location=location.absolute, color=red, textcolor=white, offset=-2)
// plotshape(title='+Hidden Bearish Div Label', series=showdivs and showdiv_labels and hidden_bearish_div and showhidden ? k[2] : na, text='H', style=shape.labeldown, location=location.absolute, color=red, textcolor=white, offset=-2)
// plotshape(title='-Regular Bullish Div Label', series=showdivs and showdiv_labels and regular_bullish_div ? k[2] : na, text='R', style=shape.labelup, location=location.absolute, color=green, textcolor=white, offset=-2)
// plotshape(title='-Hidden Bearish Div Label', series=showdivs and showdiv_labels and hidden_bullish_div  and showhidden ? k[2] : na, text='H', style=shape.labelup, location=location.absolute, color=green, textcolor=white, offset=-2)

//plotshape(title='RSX Divergences: Hidden Bearish Div', series=showdivs and showdiv_labels2 and hidden_bearish_div and showhidden ? k[2] : na, style=shape.square, location=location.absolute, color=#FF0000		, offset=-2,size=size.tiny)
//plotshape(title='RSX Divergences: Hidden Bullish Div', series=showdivs and showdiv_labels2 and hidden_bullish_div  and showhidden ? k[2] : na, style=shape.square, location=location.absolute, color=#00FF00	, offset=-2,size=size.tiny)

//plotshape(title='LSMA-D Divergences: Hidden Bearish Div', series=showdivs2 and showdiv_labels22 and hidden_bearish_div2 and showhidden2 ? k2[2] : na, style=shape.square, location=location.absolute, color=#FF0000		, offset=-2,size=size.tiny)
//plotshape(title='LSMA-D Divergences: Hidden Bullish Div', series=showdivs2 and showdiv_labels22 and hidden_bullish_div2  and showhidden2 ? k2[2] : na, style=shape.square, location=location.absolute, color=#00FF00	, offset=-2,size=size.tiny)

//-------------------------------------------------------------------
//---- Alerts

// Libertus Div Alerts, RSX
    // [L] Suffix
alertcondition(divbear, title='RSX: Bear div [L]', message='RSX: Bear div [L]')
alertcondition(divbull, title='RSX: Bull div [L]', message='RSX: Bull div [L]')

RSX1_green =
       divbull
       ?1:0
RSX1_red =
       divbear
       ?1:0
//---- Neobutane Div Alerts, RSX
    // [NB] Suffix
alertcondition(regular_bearish_div, "RSX Regular Bear Div [NB]", "RSX Regular Bear Div [NB]") 
alertcondition(regular_bullish_div, "RSX Regular Bull Div [NB]", "RSX Regular Bull Div [NB]") 
alertcondition(hidden_bearish_div, "RSX Hidden Bear Div [NB]", "RSX Hidden Bear Div [NB]") 
alertcondition(hidden_bullish_div, "RSX Hidden Bull Div [NB]", "RSX Hidden Bull Div [NB]") 

RSX2_green =
       regular_bullish_div
       ?1:0
RSX2_red =
       regular_bearish_div
       ?1:0
//---- Neobutane Div Alerts, LSMA-D
    // [NB] Suffix
alertcondition(regular_bearish_div2, "LSMA-D Regular Bear Div [NB]", "LSMA-D Regular Bear Div [NB]") 
alertcondition(regular_bullish_div2, "LSMA-D Regular Bull Div [NB]", "LSMA-D Regular Bull Div [NB]") 
alertcondition(hidden_bearish_div2, "LSMA-D Hidden Bear Div [NB]", "LSMA-D Hidden Bear Div [NB]") 
alertcondition(hidden_bullish_div2, "LSMA-D Hidden Bull Div [NB]", "LSMA-D Hidden Bull Div [NB]") 

RSX3_green =
       regular_bullish_div2
       ?1:0
RSX3_red =
       regular_bearish_div2
       ?1:0
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


//plotshape((showArrows and showArrowsCenter and trend_center == -1 ) ? 65 : na, color=color.new(color.white, transp=20), style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU Midline")
//plotshape((showArrows and showArrowsCenter and trend_center == 1 ) ? 35 : na, color=color.new(color.white, transp=20), style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO Midline")

//plotshape((showArrows and showArrowsExit and trend_exit == -1) ? 100 : na, color=color.new(color.aqua, transp=20), style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU M1")
//plotshape((showArrows and showArrowsEnter and trend_enter == -1) ? 100 : na, color=color.new(color.aqua, transp=85), style=shape.triangledown, size=size.tiny, location=location.absolute, title="+RSX CO M1")
   
//plotshape((showArrows and showArrowsEnter and trend_enter == 1) ? 0 : na, color=color.new(color.orange, transp=85), style=shape.triangleup, size=size.tiny,  location=location.absolute, title="-RSX CU M2")
//plotshape((showArrows and showArrowsExit and trend_exit == 1) ? 0 : na, color=color.new(color.orange, transp=20), style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO M2")

// rsx/LSMA-D CU/CO
//plotshape((showArrows and showArrowsrsx_lsmaD and rsx_lsmaD_cu) ? 105 : na, color=color.new(color.fuchsia, transp=20), style=shape.triangledown, size=size.tiny, location=location.absolute, title="-RSX CU LSMA-D")
//plotshape((showArrows and showArrowsrsx_lsmaD and rsx_lsmaD_co) ? -5 : na, color=color.new(color.fuchsia, transp=20), style=shape.triangleup, size=size.tiny, location=location.absolute, title="+RSX CO LSMA-D")
   
//----

alertcondition((showArrowsCenter and trend_center == 1), message="+RSX CO Midline", title="+RSX CO Midline")
alertcondition((showArrowsCenter and trend_center == -1), message="-RSX CU Midline", title="-RSX CU Midline")

RSX4_green =
       showArrowsCenter and trend_center == 1
       ?1:0
RSX4_red =
       showArrowsCenter and trend_center == -1
       ?1:0

alertcondition((showArrowsExit and trend_exit == -1), message="-RSX CU M1", title="-RSX CU M1")
alertcondition((showArrowsEnter and trend_enter == -1), message="+RSX CO M1", title="+RSX CO M1")

RSX5_green =
       showArrowsEnter and trend_enter == -1
       ?1:0
RSX5_red =
       showArrowsExit and trend_exit == -1
       ?1:0

alertcondition((showArrowsEnter and trend_enter == 1), message="-RSX CU M2", title="-RSX CU M2")
alertcondition((showArrowsExit and trend_exit == 1), message="+RSX CO M2", title="+RSX CO M2")

RSX6_green =
       showArrowsExit and trend_exit == 1
       ?1:0
RSX6_red =
       showArrowsEnter and trend_enter == 1
       ?1:0

alertcondition((rsx_lsmaD_cu), message="-RSX CU LSMA-D", title="-RSX CU LSMA-D")
alertcondition((rsx_lsmaD_co), message="+RSX CO LSMA-D", title="+RSX CO LSMA-D")

RSX7_green =
       rsx_lsmaD_co
       ?1:0
RSX7_red =
       rsx_lsmaD_cu
       ?1:0   

//sum rsx
//RSX_green = RSX1_green + RSX2_green + RSX3_green + RSX4_green + RSX5_green + RSX6_green + RSX7_green
//RSX_red = RSX1_red + RSX2_red + RSX3_red + RSX4_red + RSX5_red + RSX6_red + RSX7_red
RSX_green = rsx > lsmaD ? rsx < osLevel ? 2:1:0
RSX_red = rsx < lsmaD ? rsx > obLevel ? -2:-1:0

//ket thuc code rsx-d
//bat dau code algo


//RB SSL CHANNEL
period=input(title="Period", defval=13)
len=input(title="Period", defval=13)



// Set the position of the table




smaHigh=sma(high, len)
smaLow=sma(low, len)
Hlv = 0.0
Hlv := close > smaHigh ? 1 : close < smaLow ? -1 : Hlv[1]
sslDown = Hlv < 0 ? smaHigh: smaLow
sslUp   = Hlv < 0 ? smaLow : smaHigh



//plot(sslDown, linewidth=2, color=#FF0000)
//plot(sslUp, linewidth=2, color=#00FF00)

ssl_l=crossover(sslUp,sslDown)
ssl_s=crossunder(sslUp,sslDown)


//Conditions For Trades

long_algo= ssl_l 
short_algo=  ssl_s


//Strategy Conditions



//Use this to customize the look of the arrows to suit your needs.
//plotshape(long, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Buy")
//plotshape(short, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Sell")
//plotshape(longclose, location=location.belowbar, color=color.lime, style=shape.arrowup, text="Exit Buy")
//plotshape(shortclose, location=location.abovebar, color=color.red, style=shape.arrowdown, text="Exit Sell")






alertcondition(long_algo, 'Buy Long_Algo', 'Long Entry:{{plot("giavaoentrylong")}}-SL:{{plot("giastoplosslong")}}-TP:{{plot("giachotloilong")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
//alertcondition(longclose, 'Long Close', 'Long Close')
alertcondition(short_algo, 'Buy Short Algo', 'Short Entry:{{plot("giavaoentryshort")}}-SL:{{plot("giastoplossshort")}}-TP:{{plot("giachotloishort")}}-margin:{{plot("tylemargin")}}-size={{plot("giatrivaolenh")}}')
//alertcondition(shortclose, 'Short Close', 'Short Close')
Algo_green =
       sslUp > sslDown
       ?1:0
Algo_red =
       sslUp < sslDown
       ?-1:0 
//ket thuc code algo
//code supertrend pivot


prd = input(defval = 2, title="Pivot Point Period", minval = 1, maxval = 50)
Factor=input(defval = 3, title = "ATR Factor", minval = 1, step = 0.1)
Pd=input(defval = 10, title = "ATR Period", minval=1)
showpivot = input(defval = false, title="Show Pivot Points")
showlabel = input(defval = true, title="Show Buy/Sell Labels")
showcl = input(defval = false, title="Show PP Center Line")
showsr = input(defval = false, title="Show Support/Resistance")

// get Pivot High/Low
float ph = pivothigh(prd, prd)
float pl = pivotlow(prd, prd)

// drawl Pivot Points if "showpivot" is enabled
//plotshape(ph and showpivot, text="H",  style=shape.labeldown, color=color.new(na, transp=0), textcolor=color.red, location=location.abovebar, offset = -prd)
//plotshape(pl and showpivot, text="L",  style=shape.labeldown, color=color.new(na, transp=0), textcolor=color.lime, location=location.belowbar, offset = -prd)

// calculate the Center line using pivot points
var float center = na
float lastpp = ph ? ph : pl ? pl : na
if lastpp
    if na(center)
        center := lastpp
    else
        //weighted calculation
        center := (center * 2 + lastpp) / 3

// upper/lower bands calculation
Up = center - (Factor * atr(Pd))
Dn = center + (Factor * atr(Pd))

// get the trend
float TUp = na
float TDown = na
Trend = 0
TUp := close[1] > TUp[1] ? max(Up, TUp[1]) : Up
TDown := close[1] < TDown[1] ? min(Dn, TDown[1]) : Dn
Trend := close > TDown[1] ? 1: close < TUp[1]? -1: nz(Trend[1], 1)
Trailingsl = Trend == 1 ? TUp : TDown

// plot the trend
linecolor = Trend == 1 and nz(Trend[1]) == 1 ? color.lime : Trend == -1 and nz(Trend[1]) == -1 ? color.red : na
//plot(Trailingsl, color = linecolor ,  linewidth = 2, title = "PP SuperTrend")

//plot(showcl ? center : na, color = showcl ? center < hl2 ? color.blue : color.red : na)

// check and plot the signals
bsignal = Trend == 1 and Trend[1] == -1
ssignal = Trend == -1 and Trend[1] == 1
//plotshape(bsignal and showlabel ? Trailingsl : na, title="Buy", text="Buy", location = location.absolute, style = shape.labelup, size = size.tiny, color = color.new(color.lime,transp = 0), textcolor = color.black)
//plotshape(ssignal and showlabel ? Trailingsl : na, title="Sell", text="Sell", location = location.absolute, style = shape.labeldown, size = size.tiny, color = color.new(color.red, transp = 0), textcolor = color.white)

//get S/R levels using Pivot Points
float resistance = na
float support = na
support := pl ? pl : support[1]
resistance := ph ? ph : resistance[1]

// if enabled then show S/R levels
//plot(showsr and support ? support : na, color = showsr and support ? color.lime : na, style = plot.style_circles, offset = -prd)
//plot(showsr and resistance ? resistance : na, color = showsr and resistance ? color.red : na, style = plot.style_circles, offset = -prd)

// alerts
alertcondition(Trend == 1 and Trend[1] == -1, title='Buy Signal', message='Buy Signal')
alertcondition(Trend == -1 and Trend[1] == 1, title='Sell Signal', message='Sell Signal')
alertcondition(change(Trend), title='Trend Changed', message='Trend Changed')

SuperTrend_green = Trend == 1 and nz(Trend[1]) == 1 ? 1 : 0
SuperTrend_red = Trend == -1 and nz(Trend[1]) == -1 ? -1 : 0 
//ket thuc code super pivot
//code macd 



smd = input(true, title="Show MacD & Signal Line? Also Turn Off Dots Below")
sd = input(true, title="Show Dots When MacD Crosses Signal Line?")
sh = input(true, title="Show Histogram?")
macd_colorChange = input(true,title="Change MacD Line Color-Signal Line Cross?")
hist_colorChange = input(true,title="MacD Histogram 4 Colors?")




outMacD = security(syminfo.tickerid, res, macd)
outSignal = security(syminfo.tickerid, res, signal)
outHist = security(syminfo.tickerid, res, hist)

histA_IsUp = outHist > outHist[1] and outHist > 0
histA_IsDown = outHist < outHist[1] and outHist > 0
histB_IsDown = outHist < outHist[1] and outHist <= 0
histB_IsUp = outHist > outHist[1] and outHist <= 0

//MacD Color Definitions
macd_IsAbove = outMacD >= outSignal
macd_IsBelow = outMacD < outSignal

plot_color = hist_colorChange ? histA_IsUp ? color.aqua : histA_IsDown ? color.blue : histB_IsDown ? color.red : histB_IsUp ? color.maroon :color.yellow :color.gray
macd_color = macd_colorChange ? macd_IsAbove ? color.lime : color.red : color.red
signal_color = macd_colorChange ? macd_IsAbove ? color.yellow : color.yellow : color.lime

circleYPosition = outSignal
 
//plot(smd and outMacD ? outMacD : na, title="MACD", color=macd_color, linewidth=4)
//plot(smd and outSignal ? outSignal : na, title="Signal Line", color=signal_color, style=plot.style_line ,linewidth=2)
//plot(sh and outHist ? outHist : na, title="Histogram", color=plot_color, style=plot.style_histogram, linewidth=4)
//plot(sd and cross(outMacD, outSignal) ? circleYPosition : na, title="Cross", style=plot.style_circles, linewidth=4, color=macd_color)
hline(0, '0 Line', linestyle=hline.style_dashed, linewidth=2, color=color.white)

MACD_green =
       macd_colorChange ? macd_IsAbove
       ?1:-1:-1
//ket thuc macd

//bat dau code fearzone and greedzone


f_security(_symbol, _res, _src, _repaint) => 
    security(_symbol, _res, _src[_repaint ? 0 : barstate.isrealtime ? 1 : 0])[_repaint ? 0 : barstate.isrealtime ? 0 : 1]
    
rep = input(title="Allow Repainting?", type=input.bool, defval=false)
bar = input(title="Allow Bar Color Change?", type=input.bool, defval=true)
fastLength = input(title="FastLength", type=input.integer, defval=10, minval=1)
slowLength = input(title="SlowLength", type=input.integer, defval=30, minval=1)
smoothLength = input(title="SmoothLength", type=input.integer, defval=2, minval=1)
trimdolechdulieu = input(title="Trim do lech du lieu Fear, Greed", defval=0.00015)

p = f_security(syminfo.tickerid, res, close, rep)
t = f_security(syminfo.tickerid, res, tr, rep)

trUp = p > p[1] ? t : 0
trDn = p < p[1] ? t : 0
fastDiff = wma(trUp, fastLength) - wma(trDn, fastLength)
slowDiff = wma(trUp, slowLength) - wma(trDn, slowLength)
fgi = wma(fastDiff - slowDiff, smoothLength)

sig = fgi > 0 ? 1 : fgi < 0 ? -1 : 0
alertcondition(crossover(sig, 0), "Buy Signal", "Bullish Change Detected")
alertcondition(crossunder(sig, 0), "Sell Signal", "Bearish Change Detected")
fgiColor = sig > 0 ? color.green : sig < 0 ? color.red : color.black
barcolor(bar ? fgiColor : na)
//plot(fgi, color=fgiColor, style=plot.style_histogram, linewidth=2)
fearsig = fgi < close*trimdolechdulieu*-1 ? -1 : 0
greedsig = fgi > close*trimdolechdulieu ? 1 : 0
//ket thuc fearzone and greedzone

//bat dau sum cham diem
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

diemTAhelp = sell and not Strong_sell ? -1 : Strong_sell ? -2 : buy and not Strong_buy ? 1 : Strong_buy ? 2 : neutral ? 0 : na
diemtotal = diemTAhelp + SuperTrend_green*hesosuppertrendpivot + SuperTrend_red*hesosuppertrendpivot + Algo_green*hesoalgo + Algo_red*hesoalgo + RSX_green*hesorsx + RSX_red*hesorsx + MACD_green*hesoMACD + fearsig*hesofeargreed + greedsig*hesofeargreed

//plot(RSX_green, linewidth=2, color=color.green, title="RSX_green")
//plot(RSX_red, linewidth=2, color=color.red, title="RSX_red")
//plot(diemTAhelp, linewidth=2, color=color.yellow, title="diemTAhelp")
//plot(diemtotal, linewidth=2, color=color.blue, title="diemtotal")
//plot(SuperTrend_green + SuperTrend_red, linewidth=2, color=color.white, title="SuperTrend")
//plot(Algo_green + Algo_red, linewidth=2, color=color.lime, title="Algo Plot")
//plot(MACD_green, linewidth=2, color=color.red, title="MACD plot")
//plot(fearsig + greedsig, linewidth=2, color=color.red, title="Fear Greed plot")

// Initiate the table
var table TA_Display = table.new(pos, 13, 4)


// Final suggestion


if diemtotal < diemsell
    for i=0 to 6
        table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=ssBgColor)
        table.cell_set_text(TA_Display, 4, 0, "STRONG SELL")

if diemtotal > diembuy
    for i=0 to 6
        table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=sbBgColor)
        table.cell_set_text(TA_Display, 4, 0, "STRONG BUY")
if diemtotal <= diembuy and diemtotal >= diemsell
    for i=0 to 6
        table.cell(TA_Display, i, 0, text_color=color.white, text_size=txtSize, bgcolor=nBgColor)
        table.cell_set_text(TA_Display, 4, 0, "Hold")
    


// bang du lieu

table.cell(TA_Display, 0, 1, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 1, 1, "Tieu chi 1", text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 2, 1, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 0, 2, tostring(diemTAhelp*hesotahelp), text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 1, 2, tostring((SuperTrend_green+SuperTrend_red)*hesosuppertrendpivot), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 2, 2, tostring((Algo_green+Algo_red)*hesorsx), text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 0, 3, "TA Help", text_color=color.red, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 1, 3, "SuperTrend", text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 2, 3, "Algo", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 3, 1, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 4, 1, "Tieu chi 2", text_color=color.white, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 5, 1, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 3, 2, tostring((RSX_green+RSX_red)*hesorsx), text_color=color.red, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 4, 2, tostring(MACD_green*hesoMACD), text_color=color.gray, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 5, 2, tostring((fearsig+greedsig)*hesofeargreed), text_color=color.green, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 3, 3, "RSX", text_color=color.red, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 4, 3, "MACD", text_color=color.gray, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 5, 3, "FEAR-GREED", text_color=color.green, text_size=txtSize, bgcolor=oscBgColor)
table.cell(TA_Display, 6, 1, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 6, 1, "Total", text_color=color.white, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 6, 2, tostring(diemtotal), text_color=color.gray, text_size=txtSize, bgcolor=pivBgColor)
table.cell(TA_Display, 6, 3, "Diem Total", text_color=color.green, text_size=txtSize, bgcolor=pivBgColor)

//alertcondition(diemtotal < diemsell and barstate.isrealtime, 'Buy Short ALL')
//alertcondition(diemtotal > diembuy and barstate.isrealtime, 'Buy Long ALL')
short = (diemtotal < diemsell)
long = (diemtotal > diembuy)

strategy.entry("Long", strategy.long, when=long, alert_message = lenhbuy)
strategy.entry("Short", strategy.short, when=short, alert_message = lenhsell)
strategy.close("Long", when = short)  
strategy.close("Short", when = long) 