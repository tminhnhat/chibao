//@version=5

strategy('CODE AI MOD dev 4', overlay=true, initial_capital=1000)

// Setting 

capcoin = input("ETH/USDT", title="Cap coin trade", group="Setting")
sancoin = input("futu", title="San coin trade", group="Setting")

loaigiamua = input("", title="Chon loai gia mua", group="Setting")
loaigiaban = input("", title="Chon loai gia ban", group="Setting")
loaimargin = input.string(title="Loai Margin", defval="isolated", options=["isolated", "cross"], group="Setting")

donbay = input.int(title="Don bay", defval=10, group="Setting")
risk = input.float(2, title="Risk per Trade %", group="Setting", step=0.5)
ruiromax = input.float(2, title="rui ro % MAX", group="Setting", step=0.1)
typeSL = input.string(title="StopLoss", defval="ATR", options=["Swing", "ATR"], group="Setting")

typeTP = input.string(title="TakeProfit", defval="R:R", options=["R:R", "Multiple Target"], group="Setting")
trendA = input.string(title="Trend Indicator", defval="EMA", options=["EMA", "Superichi"], group="Setting")
_x = input.bool(false, title="do not take too small positions", group="Setting", tooltip="This parameter is used to avoid positions that have a stoploss too close to the entry point and that the broker's spreads take all the gains")
security = input.float(10, title="min of pips (00001.00)", group="Setting")

riskt = risk / 100 + 1



//Backtest Time Period

useDateFilter = input.bool(false, title="Filter Date Range of Backtest", group="Backtest Time Period")
backtestStartDate = input.time(timestamp("1 Jan 2023"), title="Start Date", group="Backtest Time Period", tooltip="This start date is in the time zone of the exchange " + "where the chart's instrument trades. It doesn't use the time " + "zone of the chart or of your computer.")
backtestEndDate = input.time(timestamp("1 July 2023"), title="End Date", group="Backtest Time Period", tooltip="This end date is in the time zone of the exchange " + "where the chart's instrument trades. It doesn't use the time " + "zone of the chart or of your computer.")

inTradeWindow = not useDateFilter or (time >= backtestStartDate and time < backtestEndDate)

//StopLoss

swingHighV = input.int(7, title="Swing High", group="Stop Loss", tooltip="Number of candles in which the parameter targets the highest")
swingLowV = input.int(7, title="Swing Low", group="Stop Loss", tooltip="Number of candles in which the parameter targets the lowest point")

atr1 = input.int(14, title="ATR Period", group="Stop Loss")
atrMultiplierSL = input.int(2, title = "ATR Multiplier", group="Stop Loss")

atr = ta.atr(atr1)
//rui ro max toi da %
biendoruiro = close * ruiromax / 100

swingHigh = ta.highest(high, swingHighV)
swingLow = ta.lowest(low, swingLowV)


atrSell = close + math.min(atr, biendoruiro) * atrMultiplierSL
atrBuy = close - math.min(atr, biendoruiro) * atrMultiplierSL

//plot(atr, color=color.new(color.white, 0), title="ATR test")
//plot(biendoruiro, color=color.new(color.red, 0), title="bien do rui ro")


//TakeProfit

target_stop_ratio = input.float(title='Risk/Reward (R:R)', defval=3, minval=0.5, maxval=100, step=0.1, group="TakeProfit")
target1 = input.float(1, title='Target 1 R:R (Multiple Target)', group="TakeProfit", step=0.1)
target2 = input.float(2, title='Target 2 R:R (Multiple Target)', group="TakeProfit", step=0.1)
target3 = input.float(3, title='Target 3 R:R (Multiple Target)', group="TakeProfit", step=0.1)

//code AI

import jdehorty/MLExtensions/3 as ml
import jdehorty/KernelFunctions/2 as kernels

// ====================
// ==== Background ====
// ====================

// When using Machine Learning algorithms like K-Nearest Neighbors, choosing an
// appropriate distance metric is essential. Euclidean Distance is often used as
// the default distance metric, but it may not always be the best choice. This is
// because market data is often significantly impacted by proximity to significant
// world events such as FOMC Meetings and Black Swan events. These major economic
// events can contribute to a warping effect analogous a massive object's 
// gravitational warping of Space-Time. In financial markets, this warping effect 
// operates on a continuum, which can analogously be referred to as "Price-Time".

// To help to better account for this warping effect, Lorentzian Distance can be
// used as an alternative distance metric to Euclidean Distance. The geometry of
// Lorentzian Space can be difficult to visualize at first, and one of the best
// ways to intuitively understand it is through an example involving 2 feature
// dimensions (z=2). For purposes of this example, let's assume these two features
// are Relative Strength Index (RSI) and the Average Directional Index (ADX). In
// reality, the optimal number of features is in the range of 3-8, but for the sake
// of simplicity, we will use only 2 features in this example.

// Fundamental Assumptions:
// (1) We can calculate RSI and ADX for a given chart.
// (2) For simplicity, values for RSI and ADX are assumed to adhere to a Gaussian 
//     distribution in the range of 0 to 100.
// (3) The most recent RSI and ADX value can be considered the origin of a coordinate 
//     system with ADX on the x-axis and RSI on the y-axis.

// Distances in Euclidean Space:
// Measuring the Euclidean Distances of historical values with the most recent point
// at the origin will yield a distribution that resembles Figure 1 (below).

//                        [RSI]
//                          |                      
//                          |                   
//                          |                 
//                      ...:::....              
//                .:.:::••••••:::•::..             
//              .:•:.:•••::::••::••....::.            
//             ....:••••:••••••••::••:...:•.          
//            ...:.::::::•••:::•••:•••::.:•..          
//            ::•:.:•:•••••••:.:•::::::...:..         
//  |--------.:•••..•••••••:••:...:::•:•:..:..----------[ADX]    
//  0        :•:....:•••••::.:::•••::••:.....            
//           ::....:.:••••••••:•••::••::..:.          
//            .:...:••:::••••••••::•••....:          
//              ::....:.....:•::•••:::::..             
//                ..:..::••..::::..:•:..              
//                    .::..:::.....:                
//                          |            
//                          |                   
//                          |
//                          |
//                         _|_ 0        
//                          
//        Figure 1: Neighborhood in Euclidean Space

// Distances in Lorentzian Space:
// However, the same set of historical values measured using Lorentzian Distance will 
// yield a different distribution that resembles Figure 2 (below).

//                         
//                         [RSI] 
//  ::..                     |                    ..:::  
//   .....                   |                  ......
//    .••••::.               |               :••••••. 
//     .:•••••:.             |            :::••••••.  
//       .•••••:...          |         .::.••••••.    
//         .::•••••::..      |       :..••••••..      
//            .:•••••••::.........::••••••:..         
//              ..::::••••.•••••••.•••••••:.            
//                ...:•••••••.•••••••••::.              
//                  .:..••.••••••.••••..                
//  |---------------.:•••••••••••••••••.---------------[ADX]          
//  0             .:•:•••.••••••.•••••••.                
//              .••••••••••••••••••••••••:.            
//            .:••••••••••::..::.::••••••••:.          
//          .::••••••::.     |       .::•••:::.       
//         .:••••••..        |          :••••••••.     
//       .:••••:...          |           ..•••••••:.   
//     ..:••::..             |              :.•••••••.   
//    .:•....                |               ...::.:••.  
//   ...:..                  |                   :...:••.     
//  :::.                     |                       ..::  
//                          _|_ 0
//
//       Figure 2: Neighborhood in Lorentzian Space 


