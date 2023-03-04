// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © SoftKill21
// © despotak

//@version=4


study(title="Custom chi bao-backtest them chi bao", max_bars_back = 2000, overlay=false)

tick = syminfo.tickerid
res = input(title="Resolution", type=input.resolution, defval="", tooltip="Select the resolution you want to track.")
source = security(tick,res,close)

hesoalgo=input(title="He so Algo", defval=1)
hesorsx=input(title="He so RSX", defval=1)
hesosuppertrendpivot=input(title="He so SuperTrend Pivot", defval=1)
hesoMACD=input(title="He so MACD", defval=1)
hesofeargreed=input(title="He so Fear Greed", defval=1)
hesotahelp=input(title="He so TA Help", defval=1)
hesovumanchu=input(title="He so Vumanchu", defval=1)
hesophankymuti=input(title="He so Phan Ky Muti", defval=1)
hesophankyppo=input(title="He so Phan Ky PPO", defval=1)
hesohotrokhangcu1=input(title="He so Support Resistance - Dynamic v2", defval=1)
hesohotrokhangcu2=input(title="He so Volume-based Support & Resistance Zones V2", defval=1)
hesopivotdaochieu = input(title="He so pivot dao chieu", defval=1)
diembuy=input(title="Diem buy", defval=2)
diemsell=input(title="Diem Sell", defval=-2)

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

//bat dau vumanchu B
// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © vumanchu




//  Thanks to dynausmaux for the code
//  Thanks to falconCoin for https://www.tradingview.com/script/KVfgBvDd-Market-Cipher-B-Free-version-with-Buy-and-sell/ inspired me to start this.
//  Thanks to LazyBear for WaveTrend Oscillator https://www.tradingview.com/script/2KE8wTuF-Indicator-WaveTrend-Oscillator-WT/
//  Thanks to RicardoSantos for https://www.tradingview.com/script/3oeDh0Yq-RS-Price-Divergence-Detector-V2/
//  Thanks to LucemAnb for Plain Stochastic Divergence https://www.tradingview.com/script/FCUgF8ag-Plain-Stochastic-Divergence/
//  Thanks to andreholanda73 for MFI+RSI Area https://www.tradingview.com/script/UlGZzUAr/
//  I especially want to thank TradingView for its platform that facilitates development and learning.

//
//  CIRCLES & TRIANGLES:
//    - LITTLE CIRCLE: They appear at all WaveTrend wave crossings.
//    - GREEN CIRCLE: The wavetrend waves are at the oversold level and have crossed up (bullish).
//    - RED CIRCLE: The wavetrend waves are at the overbought level and have crossed down (bearish).
//    - GOLD/ORANGE CIRCLE: When RSI is below 20, WaveTrend waves are below or equal to -80 and have crossed up after good bullish divergence (DONT BUY WHEN GOLD CIRCLE APPEAR).
//    - None of these circles are certain signs to trade. It is only information that can help you. 
//    - PURPLE TRIANGLE: Appear when a bullish or bearish divergence is formed and WaveTrend waves crosses at overbought and oversold points.
//
//  NOTES:
//    - I am not an expert trader or know how to program pine script as such, in fact it is my first indicator only to study and all the code is copied and modified from other codes that are published in TradingView.
//    - I am very grateful to the entire TV community that publishes codes so that other newbies like me can learn and present their results. This is an attempt to imitate Market Cipher B. 
//    - Settings by default are for 4h timeframe, divergences are more stronger and accurate. Haven't tested in all timeframes, only 2h and 4h.
//    - If you get an interesting result in other timeframes I would be very grateful if you would comment your configuration to implement it or at least check it.
//
//  CONTRIBUTIONS:
//    - Tip/Idea: Add higher timeframe analysis for bearish/bullish patterns at the current timeframe.
//    + Bearish/Bullish FLAG:
//      - MFI+RSI Area are RED (Below 0).
//      - Wavetrend waves are above 0 and crosses down.
//      - VWAP Area are below 0 on higher timeframe.
//      - This pattern reversed becomes bullish.
//    - Tip/Idea: Check the last heikinashi candle from 2 higher timeframe
//    + Bearish/Bullish DIAMOND:
//      - HT Candle is red
//      - WT > 0 and crossed down


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
//ket chu code vumanchu b
//bat dau code phan ky Divergence for Many Indicators v4
// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © LonesomeTheBlue


prd = input(defval = 5, title = "Pivot Period", minval = 1, maxval = 50)
source = input(defval = "Close", title = "Source for Pivot Points", options = ["Close", "High/Low"])
searchdiv = input(defval = "Regular", title = "Divergence Type", options = ["Regular", "Hidden", "Regular/Hidden"])
showindis = input(defval = "Full", title = "Show Indicator Names", options = ["Full", "First Letter", "Don't Show"])
showlimit = input(1, title="Minimum Number of Divergence", minval = 1, maxval = 11)
maxpp = input(defval = 10, title = "Maximum Pivot Points to Check", minval = 1, maxval = 20)
maxbars = input(defval = 100, title = "Maximum Bars to Check", minval = 30, maxval = 200)
shownum = input(defval = true, title = "Show Divergence Number")
showlast = input(defval = false, title = "Show Only Last Divergence")
dontconfirm = input(defval = false, title = "Don't Wait for Confirmation")
showlines = input(defval = true, title = "Show Divergence Lines")
showpivot = input(defval = false, title = "Show Pivot Points")
calcmacd = input(defval = true, title = "MACD")
calcmacda = input(defval = true, title = "MACD Histogram")
calcrsi = input(defval = true, title = "RSI")
calcstoc = input(defval = true, title = "Stochastic")
calccci = input(defval = true, title = "CCI")
calcmom = input(defval = true, title = "Momentum")
calcobv = input(defval = true, title = "OBV")
calcvwmacd = input(true, title = "VWmacd")
calccmf = input(true, title = "Chaikin Money Flow")
calcmfi = input(true, title = "Money Flow Index")
calcext = input(false, title = "Check External Indicator")
externalindi = input(defval = close, title = "External Indicator")
pos_reg_div_col = input(defval = color.yellow, title = "Positive Regular Divergence")
neg_reg_div_col = input(defval = color.navy, title = "Negative Regular Divergence")
pos_hid_div_col = input(defval = color.lime, title = "Positive Hidden Divergence")
neg_hid_div_col = input(defval = color.red, title = "Negative Hidden Divergence")
pos_div_text_col = input(defval = color.black, title = "Positive Divergence Text Color")
neg_div_text_col = input(defval = color.white, title = "Negative Divergence Text Color")
reg_div_l_style_ = input(defval = "Solid", title = "Regular Divergence Line Style", options = ["Solid", "Dashed", "Dotted"])
hid_div_l_style_ = input(defval = "Dashed", title = "Hdden Divergence Line Style", options = ["Solid", "Dashed", "Dotted"])
reg_div_l_width = input(defval = 2, title = "Regular Divergence Line Width", minval = 1, maxval = 5)
hid_div_l_width = input(defval = 1, title = "Hidden Divergence Line Width", minval = 1, maxval = 5)
showmas = input(defval = false, title = "Show MAs 50 & 200", inline = "ma12")
cma1col = input(defval = color.lime, title = "", inline = "ma12")
cma2col = input(defval = color.red, title = "", inline = "ma12")

plot(showmas ? sma(close, 50) : na, color = showmas ? cma1col : na)
plot(showmas ? sma(close, 200) : na, color = showmas ? cma2col: na)

// set line styles
var reg_div_l_style = reg_div_l_style_ == "Solid" ? line.style_solid : 
                       reg_div_l_style_ == "Dashed" ? line.style_dashed :
                       line.style_dotted
var hid_div_l_style = hid_div_l_style_ == "Solid" ? line.style_solid : 
                       hid_div_l_style_ == "Dashed" ? line.style_dashed :
                       line.style_dotted


// get indicators
rsi = rsi(close, 14) // RSI
[macd, signal, deltamacd] = macd(close, 12, 26, 9) // MACD
moment = mom(close, 10) // Momentum
cci = cci(close, 10) // CCI
Obv = obv // OBV
stk = sma(stoch(close, high, low, 14), 3) // Stoch
maFast = vwma(close, 12), maSlow = vwma(close, 26), vwmacd = maFast - maSlow // volume weighted macd
Cmfm = ((close-low) - (high-close)) / (high - low), Cmfv = Cmfm * volume, cmf = sma(Cmfv, 21) / sma(volume,21) // Chaikin money flow
Mfi = mfi(close, 14) // Moneyt Flow Index

// keep indicators names and colors in arrays
var indicators_name = array.new_string(11)
var div_colors = array.new_color(4)
if barstate.isfirst
    // names
    array.set(indicators_name, 0, showindis == "Full" ? "MACD" : "M")
    array.set(indicators_name, 1, showindis == "Full" ? "Hist" : "H")
    array.set(indicators_name, 2, showindis == "Full" ? "RSI" : "E")
    array.set(indicators_name, 3, showindis == "Full" ? "Stoch" : "S")
    array.set(indicators_name, 4, showindis == "Full" ? "CCI" : "C")
    array.set(indicators_name, 5, showindis == "Full" ? "MOM" : "M")
    array.set(indicators_name, 6, showindis == "Full" ? "OBV" : "O")
    array.set(indicators_name, 7, showindis == "Full" ? "VWMACD" : "V")
    array.set(indicators_name, 8, showindis == "Full" ? "CMF" : "C")
    array.set(indicators_name, 9, showindis == "Full" ? "MFI" : "M")
    array.set(indicators_name,10, showindis == "Full" ? "Extrn" : "X")
    //colors
    array.set(div_colors, 0, pos_reg_div_col)
    array.set(div_colors, 1, neg_reg_div_col)
    array.set(div_colors, 2, pos_hid_div_col)
    array.set(div_colors, 3, neg_hid_div_col)

// Check if we get new Pivot High Or Pivot Low
float ph = pivothigh((source == "Close" ? close : high), prd, prd)
float pl = pivotlow((source == "Close" ? close : low), prd, prd)
plotshape(ph and showpivot, text = "H",  style = shape.labeldown, color = color.new(color.white, 100), textcolor = color.red, location = location.abovebar, offset = -prd)
plotshape(pl and showpivot, text = "L",  style = shape.labelup, color = color.new(color.white, 100), textcolor = color.lime, location = location.belowbar, offset = -prd)

// keep values and positions of Pivot Highs/Lows in the arrays
var int maxarraysize = 20
var ph_positions = array.new_int(maxarraysize, 0)
var pl_positions = array.new_int(maxarraysize, 0)
var ph_vals = array.new_float(maxarraysize, 0.)
var pl_vals = array.new_float(maxarraysize, 0.)

// add PHs to the array
if ph
    array.unshift(ph_positions, bar_index)
    array.unshift(ph_vals, ph)
    if array.size(ph_positions) > maxarraysize
        array.pop(ph_positions)
        array.pop(ph_vals)

// add PLs to the array
if pl
    array.unshift(pl_positions, bar_index)
    array.unshift(pl_vals, pl)
    if array.size(pl_positions) > maxarraysize
        array.pop(pl_positions)
        array.pop(pl_vals)

// functions to check Regular Divergences and Hidden Divergences

// function to check positive regular or negative hidden divergence
// cond == 1 => positive_regular, cond == 2=> negative_hidden
positive_regular_positive_hidden_divergence(src, cond)=>
    divlen = 0
    prsc = source == "Close" ? close : low
    // if indicators higher than last value and close price is higher than las close 
    if dontconfirm or src > src[1] or close > close[1]
        startpoint = dontconfirm ? 0 : 1 // don't check last candle
        // we search last 15 PPs
        for x = 0 to maxpp - 1
            len = bar_index - array.get(pl_positions, x) + prd
            // if we reach non valued array element or arrived 101. or previous bars then we don't search more
            if array.get(pl_positions, x) == 0 or len > maxbars
                break
            if len > 5 and 
               ((cond == 1 and src[startpoint] > src[len] and prsc[startpoint] < nz(array.get(pl_vals, x))) or
               (cond == 2 and src[startpoint] < src[len] and prsc[startpoint] > nz(array.get(pl_vals, x))))
                slope1 = (src[startpoint] - src[len]) / (len - startpoint)
                virtual_line1 = src[startpoint] - slope1
                slope2 = (close[startpoint] - close[len]) / (len - startpoint)
                virtual_line2 = close[startpoint] - slope2
                arrived = true
                for y = 1 + startpoint to len - 1
                    if src[y] < virtual_line1 or nz(close[y]) < virtual_line2
                        arrived := false
                        break
                    virtual_line1 := virtual_line1 - slope1
                    virtual_line2 := virtual_line2 - slope2
                
                if arrived
                    divlen := len
                    break
    divlen

