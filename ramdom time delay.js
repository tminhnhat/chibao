//@version=4
study("Seeded Randomizer")

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

plot(i_qtyTimeUnits, "MA", color.red)