// Observations:
// (1) In Lorentzian Space, the shortest distance between two points is not 
//     necessarily a straight line, but rather, a geodesic curve.
// (2) The warping effect of Lorentzian distance reduces the overall influence  
//     of outliers and noise.
// (3) Lorentzian Distance becomes increasingly different from Euclidean Distance 
//     as the number of nearest neighbors used for comparison increases.

// ======================
// ==== Custom Types ====
// ======================

// This section uses PineScript's new Type syntax to define important data structures
// used throughout the script.

type Settings
    float source
    int neighborsCount
    int maxBarsBack
    int featureCount
    int colorCompression
    bool showExits
    bool useDynamicExits

type Label
    int long
    int short
    int neutral

type FeatureArrays
    array<float> f1
    array<float> f2
    array<float> f3
    array<float> f4
    array<float> f5

type FeatureSeries
    float f1
    float f2
    float f3
    float f4
    float f5

type MLModel
    int firstBarIndex
    array<int> trainingLabels
    int loopSize
    float lastDistance
    array<float> distancesArray
    array<int> predictionsArray
    int prediction

type FilterSettings 
    bool useVolatilityFilter
    bool useRegimeFilter
    bool useAdxFilter
    float regimeThreshold
    int adxThreshold

type Filter
    bool volatility
    bool regime
    bool adx 

// ==========================
// ==== Helper Functions ====
// ==========================

series_from(feature_string, _close, _high, _low, _hlc3, f_paramA, f_paramB) =>
    switch feature_string
        "RSI" => ml.n_rsi(_close, f_paramA, f_paramB)
        "WT" => ml.n_wt(_hlc3, f_paramA, f_paramB)
        "CCI" => ml.n_cci(_close, f_paramA, f_paramB)
        "ADX" => ml.n_adx(_high, _low, _close, f_paramA)

get_lorentzian_distance(int i, int featureCount, FeatureSeries featureSeries, FeatureArrays featureArrays) =>
    switch featureCount
        5 => math.log(1+math.abs(featureSeries.f1 - array.get(featureArrays.f1, i))) + 
             math.log(1+math.abs(featureSeries.f2 - array.get(featureArrays.f2, i))) + 
             math.log(1+math.abs(featureSeries.f3 - array.get(featureArrays.f3, i))) + 
             math.log(1+math.abs(featureSeries.f4 - array.get(featureArrays.f4, i))) + 
             math.log(1+math.abs(featureSeries.f5 - array.get(featureArrays.f5, i)))
        4 => math.log(1+math.abs(featureSeries.f1 - array.get(featureArrays.f1, i))) +
             math.log(1+math.abs(featureSeries.f2 - array.get(featureArrays.f2, i))) +
             math.log(1+math.abs(featureSeries.f3 - array.get(featureArrays.f3, i))) +
             math.log(1+math.abs(featureSeries.f4 - array.get(featureArrays.f4, i)))
        3 => math.log(1+math.abs(featureSeries.f1 - array.get(featureArrays.f1, i))) +
             math.log(1+math.abs(featureSeries.f2 - array.get(featureArrays.f2, i))) +
             math.log(1+math.abs(featureSeries.f3 - array.get(featureArrays.f3, i)))
        2 => math.log(1+math.abs(featureSeries.f1 - array.get(featureArrays.f1, i))) +
             math.log(1+math.abs(featureSeries.f2 - array.get(featureArrays.f2, i)))

// ================  
// ==== Inputs ==== 
// ================ 

// Settings Object: General User-Defined Inputs
Settings settings = 
 Settings.new(
   input.source(title='Source', defval=close, group="General Settings", tooltip="Source of the input data"),
   input.int(title='Neighbors Count', defval=8, group="General Settings", minval=1, maxval=100, step=1, tooltip="Number of neighbors to consider"),
   input.int(title="Max Bars Back", defval=2000, group="General Settings"),
   input.int(title="Feature Count", defval=5, group="Feature Engineering", minval=2, maxval=5, tooltip="Number of features to use for ML predictions."),
   input.int(title="Color Compression", defval=1, group="General Settings", minval=1, maxval=10, tooltip="Compression factor for adjusting the intensity of the color scale."),
   input.bool(title="Show Default Exits", defval=false, group="General Settings", tooltip="Default exits occur exactly 4 bars after an entry signal. This corresponds to the predefined length of a trade during the model's training process.", inline="exits"),
   input.bool(title="Use Dynamic Exits", defval=false, group="General Settings", tooltip="Dynamic exits attempt to let profits ride by dynamically adjusting the exit threshold based on kernel regression logic.", inline="exits")
 )
   
// Trade Stats Settings
// Note: The trade stats section is NOT intended to be used as a replacement for proper backtesting. It is intended to be used for calibration purposes only.
showTradeStats = input.bool(true, 'Show Trade Stats', tooltip='Displays the trade stats for a given configuration. Useful for optimizing the settings in the Feature Engineering section. This should NOT replace backtesting and should be used for calibration purposes only. Early Signal Flips represent instances where the model changes signals before 4 bars elapses; high values can indicate choppy (ranging) market conditions.', group="General Settings")
useWorstCase = input.bool(false, "Use Worst Case Estimates", tooltip="Whether to use the worst case scenario for backtesting. This option can be useful for creating a conservative estimate that is based on close prices only, thus avoiding the effects of intrabar repainting. This option assumes that the user does not enter when the signal first appears and instead waits for the bar to close as confirmation. On larger timeframes, this can mean entering after a large move has already occurred. Leaving this option disabled is generally better for those that use this indicator as a source of confluence and prefer estimates that demonstrate discretionary mid-bar entries. Leaving this option enabled may be more consistent with traditional backtesting results.", group="General Settings")

// Settings object for user-defined settings
FilterSettings filterSettings =
 FilterSettings.new(
   input.bool(title="Use Volatility Filter", defval=true, tooltip="Whether to use the volatility filter.", group="Filters"),
   input.bool(title="Use Regime Filter", defval=true, group="Filters", inline="regime"),
   input.bool(title="Use ADX Filter", defval=false, group="Filters", inline="adx"),
   input.float(title="Threshold", defval=-0.1, minval=-10, maxval=10, step=0.1, tooltip="Whether to use the trend detection filter. Threshold for detecting Trending/Ranging markets.", group="Filters", inline="regime"),
   input.int(title="Threshold", defval=20, minval=0, maxval=100, step=1, tooltip="Whether to use the ADX filter. Threshold for detecting Trending/Ranging markets.", group="Filters", inline="adx")
 )

// Filter object for filtering the ML predictions
Filter filter =
 Filter.new(
   ml.filter_volatility(1, 10, filterSettings.useVolatilityFilter), 
   ml.regime_filter(ohlc4, filterSettings.regimeThreshold, filterSettings.useRegimeFilter),
   ml.filter_adx(settings.source, 14, filterSettings.adxThreshold, filterSettings.useAdxFilter)
  )

