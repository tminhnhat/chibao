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


//bat dau code wumanchu cip b
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
//ket thuc code wumanchu cip b

//bat dau code peucse
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
			
//ket thuc code pearuse
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