// function to check negative regular or positive hidden divergence
// cond == 1 => negative_regular, cond == 2=> positive_hidden
negative_regular_negative_hidden_divergence(src, cond)=>
    divlen = 0
    prsc = source == "Close" ? close : high
    // if indicators higher than last value and close price is higher than las close 
    if dontconfirm or src < src[1] or close < close[1]
        startpoint = dontconfirm ? 0 : 1 // don't check last candle
        // we search last 15 PPs
        for x = 0 to maxpp - 1
            len = bar_index - array.get(ph_positions, x) + prd
            // if we reach non valued array element or arrived 101. or previous bars then we don't search more
            if array.get(ph_positions, x) == 0 or len > maxbars
                break
            if len > 5 and 
               ((cond == 1 and src[startpoint] < src[len] and prsc[startpoint] > nz(array.get(ph_vals, x))) or 
               (cond == 2 and src[startpoint] > src[len] and prsc[startpoint] < nz(array.get(ph_vals, x))))
                slope1 = (src[startpoint] - src[len]) / (len - startpoint)
                virtual_line1 = src[startpoint] - slope1
                slope2 = (close[startpoint] - nz(close[len])) / (len - startpoint)
                virtual_line2 = close[startpoint] - slope2
                arrived = true
                for y = 1 + startpoint to len - 1
                    if src[y] > virtual_line1 or nz(close[y]) > virtual_line2
                        arrived := false
                        break
                    virtual_line1 := virtual_line1 - slope1
                    virtual_line2 := virtual_line2 - slope2
                
                if arrived
                    divlen := len
                    break
    divlen

// calculate 4 types of divergence if enabled in the options and return divergences in an array
calculate_divs(cond, indicator)=>
    divs = array.new_int(4, 0)
    array.set(divs, 0, cond and (searchdiv == "Regular" or searchdiv == "Regular/Hidden") ? positive_regular_positive_hidden_divergence(indicator, 1) : 0)
    array.set(divs, 1, cond and (searchdiv == "Regular" or searchdiv == "Regular/Hidden") ? negative_regular_negative_hidden_divergence(indicator, 1) : 0)
    array.set(divs, 2, cond and (searchdiv == "Hidden" or searchdiv == "Regular/Hidden")  ? positive_regular_positive_hidden_divergence(indicator, 2) : 0)
    array.set(divs, 3, cond and (searchdiv == "Hidden" or searchdiv == "Regular/Hidden")  ? negative_regular_negative_hidden_divergence(indicator, 2) : 0)
    divs

// array to keep all divergences
var all_divergences = array.new_int(44) // 11 indicators * 4 divergence = 44 elements
// set related array elements
array_set_divs(div_pointer, index)=>
    for x = 0 to 3
        array.set(all_divergences, index * 4 + x, array.get(div_pointer, x))

// set divergences array 
array_set_divs(calculate_divs(calcmacd, macd), 0)
array_set_divs(calculate_divs(calcmacda, deltamacd), 1)
array_set_divs(calculate_divs(calcrsi, rsi), 2)
array_set_divs(calculate_divs(calcstoc, stk), 3)
array_set_divs(calculate_divs(calccci, cci), 4)
array_set_divs(calculate_divs(calcmom, moment), 5)
array_set_divs(calculate_divs(calcobv, Obv), 6)
array_set_divs(calculate_divs(calcvwmacd, vwmacd), 7)
array_set_divs(calculate_divs(calccmf, cmf), 8)
array_set_divs(calculate_divs(calcmfi, Mfi), 9)
array_set_divs(calculate_divs(calcext, externalindi), 10)

// check minimum number of divergence, if less than showlimit then delete all divergence
total_div = 0
for x = 0 to array.size(all_divergences) - 1
    total_div := total_div + round(sign(array.get(all_divergences, x)))

if total_div < showlimit
    array.fill(all_divergences, 0)

// keep line in an array
var pos_div_lines = array.new_line(0)
var neg_div_lines = array.new_line(0)
var pos_div_labels = array.new_label(0)
var neg_div_labels = array.new_label(0) 

// remove old lines and labels if showlast option is enabled
delete_old_pos_div_lines()=>
    if array.size(pos_div_lines) > 0    
        for j = 0 to array.size(pos_div_lines) - 1 
            line.delete(array.get(pos_div_lines, j))
        array.clear(pos_div_lines)

delete_old_neg_div_lines()=>
    if array.size(neg_div_lines) > 0    
        for j = 0 to array.size(neg_div_lines) - 1 
            line.delete(array.get(neg_div_lines, j))
        array.clear(neg_div_lines)

delete_old_pos_div_labels()=>
    if array.size(pos_div_labels) > 0 
        for j = 0 to array.size(pos_div_labels) - 1 
            label.delete(array.get(pos_div_labels, j))
        array.clear(pos_div_labels)

delete_old_neg_div_labels()=>
    if array.size(neg_div_labels) > 0    
        for j = 0 to array.size(neg_div_labels) - 1 
            label.delete(array.get(neg_div_labels, j))
        array.clear(neg_div_labels)

// delete last creted lines and labels until we met new PH/PV 
delete_last_pos_div_lines_label(n)=>
    if n > 0 and array.size(pos_div_lines) >= n    
        asz = array.size(pos_div_lines)
        for j = 1 to n
            line.delete(array.get(pos_div_lines, asz - j))
            array.pop(pos_div_lines)
        if array.size(pos_div_labels) > 0  
            label.delete(array.get(pos_div_labels, array.size(pos_div_labels) - 1))
            array.pop(pos_div_labels)

delete_last_neg_div_lines_label(n)=>
    if n > 0 and array.size(neg_div_lines) >= n    
        asz = array.size(neg_div_lines)
        for j = 1 to n
            line.delete(array.get(neg_div_lines, asz - j))
            array.pop(neg_div_lines)
        if array.size(neg_div_labels) > 0  
            label.delete(array.get(neg_div_labels, array.size(neg_div_labels) - 1))
            array.pop(neg_div_labels)
            
// variables for Alerts
pos_reg_div_detected = false
neg_reg_div_detected = false
pos_hid_div_detected = false
neg_hid_div_detected = false

// to remove lines/labels until we met new // PH/PL
var last_pos_div_lines = 0
var last_neg_div_lines = 0
var remove_last_pos_divs = false 
var remove_last_neg_divs = false
if pl
    remove_last_pos_divs := false
    last_pos_div_lines := 0
if ph
    remove_last_neg_divs := false
    last_neg_div_lines := 0

// draw divergences lines and labels
divergence_text_top = ""
divergence_text_bottom = ""
distances = array.new_int(0)
dnumdiv_top = 0
dnumdiv_bottom = 0
top_label_col = color.white
bottom_label_col = color.white
old_pos_divs_can_be_removed = true
old_neg_divs_can_be_removed = true
startpoint = dontconfirm ? 0 : 1 // used for don't confirm option

for x = 0 to 10
    div_type = -1
    for y = 0 to 3
        if array.get(all_divergences, x * 4 + y) > 0 // any divergence?
            div_type := y
            if (y % 2) == 1 
                dnumdiv_top := dnumdiv_top + 1
                top_label_col := array.get(div_colors, y)
            if (y % 2) == 0
                dnumdiv_bottom := dnumdiv_bottom + 1
                bottom_label_col := array.get(div_colors, y)
            if not array.includes(distances, array.get(all_divergences, x * 4 + y))  // line not exist ?
                array.push(distances, array.get(all_divergences, x * 4 + y))
                new_line = showlines ? line.new(x1 = bar_index - array.get(all_divergences, x * 4 + y), 
                          y1 = (source == "Close" ? close[array.get(all_divergences, x * 4 + y)] : 
                                           (y % 2) == 0 ? low[array.get(all_divergences, x * 4 + y)] : 
                                                          high[array.get(all_divergences, x * 4 + y)]),
                          x2 = bar_index - startpoint,
                          y2 = (source == "Close" ? close[startpoint] : 
                                           (y % 2) == 0 ? low[startpoint] : 
                                                          high[startpoint]),
                          color = array.get(div_colors, y),
                          style = y < 2 ? reg_div_l_style : hid_div_l_style,
                          width = y < 2 ? reg_div_l_width : hid_div_l_width
                          )
                          : na
                if (y % 2) == 0
                    if old_pos_divs_can_be_removed
                        old_pos_divs_can_be_removed := false
                        if not showlast and remove_last_pos_divs
                            delete_last_pos_div_lines_label(last_pos_div_lines)
                            last_pos_div_lines := 0
                        if showlast
                            delete_old_pos_div_lines()
                    array.push(pos_div_lines, new_line)
                    last_pos_div_lines := last_pos_div_lines + 1
                    remove_last_pos_divs := true
                    
                if (y % 2) == 1
                    if old_neg_divs_can_be_removed
                        old_neg_divs_can_be_removed := false
                        if not showlast and remove_last_neg_divs
                            delete_last_neg_div_lines_label(last_neg_div_lines)
                            last_neg_div_lines := 0
                        if showlast
                            delete_old_neg_div_lines()
                    array.push(neg_div_lines, new_line)
                    last_neg_div_lines := last_neg_div_lines + 1
                    remove_last_neg_divs := true
                    
            // set variables for alerts
            if y == 0
                pos_reg_div_detected := true
            if y == 1
                neg_reg_div_detected := true
            if y == 2
                pos_hid_div_detected := true
            if y == 3
                neg_hid_div_detected := true
    // get text for labels
    if div_type >= 0
        divergence_text_top    := divergence_text_top    + ((div_type % 2) == 1 ? (showindis != "Don't Show" ? array.get(indicators_name, x) + "\n" : "") : "")
        divergence_text_bottom := divergence_text_bottom + ((div_type % 2) == 0 ? (showindis != "Don't Show" ? array.get(indicators_name, x) + "\n" : "") : "")


// draw labels
if showindis != "Don't Show" or shownum
    if shownum and dnumdiv_top > 0
        divergence_text_top := divergence_text_top + tostring(dnumdiv_top)
    if shownum and dnumdiv_bottom > 0
        divergence_text_bottom := divergence_text_bottom + tostring(dnumdiv_bottom)
    if divergence_text_top != ""
        if showlast
            delete_old_neg_div_labels()
        array.push(neg_div_labels, 
                      label.new( x = bar_index, 
                                 y = max(high, high[1]), 
                                 text = divergence_text_top,
                                 color = top_label_col,
                                 textcolor = neg_div_text_col,
                                 style = label.style_label_down
                                 ))
                                 
    if divergence_text_bottom != ""
        if showlast
            delete_old_pos_div_labels()
        array.push(pos_div_labels, 
                      label.new( x = bar_index, 
                                 y = min(low, low[1]), 
                                 text = divergence_text_bottom,
                                 color = bottom_label_col, 
                                 textcolor = pos_div_text_col,
                                 style = label.style_label_up
                                 ))
                                 
    
alertcondition(pos_reg_div_detected, title='Positive Regular Divergence Detected', message='Positive Regular Divergence Detected')
alertcondition(neg_reg_div_detected, title='Negative Regular Divergence Detected', message='Negative Regular Divergence Detected')
alertcondition(pos_hid_div_detected, title='Positive Hidden Divergence Detected', message='Positive Hidden Divergence Detected')
alertcondition(neg_hid_div_detected, title='Negative Hidden Divergence Detected', message='Negative Hidden Divergence Detected')

alertcondition(pos_reg_div_detected or pos_hid_div_detected, title='Positive Divergence Detected', message='Positive Divergence Detected')
alertcondition(neg_reg_div_detected or neg_hid_div_detected, title='Negative Divergence Detected', message='Negative Divergence Detected')
//ket thuc code phan ky

//bat dau code phan ky PPO Divergence Alerts 3.0


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

plotshape(topbots and beardiv ? d : na, text='', style=shape.triangledown, location=location.abovebar, color=color.new(color.red, 80), offset=0, size=size.tiny, title="PPO Top")
plotshape(topbots and bulldiv ? d : na, text='', style=shape.triangleup, location=location.belowbar, color=color.new(color.green, 80), offset=0, size=size.tiny, title="PPO Bottom")

plotshape((d >= 1 or d < -0.25) and topbots and beardiv ? d : na, text='', style=shape.triangledown, location=location.abovebar, color=color.red, offset=0, size=size.tiny, title="PPO Top (with Filters)")
plotshape((d <= -1 or d > 0.25) and topbots and bulldiv ? d : na, text='', style=shape.triangleup, location=location.belowbar, color=color.green, offset=0, size=size.tiny, title="PPO Bottom (with Filters)")