// Feature Variables: User-Defined Inputs for calculating Feature Series. 
f1_string = input.string(title="Feature 1", options=["RSI", "WT", "CCI", "ADX"], defval="RSI", inline = "01", tooltip="The first feature to use for ML predictions.", group="Feature Engineering")
f1_paramA = input.int(title="Parameter A", tooltip="The primary parameter of feature 1.", defval=14, inline = "02", group="Feature Engineering")
f1_paramB = input.int(title="Parameter B", tooltip="The secondary parameter of feature 2 (if applicable).", defval=1, inline = "02", group="Feature Engineering")
f2_string = input.string(title="Feature 2", options=["RSI", "WT", "CCI", "ADX"], defval="WT", inline = "03", tooltip="The second feature to use for ML predictions.", group="Feature Engineering")
f2_paramA = input.int(title="Parameter A", tooltip="The primary parameter of feature 2.", defval=10, inline = "04", group="Feature Engineering")
f2_paramB = input.int(title="Parameter B", tooltip="The secondary parameter of feature 2 (if applicable).", defval=11, inline = "04", group="Feature Engineering")
f3_string = input.string(title="Feature 3", options=["RSI", "WT", "CCI", "ADX"], defval="CCI", inline = "05", tooltip="The third feature to use for ML predictions.", group="Feature Engineering")
f3_paramA = input.int(title="Parameter A", tooltip="The primary parameter of feature 3.", defval=20, inline = "06", group="Feature Engineering")
f3_paramB = input.int(title="Parameter B", tooltip="The secondary parameter of feature 3 (if applicable).", defval=1, inline = "06", group="Feature Engineering")
f4_string = input.string(title="Feature 4", options=["RSI", "WT", "CCI", "ADX"], defval="ADX", inline = "07", tooltip="The fourth feature to use for ML predictions.", group="Feature Engineering")
f4_paramA = input.int(title="Parameter A", tooltip="The primary parameter of feature 4.", defval=20, inline = "08", group="Feature Engineering")
f4_paramB = input.int(title="Parameter B", tooltip="The secondary parameter of feature 4 (if applicable).", defval=2, inline = "08", group="Feature Engineering")
f5_string = input.string(title="Feature 5", options=["RSI", "WT", "CCI", "ADX"], defval="RSI", inline = "09", tooltip="The fifth feature to use for ML predictions.", group="Feature Engineering")
f5_paramA = input.int(title="Parameter A", tooltip="The primary parameter of feature 5.", defval=9, inline = "10", group="Feature Engineering")
f5_paramB = input.int(title="Parameter B", tooltip="The secondary parameter of feature 5 (if applicable).", defval=1, inline = "10", group="Feature Engineering")

// FeatureSeries Object: Calculated Feature Series based on Feature Variables
featureSeries = 
 FeatureSeries.new(
   series_from(f1_string, close, high, low, hlc3, f1_paramA, f1_paramB), // f1
   series_from(f2_string, close, high, low, hlc3, f2_paramA, f2_paramB), // f2 
   series_from(f3_string, close, high, low, hlc3, f3_paramA, f3_paramB), // f3
   series_from(f4_string, close, high, low, hlc3, f4_paramA, f4_paramB), // f4
   series_from(f5_string, close, high, low, hlc3, f5_paramA, f5_paramB)  // f5
 )

// FeatureArrays Variables: Storage of Feature Series as Feature Arrays Optimized for ML
// Note: These arrays cannot be dynamically created within the FeatureArrays Object Initialization and thus must be set-up in advance.
var f1Array = array.new_float()
var f2Array = array.new_float()
var f3Array = array.new_float()
var f4Array = array.new_float()
var f5Array = array.new_float()
array.push(f1Array, featureSeries.f1)
array.push(f2Array, featureSeries.f2)
array.push(f3Array, featureSeries.f3)
array.push(f4Array, featureSeries.f4)
array.push(f5Array, featureSeries.f5)

// FeatureArrays Object: Storage of the calculated FeatureArrays into a single object
featureArrays = 
 FeatureArrays.new(
  f1Array, // f1
  f2Array, // f2
  f3Array, // f3
  f4Array, // f4
  f5Array  // f5
 )

// Label Object: Used for classifying historical data as training data for the ML Model
Label direction = 
 Label.new(
   long=1, 
   short=-1, 
   neutral=0
  )

// Derived from General Settings
maxBarsBackIndex = last_bar_index >= settings.maxBarsBack ? last_bar_index - settings.maxBarsBack : 0

// EMA Settings 
useEmaFilter = input.bool(title="Use EMA Filter", defval=false, group="Filters", inline="ema")
emaPeriod = input.int(title="Period", defval=200, minval=1, step=1, group="Filters", inline="ema", tooltip="The period of the EMA used for the EMA Filter.")
isEmaUptrend = useEmaFilter ? close > ta.ema(close, emaPeriod) : true
isEmaDowntrend = useEmaFilter ? close < ta.ema(close, emaPeriod) : true
useSmaFilter = input.bool(title="Use SMA Filter", defval=false, group="Filters", inline="sma")
smaPeriod = input.int(title="Period", defval=200, minval=1, step=1, group="Filters", inline="sma", tooltip="The period of the SMA used for the SMA Filter.")
isSmaUptrend = useSmaFilter ? close > ta.sma(close, smaPeriod) : true
isSmaDowntrend = useSmaFilter ? close < ta.sma(close, smaPeriod) : true

// Nadaraya-Watson Kernel Regression Settings
useKernelFilter = input.bool(true, "Trade with Kernel", group="Kernel Settings", inline="kernel")
showKernelEstimate = input.bool(true, "Show Kernel Estimate", group="Kernel Settings", inline="kernel")
useKernelSmoothing = input.bool(false, "Enhance Kernel Smoothing", tooltip="Uses a crossover based mechanism to smoothen kernel color changes. This often results in less color transitions overall and may result in more ML entry signals being generated.", inline='1', group='Kernel Settings')
h = input.int(8, 'Lookback Window', minval=3, tooltip='The number of bars used for the estimation. This is a sliding value that represents the most recent historical bars. Recommended range: 3-50', group="Kernel Settings", inline="kernel")
r = input.float(8., 'Relative Weighting', step=0.25, tooltip='Relative weighting of time frames. As this value approaches zero, the longer time frames will exert more influence on the estimation. As this value approaches infinity, the behavior of the Rational Quadratic Kernel will become identical to the Gaussian kernel. Recommended range: 0.25-25', group="Kernel Settings", inline="kernel")
x = input.int(25, "Regression Level", tooltip='Bar index on which to start regression. Controls how tightly fit the kernel estimate is to the data. Smaller values are a tighter fit. Larger values are a looser fit. Recommended range: 2-25', group="Kernel Settings", inline="kernel")
lag = input.int(2, "Lag", tooltip="Lag for crossover detection. Lower values result in earlier crossovers. Recommended range: 1-2", inline='1', group='Kernel Settings')

