//@version=4
study("Zig Zag MOD", overlay=true, max_lines_count=500, max_labels_count=500)
dev_threshold = input(title="Deviation (%)", type=input.float, defval=5.0, minval=0.00001, maxval=100.0)
depth = input(title="Depth", type=input.integer, defval=10, minval=1)
line_color = input(title="Line Color", defval=#2962FF)
extend_to_last_bar = input(title="Extend to Last Bar", defval=true)
display_reversal_price = input(title="Display Reversal Price", defval=true)
display_cumulative_volume = input(title="Display Cumulative Volume", defval=true)
display_reversal_price_change = input(title="Display Reversal Price Change", defval=true, inline="price rev")
difference_price = input("Absolute", "", options=["Absolute", "Percent"], inline="price rev")

pivots(src, length, isHigh) =>
	p = nz(src[length])
	if length == 0
		[bar_index, p]
	else
		isFound = true
		for i = 0 to length - 1
			if isHigh and src[i] > p
				isFound := false
			if not isHigh and src[i] < p
				isFound := false
		for i = length + 1 to 2 * length
			if isHigh and src[i] >= p
				isFound := false
			if not isHigh and src[i] <= p
				isFound := false
		if isFound and length * 2 <= bar_index
			[bar_index[length], p]
		else
			[int(na), float(na)]
[iH, pH] = pivots(high, floor(depth / 2), true)
[iL, pL] = pivots(low, floor(depth / 2), false)

calc_dev(base_price, price) =>
	100 * (price - base_price) / base_price

price_rotation_aggregate(price_rotation, pLast, cum_volume) =>
    str = ""
    if display_reversal_price
        str += tostring(pLast, format.mintick) + " "
    if display_reversal_price_change
        str += price_rotation + " "
    if display_cumulative_volume
        str += "\n" + cum_volume
    str

caption(isHigh, iLast, pLast, price_rotation, cum_volume) =>
    price_rotation_str = price_rotation_aggregate(price_rotation, pLast, cum_volume)
    if display_reversal_price or display_reversal_price_change or display_cumulative_volume
        if not isHigh
            label.new(iLast, pLast, text=price_rotation_str, style=label.style_none, yloc=yloc.belowbar, textcolor=color.red)
        else
            label.new(iLast, pLast, text=price_rotation_str, style=label.style_none, yloc=yloc.abovebar, textcolor=color.green)

price_rotation_diff(pLast, price) =>
    if display_reversal_price_change
        tmp_calc = price - pLast
        str = difference_price == "Absolute"? (sign(tmp_calc) > 0? "+" : "") + tostring(tmp_calc, format.mintick) : (sign(tmp_calc) > 0? "+" : "-") + tostring((abs(tmp_calc) * 100)/pLast, format.percent)
        str := "(" + str  + ")"
        str
    else
	    ""
volume_sum(index1, index2) =>
    float CVI = 0
    for i = index1 + 1 to index2
        CVI += volume[bar_index - i]
	tostring(CVI, format.volume)

var line lineLast = na
var label labelLast = na
var int iLast = 0
var float pLast = 0
var bool isHighLast = true // otherwise the last pivot is a low pivot
var int linesCount = 0

pivotFound(dev, isHigh, index, price) =>
	if isHighLast == isHigh and not na(lineLast)
		// same direction
		if isHighLast ? price > pLast : price < pLast
			if linesCount <= 1
				line.set_xy1(lineLast, index, price)
			line.set_xy2(lineLast, index, price)
			label.set_xy(labelLast, index, price)
			label.set_text(labelLast, price_rotation_aggregate(price_rotation_diff(line.get_y1(lineLast), price), price, volume_sum(line.get_x1(lineLast), index)))
			[lineLast, labelLast, isHighLast, false]
		else
			[line(na), label(na), bool(na), false]
	else // reverse the direction (or create the very first line)
		if na(lineLast)
			id = line.new(index, price, index, price, color=line_color, width=2)
			lb = caption(isHigh, index, price, price_rotation_diff(pLast, price), volume_sum(index, index))
			[id, lb, isHigh, true]
		else
			// price move is significant
			if abs(dev) >= dev_threshold
			    id = line.new(iLast, pLast, index, price, color=line_color, width=2)
			    lb = caption(isHigh, index, price, price_rotation_diff(pLast, price), volume_sum(iLast, index))
				[id, lb, isHigh, true]
			else
				[line(na), label(na), bool(na), false]


if not na(iH) and not na(iL) and iH == iL
	dev1 = calc_dev(pLast, pH)
	[id2, lb2, isHigh2, isNew2] = pivotFound(dev1, true, iH, pH)
	if isNew2
		linesCount := linesCount + 1
	if not na(id2)
		lineLast := id2
		labelLast := lb2
		isHighLast := isHigh2
		iLast := iH
		pLast := pH
	dev2 = calc_dev(pLast, pL)
	[id1, lb1, isHigh1, isNew1] = pivotFound(dev2, false, iL, pL)
	if isNew1
		linesCount := linesCount + 1
	if not na(id1)
		lineLast := id1
		labelLast := lb1
		isHighLast := isHigh1
		iLast := iL
		pLast := pL
else
	if not na(iH)
		dev1 = calc_dev(pLast, pH)
		[id, lb, isHigh, isNew] = pivotFound(dev1, true, iH, pH)
		if isNew
			linesCount := linesCount + 1
		if not na(id)
			lineLast := id
			labelLast := lb
			isHighLast := isHigh
			iLast := iH
			pLast := pH
	else
		if not na(iL)
			dev2 = calc_dev(pLast, pL)
			[id, lb, isHigh, isNew] = pivotFound(dev2, false, iL, pL)
			if isNew
				linesCount := linesCount + 1
			if not na(id)
				lineLast := id
				labelLast := lb
				isHighLast := isHigh
				iLast := iL
				pLast := pL
isHighLastPoint = not isHighLast
var line extend_line = na
var label extend_label = na
if extend_to_last_bar == true and barstate.islast == true
    isHighLastPoint = not isHighLast
    curSeries = isHighLastPoint ? high : low

    if na(extend_line) and na(extend_label)
        extend_line := line.new(line.get_x2(lineLast), line.get_y2(lineLast), bar_index, curSeries, color=line_color, width=2)
        extend_label := caption(not isHighLast, bar_index, curSeries,  price_rotation_diff(line.get_y2(lineLast), curSeries), volume_sum(line.get_x2(lineLast), bar_index))

    line.set_xy1(extend_line, line.get_x2(lineLast), line.get_y2(lineLast))
    line.set_xy2(extend_line, bar_index, curSeries)
	label.set_xy(extend_label, bar_index, curSeries)
	price_rotation = price_rotation_diff(line.get_y1(extend_line), curSeries)
	volume_cum = volume_sum(line.get_x1(extend_line), bar_index)
	label.set_text(extend_label, price_rotation_aggregate(price_rotation, curSeries, volume_cum))
	label.set_textcolor(extend_label, isHighLastPoint? color.green : color.red)
	label.set_yloc(extend_label, yloc= isHighLastPoint? yloc.abovebar : yloc.belowbar)
plotshape(isHighLastPoint and barstate.islast == true, style=shape.xcross)