alertcondition(bearish, title="Bear Divergence", message="PPO Bear Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bullish, title="Bull Divergence", message="PPO Bull Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(ltbearish, title="Long Term Bear Divergence", message="PPO Long Term Bear Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(ltbullish, title="Long Term Bull Divergence", message="PPO Long Term Bull Divergence: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(beardiv, title="PPO Top", message="PPO Top: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bulldiv, title="PPO Bottom", message="PPO Bottom: {{exchange}}:{{ticker}} {{interval}}")
alertcondition(bearish or bullish or ltbearish or ltbullish or beardiv or bulldiv, title="Any PPO Signal", message="PPO Signal: {{exchange}}:{{ticker}} {{interval}}")
//ket thuc code phan ky 2

//bat dau code ho tro khang cu Support Resistance - Dynamic v2

// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © LonesomeTheBlue

prd = input(defval = 10, title="Pivot Period", minval = 4, maxval = 30, group = "Setup")
ppsrc = input(defval = 'High/Low', title="Source", options = ['High/Low', 'Close/Open'], group = "Setup")
maxnumpp = input(defval = 20, title =" Maximum Number of Pivot", minval = 5, maxval = 100, group = "Setup")
ChannelW = input(defval = 10, title = "Maximum Channel Width %", minval = 1, group = "Setup")
maxnumsr = input(defval = 5, title =" Maximum Number of S/R", minval = 1, maxval = 10, group = "Setup")
min_strength = input(defval = 2, title =" Minimum Strength", minval = 1, maxval = 10, group = "Setup")
labelloc = input(defval = 20, title = "Label Location", group = "Colors", tooltip = "Positive numbers reference future bars, negative numbers reference histical bars")
linestyle = input(defval = 'Dashed', title = "Line Style", options = ['Solid', 'Dotted', 'Dashed'], group = "Colors")
linewidth = input(defval = 2, title = "Line Width", minval = 1, maxval = 4, group = "Colors")
resistancecolor = input(defval = color.red, title = "Resistance Color", type = input.color, group = "Colors")
supportcolor = input(defval = color.lime, title = "Support Color", type = input.color, group = "Colors")
showpp = input(false, title = "Show Point Points")

float src1 =  ppsrc == 'High/Low' ? high : max(close, open)
float src2 =  ppsrc == 'High/Low' ? low: min(close, open)
float ph = pivothigh(src1, prd, prd)
float pl = pivotlow(src2, prd, prd)

plotshape(ph and showpp, text = "H",  style = shape.labeldown, color = na, textcolor = color.red, location = location.abovebar,  offset = -prd)
plotshape(pl and showpp, text = "L",  style = shape.labelup, color = na, textcolor = color.lime, location = location.belowbar,  offset = -prd)

Lstyle = linestyle == 'Dashed' ? line.style_dashed :
         linestyle == 'Solid' ? line.style_solid :
         line.style_dotted
                 
//calculate maximum S/R channel zone width
prdhighest =  highest(300)
prdlowest = lowest(300)
cwidth = (prdhighest - prdlowest) * ChannelW / 100

var pivotvals= array.new_float(0)

if ph or pl
    array.unshift(pivotvals, ph ? ph : pl)
    if array.size(pivotvals) > maxnumpp // limit the array size
        array.pop(pivotvals)

get_sr_vals(ind)=>
    float lo = array.get(pivotvals, ind)
    float hi = lo
    int numpp = 0
    for y = 0 to array.size(pivotvals) - 1
        float cpp = array.get(pivotvals, y)
        float wdth = cpp <= lo ? hi - cpp : cpp - lo
        if wdth <= cwidth // fits the max channel width?
            lo := cpp <= lo ? cpp : lo
            hi := cpp > lo ? cpp : hi
            numpp += 1
    [hi, lo, numpp]  

var sr_up_level = array.new_float(0)
var sr_dn_level = array.new_float(0)
sr_strength = array.new_float(0)

find_loc(strength)=>
    ret = array.size(sr_strength)
    for i = (ret > 0 ? array.size(sr_strength) - 1 : na) to 0
        if strength <= array.get(sr_strength, i)
            break
        ret := i
    ret

check_sr(hi, lo, strength)=>
    ret = true
    for i = 0 to (array.size(sr_up_level) > 0 ? array.size(sr_up_level) - 1 : na)
        //included?
        if array.get(sr_up_level, i) >= lo and array.get(sr_up_level, i) <= hi  or 
           array.get(sr_dn_level, i) >= lo and array.get(sr_dn_level, i) <= hi
            if strength >= array.get(sr_strength, i)
                array.remove(sr_strength, i)
                array.remove(sr_up_level, i)
                array.remove(sr_dn_level, i)
                ret
            else
                ret := false
            break
    ret

var sr_lines = array.new_line(11, na)
var sr_labels = array.new_label(11, na)

for x = 1 to 10
    rate = 100 * (label.get_y(array.get(sr_labels, x)) - close) / close
    label.set_text(array.get(sr_labels, x), text = tostring(label.get_y(array.get(sr_labels, x))) + "(" + tostring(rate,'#.##') + "%)")
    label.set_x(array.get(sr_labels, x), x = bar_index + labelloc)
    label.set_color(array.get(sr_labels, x), color = label.get_y(array.get(sr_labels, x)) >= close ? color.red : color.lime)
    label.set_textcolor(array.get(sr_labels, x), textcolor = label.get_y(array.get(sr_labels, x)) >= close ? color.white : color.black)
    label.set_style(array.get(sr_labels, x), style = label.get_y(array.get(sr_labels, x)) >= close ? label.style_labeldown : label.style_labelup)
    line.set_color(array.get(sr_lines, x), color = line.get_y1(array.get(sr_lines, x)) >= close ? resistancecolor : supportcolor) 

if ph or pl
    //because of new calculation, remove old S/R levels
    array.clear(sr_up_level)
    array.clear(sr_dn_level)
    array.clear(sr_strength)
    //find S/R zones
    for x = 0 to array.size(pivotvals) - 1
        [hi, lo, strength] = get_sr_vals(x)
        if check_sr(hi, lo, strength)
            loc = find_loc(strength)
            // if strength is in first maxnumsr sr then insert it to the arrays 
            if loc < maxnumsr and strength >= min_strength
                array.insert(sr_strength, loc, strength)
                array.insert(sr_up_level, loc, hi)
                array.insert(sr_dn_level, loc, lo)
                // keep size of the arrays = 5
                if array.size(sr_strength) > maxnumsr
                    array.pop(sr_strength)
                    array.pop(sr_up_level)
                    array.pop(sr_dn_level)
    
    for x = 1 to 10
        line.delete(array.get(sr_lines, x))
        label.delete(array.get(sr_labels, x))
       
    for x = 0 to (array.size(sr_up_level) > 0 ? array.size(sr_up_level) - 1 : na)
        float mid = round_to_mintick((array.get(sr_up_level, x) + array.get(sr_dn_level, x)) / 2)
        rate = 100 * (mid - close) / close
        array.set(sr_labels, x + 1, 
          label.new( x = bar_index + labelloc, 
                     y = mid, text = tostring(mid) + "(" + tostring(rate,'#.##') + "%)", 
                     color = mid >= close ? color.red : color.lime,
                     textcolor = mid >= close ? color.white : color.black, 
                     style = mid >= close ? label.style_labeldown : label.style_labelup))
                     
        array.set(sr_lines, x + 1, 
                  line.new(x1 = bar_index, y1 = mid, x2 = bar_index - 1, y2 = mid, 
                  extend = extend.both,
                  color = mid >= close ? resistancecolor : supportcolor, 
                  style = Lstyle, 
                  width = linewidth))

f_crossed_over()=>
    ret = false
    for x = 0 to (array.size(sr_up_level) > 0 ? array.size(sr_up_level) - 1 : na)
        float mid = round_to_mintick((array.get(sr_up_level, x) + array.get(sr_dn_level, x)) / 2)
        if close[1] <= mid and close > mid
            ret := true
    ret

f_crossed_under()=>
    ret = false
    for x = 0 to (array.size(sr_up_level) > 0 ? array.size(sr_up_level) - 1 : na)
        float mid = round_to_mintick((array.get(sr_up_level, x) + array.get(sr_dn_level, x)) / 2)
        if close[1] >= mid and close < mid
            ret := true
    ret

alertcondition(f_crossed_over(), title='Resistance Broken', message='Resistance Broken')
alertcondition(f_crossed_under(), title='Support Broken', message='Support Broken')
//ket thuc ho tro khang cu
//bat dau Volume-based Support & Resistance Zones V2
//@version=5
// Original script is thanks to synapticex and additional modifications is thanks to Lij_MC. Credit to both of them for most of the logic behind this script. Since then I have made many changes to this script as noted below.
// Changed default S/R lines from plots to lines, and gave option to user to change between solid line, dashed line, or dotted line for both S/R lines.
// Added additional time frame and gave more TF options for TF1 other than current TF. Now you will have 4 time frames to plot S/R zones from.
// Gave user option to easily change line thickness for all S/R lines.
// Made it easier to change colors of S/R lines and zones by consolidating the options under settings (rather than under style).
// Added extensions to active SR Zones to extend all the way right. 
// Added option to extend or not extend the previous S/R zones up to next S/R zone.
// Added optional time frame labels to active S/R zones, with left and right options as well as option to adjust how far to the right label is set.
// Fixed issue where the higher time frame S/R zone was not properly starting from the high/low of fractal. Now any higher time frame S/R will begin exactly at the High/Low points.
// Added to script a function that will prevent S/R zones from lower time frames displaying while on a higher time frame. This helps clean up the chart quite a bit.
// Created arrays for each time frame's lines and labels so that the number of S/R zones can be controlled for each time frame and limit memory consumption.
// New alert options added and customized alert messages.

indicator('Volume-based Support & Resistance Zones V2', shorttitle='Vol S/R Zones V2', overlay=true, max_bars_back=4999, max_lines_count=500, max_labels_count=10)

// Inputs
ExtendLines1 = input.bool(title='Extend all S/R Zones to Next Zone', defval=true, inline='extline', group='*** General Settings ***')
ext_active = input.bool(title='Extend active S/R Zones to Right', defval=true, inline='extline', group='*** General Settings ***')
ShowLabel = input.bool(title='Show Time Frame Label?', defval=true, group='*** General Settings ***')
label_loc = input.string(title='Label Location', defval='Right', options=['Left', 'Right'], inline='1', group='*** General Settings ***')
label_offset = input.int(title='  Right Label Offset', defval=15, inline='1', tooltip='Adjust how far to the right you\'d like the time frame label to appear.', group='*** General Settings ***')
show_HL = input.bool(title='Show High/Low Line     ', defval=true, inline='1b', group='*** General Settings ***')
show_close = input.bool(title='Show Open/Close Line', defval=true, inline='1b', group='*** General Settings ***')
LineStyleHLInput = input.string(title='Line Style (H/L)', defval='Solid', options=['Solid', 'Dotted', 'Dashed'], inline='2', group='*** General Settings ***')
LineWidthHLInput = input.int(title='  Line Width (H/L)', defval=1, inline='2', group='*** General Settings ***')
LineStyleCloseInput = input.string(title='Line Style (O/C)', defval='Solid', options=['Solid', 'Dotted', 'Dashed'], inline='3', group='*** General Settings ***')
LineWidthCloseInput = input.int(title='  Line Width (O/C)', defval=1, inline='3', group='*** General Settings ***')

var string LineStyleHL = na

LineStyleHL := if LineStyleHLInput == 'Solid'
    line.style_solid
else if LineStyleHLInput == 'Dotted'
    line.style_dotted
else if LineStyleHLInput == 'Dashed'
    line.style_dashed

var string LineStyleClose = na

LineStyleClose := if LineStyleCloseInput == 'Solid'
    line.style_solid
else if LineStyleCloseInput == 'Dotted'
    line.style_dotted
else if LineStyleCloseInput == 'Dashed'
    line.style_dashed

// Time Frame 1 = TF1
TF1_Menu = input.string(title='Display Lines Only, With Zones, or Disable     ', defval='S/R Zones', options=['S/R', 'S/R Zones', 'Disable'], group='*** Time Frame 1 ***')
TF1_input = input.string(title='Time Frame 1', defval='Chart', options=['Chart', '3m', '5m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', 'D', '3D', 'W', '2W', '1M'], group='*** Time Frame 1 ***')
TF1_VolMA1Input = input.int(title='Volume MA - Threshold', defval=6, group='*** Time Frame 1 ***')
TF1_NumZones = input.int(title='Number of Zones Back', defval=30, minval=1, maxval=100, group='*** Time Frame 1 ***',
 tooltip='Change how many zones back you would like on the chart for time frame 1 (this number applies to both # of support zones and # of resistance zones back). Be mindful of setting too high with other zones, as the maximum total lines allowed on the chart is 500.')
TF1_extRight = input.bool(title='Extend S/R Zones to Right', defval=false, group='*** Time Frame 1 ***')
TF1_ResLinesColor = input.color(color.new(color.red, 20), 'Resistance Lines Color', inline='1', group='*** Time Frame 1 ***')
TF1_ResZoneColor = input.color(color.new(color.red, 90), 'Resistance Zone Color', inline='2', group='*** Time Frame 1 ***')
TF1_SupLinesColor = input.color(color.new(color.lime, 20), '        Support Lines Color', inline='1', group='*** Time Frame 1 ***')
TF1_SupZoneColor = input.color(color.new(color.lime, 90), '         Support Zone Color', inline='2', group='*** Time Frame 1 ***')
TF1_Alerts = input.string(title='Alerts', defval='None', 
  options=['None', 'Price Enters Resistance Zone', 'Price Enters Support Zone', 'Price Enters Either S/R Zone', 'Price Breaks Up Resistance', 'Price Breaks Down Support', 'Price Breaks Either S/R', 'New S/R Zone Found', 'All Alerts On'], 
  tooltip='Select the type of alert you would like, then save settings. On chart, right click on SR indicator and click \'Add Alert\' then save. If you would like to change the alert, delete existing alert, change alert settings on indicator, then create new alert', 
  group='*** Time Frame 1 ***')

// Time Frame 2 = TF2
TF2_Menu = input.string(title='Display Lines Only, With Zones, or Disable     ', defval='S/R Zones', options=['S/R', 'S/R Zones', 'Disable'], group='*** Time Frame 2 ***')
TF2_input = input.string(title='Time Frame 2', defval='4h', options=['3m', '5m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', 'D', '3D', 'W', '2W', '1M'], group='*** Time Frame 2 ***')
TF2_VolMA1Input = input.int(title='Volume MA - Threshold', defval=6, group='*** Time Frame 2 ***')
TF2_NumZones = input.int(title='Number of Zones Back', defval=30, minval=1, maxval=100, group='*** Time Frame 2 ***',
 tooltip='Change how many zones back you would like on the chart for time frame 2 (this number applies to both # of support zones and # of resistance zones back). Be mindful of setting too high with other zones, as the maximum total lines allowed on the chart is 500.')
TF2_extRight = input.bool(title='Extend S/R Zones to Right', defval=false, group='*** Time Frame 2 ***')
TF2_ResLinesColor = input.color(color.new(color.fuchsia, 20), 'Resistance Lines Color', inline='1', group='*** Time Frame 2 ***')
TF2_ResZoneColor = input.color(color.new(color.fuchsia, 90), 'Resistance Zone Color', inline='2', group='*** Time Frame 2 ***')
TF2_SupLinesColor = input.color(color.new(color.green, 20), '        Support Lines Color', inline='1', group='*** Time Frame 2 ***')
TF2_SupZoneColor = input.color(color.new(color.green, 90), '         Support Zone Color', inline='2', group='*** Time Frame 2 ***')
TF2_Alerts = input.string(title='Alerts', defval='None', 
  options=['None', 'Price Enters Resistance Zone', 'Price Enters Support Zone', 'Price Enters Either S/R Zone', 'Price Breaks Up Resistance', 'Price Breaks Down Support', 'Price Breaks Either S/R', 'New S/R Zone Found', 'All Alerts On'], 
  tooltip='Select the type of alert you would like, then save settings. On chart, right click on SR indicator and click \'Add Alert\' then save. If you would like to change the alert, delete existing alert, change alert settings on indicator, then create new alert', 
  group='*** Time Frame 2 ***')

// Time Frame 3 = TF3
TF3_Menu = input.string(title='Display Lines Only, With Zones, or Disable     ', defval='S/R Zones', options=['S/R', 'S/R Zones', 'Disable'], group='*** Time Frame 3 ***')
TF3_input = input.string(title='Time Frame 3', defval='D', options=['5m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', 'D', '3D', 'W', '2W', '1M'], group='*** Time Frame 3 ***')
TF3_VolMA1Input = input.int(title='Volume MA - Threshold', defval=6, group='*** Time Frame 3 ***')
TF3_NumZones = input.int(title='Number of Zones Back', defval=30, minval=1, maxval=100, group='*** Time Frame 3 ***',
 tooltip='Change how many zones back you would like on the chart for time frame 3 (this number applies to both # of support zones and # of resistance zones back). Be mindful of setting too high with other zones, as the maximum total lines allowed on the chart is 500.')
TF3_extRight = input.bool(title='Extend S/R Zones to Right', defval=false, group='*** Time Frame 3 ***')
TF3_ResLinesColor = input.color(color.new(color.orange, 20), 'Resistance Lines Color', inline='1', group='*** Time Frame 3 ***')
TF3_ResZoneColor = input.color(color.new(color.orange, 90), 'Resistance Zone Color', inline='2', group='*** Time Frame 3 ***')
TF3_SupLinesColor = input.color(color.new(color.blue, 20), '        Support Lines Color', inline='1', group='*** Time Frame 3 ***')
TF3_SupZoneColor = input.color(color.new(color.blue, 90), '         Support Zone Color', inline='2', group='*** Time Frame 3 ***')
TF3_Alerts = input.string(title='Alerts', defval='None', 
  options=['None', 'Price Enters Resistance Zone', 'Price Enters Support Zone', 'Price Enters Either S/R Zone', 'Price Breaks Up Resistance', 'Price Breaks Down Support', 'Price Breaks Either S/R', 'New S/R Zone Found', 'All Alerts On'], 
  tooltip='Select the type of alert you would like, then save settings. On chart, right click on SR indicator and click \'Add Alert\' then save. If you would like to change the alert, delete existing alert, change alert settings on indicator, then create new alert', 
  group='*** Time Frame 3 ***')

// Time Frame 4 = TF4
TF4_Menu = input.string(title='Display Lines Only, With Zones, or Disable     ', defval='S/R Zones', options=['S/R', 'S/R Zones', 'Disable'], group='*** Time Frame 4 ***')
TF4_input = input.string(title='Time Frame 4', defval='W', options=['5m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '6h', '8h', '12h', 'D', '3D', 'W', '2W', '1M'], group='*** Time Frame 4 ***')
TF4_VolMA1Input = input.int(title='Volume MA - Threshold', defval=6, group='*** Time Frame 4 ***')
TF4_NumZones = input.int(title='Number of Zones Back', defval=30, minval=1, maxval=100, group='*** Time Frame 4 ***',
 tooltip='Change how many zones back you would like on the chart for time frame 4 (this number applies to both # of support zones and # of resistance zones back). Be mindful of setting too high with other zones, as the maximum total lines allowed on the chart is 500.')
TF4_extRight = input.bool(title='Extend S/R Zones to Right', defval=false, group='*** Time Frame 4 ***')
TF4_ResLinesColor = input.color(color.new(color.maroon, 20), 'Resistance Lines Color', inline='1', group='*** Time Frame 4 ***')
TF4_ResZoneColor = input.color(color.new(color.maroon, 90), 'Resistance Zone Color', inline='2', group='*** Time Frame 4 ***')
TF4_SupLinesColor = input.color(color.new(color.teal, 20), '        Support Lines Color', inline='1', group='*** Time Frame 4 ***')
TF4_SupZoneColor = input.color(color.new(color.teal, 90), '         Support Zone Color', inline='2', group='*** Time Frame 4 ***')
TF4_Alerts = input.string(title='Alerts', defval='None', 
  options=['None', 'Price Enters Resistance Zone', 'Price Enters Support Zone', 'Price Enters Either S/R Zone', 'Price Breaks Up Resistance', 'Price Breaks Down Support', 'Price Breaks Either S/R', 'New S/R Zone Found', 'All Alerts On'],
  tooltip='Select the type of alert you would like, then save settings. On chart, right click on SR indicator and click \'Add Alert\' then save. If you would like to change the alert, delete existing alert, change alert settings on indicator, then create new alert', 
  group='*** Time Frame 4 ***')

f_TFx(_TF_input) =>
    if _TF_input == 'Chart'
        timeframe.period
    else if _TF_input == '3m'
        '3'
    else if _TF_input == '5m'
        '5'
    else if _TF_input == '15m'
        '15'
    else if _TF_input == '30m'
        '30'
    else if _TF_input == '45m'
        '45'
    else if _TF_input == '1h'
        '60'
    else if _TF_input == '2h'
        '120'
    else if _TF_input == '3h'
        '180'
    else if _TF_input == '4h'
        '240'
    else if _TF_input == '6h'
        '360'
    else if _TF_input == '8h'
        '480'
    else if _TF_input == '12h'
        '720'
    else if _TF_input == 'D'
        'D'
    else if _TF_input == '3D'
        '3D'
    else if _TF_input == 'W'
        'W'
    else if _TF_input == '2W'
        '2W'
    else if _TF_input == '1M'
        '1M'

TF1 = f_TFx(TF1_input)
TF2 = f_TFx(TF2_input)
TF3 = f_TFx(TF3_input)
TF4 = f_TFx(TF4_input)

vol_check = na(volume)
var table vol_check_table = na
if barstate.islast and vol_check
    table.delete(vol_check_table)
    vol_check_table := table.new(position=position.middle_right, columns=1, rows=1, frame_color=color.red, frame_width=1)
    table.cell(vol_check_table, column=0, row=0, text='There is no volume data for this symbol' + ' (' + syminfo.tickerid + ')' + '\n Please use a different symbol with volume data', text_color=color.red)

// // --------- This ensures that no plots from lower time frames will be plotted on higher time frames.
// ————— Converts current chart resolution into a float minutes value.
f_resInMinutes() =>
    _resInMinutes = timeframe.multiplier * (timeframe.isseconds ? 1. / 60 : timeframe.isminutes ? 1. : timeframe.isdaily ? 60. * 24 : timeframe.isweekly ? 60. * 24 * 7 : timeframe.ismonthly ? 60. * 24 * 30.4375 : na)
    _resInMinutes
// ————— Returns the float minutes value of the string _res.
f_tfResInMinutes(_res) =>
    // _res: resolution of any TF (in "timeframe.period" string format).
    // Dependency: f_resInMinutes().
    request.security(syminfo.tickerid, _res, f_resInMinutes())

// —————————— Determine if current timeframe is smaller that higher timeframe selected in Inputs.
// Get higher timeframe in minutes.
TF1InMinutes = f_tfResInMinutes(TF1)
TF2InMinutes = f_tfResInMinutes(TF2)
TF3InMinutes = f_tfResInMinutes(TF3)
TF4InMinutes = f_tfResInMinutes(TF4)

// Get current timeframe in minutes.
currentTFInMinutes = f_resInMinutes()
// Compare current TF to higher TF to make sure it is smaller, otherwise our plots don't make sense.
chartOnLowerTF1 = currentTFInMinutes <= TF1InMinutes
chartOnLowerTF2 = currentTFInMinutes <= TF2InMinutes
chartOnLowerTF3 = currentTFInMinutes <= TF3InMinutes
chartOnLowerTF4 = currentTFInMinutes <= TF4InMinutes

chartEqualTF2 = currentTFInMinutes == TF2InMinutes and TF2_Menu != 'Disable'
chartEqualTF3 = currentTFInMinutes == TF3InMinutes and TF3_Menu != 'Disable'
chartEqualTF4 = currentTFInMinutes == TF4InMinutes and TF4_Menu != 'Disable'

TF1_inH = str.tostring(TF1InMinutes / 60)
TF1_text = TF1InMinutes >= 60 and TF1InMinutes < 1440 ? TF1_inH + 'h' : TF1InMinutes < 60 ? TF1 + 'm' : TF1

//--- In order to get the left side of SR zone on higher time frames to line up directly on the bar with the fractal high or fractal low, we need to perform
//--- a series of calculations to find the pivot high/low. Since the FractalUp or FractalDown condition is found after 2 confirming bars, the SR zone would begin
//--- at the opening of the 3rd bar following the pivot high/low). For example, if there is a 4hr Fractal confirmed while on the 1hr chart, it would take 3 4hr bars to confirm. 
//--- That means the high/low point could've occured anywhere between 8-12 1hr bars ago.
// // --------- To get the correct bar_index for higher time frame SR zones placed on lower time frame candles, first the range of candles to scan needs to be established.
// // --------- Then find the highest/lowest bar within that range of bars for bar_index on the x1 (left) coordinates of lines (next steps below)
bool TF1_newbar = ta.change(time(TF1)) != 0, bool TF2_newbar = ta.change(time(TF2)) != 0, bool TF3_newbar = ta.change(time(TF3)) != 0, bool TF4_newbar = ta.change(time(TF4)) != 0 
TF1_bi1 = ta.valuewhen(TF1_newbar, bar_index, 1), TF2_bi1 = ta.valuewhen(TF2_newbar, bar_index, 1), TF3_bi1 = ta.valuewhen(TF3_newbar, bar_index, 1), TF4_bi1 = ta.valuewhen(TF4_newbar, bar_index, 1)
TF1_bi5 = ta.valuewhen(TF1_newbar, bar_index, 5), TF2_bi5 = ta.valuewhen(TF2_newbar, bar_index, 5), TF3_bi5 = ta.valuewhen(TF3_newbar, bar_index, 5), TF4_bi5 = ta.valuewhen(TF4_newbar, bar_index, 5)
TF1_bb1 = bar_index-TF1_bi1, TF2_bb1 = bar_index-TF2_bi1, TF3_bb1 = bar_index-TF3_bi1, TF4_bb1 = bar_index-TF4_bi1
TF1_bb5 = bar_index-TF1_bi5, TF2_bb5 = bar_index-TF2_bi5, TF3_bb5 = bar_index-TF3_bi5, TF4_bb5 = bar_index-TF4_bi5
TF1_br = TF1_bb5 - TF1_bb1, TF2_br = TF2_bb5 - TF2_bb1, TF3_br = TF3_bb5 - TF3_bb1, TF4_br = TF4_bb5 - TF4_bb1

// Get offset value for the highest high or lowest low found within the specified range , using [] to establish the starting point back to begin scanning past bars for highest high or lowest low. 
// Moving the starting point back ensures it scans within the range in which the high/low was found by FractalUp/FractalDown condition.
// Output by default is negative, make positive with absolute value for bar_index.
// Adding the TFx_bar_index back in accounts for the number of bars skipped back in [].
// First check if the number of bars back to scan for pivot high/low is going to be over the max bars back, and if so set the bar_index to the max bars back, 
// otherwise get exact bar index value for pivot high/low.

var int TF1_Hi_Bi = na
var int TF1_Lo_Bi = na
var int TF2_Hi_Bi = na
var int TF2_Lo_Bi = na
var int TF3_Hi_Bi = na
var int TF3_Lo_Bi = na
var int TF4_Hi_Bi = na
var int TF4_Lo_Bi = na

if TF1_bb1 > 4999 or (TF1_bb1 + TF1_br) > 4999
    TF1_Hi_Bi := 4999
    TF1_Lo_Bi := 4999
else
    TF1_Hi_Bi := math.abs(ta.highestbars(high, nz(TF1_br, 1)))[TF1_bb1] + TF1_bb1
    TF1_Lo_Bi := math.abs(ta.lowestbars(low, nz(TF1_br, 1)))[TF1_bb1] + TF1_bb1

if TF2_bb1 > 4999 or (TF2_bb1 + TF2_br) > 4999
    TF2_Hi_Bi := 4999
    TF2_Lo_Bi := 4999
else
    TF2_Hi_Bi := math.abs(ta.highestbars(high, nz(TF2_br, 1)))[TF2_bb1] + TF2_bb1
    TF2_Lo_Bi := math.abs(ta.lowestbars(low, nz(TF2_br, 1)))[TF2_bb1] + TF2_bb1

if TF3_bb1 > 4999 or (TF3_bb1 + TF3_br) > 4999
    TF3_Hi_Bi := 4999
    TF3_Lo_Bi := 4999
else
    TF3_Hi_Bi := math.abs(ta.highestbars(high, nz(TF3_br, 1)))[TF3_bb1] + TF3_bb1
    TF3_Lo_Bi := math.abs(ta.lowestbars(low, nz(TF3_br, 1)))[TF3_bb1] + TF3_bb1

if TF4_bb1 > 4999 or (TF4_bb1 + TF4_br) > 4999
    TF4_Hi_Bi := 4999
    TF4_Lo_Bi := 4999
else
    TF4_Hi_Bi := math.abs(ta.highestbars(high, nz(TF4_br, 1)))[TF4_bb1] + TF4_bb1
    TF4_Lo_Bi := math.abs(ta.lowestbars(low, nz(TF4_br, 1)))[TF4_bb1] + TF4_bb1


// TFUp and TFDown Calculations
f_tfUp(_TF_High, _TF_Vol, _TF_VolMA) =>
    _TF_High[3] > _TF_High[4] and _TF_High[4] > _TF_High[5] and _TF_High[2] < _TF_High[3] and _TF_High[1] < _TF_High[2] and _TF_Vol[3] > _TF_VolMA[3]
f_tfDown(_TF_Low, _TF_Vol, _TF_VolMA) =>
    _TF_Low[3] < _TF_Low[4] and _TF_Low[4] < _TF_Low[5] and _TF_Low[2] > _TF_Low[3] and _TF_Low[1] > _TF_Low[2] and _TF_Vol[3] > _TF_VolMA[3]

// Function for each time frame's various sources used in FractalUp and FractalDown calculations.
f_tfSources(_res, _source) =>
    request.security(syminfo.tickerid, _res, _source)

// Line and label arrays
var TF1_UpperSupportLine_array = array.new_line(TF1_NumZones), var TF2_UpperSupportLine_array = array.new_line(TF2_NumZones), var TF3_UpperSupportLine_array = array.new_line(TF3_NumZones), var TF4_UpperSupportLine_array = array.new_line(TF4_NumZones)
var TF1_LowerSupportLine_array = array.new_line(TF1_NumZones), var TF2_LowerSupportLine_array = array.new_line(TF2_NumZones), var TF3_LowerSupportLine_array = array.new_line(TF3_NumZones), var TF4_LowerSupportLine_array = array.new_line(TF4_NumZones)
var TF1SupLabel_array = array.new_label(1), var TF2SupLabel_array = array.new_label(1), var TF3SupLabel_array = array.new_label(1), var TF4SupLabel_array = array.new_label(1)

var TF1_UpperResLine_array = array.new_line(TF1_NumZones), var TF2_UpperResLine_array = array.new_line(TF2_NumZones), var TF3_UpperResLine_array = array.new_line(TF3_NumZones), var TF4_UpperResLine_array = array.new_line(TF4_NumZones)
var TF1_LowerResLine_array = array.new_line(TF1_NumZones), var TF2_LowerResLine_array = array.new_line(TF2_NumZones), var TF3_LowerResLine_array = array.new_line(TF3_NumZones), var TF4_LowerResLine_array = array.new_line(TF4_NumZones)
var TF1ResLabel_array = array.new_label(1), var TF2ResLabel_array = array.new_label(1), var TF3ResLabel_array = array.new_label(1), var TF4ResLabel_array = array.new_label(1)

// Resistance Line Functions
TF_ResistanceLineA(TF_input,TF_FractalUp,TF_ResLineColor,TF_UpperResLine_array,TF_NumZones,TF_ResZone, TF_LowerResLine_array,TF_text,TF_ResLabel_array,bi_hi,bi_3,bi,bi_2,ext_right) =>
    if show_HL
        UpperResistanceLine = line.new(x1=TF_input != 'Chart' ? bi_hi : bi_3, y1=TF_FractalUp, x2=bi, y2=TF_FractalUp, color=TF_ResLineColor, style=LineStyleHL, width=LineWidthHLInput, extend=extend.right)
        line.set_extend(id=array.get(TF_UpperResLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_UpperResLine_array, TF_NumZones-1), x=TF_input != 'Chart' ? bi_hi : bi_3)
        array.push(TF_UpperResLine_array, UpperResistanceLine)
        line.delete(array.shift(TF_UpperResLine_array))
    if show_close
        LowerResistanceLine = line.new(x1=TF_input != 'Chart' ? bi_hi : bi_3, y1=TF_ResZone, x2=bi, y2=TF_ResZone, color=TF_ResLineColor, style=LineStyleClose, width=LineWidthCloseInput, extend=extend.right)
        line.set_extend(id=array.get(TF_LowerResLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_LowerResLine_array, TF_NumZones-1), x=TF_input != 'Chart' ? bi_hi : bi_3)
        array.push(TF_LowerResLine_array, LowerResistanceLine)
        line.delete(array.shift(TF_LowerResLine_array))
    if ShowLabel == true and label_loc == 'Left'
        TFResLabel = label.new(TF_input != 'Chart' ? bi_hi : bi_2, TF_FractalUp, text=TF_text + "(R)", color=color.new(color.white, 100), size=size.normal, style=label.style_label_right, textcolor=TF_ResLineColor)
        array.push(TF_ResLabel_array, TFResLabel)
        label.delete(array.shift(TF_ResLabel_array))

TF_ResistanceLineB(TF_FractalUp,TF_ResLineColor,TF_UpperResLine_array,TF_NumZones,TF_ResZone,TF_LowerResLine_array,TF_text,TF_ResLabel_array,bi3,bi,ext_right) =>
    if show_HL
        UpperResistanceLine = line.new(x1=bi3, y1=TF_FractalUp, x2=bi, y2=TF_FractalUp, color=TF_ResLineColor, style=LineStyleHL, width=LineWidthHLInput, extend=extend.right)
        line.set_extend(id=array.get(TF_UpperResLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_UpperResLine_array, TF_NumZones-1), x=bi3)
        array.push(TF_UpperResLine_array, UpperResistanceLine)
        line.delete(array.shift(TF_UpperResLine_array))
    if show_close
        LowerResistanceLine = line.new(x1=bi3, y1=TF_ResZone, x2=bi, y2=TF_ResZone, color=TF_ResLineColor, style=LineStyleClose, width=LineWidthCloseInput, extend=extend.right)
        line.set_extend(id=array.get(TF_LowerResLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_LowerResLine_array, TF_NumZones-1), x=bi3)
        array.push(TF_LowerResLine_array, LowerResistanceLine)
        line.delete(array.shift(TF_LowerResLine_array))
    if ShowLabel == true and label_loc == 'Left'
        TFResLabel = label.new(bi3, TF_FractalUp, text=TF_text + "(R)", color=color.new(color.white, 100), size=size.normal, style=label.style_label_right, textcolor=TF_ResLineColor)
        array.push(TF_ResLabel_array, TFResLabel)
        label.delete(array.shift(TF_ResLabel_array))

// Support Line Functions
TF_SupportLineA(TF_input, TF_FractalDown,TF_SupLinesColor,TF_UpperSupportLine_array,TF_NumZones,TF_SupportZone, TF_LowerSupportLine_array,TF_text,TF_SupLabel_array,bi_lo,bi_3,bi,bi_2,ext_right) =>
    if show_close
        UpperSupportLine = line.new(x1=TF_input != 'Chart' ? bi_lo : bi_3, y1=TF_SupportZone, x2=bi, y2=TF_SupportZone, color=TF_SupLinesColor, style=LineStyleClose, width=LineWidthCloseInput, extend=extend.right)
        line.set_extend(id=array.get(TF_UpperSupportLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_UpperSupportLine_array, TF_NumZones-1), x=TF_input != 'Chart' ? bi_lo : bi_3)
        array.push(TF_UpperSupportLine_array, UpperSupportLine)
        line.delete(array.shift(TF_UpperSupportLine_array))
    if show_HL
        LowerSupportLine = line.new(x1=TF_input != 'Chart' ? bi_lo : bi_3, y1=TF_FractalDown, x2=bi, y2=TF_FractalDown, color=TF_SupLinesColor, style=LineStyleHL, width=LineWidthHLInput, extend=extend.right)
        line.set_extend(id=array.get(TF_LowerSupportLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_LowerSupportLine_array, TF_NumZones-1), x=TF_input != 'Chart' ? bi_lo : bi_3)
        array.push(TF_LowerSupportLine_array, LowerSupportLine)
        line.delete(array.shift(TF_LowerSupportLine_array))
    if ShowLabel == true and label_loc == 'Left'
        SupLabel = label.new(TF_input != 'Chart' ? bi_lo : bi_2, TF_FractalDown, text=TF_text + "(S)", color=color.new(color.white, 100), size=size.normal, style=label.style_label_right, textcolor=TF_SupLinesColor)
        array.push(TF_SupLabel_array, SupLabel)
        label.delete(array.shift(TF_SupLabel_array))

TF_SupportLineB(TF_FractalDown,TF_SupLinesColor,TF_UpperSupportLine_array,TF_NumZones,TF_SupportZone,TF_LowerSupportLine_array,TF_text,TF_SupLabel_array,bi3,bi,ext_right) =>
    if show_close
        UpperSupportLine = line.new(x1=bi3, y1=TF_SupportZone, x2=bi, y2=TF_SupportZone, color=TF_SupLinesColor, style=LineStyleClose, width=LineWidthCloseInput, extend=extend.right)
        line.set_extend(id=array.get(TF_UpperSupportLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_UpperSupportLine_array, TF_NumZones-1), x=bi3)
        array.push(TF_UpperSupportLine_array, UpperSupportLine)
        line.delete(array.shift(TF_UpperSupportLine_array))
    if show_HL
        LowerSupportLine = line.new(x1=bi3, y1=TF_FractalDown, x2=bi, y2=TF_FractalDown, color=TF_SupLinesColor, style=LineStyleHL, width=LineWidthHLInput, extend=extend.right)
        line.set_extend(id=array.get(TF_LowerSupportLine_array, TF_NumZones-1), extend=ext_right ? extend.right : extend.none)
        if ExtendLines1 == true
            line.set_x2(id=array.get(TF_LowerSupportLine_array, TF_NumZones-1), x=bi3)
        array.push(TF_LowerSupportLine_array, LowerSupportLine)
        line.delete(array.shift(TF_LowerSupportLine_array))
    if ShowLabel == true and label_loc == 'Left'
        SupLabel = label.new(bi3, TF_FractalDown, text=TF_text + "(S)", color=color.new(color.white, 100), size=size.normal, style=label.style_label_right, textcolor=TF_SupLinesColor)
        array.push(TF_SupLabel_array, SupLabel)
        label.delete(array.shift(TF_SupLabel_array))

// Label Function
TFLabel(bi, TF_Fractal, txt, txtcolor, TFLabel_array) =>
    Label = label.new(bi, TF_Fractal, text=txt, size=size.normal, style=label.style_none, textcolor=txtcolor)
    array.push(TFLabel_array, Label)
    label.delete(array.shift(TFLabel_array))

// S/R  = Time Frame 1 = TF1
TF1_Vol = f_tfSources(TF1, volume)
TF1_VolMA = ta.sma(TF1_Vol, TF1_VolMA1Input)
TF1_High = f_tfSources(TF1, high)
TF1_Low = f_tfSources(TF1, low)
TF1_Open = f_tfSources(TF1, open)
TF1_Close = f_tfSources(TF1, close)

TF1_Up = f_tfUp(TF1_High, TF1_Vol, TF1_VolMA)
TF1_Down = f_tfDown(TF1_Low, TF1_Vol, TF1_VolMA)

TF1_CalcFractalUp() =>
    TF1_FractalUp = 0.0
    TF1_FractalUp := TF1_Up ? TF1_High[3] : TF1_FractalUp[1]
    TF1_FractalUp

TF1_CalcFractalDown() =>
    TF1_FractalDown = 0.0
    TF1_FractalDown := TF1_Down ? TF1_Low[3] : TF1_FractalDown[1]
    TF1_FractalDown

TF1_FractalUp = request.security(syminfo.tickerid, TF1, TF1_CalcFractalUp())
TF1_FractalDown = request.security(syminfo.tickerid, TF1, TF1_CalcFractalDown())

// Zones - Current Time Frame = Time Frame 1 = TF1
// Fractal Up Zones
TF1_CalcFractalUpZone() =>
    TF1_FractalUpZone = 0.0
    TF1_FractalUpZone := TF1_Up and TF1_Close[3] >= TF1_Open[3] ? TF1_Close[3] : TF1_Up and TF1_Close[3] < TF1_Open[3] ? TF1_Open[3] : TF1_FractalUpZone[1]
    TF1_FractalUpZone

TF1_FractalUpZone = request.security(syminfo.tickerid, TF1, TF1_CalcFractalUpZone())
TF1_ResZone = TF1_FractalUpZone

// Fractal Down Zones
TF1_CalcFractalDownZone() =>
    TF1_FractalDownZone = 0.0
    TF1_FractalDownZone := TF1_Down and TF1_Close[3] >= TF1_Open[3] ? TF1_Open[3] : TF1_Down and TF1_Close[3] < TF1_Open[3] ? TF1_Close[3] : TF1_FractalDownZone[1]
    TF1_FractalDownZone

TF1_FractalDownZone = request.security(syminfo.tickerid, TF1, TF1_CalcFractalDownZone())
TF1_SupportZone = TF1_FractalDownZone

// Time Frame 1 = TF1 Resistance
if (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and TF1_FractalUp != TF1_FractalUp[1] and chartOnLowerTF1 and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4
    TF_ResistanceLineA(TF1_input,TF1_FractalUp,TF1_ResLinesColor,TF1_UpperResLine_array,TF1_NumZones,TF1_ResZone, TF1_LowerResLine_array,TF1_text,TF1ResLabel_array,bar_index[TF1_Hi_Bi], bar_index[3], bar_index,bar_index[2], TF1_extRight)
else if (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and na(TF1_FractalUp != TF1_FractalUp[1]) and chartOnLowerTF1 and na(ta.barssince(TF1_FractalUp != TF1_FractalUp[1])) and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4
    TF_ResistanceLineB(TF1_FractalUp,TF1_ResLinesColor,TF1_UpperResLine_array,TF1_NumZones,TF1_ResZone,TF1_LowerResLine_array,TF1_text,TF1ResLabel_array,bar_index[3],bar_index, TF1_extRight)

if (TF1_Menu == 'S/R Zones')
    linefill.new(array.get(TF1_UpperResLine_array, TF1_NumZones-1), array.get(TF1_LowerResLine_array, TF1_NumZones-1), TF1_ResZoneColor)

if ShowLabel == true and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF1_FractalUp, TF1_text+"(R)", TF1_ResLinesColor, TF1ResLabel_array)


// Time Frame 1 = TF1 Support
if (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and TF1_FractalDown != TF1_FractalDown[1] and chartOnLowerTF1 and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4
    TF_SupportLineA(TF1_input,TF1_FractalDown,TF1_SupLinesColor,TF1_UpperSupportLine_array,TF1_NumZones,TF1_SupportZone, TF1_LowerSupportLine_array,TF1_text,TF1SupLabel_array,bar_index[TF1_Lo_Bi], bar_index[3], bar_index,bar_index[2], TF1_extRight)
else if (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and na(TF1_FractalDown != TF1_FractalDown[1]) and chartOnLowerTF1 and na(ta.barssince(TF1_FractalDown != TF1_FractalDown[1])) and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4
    TF_SupportLineB(TF1_FractalDown,TF1_SupLinesColor,TF1_UpperSupportLine_array,TF1_NumZones,TF1_SupportZone,TF1_LowerSupportLine_array,TF1_text,TF1SupLabel_array,bar_index[3],bar_index, TF1_extRight)

if (TF1_Menu == 'S/R Zones')
    linefill.new(array.get(TF1_UpperSupportLine_array, TF1_NumZones-1), array.get(TF1_LowerSupportLine_array, TF1_NumZones-1), TF1_SupZoneColor)

if ShowLabel == true and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and not chartEqualTF2 and not chartEqualTF3 and not chartEqualTF4 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF1_FractalDown, TF1_text+"(S)", TF1_SupLinesColor, TF1SupLabel_array)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF1_UpperResLine_array, TF1_NumZones-1), extend.none)
    line.set_x2(array.get(TF1_UpperResLine_array, TF1_NumZones-1), bar_index)
    line.set_extend(array.get(TF1_LowerResLine_array, TF1_NumZones-1), extend.none)
    line.set_x2(array.get(TF1_LowerResLine_array, TF1_NumZones-1), bar_index)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF1_UpperSupportLine_array, TF1_NumZones-1), extend.none)
    line.set_x2(array.get(TF1_UpperSupportLine_array, TF1_NumZones-1), bar_index)
    line.set_extend(array.get(TF1_LowerSupportLine_array, TF1_NumZones-1), extend.none)
    line.set_x2(array.get(TF1_LowerSupportLine_array, TF1_NumZones-1), bar_index)

// S/R  = Time Frame 2 = TF2
TF2_Vol = f_tfSources(TF2, volume)
TF2_VolMA = ta.sma(TF2_Vol, TF2_VolMA1Input)
TF2_High = f_tfSources(TF2, high)
TF2_Low = f_tfSources(TF2, low)
TF2_Open = f_tfSources(TF2, open)
TF2_Close = f_tfSources(TF2, close)

TF2_Up = f_tfUp(TF2_High, TF2_Vol, TF2_VolMA)
TF2_Down = f_tfDown(TF2_Low, TF2_Vol, TF2_VolMA)

TF2_CalcFractalUp() =>
    TF2_FractalUp = 0.0
    TF2_FractalUp := TF2_Up ? TF2_High[3] : TF2_FractalUp[1]
    TF2_FractalUp

TF2_CalcFractalDown() =>
    TF2_FractalDown = 0.0
    TF2_FractalDown := TF2_Down ? TF2_Low[3] : TF2_FractalDown[1]
    TF2_FractalDown

TF2_FractalUp = request.security(syminfo.tickerid, TF2, TF2_CalcFractalUp())
TF2_FractalDown = request.security(syminfo.tickerid, TF2, TF2_CalcFractalDown())

// Zones - Current Time Frame = Time Frame 2 = TF2
// Fractal Up Zones
TF2_CalcFractalUpZone() =>
    TF2_FractalUpZone = 0.0
    TF2_FractalUpZone := TF2_Up and TF2_Close[3] >= TF2_Open[3] ? TF2_Close[3] : TF2_Up and TF2_Close[3] < TF2_Open[3] ? TF2_Open[3] : TF2_FractalUpZone[1]
    TF2_FractalUpZone

TF2_FractalUpZone = request.security(syminfo.tickerid, TF2, TF2_CalcFractalUpZone())
TF2_ResZone = TF2_FractalUpZone

// Fractal Down Zones
TF2_CalcFractalDownZone() =>
    TF2_FractalDownZone = 0.0
    TF2_FractalDownZone := TF2_Down and TF2_Close[3] >= TF2_Open[3] ? TF2_Open[3] : TF2_Down and TF2_Close[3] < TF2_Open[3] ? TF2_Close[3] : TF2_FractalDownZone[1]
    TF2_FractalDownZone

TF2_FractalDownZone = request.security(syminfo.tickerid, TF2, TF2_CalcFractalDownZone())
TF2_SupportZone = TF2_FractalDownZone

// Time Frame 2 = TF2 Resistance
if (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and TF2_FractalUp != TF2_FractalUp[1] and chartOnLowerTF2
    TF_ResistanceLineA(TF2_input,TF2_FractalUp,TF2_ResLinesColor,TF2_UpperResLine_array,TF2_NumZones,TF2_ResZone, TF2_LowerResLine_array,TF2_input,TF2ResLabel_array,bar_index[TF2_Hi_Bi], bar_index[3], bar_index,bar_index[2], TF2_extRight)
else if (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and na(TF2_FractalUp != TF2_FractalUp[1]) and chartOnLowerTF2 and na(ta.barssince(TF2_FractalUp != TF2_FractalUp[1]))
    TF_ResistanceLineB(TF2_FractalUp,TF2_ResLinesColor,TF2_UpperResLine_array,TF2_NumZones,TF2_ResZone,TF2_LowerResLine_array,TF2_input,TF2ResLabel_array,bar_index[3],bar_index, TF2_extRight)

if (TF2_Menu == 'S/R Zones')
    linefill.new(array.get(TF2_UpperResLine_array, TF2_NumZones-1), array.get(TF2_LowerResLine_array, TF2_NumZones-1), TF2_ResZoneColor)

if ShowLabel == true and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF2_FractalUp, TF2_input+"(R)", TF2_ResLinesColor, TF2ResLabel_array)


// Time Frame 2 = TF2 Support
if (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and TF2_FractalDown != TF2_FractalDown[1] and chartOnLowerTF2
    TF_SupportLineA(TF2_input,TF2_FractalDown,TF2_SupLinesColor,TF2_UpperSupportLine_array,TF2_NumZones,TF2_SupportZone, TF2_LowerSupportLine_array,TF2_input,TF2SupLabel_array,bar_index[TF2_Lo_Bi], bar_index[3], bar_index,bar_index[2], TF2_extRight)
else if (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and na(TF2_FractalDown != TF2_FractalDown[1]) and chartOnLowerTF2 and na(ta.barssince(TF2_FractalDown != TF2_FractalDown[1])) 
    TF_SupportLineB(TF2_FractalDown,TF2_SupLinesColor,TF2_UpperSupportLine_array,TF2_NumZones,TF2_SupportZone,TF2_LowerSupportLine_array,TF2_input,TF2SupLabel_array,bar_index[3],bar_index, TF2_extRight)

if (TF2_Menu == 'S/R Zones')
    linefill.new(array.get(TF2_UpperSupportLine_array, TF2_NumZones-1), array.get(TF2_LowerSupportLine_array, TF2_NumZones-1), TF2_SupZoneColor)

if ShowLabel == true and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF2_FractalDown, TF2_input+"(S)", TF2_SupLinesColor, TF2SupLabel_array)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF2_UpperResLine_array, TF2_NumZones-1), extend.none)
    line.set_x2(array.get(TF2_UpperResLine_array, TF2_NumZones-1), bar_index)
    line.set_extend(array.get(TF2_LowerResLine_array, TF2_NumZones-1), extend.none)
    line.set_x2(array.get(TF2_LowerResLine_array, TF2_NumZones-1), bar_index)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF2_UpperSupportLine_array, TF2_NumZones-1), extend.none)
    line.set_x2(array.get(TF2_UpperSupportLine_array, TF2_NumZones-1), bar_index)
    line.set_extend(array.get(TF2_LowerSupportLine_array, TF2_NumZones-1), extend.none)
    line.set_x2(array.get(TF2_LowerSupportLine_array, TF2_NumZones-1), bar_index)

// S/R  = Time Frame 3 = TF3
TF3_Vol = f_tfSources(TF3, volume)
TF3_VolMA = ta.sma(TF3_Vol, TF3_VolMA1Input)
TF3_High = f_tfSources(TF3, high)
TF3_Low = f_tfSources(TF3, low)
TF3_Open = f_tfSources(TF3, open)
TF3_Close = f_tfSources(TF3, close)

TF3_Up = f_tfUp(TF3_High, TF3_Vol, TF3_VolMA)
TF3_Down = f_tfDown(TF3_Low, TF3_Vol, TF3_VolMA)

TF3_CalcFractalUp() =>
    TF3_FractalUp = 0.0
    TF3_FractalUp := TF3_Up ? TF3_High[3] : TF3_FractalUp[1]
    TF3_FractalUp

TF3_CalcFractalDown() =>
    TF3_FractalDown = 0.0
    TF3_FractalDown := TF3_Down ? TF3_Low[3] : TF3_FractalDown[1]
    TF3_FractalDown

TF3_FractalUp = request.security(syminfo.tickerid, TF3, TF3_CalcFractalUp())
TF3_FractalDown = request.security(syminfo.tickerid, TF3, TF3_CalcFractalDown())

// Zones - Current Time Frame = Time Frame 3 = TF3
// Fractal Up Zones
TF3_CalcFractalUpZone() =>
    TF3_FractalUpZone = 0.0
    TF3_FractalUpZone := TF3_Up and TF3_Close[3] >= TF3_Open[3] ? TF3_Close[3] : TF3_Up and TF3_Close[3] < TF3_Open[3] ? TF3_Open[3] : TF3_FractalUpZone[1]
    TF3_FractalUpZone

TF3_FractalUpZone = request.security(syminfo.tickerid, TF3, TF3_CalcFractalUpZone())
TF3_ResZone = TF3_FractalUpZone

// Fractal Down Zones
TF3_CalcFractalDownZone() =>
    TF3_FractalDownZone = 0.0
    TF3_FractalDownZone := TF3_Down and TF3_Close[3] >= TF3_Open[3] ? TF3_Open[3] : TF3_Down and TF3_Close[3] < TF3_Open[3] ? TF3_Close[3] : TF3_FractalDownZone[1]
    TF3_FractalDownZone

TF3_FractalDownZone = request.security(syminfo.tickerid, TF3, TF3_CalcFractalDownZone())
TF3_SupportZone = TF3_FractalDownZone

// Time Frame 3 = TF3 Resistance
if (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and TF3_FractalUp != TF3_FractalUp[1] and chartOnLowerTF3
    TF_ResistanceLineA(TF3_input,TF3_FractalUp,TF3_ResLinesColor,TF3_UpperResLine_array,TF3_NumZones,TF3_ResZone, TF3_LowerResLine_array,TF3_input,TF3ResLabel_array,bar_index[TF3_Hi_Bi], bar_index[3], bar_index,bar_index[2], TF3_extRight)
else if (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and na(TF3_FractalUp != TF3_FractalUp[1]) and chartOnLowerTF3 and na(ta.barssince(TF3_FractalUp != TF3_FractalUp[1]))
    TF_ResistanceLineB(TF3_FractalUp,TF3_ResLinesColor,TF3_UpperResLine_array,TF3_NumZones,TF3_ResZone,TF3_LowerResLine_array,TF3_input,TF3ResLabel_array,bar_index[3],bar_index, TF3_extRight)

if (TF3_Menu == 'S/R Zones')
    linefill.new(array.get(TF3_UpperResLine_array, TF3_NumZones-1), array.get(TF3_LowerResLine_array, TF3_NumZones-1), TF3_ResZoneColor)

if ShowLabel == true and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF3_FractalUp, TF3_input+"(R)", TF3_ResLinesColor, TF3ResLabel_array)


// Time Frame 3 = TF3 Support
if (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and TF3_FractalDown != TF3_FractalDown[1] and chartOnLowerTF3
    TF_SupportLineA(TF3_input,TF3_FractalDown,TF3_SupLinesColor,TF3_UpperSupportLine_array,TF3_NumZones,TF3_SupportZone, TF3_LowerSupportLine_array,TF3_input,TF3SupLabel_array,bar_index[TF3_Lo_Bi], bar_index[3], bar_index,bar_index[2], TF3_extRight)
else if (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and na(TF3_FractalDown != TF3_FractalDown[1]) and chartOnLowerTF3 and na(ta.barssince(TF3_FractalDown != TF3_FractalDown[1])) 
    TF_SupportLineB(TF3_FractalDown,TF3_SupLinesColor,TF3_UpperSupportLine_array,TF3_NumZones,TF3_SupportZone,TF3_LowerSupportLine_array,TF3_input,TF3SupLabel_array,bar_index[3],bar_index, TF3_extRight)

if (TF3_Menu == 'S/R Zones')
    linefill.new(array.get(TF3_UpperSupportLine_array, TF3_NumZones-1), array.get(TF3_LowerSupportLine_array, TF3_NumZones-1), TF3_SupZoneColor)

if ShowLabel == true and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF3_FractalDown, TF3_input+"(S)", TF3_SupLinesColor, TF3SupLabel_array)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF3_UpperResLine_array, TF3_NumZones-1), extend.none)
    line.set_x2(array.get(TF3_UpperResLine_array, TF3_NumZones-1), bar_index)
    line.set_extend(array.get(TF3_LowerResLine_array, TF3_NumZones-1), extend.none)
    line.set_x2(array.get(TF3_LowerResLine_array, TF3_NumZones-1), bar_index)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF3_UpperSupportLine_array, TF3_NumZones-1), extend.none)
    line.set_x2(array.get(TF3_UpperSupportLine_array, TF3_NumZones-1), bar_index)
    line.set_extend(array.get(TF3_LowerSupportLine_array, TF3_NumZones-1), extend.none)
    line.set_x2(array.get(TF3_LowerSupportLine_array, TF3_NumZones-1), bar_index)