// Display Settings
showBarColors = input.bool(true, "Show Bar Colors", tooltip="Whether to show the bar colors.", group="Display Settings")
showBarPredictions = input.bool(defval = true, title = "Show Bar Prediction Values", tooltip = "Will show the ML model's evaluation of each bar as an integer.", group="Display Settings")
useAtrOffset = input.bool(defval = false, title = "Use ATR Offset", tooltip = "Will use the ATR offset instead of the bar prediction offset.", group="Display Settings")
barPredictionsOffset = input.float(0, "Bar Prediction Offset", minval=0, tooltip="The offset of the bar predictions as a percentage from the bar high or close.", group="Display Settings")

// =================================
// ==== Next Bar Classification ====
// =================================

// This model specializes specifically in predicting the direction of price action over the course of the next 4 bars. 
// To avoid complications with the ML model, this value is hardcoded to 4 bars but support for other training lengths may be added in the future.
src = settings.source
y_train_series = src[4] < src[0] ? direction.short : src[4] > src[0] ? direction.long : direction.neutral
var y_train_array = array.new_int(0)

// Variables used for ML Logic
var predictions = array.new_float(0)
var prediction = 0.
var signal = direction.neutral
var distances = array.new_float(0)

array.push(y_train_array, y_train_series)

// =========================
// ====  Core ML Logic  ====
// =========================

// Approximate Nearest Neighbors Search with Lorentzian Distance:
// A novel variation of the Nearest Neighbors (NN) search algorithm that ensures a chronologically uniform distribution of neighbors.

// In a traditional KNN-based approach, we would iterate through the entire dataset and calculate the distance between the current bar 
// and every other bar in the dataset and then sort the distances in ascending order. We would then take the first k bars and use their 
// labels to determine the label of the current bar. 

// There are several problems with this traditional KNN approach in the context of real-time calculations involving time series data:
// - It is computationally expensive to iterate through the entire dataset and calculate the distance between every historical bar and
//   the current bar.
// - Market time series data is often non-stationary, meaning that the statistical properties of the data change slightly over time.
// - It is possible that the nearest neighbors are not the most informative ones, and the KNN algorithm may return poor results if the
//   nearest neighbors are not representative of the majority of the data.

// Previously, the user @capissimo attempted to address some of these issues in several of his PineScript-based KNN implementations by:
// - Using a modified KNN algorithm based on consecutive furthest neighbors to find a set of approximate "nearest" neighbors.
// - Using a sliding window approach to only calculate the distance between the current bar and the most recent n bars in the dataset.

// Of these two approaches, the latter is inherently limited by the fact that it only considers the most recent bars in the overall dataset. 

// The former approach has more potential to leverage historical price action, but is limited by:
// - The possibility of a sudden "max" value throwing off the estimation
// - The possibility of selecting a set of approximate neighbors that are not representative of the majority of the data by oversampling 
//   values that are not chronologically distinct enough from one another
// - The possibility of selecting too many "far" neighbors, which may result in a poor estimation of price action

// To address these issues, a novel Approximate Nearest Neighbors (ANN) algorithm is used in this indicator.

// In the below ANN algorithm:
// 1. The algorithm iterates through the dataset in chronological order, using the modulo operator to only perform calculations every 4 bars.
//    This serves the dual purpose of reducing the computational overhead of the algorithm and ensuring a minimum chronological spacing 
//    between the neighbors of at least 4 bars.
// 2. A list of the k-similar neighbors is simultaneously maintained in both a predictions array and corresponding distances array.
// 3. When the size of the predictions array exceeds the desired number of nearest neighbors specified in settings.neighborsCount, 
//    the algorithm removes the first neighbor from the predictions array and the corresponding distance array.
// 4. The lastDistance variable is overriden to be a distance in the lower 25% of the array. This step helps to boost overall accuracy 
//    by ensuring subsequent newly added distance values increase at a slower rate.
// 5. Lorentzian distance is used as a distance metric in order to minimize the effect of outliers and take into account the warping of 
//    "price-time" due to proximity to significant economic events.

lastDistance = -1.0
size = math.min(settings.maxBarsBack-1, array.size(y_train_array)-1)
sizeLoop = math.min(settings.maxBarsBack-1, size)

if bar_index >= maxBarsBackIndex //{
    for i = 0 to sizeLoop //{
        d = get_lorentzian_distance(i, settings.featureCount, featureSeries, featureArrays) 
        if d >= lastDistance and i%4 //{
            lastDistance := d            
            array.push(distances, d)
            array.push(predictions, math.round(array.get(y_train_array, i)))
            if array.size(predictions) > settings.neighborsCount //{
                lastDistance := array.get(distances, math.round(settings.neighborsCount*3/4))
                array.shift(distances)
                array.shift(predictions)
            //}
        //}
    //}
    prediction := array.sum(predictions)
//}

// ============================
// ==== Prediction Filters ====
// ============================

// User Defined Filters: Used for adjusting the frequency of the ML Model's predictions
filter_all = filter.volatility and filter.regime and filter.adx

// Filtered Signal: The model's prediction of future price movement direction with user-defined filters applied
signal := prediction > 0 and filter_all ? direction.long : prediction < 0 and filter_all ? direction.short : nz(signal[1])

// Bar-Count Filters: Represents strict filters based on a pre-defined holding period of 4 bars
var int barsHeld = 0
barsHeld := ta.change(signal) ? 0 : barsHeld + 1
isHeldFourBars = barsHeld == 4
isHeldLessThanFourBars = 0 < barsHeld and barsHeld < 4

// Fractal Filters: Derived from relative appearances of signals in a given time series fractal/segment with a default length of 4 bars
isDifferentSignalType = ta.change(signal)
isEarlySignalFlip = ta.change(signal) and (ta.change(signal[1]) or ta.change(signal[2]) or ta.change(signal[3]))
isBuySignal = signal == direction.long and isEmaUptrend and isSmaUptrend
isSellSignal = signal == direction.short and isEmaDowntrend and isSmaDowntrend
isLastSignalBuy = signal[4] == direction.long and isEmaUptrend[4] and isSmaUptrend[4]
isLastSignalSell = signal[4] == direction.short and isEmaDowntrend[4] and isSmaDowntrend[4]
isNewBuySignal = isBuySignal and isDifferentSignalType
isNewSellSignal = isSellSignal and isDifferentSignalType