// S/R  = Time Frame 4 = TF4
TF4_Vol = f_tfSources(TF4, volume)
TF4_VolMA = ta.sma(TF4_Vol, TF4_VolMA1Input)
TF4_High = f_tfSources(TF4, high)
TF4_Low = f_tfSources(TF4, low)
TF4_Open = f_tfSources(TF4, open)
TF4_Close = f_tfSources(TF4, close)

TF4_Up = f_tfUp(TF4_High, TF4_Vol, TF4_VolMA)
TF4_Down = f_tfDown(TF4_Low, TF4_Vol, TF4_VolMA)

TF4_CalcFractalUp() =>
    TF4_FractalUp = 0.0
    TF4_FractalUp := TF4_Up ? TF4_High[3] : TF4_FractalUp[1]
    TF4_FractalUp

TF4_CalcFractalDown() =>
    TF4_FractalDown = 0.0
    TF4_FractalDown := TF4_Down ? TF4_Low[3] : TF4_FractalDown[1]
    TF4_FractalDown

TF4_FractalUp = request.security(syminfo.tickerid, TF4, TF4_CalcFractalUp())
TF4_FractalDown = request.security(syminfo.tickerid, TF4, TF4_CalcFractalDown())

// Zones - Current Time Frame = Time Frame 4 = TF4
// Fractal Up Zones
TF4_CalcFractalUpZone() =>
    TF4_FractalUpZone = 0.0
    TF4_FractalUpZone := TF4_Up and TF4_Close[3] >= TF4_Open[3] ? TF4_Close[3] : TF4_Up and TF4_Close[3] < TF4_Open[3] ? TF4_Open[3] : TF4_FractalUpZone[1]
    TF4_FractalUpZone