// Kernel Regression Filters: Filters based on Nadaraya-Watson Kernel Regression using the Rational Quadratic Kernel
// For more information on this technique refer to my other open source indicator located here: 
// https://www.tradingview.com/script/AWNvbPRM-Nadaraya-Watson-Rational-Quadratic-Kernel-Non-Repainting/
c_green = color.new(#009988, 20)
c_red = color.new(#CC3311, 20)
transparent = color.new(#000000, 100)
yhat1 = kernels.rationalQuadratic(settings.source, h, r, x)
yhat2 = kernels.gaussian(settings.source, h-lag, x)
kernelEstimate = yhat1
// Kernel Rates of Change
bool wasBearishRate = yhat1[2] > yhat1[1]
bool wasBullishRate = yhat1[2] < yhat1[1]
bool isBearishRate = yhat1[1] > yhat1
bool isBullishRate = yhat1[1] < yhat1
isBearishChange = isBearishRate and wasBullishRate
isBullishChange = isBullishRate and wasBearishRate
// Kernel Crossovers
bool isBullishCrossAlert = ta.crossover(yhat2, yhat1)
bool isBearishCrossAlert = ta.crossunder(yhat2, yhat1) 
bool isBullishSmooth = yhat2 >= yhat1
bool isBearishSmooth = yhat2 <= yhat1
// Kernel Colors
color colorByCross = isBullishSmooth ? c_green : c_red
color colorByRate = isBullishRate ? c_green : c_red
color plotColor = showKernelEstimate ? (useKernelSmoothing ? colorByCross : colorByRate) : transparent
plot(kernelEstimate, color=plotColor, linewidth=2, title="Kernel Regression Estimate")
// Alert Variables
bool alertBullish = useKernelSmoothing ? isBullishCrossAlert : isBullishChange
bool alertBearish = useKernelSmoothing ? isBearishCrossAlert : isBearishChange
// Bullish and Bearish Filters based on Kernel
isBullish = useKernelFilter ? (useKernelSmoothing ? isBullishSmooth : isBullishRate) : true
isBearish = useKernelFilter ? (useKernelSmoothing ? isBearishSmooth : isBearishRate) : true

// ===========================
// ==== Entries and Exits ====
// ===========================

// Entry Conditions: Booleans for ML Model Position Entries
startLongTrade = isNewBuySignal and isBullish and isEmaUptrend and isSmaUptrend
startShortTrade = isNewSellSignal and isBearish and isEmaDowntrend and isSmaDowntrend

// Dynamic Exit Conditions: Booleans for ML Model Position Exits based on Fractal Filters and Kernel Regression Filters
lastSignalWasBullish = ta.barssince(startLongTrade) < ta.barssince(startShortTrade)
lastSignalWasBearish = ta.barssince(startShortTrade) < ta.barssince(startLongTrade)
barsSinceRedEntry = ta.barssince(startShortTrade)
barsSinceRedExit = ta.barssince(alertBullish)
barsSinceGreenEntry = ta.barssince(startLongTrade)
barsSinceGreenExit = ta.barssince(alertBearish)
isValidShortExit = barsSinceRedExit > barsSinceRedEntry
isValidLongExit = barsSinceGreenExit > barsSinceGreenEntry
endLongTradeDynamic = (isBearishChange and isValidLongExit[1])
endShortTradeDynamic = (isBullishChange and isValidShortExit[1])

// Fixed Exit Conditions: Booleans for ML Model Position Exits based on a Bar-Count Filters
endLongTradeStrict = ((isHeldFourBars and isLastSignalBuy) or (isHeldLessThanFourBars and isNewSellSignal and isLastSignalBuy)) and startLongTrade[4]
endShortTradeStrict = ((isHeldFourBars and isLastSignalSell) or (isHeldLessThanFourBars and isNewBuySignal and isLastSignalSell)) and startShortTrade[4]
isDynamicExitValid = not useEmaFilter and not useSmaFilter and not useKernelSmoothing
endLongTrade = settings.useDynamicExits and isDynamicExitValid ? endLongTradeDynamic : endLongTradeStrict 
endShortTrade = settings.useDynamicExits and isDynamicExitValid ? endShortTradeDynamic : endShortTradeStrict

// =========================
// ==== Plotting Labels ====
// =========================

// Note: These will not repaint once the most recent bar has fully closed. By default, signals appear over the last closed bar; to override this behavior set offset=0.
plotshape(startLongTrade ? low : na, 'Buy', shape.labelup, location.belowbar, color=ml.color_green(prediction), size=size.small, offset=0)
plotshape(startShortTrade ? high : na, 'Sell', shape.labeldown, location.abovebar, ml.color_red(-prediction), size=size.small, offset=0)
plotshape(endLongTrade and settings.showExits ? high : na, 'StopBuy', shape.xcross, location.absolute, color=#3AFF17, size=size.tiny, offset=0)
plotshape(endShortTrade and settings.showExits ? low : na, 'StopSell', shape.xcross, location.absolute, color=#FD1707, size=size.tiny, offset=0)

// ================
// ==== Alerts ====
// ================ 

// Separate Alerts for Entries and Exits
//alertcondition(startLongTrade, title='Open Long ▲', message='LDC Open Long ▲ | {{ticker}}@{{close}} | ({{interval}})')
//alertcondition(endLongTrade, title='Close Long ▲', message='LDC Close Long ▲ | {{ticker}}@{{close}} | ({{interval}})')
//alertcondition(startShortTrade, title='Open Short ▼', message='LDC Open Short  | {{ticker}}@{{close}} | ({{interval}})')
//alertcondition(endShortTrade, title='Close Short ▼', message='LDC Close Short ▼ | {{ticker}}@{{close}} | ({{interval}})')

// Combined Alerts for Entries and Exits
//alertcondition(startShortTrade or startLongTrade, title='Open Position ▲▼', message='LDC Open Position ▲▼ | {{ticker}}@{{close}} | ({{interval}})')
//alertcondition(endShortTrade or endLongTrade, title='Close Position ▲▼', message='LDC Close Position  ▲▼ | {{ticker}}@[{{close}}] | ({{interval}})')

// Kernel Estimate Alerts
//alertcondition(condition=alertBullish, title='Kernel Bullish Color Change', message='LDC Kernel Bullish ▲ | {{ticker}}@{{close}} | ({{interval}})')
//alertcondition(condition=alertBearish, title='Kernel Bearish Color Change', message='LDC Kernel Bearish ▼ | {{ticker}}@{{close}} | ({{interval}})')

// =========================
// ==== Display Signals ==== 
// =========================

atrSpaced = useAtrOffset ? ta.atr(1) : na
compressionFactor = settings.neighborsCount / settings.colorCompression
c_pred = prediction > 0 ? color.from_gradient(prediction, 0, compressionFactor, #787b86, #009988) : prediction <= 0 ? color.from_gradient(prediction, -compressionFactor, 0, #CC3311, #787b86) : na
c_label = showBarPredictions ? c_pred : na
c_bars = showBarColors ? color.new(c_pred, 50) : na
x_val = bar_index
y_val = useAtrOffset ? prediction > 0 ? high + atrSpaced: low - atrSpaced : prediction > 0 ? high + hl2*barPredictionsOffset/20 : low - hl2*barPredictionsOffset/30
label.new(x_val, y_val, str.tostring(prediction), xloc.bar_index, yloc.price, color.new(color.white, 100), label.style_label_up, c_label, size.normal, text.align_left)
barcolor(showBarColors ? color.new(c_pred, 50) : na)

// ===================== 
// ==== Backtesting ====
// =====================

// The following can be used to stream signals to a backtest adapter
backTestStream = switch 
    startLongTrade => 1
    endLongTrade => 2
    startShortTrade => -1
    endShortTrade => -2
plot(backTestStream, "Backtest Stream", display=display.none)



//EMA

srce = input.source(close, title="Source", group="EMA (Trend)")
emav = input.int(200, title="Length", group="EMA (Trend)")

ema = ta.ema(srce, emav)

//Superichi

tenkan_len  = input(9,'Tenkan',inline='tenkan', group="Superichi (Trend)")
tenkan_mult = input(2.,'',inline='tenkan', group="Superichi (Trend)")

kijun_len   = input(26,'Kijun',inline='kijun', group="Superichi (Trend)")
kijun_mult  = input(4,'',inline='kijun', group="Superichi (Trend)")

spanB_len   = input(52,'Senkou Span B',inline='span', group="Superichi (Trend)")
spanB_mult  = input(6, '', inline='span', group="Superichi (Trend)")

offset      = input(26,'Displacement', group="Superichi (Trend)")

avg(src,length,mult)=>
    atr = ta.atr(length)*mult
    up = hl2 + atr
    dn = hl2 - atr
    upper = 0.,lower = 0.
    upper := src[1] < upper[1] ? math.min(up,upper[1]) : up
    lower := src[1] > lower[1] ? math.max(dn,lower[1]) : dn
    
    os = 0,max = 0.,min = 0.
    os := src > upper ? 1 : src < lower ? 0 : os[1]
    spt = os == 1 ? lower : upper
    max := ta.cross(src,spt) ? math.max(src,max[1]) : os == 1 ? math.max(src,max[1]) : spt
    min := ta.cross(src,spt) ? math.min(src,min[1]) : os == 0 ? math.min(src,min[1]) : spt
    math.avg(max,min)

tenkan = avg(close,tenkan_len,tenkan_mult)
kijun = avg(close,kijun_len,kijun_mult)

senkouA = math.avg(kijun,tenkan)
senkouB = avg(close,spanB_len,spanB_mult)

tenkan_css = #2157f3
kijun_css = #ff5d00

cloud_a = color.new(color.teal,50)
cloud_b = color.new(color.red,50)

//Alert

getpips() =>
    syminfo.mintick * (syminfo.type == "crypto" ? 5 : 1)



mess_buyP = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(swingLow) + " profittrigger=" + str.tostring(((close-swingLow)*target_stop_ratio)+close) + " size=" + str.tostring(risk*donbay) + "%" + " cancelall=true"
mess_sellP = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(swingHigh) + " profittrigger=" + str.tostring(close-((swingHigh-close)*target_stop_ratio)) + " size=" + str.tostring(risk*donbay) + "%" + " cancelall=true"

mess_buyAP = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(atrBuy) + " profittrigger=" + str.tostring(((close-atrBuy)*target_stop_ratio)+close) + " size=" + str.tostring(risk*donbay) + "%" + " cancelall=true"
mess_sellAP = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(atrSell) + " profittrigger=" + str.tostring(close-((atrSell-close)*target_stop_ratio)) + " size=" + str.tostring(risk*donbay) + "%" + " cancelall=true"

mess_buyAMP1 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(atrBuy) + " profittrigger=" + str.tostring(((close-atrBuy)*target1)+close) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_buyAMP2 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(atrBuy) + " profittrigger=" + str.tostring(((close-atrBuy)*target2)+close) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_buyAMP3 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(atrBuy) + " profittrigger=" + str.tostring(((close-atrBuy)*target3)+close) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"

mess_sellAMP1 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(atrSell) + " profittrigger=" + str.tostring(close-((atrSell-close)*target1)) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_sellAMP2 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(atrSell) + " profittrigger=" + str.tostring(close-((atrSell-close)*target2)) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_sellAMP3 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(atrSell) + " profittrigger=" + str.tostring(close-((atrSell-close)*target3)) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"

mess_buyMP1 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(swingLow) + " profittrigger=" + str.tostring(((close-swingLow)*target1)+close) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_buyMP2 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(swingLow) + " profittrigger=" + str.tostring(((close-swingLow)*target2)+close) + " size=" + str.tostring(risk*donbay/2) + "%"
mess_buyMP3 = "trade:" + sancoin + ":long leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiamua) + " stoptrigger=" + str.tostring(swingLow) + " profittrigger=" + str.tostring(((close-swingLow)*target3)+close) + " size=" + str.tostring(risk*donbay/2) + "%"

mess_sellMP1 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(swingHigh) + " profittrigger=" + str.tostring(close-((swingHigh-close)*target1)) + " size=" + str.tostring(risk*donbay/2) + "%" + " cancelall=true"
mess_sellMP2 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(swingHigh) + " profittrigger=" + str.tostring(close-((swingHigh-close)*target2)) + " size=" + str.tostring(risk*donbay/2) + "%"
mess_sellMP3 = "trade:" + sancoin + ":short leverage=" + str.tostring(donbay) + " symbol=" + str.tostring(capcoin) + str.tostring(loaigiaban) + " stoptrigger=" + str.tostring(swingHigh) + " profittrigger=" + str.tostring(close-((swingHigh-close)*target3)) + " size=" + str.tostring(risk*donbay/2) + "%"

mess_quayxe = "trade:" + sancoin + ":close" + " symbol=" + str.tostring(capcoin) + " cancelall=true"

// Strategy
    
float risk_long = na
float risk_short = na
float stopLoss = na
float takeProfit1 = na
float takeProfit2 = na
float takeProfit3 = na
float entry_price = na



string mess_doistoplossbuy1 = na
string mess_doistoplossbuy2 = na
string mess_doistoplossbuy3 = na
string mess_doistoplossbuy4 = na
string mess_doistoplossbuy5 = na

string mess_doistoplosssell1 = na
string mess_doistoplosssell2 = na
string mess_doistoplosssell3 = na
string mess_doistoplosssell4 = na
string mess_doistoplosssell5 = na

string mess_doistoplossbuyrr1 = na
string mess_doistoplossbuyrr2 = na
string mess_doistoplosssellrr1 = na
string mess_doistoplosssellrr2 = na

bool longcondition = na
bool shortcondition = na




//ket thuc mess doi stoploss

if trendA == "Superichi"
    longcondition := startLongTrade and close > senkouA[26] and senkouA[26] > senkouB[26]
    shortcondition := startShortTrade and close < senkouA[26] and senkouA[26] < senkouB[26]
if trendA == "EMA"   
    longcondition := startLongTrade and close > ema
    shortcondition := startShortTrade and close < ema

risk_long := risk_long[1]
risk_short := risk_short[1]

lotB = (strategy.equity*riskt-strategy.equity)/(close - swingLow)
lotS = (strategy.equity*riskt-strategy.equity)/(swingHigh - close)
    
lotB1 = (strategy.equity*riskt-strategy.equity)/(close - atrBuy)
lotS1 = (strategy.equity*riskt-strategy.equity)/(atrSell - close)

if typeSL == "ATR"

    if typeTP == "Multiple Target"
    
        if (strategy.position_size == 0 or strategy.position_size[1] < 0) and longcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_long := (close - atrBuy) / close
            minp = close - atrBuy
            
            if _x 
                strategy.entry("long", strategy.long, qty=lotB1, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyAMP1, when = minp > security)
                alert(mess_buyAMP2, alert.freq_once_per_bar_close)					
                alert(mess_buyAMP3, alert.freq_once_per_bar_close)					
				
            else 
                strategy.entry("long", strategy.long, qty=lotB1, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyAMP1)
                alert(mess_buyAMP2, alert.freq_once_per_bar_close)	
                alert(mess_buyAMP3, alert.freq_once_per_bar_close)	
                
        
        if (strategy.position_size == 0 or strategy.position_size[1] > 0) and shortcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_short := (atrSell - close) / close 
            minp = atrSell - close
            
            if _x 

                strategy.entry("short", strategy.short, qty=lotS1, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellAMP1, when = minp > security)
                alert(mess_sellAMP2, alert.freq_once_per_bar_close)                    
                alert(mess_sellAMP3, alert.freq_once_per_bar_close)                    
				
            else 

                strategy.entry("short", strategy.short, qty=lotS1, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellAMP1)
                alert(mess_sellAMP2, alert.freq_once_per_bar_close)                    
                alert(mess_sellAMP3, alert.freq_once_per_bar_close)                    

    
    if typeTP == "R:R"
    
        if (strategy.position_size == 0 or strategy.position_size[1] < 0) and longcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_long := (close - atrBuy) / close
            minp = close - atrBuy
            
            if _x 

                strategy.entry("long", strategy.long, qty=lotB1, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyAP, when = minp > security)                
			
			else 

				strategy.entry("long", strategy.long, qty=lotB1, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyAP)


        
        if (strategy.position_size == 0 or strategy.position_size[1] > 0) and shortcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_short := (atrSell - close) / close 
            minp = atrSell - close
         
            if _x 

                strategy.entry("short", strategy.short, qty=lotS1, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellAP, when = minp > security)
                    
			else 

                strategy.entry("short", strategy.short, qty=lotS1, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellAP)


    
if typeSL == "Swing"

    if typeTP == "Multiple Target"
    
        if (strategy.position_size == 0 or strategy.position_size[1] < 0) and longcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_long := (close - swingLow) / close
            minp = close - swingLow
            
            if _x 

                strategy.entry("long", strategy.long, qty=lotB, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyMP1, when = minp > security)
                alert(mess_buyMP2, alert.freq_once_per_bar_close)                   
                alert(mess_buyMP3, alert.freq_once_per_bar_close)                   

            else 

                strategy.entry("long", strategy.long, qty=lotB, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyMP1)
                alert(mess_buyMP2, alert.freq_once_per_bar_close)                   
                alert(mess_buyMP3, alert.freq_once_per_bar_close)                   

       
        if (strategy.position_size == 0 or strategy.position_size[1] > 0) and shortcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_short := (swingHigh - close) / close  
            minp = swingHigh - close
            
            if _x 

                strategy.entry("short", strategy.short, qty=lotS, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellMP1, when = minp > security)
                alert(mess_sellMP2, alert.freq_once_per_bar_close)                        
                alert(mess_sellMP3, alert.freq_once_per_bar_close)                        

            else 

                strategy.entry("short", strategy.short, qty=lotS, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellMP1)
                alert(mess_sellMP2, alert.freq_once_per_bar_close)                       
                alert(mess_sellMP3, alert.freq_once_per_bar_close)                       
                    
    if typeTP == "R:R"

        if (strategy.position_size == 0 or strategy.position_size[1] < 0) and longcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_long := (close - swingLow) / close
            minp = close - swingLow
        
            if _x 

                strategy.entry("long", strategy.long, qty=lotB, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyP, when = minp > security)
                    
			else 

                strategy.entry("long", strategy.long, qty=lotB, comment="Buy " + str.tostring(close) + "", alert_message = mess_buyP)

 
       
        if (strategy.position_size == 0 or strategy.position_size[1] > 0) and shortcondition and inTradeWindow 
            strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe)
			risk_short := (swingHigh - close) / close  
            minp = swingHigh - close
  
            if _x 

                strategy.entry("short", strategy.short, qty=lotS, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellP, when = minp > security)

			else 

                strategy.entry("short", strategy.short, qty=lotS, comment="Sell " + str.tostring(close) + "", alert_message = mess_sellP)

    
if typeTP == "Multiple Target"


        
    if strategy.position_size > 0

        stopLoss := strategy.position_avg_price * (1 - risk_long)
        takeProfit1 := strategy.position_avg_price * (1 + target1 * risk_long)
        takeProfit2 := strategy.position_avg_price * (1 + target2 * risk_long)
        takeProfit3 := strategy.position_avg_price * (1 + target3 * risk_long)
		
        entry_price := strategy.position_avg_price


//mess doi stoploss
		mess_doistoplossbuy1 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(entry_price)
		mess_doistoplossbuy2 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((entry_price + takeProfit1)/2)
		mess_doistoplossbuy3 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(takeProfit1)
		mess_doistoplossbuy4 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((takeProfit1 + takeProfit2)/2)
		mess_doistoplossbuy5 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(takeProfit2)
			
		strategy.exit("Exit 1", "long", limit = takeProfit1, qty_percent=34, comment_profit = "TP1 ✅")

        if ta.crossover(high, (takeProfit1 + entry_price)/2)
			alert(mess_doistoplossbuy1, alert.freq_once_per_bar_close)
			strategy.exit("Exit 1", "long", stop = entry_price, limit = takeProfit1, qty_percent=34, comment_profit = "TP1 ✅", comment_loss = "Hoa von")

        if ta.crossover(high, takeProfit1)
			alert(mess_doistoplossbuy2, alert.freq_once_per_bar_close)
			strategy.exit("Exit 2", "long", stop = ((takeProfit1 + entry_price)/2), limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "TP1/2")
        if ta.crossover(high, (takeProfit1 + takeProfit2)/2)
			alert(mess_doistoplossbuy3, alert.freq_once_per_bar_close)
			strategy.exit("Exit 3", "long", stop = takeProfit1, limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "Hoa von TP1")
        if ta.crossover(high, ((((takeProfit1 + takeProfit2)/2) + takeProfit2)/2))
			alert(mess_doistoplossbuy4, alert.freq_once_per_bar_close)
			strategy.exit("Exit 4", "long", stop = ((takeProfit1 + takeProfit2)/2), limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "Hoa von TP2/2")
        if ta.crossover(high, (takeProfit3 + takeProfit2)/2)
			alert(mess_doistoplossbuy5, alert.freq_once_per_bar_close)
			strategy.exit("Exit 5", "long", stop = takeProfit2, limit = takeProfit3, qty_percent = 33, comment_profit = "TP3 ✅", comment_loss = "TP2")

//		if startShortTrade
//			strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe, immediately= true)
		else 
            strategy.exit("Exit 1", "long", stop = stopLoss, qty_percent = 100, comment_loss = "SL ❌")
    
    if strategy.position_size < 0
    
        stopLoss := strategy.position_avg_price * (1 + risk_short)
        takeProfit1 := strategy.position_avg_price * (1 - target1 * risk_short)
        takeProfit2 := strategy.position_avg_price * (1 - target2 * risk_short)
        takeProfit3 := strategy.position_avg_price * (1 - target3 * risk_short)
        entry_price := strategy.position_avg_price


		mess_doistoplosssell1 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(entry_price)
		mess_doistoplosssell2 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((entry_price + takeProfit1)/2)
		mess_doistoplosssell3 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(takeProfit1)
		mess_doistoplosssell4 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((takeProfit1 + takeProfit2)/2)
		mess_doistoplosssell5 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(takeProfit2)
			
		strategy.exit("Exit 1", "short", limit = takeProfit1, qty_percent = 34, comment_profit = "TP1 ✅")
            
		if ta.crossunder(low, (takeProfit1 + entry_price)/2)
			alert(mess_doistoplosssell1, alert.freq_once_per_bar_close)
			strategy.exit("Exit 1", "short", stop = entry_price, limit = takeProfit1, qty_percent = 34, comment_profit = "TP2 ✅", comment_loss = "Hoa von")
        if ta.crossunder(low, takeProfit1)
			alert(mess_doistoplosssell2, alert.freq_once_per_bar_close)
			strategy.exit("Exit 2", "short", stop = ((takeProfit1 + entry_price)/2), limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "TP1/2")
        if ta.crossunder(low, (takeProfit1 + takeProfit2)/2)
			alert(mess_doistoplosssell3, alert.freq_once_per_bar_close)
			strategy.exit("Exit 3", "short", stop = takeProfit1, limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "Hoa von TP1")
        if ta.crossunder(low, ((((takeProfit1 + takeProfit2)/2) + takeProfit2)/2))
			alert(mess_doistoplosssell4, alert.freq_once_per_bar_close)
			strategy.exit("Exit 4", "short", stop = ((takeProfit1 + takeProfit2)/2), limit = takeProfit2, qty_percent = 33, comment_profit = "TP2 ✅", comment_loss = "Hoa von TP2/2")
        if ta.crossunder(low, (takeProfit3 + takeProfit2)/2)
			alert(mess_doistoplosssell5, alert.freq_once_per_bar_close)
			strategy.exit("Exit 5", "short", stop = takeProfit2, limit = takeProfit3, qty_percent = 33, comment_profit = "TP3 ✅", comment_loss = "TP2")

//		if startLongTrade
//			strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe, immediately= true)
		else 
            strategy.exit("Exit 1", "short", stop = stopLoss, qty_percent = 100, comment_loss = "SL ❌")
            
if typeTP == "R:R"

    if strategy.position_size > 0

        stopLoss := strategy.position_avg_price * (1 - risk_long)
        takeProfit1 := strategy.position_avg_price * (1 + target_stop_ratio * risk_long)
        entry_price := strategy.position_avg_price
//mess doi stoploss
		mess_doistoplossbuyrr1 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(entry_price)
		mess_doistoplossbuyrr2 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((entry_price + takeProfit1)/2)


        strategy.exit("Exit long", "long", stop = stopLoss, limit = takeProfit1, comment_profit="TP ✅", comment_loss="SL ❌")

        if ta.crossover(high, (takeProfit1 + entry_price)/2)
			alert(mess_doistoplossbuyrr1, alert.freq_once_per_bar_close)

        if ta.crossover(high, (((takeProfit1 + entry_price)/2) + takeProfit1)/2)
			alert(mess_doistoplossbuyrr2, alert.freq_once_per_bar_close)
//		if startShortTrade
//			strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe, immediately= true)

    if strategy.position_size < 0

        stopLoss := strategy.position_avg_price * (1 + risk_short) 
        takeProfit1 := strategy.position_avg_price * (1 - target_stop_ratio * risk_short) 
        entry_price := strategy.position_avg_price

		mess_doistoplosssellrr1 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring(entry_price)
		mess_doistoplosssellrr2 := "trade:" + sancoin + ":stoploss" + " symbol=" + str.tostring(capcoin) + " stopsize=100%" + " stoptrigger=" + str.tostring((entry_price + takeProfit1)/2)
		
            
		strategy.exit("Exit short", "short", stop = stopLoss, limit = takeProfit1, comment_profit="TP ✅" , comment_loss="SL ❌")         
        if ta.crossunder(low, (takeProfit1 + entry_price)/2)
			alert(mess_doistoplosssellrr1, alert.freq_once_per_bar_close)

        if ta.crossunder(low, (((takeProfit1 + entry_price)/2) + takeProfit1)/2)
			alert(mess_doistoplosssellrr2, alert.freq_once_per_bar_close)
//		if startLongTrade
//			strategy.close_all(comment = "Quay xe", alert_message = mess_quayxe, immediately= true)
//plot

trendema = trendA == "EMA" ? ema : na
plot(trendema, title="EMA", color=color.white, linewidth=2)

trendsuperA = trendA == "Superichi" ? senkouA : na 
trendsuperB = trendA == "Superichi" ? senkouB : na 
A = plot(trendsuperA,'Senkou Span A', na, offset=offset-1)
B = plot(trendsuperB,'Senkou Span B', na, offset=offset-1)
fill(A,B,senkouA > senkouB ? cloud_a : cloud_b)



exswingH = typeSL == "Swing" ? swingHigh : na
exswingL = typeSL == "Swing" ? swingLow : na
plot(exswingH, color=color.new(color.white, 60), style=plot.style_cross, title='Swing High')
plot(exswingL, color=color.new(color.white, 60), style=plot.style_cross, title='Swing Low')

exatrS = typeSL == "ATR" ? atrSell : na
exatrB = typeSL == "ATR" ? atrBuy : na
plot(exatrS, color=color.new(color.white, 60), title='ATR')
plot(exatrB, color=color.new(color.white, 60), title='ATR')

p_ep = plot(entry_price, color=color.new(color.white, 0), linewidth=2, style=plot.style_linebr, title='entry price')
p_sl = plot(stopLoss, color=color.new(color.red, 0), linewidth=2, style=plot.style_linebr, title='stopLoss')
p_tp2 = plot(takeProfit2, color=color.new(color.green, 0), linewidth=2, style=plot.style_linebr, title='takeProfit1')
p_tp1 = plot(takeProfit1, color=color.new(#52F071, 0), linewidth=1, style=plot.style_linebr, title='takeProfit2')
fill(p_sl, p_ep, color.new(color.red, transp=85))
fill(p_tp2, p_ep, color.new(color.green, transp=85))
fill(p_tp1, p_ep, color.new(#52F071, transp=85))

colorresult = strategy.netprofit > 0 ? color.green : color.red	
profitprc = strategy.netprofit / strategy.initial_capital * 100
periodzone = (backtestEndDate - backtestStartDate) / 3600 / 24 / 1000

var tbl = table.new(position.top_right, 4, 2, border_width=3)

table.cell(tbl, 0, 0, "Symbol",  bgcolor = #9B9B9B, width = 6, height = 6)
table.cell(tbl, 1, 0, "Net Profit", bgcolor = #9B9B9B, width = 6, height = 6)
table.cell(tbl, 2, 0, "Trades", bgcolor = #9B9B9B, width = 6, height = 6)
table.cell(tbl, 3, 0, "Period",  bgcolor = #9B9B9B, width = 6, height = 6)
    
table.cell(tbl, 0, 1, str.tostring(syminfo.ticker),  bgcolor = #E8E8E8, width = 6, height = 6)
table.cell(tbl, 1, 1, str.tostring(profitprc, format.mintick) + " %", bgcolor = colorresult,   width = 6, height = 6)
table.cell(tbl, 2, 1, str.tostring(strategy.closedtrades), bgcolor = colorresult,   width = 6, height = 6)
table.cell(tbl, 3, 1, str.tostring(periodzone) + " day", bgcolor = colorresult,   width = 6, height = 6)