TF4_FractalUpZone = request.security(syminfo.tickerid, TF4, TF4_CalcFractalUpZone())
TF4_ResZone = TF4_FractalUpZone

// Fractal Down Zones
TF4_CalcFractalDownZone() =>
    TF4_FractalDownZone = 0.0
    TF4_FractalDownZone := TF4_Down and TF4_Close[3] >= TF4_Open[3] ? TF4_Open[3] : TF4_Down and TF4_Close[3] < TF4_Open[3] ? TF4_Close[3] : TF4_FractalDownZone[1]
    TF4_FractalDownZone

TF4_FractalDownZone = request.security(syminfo.tickerid, TF4, TF4_CalcFractalDownZone())
TF4_SupportZone = TF4_FractalDownZone

// Time Frame 4 = TF4 Resistance
if (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and TF4_FractalUp != TF4_FractalUp[1] and chartOnLowerTF4
    TF_ResistanceLineA(TF4_input,TF4_FractalUp,TF4_ResLinesColor,TF4_UpperResLine_array,TF4_NumZones,TF4_ResZone, TF4_LowerResLine_array,TF4_input,TF4ResLabel_array,bar_index[TF4_Hi_Bi], bar_index[3], bar_index,bar_index[2], TF4_extRight)
else if (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and na(TF4_FractalUp != TF4_FractalUp[1]) and chartOnLowerTF4 and na(ta.barssince(TF4_FractalUp != TF4_FractalUp[1]))
    TF_ResistanceLineB(TF4_FractalUp,TF4_ResLinesColor,TF4_UpperResLine_array,TF4_NumZones,TF4_ResZone,TF4_LowerResLine_array,TF4_input,TF4ResLabel_array,bar_index[3],bar_index, TF4_extRight)

if (TF4_Menu == 'S/R Zones')
    linefill.new(array.get(TF4_UpperResLine_array, TF4_NumZones-1), array.get(TF4_LowerResLine_array, TF4_NumZones-1), TF4_ResZoneColor)

if ShowLabel == true and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and chartOnLowerTF4 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF4_FractalUp, TF4_input+"(R)", TF4_ResLinesColor, TF4ResLabel_array)


// Time Frame 4 = TF4 Support
if (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and TF4_FractalDown != TF4_FractalDown[1] and chartOnLowerTF4
    TF_SupportLineA(TF4_input,TF4_FractalDown,TF4_SupLinesColor,TF4_UpperSupportLine_array,TF4_NumZones,TF4_SupportZone, TF4_LowerSupportLine_array,TF4_input,TF4SupLabel_array,bar_index[TF4_Lo_Bi], bar_index[3], bar_index,bar_index[2], TF4_extRight)
else if (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and na(TF4_FractalDown != TF4_FractalDown[1]) and chartOnLowerTF4 and na(ta.barssince(TF4_FractalDown != TF4_FractalDown[1])) 
    TF_SupportLineB(TF4_FractalDown,TF4_SupLinesColor,TF4_UpperSupportLine_array,TF4_NumZones,TF4_SupportZone,TF4_LowerSupportLine_array,TF4_input,TF4SupLabel_array,bar_index[3],bar_index, TF4_extRight)

if (TF4_Menu == 'S/R Zones')
    linefill.new(array.get(TF4_UpperSupportLine_array, TF4_NumZones-1), array.get(TF4_LowerSupportLine_array, TF4_NumZones-1), TF4_SupZoneColor)

if ShowLabel == true and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and chartOnLowerTF4 and label_loc == 'Right'
    TFLabel(bar_index+label_offset, TF4_FractalDown, TF4_input+"(S)", TF4_SupLinesColor, TF4SupLabel_array)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF4_UpperResLine_array, TF4_NumZones-1), extend.none)
    line.set_x2(array.get(TF4_UpperResLine_array, TF4_NumZones-1), bar_index)
    line.set_extend(array.get(TF4_LowerResLine_array, TF4_NumZones-1), extend.none)
    line.set_x2(array.get(TF4_LowerResLine_array, TF4_NumZones-1), bar_index)

if ext_active == false and barstate.islast
    line.set_extend(array.get(TF4_UpperSupportLine_array, TF4_NumZones-1), extend.none)
    line.set_x2(array.get(TF4_UpperSupportLine_array, TF4_NumZones-1), bar_index)
    line.set_extend(array.get(TF4_LowerSupportLine_array, TF4_NumZones-1), extend.none)
    line.set_x2(array.get(TF4_LowerSupportLine_array, TF4_NumZones-1), bar_index)

// ---------- The following lines modify the labels when there is the same S/R zone found on 2 different time frames, to combine both into one label and take the color of the higher time frame.
// ---------- This prevents 2 labels from being displayed on top of each other. For left labels, extra lines are required to reset the labels back to their original form once the SR changes for the lower time frame.

if label_loc == 'Right'
    if TF4_FractalUp == TF3_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF3ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF3_input + '/' + TF4_input + "(R)")
    if TF4_FractalUp == TF2_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF2ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF2_input + '/' + TF4_input + "(R)")
    if TF4_FractalUp == TF1_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF4 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF1_text + '/' + TF4_input + "(R)")
    if TF3_FractalUp == TF2_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF2ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF2_input + '/' + TF3_input + "(R)")
    if TF3_FractalUp == TF1_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF3 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF1_text + '/' + TF3_input + "(R)")
    if TF2_FractalUp == TF1_FractalUp and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF2 and not chartEqualTF2
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF2ResLabel_array, 0), text=TF1_text + '/' + TF2_input + "(R)")
    if TF4_FractalDown == TF3_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF3SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF3_input + '/' + TF4_input + "(S)")
    if TF4_FractalDown == TF2_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF2SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF2_input + '/' + TF4_input + "(S)")
    if TF4_FractalDown == TF1_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF4 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF1_text + '/' + TF4_input + "(S)")
    if TF3_FractalDown == TF2_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF2SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF2_input + '/' + TF3_input + "(S)")
    if TF3_FractalDown == TF1_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF3 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF1_text + '/' + TF3_input + "(S)")
    if TF2_FractalDown == TF1_FractalDown and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF2 and not chartEqualTF2
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF2SupLabel_array, 0), text=TF1_text + '/' + TF2_input + "(S)")

// Left Labels
if label_loc == 'Left'
    if TF4_FractalUp == TF3_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF3ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF3_input + '/' + TF4_input + "(R)")
    if TF4_FractalUp[1] == TF3_FractalUp[1] and TF4_FractalUp != TF3_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R')
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF4_input + "(R)")
    if TF4_FractalUp == TF2_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF2ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF2_input + '/' + TF4_input + "(R)")
    if TF4_FractalUp[1] == TF2_FractalUp[1] and TF4_FractalUp != TF2_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R')
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF4_input + "(R)")
    if TF4_FractalUp == TF1_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF4 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF1_text + '/' + TF4_input + "(R)")
    if TF4_FractalUp[1] == TF1_FractalUp[1] and TF4_FractalUp != TF1_FractalUp and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF4ResLabel_array, 0), text=TF4_input + "(R)")
    if TF3_FractalUp == TF2_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF2ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF2_input + '/' + TF3_input + "(R)")
    if TF3_FractalUp[1] == TF2_FractalUp[1] and TF3_FractalUp != TF2_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R')
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF3_input + "(R)")
    if TF3_FractalUp == TF1_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF3 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF1_text + '/' + TF3_input + "(R)")
    if TF3_FractalUp[1] == TF1_FractalUp[1] and TF3_FractalUp != TF1_FractalUp and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF3ResLabel_array, 0), text=TF3_input + "(R)")
    if TF2_FractalUp == TF1_FractalUp and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF2 and not chartEqualTF2
        label.set_textcolor(id=array.get(TF1ResLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF2ResLabel_array, 0), text=TF1_text + '/' + TF2_input + "(R)")
    if TF2_FractalUp[1] == TF1_FractalUp[1] and TF2_FractalUp != TF1_FractalUp and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF2ResLabel_array, 0), text=TF2_input + "(R)")
    if TF4_FractalDown == TF3_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and chartOnLowerTF3 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF3SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF3_input + '/' + TF4_input + "(S)")
    if TF4_FractalDown[1] == TF3_FractalDown[1] and TF4_FractalDown != TF3_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R')
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF4_input + "(S)")
    if TF4_FractalDown == TF2_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF2SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF2_input + '/' + TF4_input + "(S)")
    if TF4_FractalDown[1] == TF2_FractalDown[1] and TF4_FractalDown != TF2_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R')
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF4_input + "(S)")
    if TF4_FractalDown == TF1_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF4 and not chartEqualTF4
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF1_text + '/' + TF4_input + "(S)")
    if TF4_FractalDown[1] == TF1_FractalDown[1] and TF4_FractalDown != TF1_FractalDown and (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF4SupLabel_array, 0), text=TF4_input + "(S)")
    if TF3_FractalDown == TF2_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and chartOnLowerTF2 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF2SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF2_input + '/' + TF3_input + "(S)")
    if TF3_FractalDown[1] == TF2_FractalDown[1] and TF2_FractalDown != TF3_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R')
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF3_input + "(S)")
    if TF3_FractalDown == TF1_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF3 and not chartEqualTF3
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF1_text + '/' + TF3_input + "(S)")
    if TF3_FractalDown[1] == TF1_FractalDown[1] and TF3_FractalDown != TF1_FractalDown and (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF3SupLabel_array, 0), text=TF3_input + "(S)")
    if TF2_FractalDown == TF1_FractalDown and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and chartOnLowerTF1 and chartOnLowerTF2 and not chartEqualTF2
        label.set_textcolor(id=array.get(TF1SupLabel_array, 0), textcolor=color.new(color.white, 100))
        label.set_text(id=array.get(TF2SupLabel_array, 0), text=TF1_text + '/' + TF2_input + "(S)")
    if TF2_FractalDown[1] == TF1_FractalDown[1] and TF2_FractalDown != TF1_FractalDown and (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R')
        label.set_text(id=array.get(TF2SupLabel_array, 0), text=TF2_input + "(S)")

// ---------------- Alerts
// TF1
PriceEntersTF1ResZone = ta.crossover(close, TF1_ResZone)
PriceTestResAsSupportTF1 = ta.crossunder(close, TF1_FractalUp)
PriceEntersTF1SupZone = ta.crossunder(close, TF1_SupportZone)
PriceTestSupportAsResTF1 = ta.crossover(close, TF1_FractalDown)
PriceBreakingTF1Resistance = ta.crossover(close, TF1_FractalUp)
PriceBreakingTF1Support = ta.crossunder(close, TF1_FractalDown)
NewResFoundTF1 = (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and TF1_FractalUp != TF1_FractalUp[1]
NewSupFoundTF1 = (TF1_Menu == 'S/R Zones' or TF1_Menu == 'S/R') and TF1_FractalDown != TF1_FractalDown[1]

if (TF1_Alerts == 'Price Enters Resistance Zone' or TF1_Alerts == 'Price Enters Either S/R Zone' or TF1_Alerts == 'All Alerts On') and PriceEntersTF1ResZone
    alert(syminfo.ticker + ' - Price enters ' + TF1_text + ' Resistance Zone', alert.freq_once_per_bar)

if (TF1_Alerts == 'Price Enters Resistance Zone' or TF1_Alerts == 'Price Enters Either S/R Zone' or TF1_Alerts == 'All Alerts On') and PriceTestResAsSupportTF1
    alert(syminfo.ticker + ' - Price is testing ' + TF1_text + ' resistance as support', alert.freq_once_per_bar)

if (TF1_Alerts == 'Price Enters Support Zone' or TF1_Alerts == 'Price Enters Either S/R Zone' or TF1_Alerts == 'All Alerts On') and PriceEntersTF1SupZone
    alert(syminfo.ticker + ' - Price enters ' + TF1_text + ' Support Zone', alert.freq_once_per_bar)

if (TF1_Alerts == 'Price Enters Support Zone' or TF1_Alerts == 'Price Enters Either S/R Zone' or TF1_Alerts == 'All Alerts On') and PriceTestSupportAsResTF1
    alert(syminfo.ticker + ' - Price is testing ' + TF1_text + ' support as resistance', alert.freq_once_per_bar)

if (TF1_Alerts == 'Price Breaks Resistance' or TF1_Alerts == 'Price Breaks Either S/R' or TF1_Alerts == 'All Alerts On') and PriceBreakingTF1Resistance
    alert(syminfo.ticker + ' - Price is breaking out ' + TF1_text + ' Resistance', alert.freq_once_per_bar)

if (TF1_Alerts == 'Price Breaks Support' or TF1_Alerts == 'Price Breaks Either S/R' or TF1_Alerts == 'All Alerts On') and PriceBreakingTF1Support
    alert(syminfo.ticker + ' - Price is breaking down ' + TF1_text + ' Support', alert.freq_once_per_bar)

if (TF1_Alerts == 'New S/R Zone Found' or TF1_Alerts == 'All Alerts On')
    if NewResFoundTF1
        alert(syminfo.ticker + ' - New ' + TF1_text + ' Resistance Zone Found', alert.freq_once_per_bar)
    if NewSupFoundTF1
        alert(syminfo.ticker + ' - New ' + TF1_text + ' Support Zone Found', alert.freq_once_per_bar)

// TF2
PriceEntersTF2ResZone = ta.crossover(close, TF2_ResZone)
PriceTestResAsSupportTF2 = ta.crossunder(close, TF2_FractalUp)
PriceEntersTF2SupZone = ta.crossunder(close, TF2_SupportZone)
PriceTestSupportAsResTF2 = ta.crossover(close, TF2_FractalDown)
PriceBreakingTF2Resistance = ta.crossover(close, TF2_FractalUp)
PriceBreakingTF2Support = ta.crossunder(close, TF2_FractalDown)
NewResFoundTF2 = (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and TF2_FractalUp != TF2_FractalUp[1]
NewSupFoundTF2 = (TF2_Menu == 'S/R Zones' or TF2_Menu == 'S/R') and TF2_FractalDown != TF2_FractalDown[1]

if (TF2_Alerts == 'Price Enters Resistance Zone' or TF2_Alerts == 'Price Enters Either S/R Zone' or TF2_Alerts == 'All Alerts On') and PriceEntersTF2ResZone
    alert(syminfo.ticker + ' - Price enters ' + TF2_input + ' Resistance Zone', alert.freq_once_per_bar)

if (TF2_Alerts == 'Price Enters Resistance Zone' or TF2_Alerts == 'Price Enters Either S/R Zone' or TF2_Alerts == 'All Alerts On') and PriceTestResAsSupportTF2
    alert(syminfo.ticker + ' - Price is testing ' + TF2_input + ' resistance as support', alert.freq_once_per_bar)

if (TF2_Alerts == 'Price Enters Support Zone' or TF2_Alerts == 'Price Enters Either S/R Zone' or TF2_Alerts == 'All Alerts On') and PriceEntersTF2SupZone
    alert(syminfo.ticker + ' - Price enters ' + TF2_input + ' Support Zone', alert.freq_once_per_bar)

if (TF2_Alerts == 'Price Enters Support Zone' or TF2_Alerts == 'Price Enters Either S/R Zone' or TF2_Alerts == 'All Alerts On') and PriceTestSupportAsResTF2
    alert(syminfo.ticker + ' - Price is testing ' + TF2_input + ' support as resistance', alert.freq_once_per_bar)

if (TF2_Alerts == 'Price Breaks Resistance' or TF2_Alerts == 'Price Breaks Either S/R' or TF2_Alerts == 'All Alerts On') and PriceBreakingTF2Resistance
    alert(syminfo.ticker + ' - Price is breaking out ' + TF2_input + ' Resistance', alert.freq_once_per_bar)

if (TF2_Alerts == 'Price Breaks Support' or TF2_Alerts == 'Price Breaks Either S/R' or TF2_Alerts == 'All Alerts On') and PriceBreakingTF2Support
    alert(syminfo.ticker + ' - Price is breaking down ' + TF2_input + ' Support', alert.freq_once_per_bar)

if (TF2_Alerts == 'New S/R Zone Found' or TF2_Alerts == 'All Alerts On')
    if NewResFoundTF2
        alert(syminfo.ticker + ' - New ' + TF2_input + ' Resistance Zone Found', alert.freq_once_per_bar)
    if NewSupFoundTF2
        alert(syminfo.ticker + ' - New ' + TF2_input + ' Support Zone Found', alert.freq_once_per_bar)

// TF3
PriceEntersTF3ResZone = ta.crossover(close, TF3_ResZone)
PriceTestResAsSupportTF3 = ta.crossunder(close, TF3_FractalUp)
PriceEntersTF3SupZone = ta.crossunder(close, TF3_SupportZone)
PriceTestSupportAsResTF3 = ta.crossover(close, TF3_FractalDown)
PriceBreakingTF3Resistance = ta.crossover(close, TF3_FractalUp)
PriceBreakingTF3Support = ta.crossunder(close, TF3_FractalDown)
NewResFoundTF3 = (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and TF3_FractalUp != TF3_FractalUp[1]
NewSupFoundTF3 = (TF3_Menu == 'S/R Zones' or TF3_Menu == 'S/R') and TF3_FractalDown != TF3_FractalDown[1]

if (TF3_Alerts == 'Price Enters Resistance Zone' or TF3_Alerts == 'Price Enters Either S/R Zone' or TF3_Alerts == 'All Alerts On') and PriceEntersTF3ResZone
    alert(syminfo.ticker + ' - Price enters ' + TF3_input + ' Resistance Zone', alert.freq_once_per_bar)

if (TF3_Alerts == 'Price Enters Resistance Zone' or TF3_Alerts == 'Price Enters Either S/R Zone' or TF3_Alerts == 'All Alerts On') and PriceTestResAsSupportTF3
    alert(syminfo.ticker + ' - Price is testing ' + TF3_input + ' resistance as support', alert.freq_once_per_bar)

if (TF3_Alerts == 'Price Enters Support Zone' or TF3_Alerts == 'Price Enters Either S/R Zone' or TF3_Alerts == 'All Alerts On') and PriceEntersTF3SupZone
    alert(syminfo.ticker + ' - Price enters ' + TF3_input + ' Support Zone', alert.freq_once_per_bar)

if (TF3_Alerts == 'Price Enters Support Zone' or TF3_Alerts == 'Price Enters Either S/R Zone' or TF3_Alerts == 'All Alerts On') and PriceTestSupportAsResTF3
    alert(syminfo.ticker + ' - Price is testing ' + TF3_input + ' support as resistance', alert.freq_once_per_bar)

if (TF3_Alerts == 'Price Breaks Resistance' or TF3_Alerts == 'Price Breaks Either S/R' or TF3_Alerts == 'All Alerts On') and PriceBreakingTF3Resistance
    alert(syminfo.ticker + ' - Price is breaking out ' + TF3_input + ' Resistance', alert.freq_once_per_bar)

if (TF3_Alerts == 'Price Breaks Support' or TF3_Alerts == 'Price Breaks Either S/R' or TF3_Alerts == 'All Alerts On') and PriceBreakingTF3Support
    alert(syminfo.ticker + ' - Price is breaking down ' + TF3_input + ' Support', alert.freq_once_per_bar)

if (TF3_Alerts == 'New S/R Zone Found' or TF3_Alerts == 'All Alerts On')
    if NewResFoundTF3
        alert(syminfo.ticker + ' - New ' + TF3_input + ' Resistance Zone Found', alert.freq_once_per_bar)
    if NewSupFoundTF3
        alert(syminfo.ticker + ' - New ' + TF3_input + ' Support Zone Found', alert.freq_once_per_bar)

// TF4
PriceEntersTF4ResZone = ta.crossover(close, TF4_ResZone)
PriceTestResAsSupportTF4 = ta.crossunder(close, TF4_FractalUp)
PriceEntersTF4SupZone = ta.crossunder(close, TF4_SupportZone)
PriceTestSupportAsResTF4 = ta.crossover(close, TF4_FractalDown)
PriceBreakingTF4Resistance = ta.crossover(close, TF4_FractalUp)
PriceBreakingTF4Support = ta.crossunder(close, TF4_FractalDown)
NewResFoundTF4 = (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and TF4_FractalUp != TF4_FractalUp[1]
NewSupFoundTF4 = (TF4_Menu == 'S/R Zones' or TF4_Menu == 'S/R') and TF4_FractalDown != TF4_FractalDown[1]

if (TF4_Alerts == 'Price Enters Resistance Zone' or TF4_Alerts == 'Price Enters Either S/R Zone' or TF4_Alerts == 'All Alerts On') and PriceEntersTF4ResZone
    alert(syminfo.ticker + ' - Price enters ' + TF4_input + ' Resistance Zone', alert.freq_once_per_bar)

if (TF4_Alerts == 'Price Enters Resistance Zone' or TF4_Alerts == 'Price Enters Either S/R Zone' or TF4_Alerts == 'All Alerts On') and PriceTestResAsSupportTF4
    alert(syminfo.ticker + ' - Price is testing ' + TF4_input + ' resistance as support', alert.freq_once_per_bar)

if (TF4_Alerts == 'Price Enters Support Zone' or TF4_Alerts == 'Price Enters Either S/R Zone' or TF4_Alerts == 'All Alerts On') and PriceEntersTF4SupZone
    alert(syminfo.ticker + ' - Price enters ' + TF4_input + ' Support Zone', alert.freq_once_per_bar)

if (TF4_Alerts == 'Price Enters Support Zone' or TF4_Alerts == 'Price Enters Either S/R Zone' or TF4_Alerts == 'All Alerts On') and PriceTestSupportAsResTF4
    alert(syminfo.ticker + ' - Price is testing ' + TF4_input + ' support as resistance', alert.freq_once_per_bar)

if (TF4_Alerts == 'Price Breaks Resistance' or TF4_Alerts == 'Price Breaks Either S/R' or TF4_Alerts == 'All Alerts On') and PriceBreakingTF4Resistance
    alert(syminfo.ticker + ' - Price is breaking out ' + TF4_input + ' Resistance', alert.freq_once_per_bar)

if (TF4_Alerts == 'Price Breaks Support' or TF4_Alerts == 'Price Breaks Either S/R' or TF4_Alerts == 'All Alerts On') and PriceBreakingTF4Support
    alert(syminfo.ticker + ' - Price is breaking down ' + TF4_input + ' Support', alert.freq_once_per_bar)

if (TF4_Alerts == 'New S/R Zone Found' or TF4_Alerts == 'All Alerts On')
    if NewResFoundTF4
        alert(syminfo.ticker + ' - New ' + TF4_input + ' Resistance Zone Found', alert.freq_once_per_bar)
    if NewSupFoundTF4
        alert(syminfo.ticker + ' - New ' + TF4_input + ' Support Zone Found', alert.freq_once_per_bar)
//ket thuc Volume-based Support & Resistance Zones V2
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

alertcondition(diemtotal < diemsell, 'Buy Short ALL')
alertcondition(diemtotal > diembuy, 'Buy Long ALL')
