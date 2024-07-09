OUT_SETTINGS = {};

var KeyPts = [];
var CLIPBOARD = null;
var UNDOREDO = [];
var UNDOREDOINDEX = -1;
var STORAGE_TIME = null;
var FREEZE_UNDOREDO = false;
var LASTSTRING = null;

function requireElm(_id) {
	//	if (_id === 'hue')
	//		debugger;
	let e = document.getElementById(_id);
	if (e) return e;
	alert("element " + _id + " not found");
	return null;
}

function setOptElmVal(_id, _val) {
	//	if (_id === 'hue')
	//debugger;
	let e = document.getElementById(_id);
	if (e) {
		e.value = _val;
	}
}

function getOptElmIntVal(_id, _default) {
	let e = document.getElementById(_id);
	if (e && e.value) {
		switch (typeof (e.value)) {
			case "string": return parseInt(e.value); break;
			case "number": if (isNaN(e.value)) return _default; else return e.value; break;
			default: break;
		}
	}
	return _default;
}

function copyKp(_index) {
	var kp = {
		colorValue: KeyPts[_index].colorValue,
		lineIndex: KeyPts[_index].lineIndex,
		weight: KeyPts[_index].weight,
		shuffle: KeyPts[_index].shuffle,
		id: KeyPts[_index].id
	};
	return kp;
}


function undo() {
	FREEZE_UNDOREDO = true;

	if (UNDOREDOINDEX > 0) {
		UNDOREDOINDEX--;
		console.log("undo restoring at " + UNDOREDOINDEX);

		loadPal(false, true, UNDOREDO[UNDOREDOINDEX]);
		/*
				var photo = UNDOREDO[UNDOREDOINDEX].kp;
				KeyPts = [];
				for (var i = 0; i < photo.length; i++) {
					KeyPts[i] = {};
					KeyPts[i].colorValue = photo[i].colorValue;
					KeyPts[i].lineIndex = photo[i].lineIndex;
					KeyPts[i].weight = photo[i].weight;
					KeyPts[i].shuffle = photo[i].shuffle;
					KeyPts[i].id = photo[i].id;
				}
				setOptElmVal('hue', UNDOREDO[UNDOREDOINDEX].hue);
				setOptElmVal('saturation', UNDOREDO[UNDOREDOINDEX].saturation);
				setOptElmVal('value', UNDOREDO[UNDOREDOINDEX].value);
		
				let linec = getOptElmVal('linecount', 256);
				onLineCount({ lines: linec, hue: UNDOREDO[UNDOREDOINDEX].hue, sat: UNDOREDO[UNDOREDOINDEX].saturation, val: UNDOREDO[UNDOREDOINDEX].value }, true);
				*/
	}

	FREEZE_UNDOREDO = false;
}

function redo() {
	FREEZE_UNDOREDO = true;

	if (UNDOREDOINDEX < UNDOREDO.length - 1) {
		UNDOREDOINDEX++;
		console.log("redo restoring at " + UNDOREDOINDEX);
		loadPal(false, true, UNDOREDO[UNDOREDOINDEX]);
		/*
				var photo = UNDOREDO[UNDOREDOINDEX].kp;
				KeyPts = [];
				for (var i = 0; i < photo.length; i++) {
					KeyPts[i] = {};
					KeyPts[i].colorValue = photo[i].colorValue;
					KeyPts[i].lineIndex = photo[i].lineIndex;
					KeyPts[i].weight = photo[i].weight;
					KeyPts[i].shuffle = photo[i].shuffle;
					KeyPts[i].id = photo[i].id;
				}
				setOptElmVal('hue', UNDOREDO[UNDOREDOINDEX].hue);
				setOptElmVal('saturation', UNDOREDO[UNDOREDOINDEX].saturation);
				setOptElmVal('value', UNDOREDO[UNDOREDOINDEX].value);
		
				let linec = getOptElmVal('linecount', 256);
				onLineCount({ lines: linec, hue: UNDOREDO[UNDOREDOINDEX].hue, sat: UNDOREDO[UNDOREDOINDEX].saturation, val: UNDOREDO[UNDOREDOINDEX].value }, true);
				*/
	}
	else console.log("max redo reached at " + UNDOREDOINDEX);

	FREEZE_UNDOREDO = false;
}

function onCopyKp(_index) {
	CLIPBOARD = copyKp(_index);
}

function onPasteKp(_index) {
	KeyPts[_index].colorValue = CLIPBOARD.colorValue;
	KeyPts[_index].weight = CLIPBOARD.weight;
	KeyPts[_index].shuffle = CLIPBOARD.shuffle;
	onLineCount(null);
}

function checkKpRequirements() {
	if (KeyPts.length === 0) {
		KeyPts.push({ colorValue: 0, lineIndex: 0, weight: 1, shuffle: 0, id: "" });
	}
	if (KeyPts.length === 1) {
		var elem = document.getElementById('linecount');
		var cnt = 256; // default line count
		if (elem) // yes, can be null when loading page
			cnt = parseInt(elem.value);
		KeyPts.push({ colorValue: 0, lineIndex: cnt - 1, weight: 1, shuffle: 0, id: "" });
	}
	KeyPts[0].lineIndex = 0;
	var elem = document.getElementById('index_0');
	if (elem)
		elem.value = 0;

	if (KeyPts[1].lineIndex < 0) {
		KeyPts[1].lineIndex = 0;
		elem = document.getElementById('index_1');
		if (elem)
			elem.value = 0;
	}

	if (KeyPts.length > 2) {
		var dirty = true;
		while (dirty) {
			dirty = false;
			for (var i = 0; i < KeyPts.length - 1; i++) {
				if (KeyPts[i].lineIndex > KeyPts[i + 1].lineIndex) {
					var kp1 = copyKp(i);
					var kp2 = copyKp(i + 1);
					KeyPts[i] = kp2;
					KeyPts[i + 1] = kp1;
					dirty = true;
					break;
				}
			}
		}
	}

	const lncnt = getOptElmIntVal('linecount', 0);
	KeyPts[KeyPts.length - 1].lineIndex = lncnt - 1;
}

function formatColor(_str) {
	while (_str.length < 6)
		_str = "0" + _str;
	return _str;
}

function addKeyPoint() {
	if (KeyPts.length == 0)
		KeyPts.push({ colorValue: 0, lineIndex: 0, weight: 1, shuffle: 0, id: "" });
	else {
		const cnt = getOptElmIntVal('linecount', 0);
		KeyPts.push({ colorValue: 0, lineIndex: cnt - 1, weight: 1, shuffle: 0, id: "" });
	}
	onLineCount(null);
}

function deleteKp(_i) {
	KeyPts.splice(_i, 1)
	onLineCount(null);
}

function getWeight(_index) {
	var elem = document.getElementById('weight_' + _index.toString());
	if (!elem)
		return 1;
	var val = parseInt(elem.value);
	if (val === 0)
		return 1;
	return val;
}

function getShuffle(_index) {
	var elem = document.getElementById('shuffle_' + _index.toString());
	if (!elem)
		return 0;
	var val = parseInt(elem.value);
	return val;
}

function getLineIndex(_index) {
	var elem = document.getElementById('index_' + _index.toString());
	if (!elem)
		return 0;
	var val = parseInt(elem.value);
	return val;
}


function duplicateKp(_i) {
	var newkp = [];
	for (var ii = 0; ii < KeyPts.length; ii++) {
		KeyPts[ii].lineIndex = getLineIndex(ii);
		KeyPts[ii].weight = getWeight(ii);
		KeyPts[ii].shuffle = getShuffle(ii);
		var iicol = document.getElementById('colorBox_' + ii.toString()).value;
		while (iicol.charAt(0) == ' ' || iicol.charAt(0) == '#')
			iicol = iicol.substr(1);
		var iival = parseInt(iicol, 16);
		KeyPts[ii].colorValue = iival;
		var ln = KeyPts[ii].lineIndex;
		if (ii < KeyPts.length - 1)
			ln = Math.floor((KeyPts[ii].lineIndex + KeyPts[ii + 1].lineIndex) / 2);
		newkp.push({ lineIndex: KeyPts[ii].lineIndex, weight: KeyPts[ii].weight, shuffle: KeyPts[ii].shuffle, colorValue: KeyPts[ii].colorValue, id: "" });
		if (ii == _i)
			newkp.push({ lineIndex: ln, weight: KeyPts[ii].weight, shuffle: KeyPts[ii].shuffle, colorValue: KeyPts[ii].colorValue, id: "" });
	}
	KeyPts = newkp;
	onLineCount(null);
}

function onNew() {
	KeyPts = [];
	//	UNDOREDO = [];
	//	UNDOREDOINDEX = -1;
	STORAGE_TIME = null;
	onLineCount(null);
	setOptElmVal('hue', 50);
	setOptElmVal('saturation', 50);
	setOptElmVal('value', 50);
	localStorage.clear();
}

function onLoad() {
	onLineCount(null, false, true);
	refreshPal(true);
}

function findNextNumberInString(_str, _index) {
	while (true) {
		var c = _str.charAt(_index++);
		if (c >= '0' && c <= '9')
			break;
	}
	var nStr = "";
	_index--;
	while (true) {
		var c = _str.charAt(_index++);
		if (c >= '0' && c <= '9') nStr += c;
		else break;
	}
	var num = parseInt(nStr);
	return { n: num, i: _index };
}

function findNextHexNumberInString(_str, _index) {
	while (true) {
		var c = _str.charAt(_index++);
		if (c == '#')
			break;
	}
	var nStr = "";
	while (true) {
		var c = _str.charAt(_index++);
		if (c >= '0' && c <= '9') nStr += c;
		else if (c >= 'a' && c <= 'f') nStr += c;
		else if (c >= 'A' && c <= 'F') nStr += c;
		else break;
	}
	var num = parseInt(nStr, 16);
	return { n: num, i: _index };
}

function loadPal(_fromLocalStorage, _omitUndoRedo, _forcedString) {
	KeyPts = [];
	let val = null;
	if (_forcedString && _forcedString.length > 2)
		val = _forcedString;
	else {
		if (_fromLocalStorage === true)
			val = localStorage.getItem('grdmstr_data');
		if (val === null) {
			var xp = document.getElementById('export');
			val = xp.value;
		}
	}
	var index = val.indexOf("grdmstr_data:");
	if (index < 0) {
		if (_fromLocalStorage)
			return false;
		alert("ERROR: could not find string 'grdmstr_data:'");
		return false;
	}
	var next = findNextNumberInString(val, index);
	var keypCount = next.n;
	index = next.i;
	next = findNextNumberInString(val, index);
	var lineCount = next.n;
	index = next.i;
	setOptElmVal('linecount', lineCount.toString());
	index = val.indexOf("hsv:");
	if (index < 0) {
		alert("ERROR: could not find string 'hsv:'");
		return false;
	}
	next = findNextNumberInString(val, index);
	var hval = next.n.toString();
	setOptElmVal('hue', hval);
	index = next.i;
	next = findNextNumberInString(val, index);
	var sval = next.n.toString();
	setOptElmVal('saturation', sval);
	index = next.i;
	next = findNextNumberInString(val, index);
	var vval = next.n.toString();
	setOptElmVal('value', vval);
	index = next.i;

	for (var i = 0; i < keypCount; i++) {
		next = findNextNumberInString(val, index);
		var lineindex = next.n;
		index = next.i;

		next = findNextHexNumberInString(val, index);
		var col = next.n;
		index = next.i;

		next = findNextNumberInString(val, index);
		var lineweight = next.n;
		index = next.i;

		next = findNextNumberInString(val, index);
		var lineshuffle = next.n;
		index = next.i;

		KeyPts.push({ colorValue: col, lineIndex: lineindex, weight: lineweight, shuffle: lineshuffle, id: "" });

	}
	onLineCount({ lines: lineCount, hue: hval, sat: sval, val: vval });
	return true;
}



function onImageDropped() {
	go();
}

function settings() {
}

function closeSettings() {
}

function validate() {
	precalSrcImg();
	if (OUT_SETTINGS.noise == 'perlin') setPerlinNoise();
	else if (OUT_SETTINGS.noise == 'simplex') setSimplexNoise();
	else if (OUT_SETTINGS.noise == 'random') setRandomNoise();
}

var origImg;
var origCvs;
var origContext;
var origImgData;
var origImgPixels;


function findPrevKeyPtIndex(_line) {
	var nearest = -1;
	for (var it = 0; it < KeyPts.length; it++) {
		if (KeyPts[it].lineIndex <= _line) {
			if (nearest == -1 || KeyPts[it].lineIndex >= KeyPts[nearest].lineIndex)
				nearest = it;
		}
	}
	if (nearest == -1) nearest = 0;
	return KeyPts[nearest];
}

function findNextKeyPtIndex(_line) {
	var nearest = -1;
	for (var it = 0; it < KeyPts.length; it++) {
		if (KeyPts[it].lineIndex > _line) {
			if (nearest == -1 || KeyPts[it].lineIndex <= KeyPts[nearest].lineIndex)
				nearest = it;
		}
	}
	if (nearest == -1) nearest = KeyPts.length - 1;
	return KeyPts[nearest];
}

function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [h, s, l];
}

function hslToRgb(h, s, l) {
	var r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [r * 255, g * 255, b * 255];
}

function doSaturation(_updateUndoRedo) {
	refreshPal(!_updateUndoRedo);
}

function importImage() {
	var elem = document.getElementById('file-input');
	elem.style.display = 'block';
	elem.onchange = e => {
		var file = e.target.files[0];
		var fileName = file.name;
		var img = document.getElementById('loadimg');
		var reader = new FileReader();
		reader.onload = (function (aImg) {
			return function (e) {
				aImg.src = e.target.result;
				aImg.onload = function () { // wait for image to load the data before continuing
					var c = document.getElementById("importCvs");
					var ctx = c.getContext('2d');
					c.width = aImg.width;
					c.height = aImg.height;
					ctx.width = aImg.width;
					ctx.height = aImg.height;
					ctx.drawImage(aImg, 0, 0);

					var imageData = ctx.getImageData(0, 0, ctx.width, ctx.height);
					var pixels = imageData.data;
					var index = 0;
					KeyPts = [];
					document.getElementById('linecount').value = ctx.height;
					for (var y = 0; y < ctx.height; y++, index += 4 * ctx.width) {
						var col = pixels[index] << 16;
						col |= pixels[index + 1] << 8;
						col |= pixels[index + 2];
						KeyPts.push({ colorValue: col, lineIndex: y, weight: 1, shuffle: 0, id: "" });
					}
					aImg.style.display = 'none';
					c.style.display = 'none';
					onLineCount();
				};
			};
		})(img);
		reader.readAsDataURL(file);

	}
	elem.click();
	elem.style.display = 'none';
}

function refreshPal(_omitUndoRedo) {
	checkKpRequirements();

	var vhue = getOptElmIntVal('hue', 50);
	var sat = getOptElmIntVal('saturation', 50);
	var val = getOptElmIntVal('value', 50);
	var xp = document.getElementById('export');
	let xportASM = true;
	let comment = ';';
	let hex = '$';
	if (document.getElementById("xport_type").value == "C") {
		xportASM = false;		
		comment = '//';
		hex = '0x0';
	}

	const cnt = getOptElmIntVal('linecount', 256);
	xp.value = "";
	if (!xportASM) xp.value += "/*\n";
	xp.value += ";grdmstr_data:" + KeyPts.length + "," + cnt + "\n";
	xp.value += ";hsv:" + vhue + "," + sat + "," + val + "\n";	

	for (var ii = 0; ii < KeyPts.length; ii++) {
		KeyPts[ii].lineIndex = getLineIndex(ii);
		KeyPts[ii].weight = getWeight(ii);
		KeyPts[ii].shuffle = getShuffle(ii);
		var iicol = document.getElementById('colorBox_' + ii.toString()).value;
		while (iicol.charAt(0) === ' ' || iicol.charAt(0) === '#')
			iicol = iicol.substr(1);
		var iival = parseInt(iicol, 16);
		KeyPts[ii].colorValue = iival;
		xp.value += ';' + KeyPts[ii].lineIndex + ":#" + iival.toString(16);
		xp.value += "," + KeyPts[ii].weight;
		xp.value += "," + KeyPts[ii].shuffle + "\n";
	}
	if (!xportASM) xp.value += "*/\n";
	LASTSTRING = xp.value;

	var str = "";//"<table style='width:100%'>";
	var r, g, b, nr, ng, nb, cr, cg, cb;
	var pr = [];
	var pg = [];
	var pb = [];
	var colors = [];
	var curKeyp;
	var nextKeyp;

	var vhue = getOptElmIntVal('hue', 50);
	var sat = getOptElmIntVal('saturation', 50);
	var colval = getOptElmIntVal('value', 50);


	for (var i = 0; i < cnt; i++) {
		var curKeyp = findPrevKeyPtIndex(i);
		var nextKeyp = findNextKeyPtIndex(i);
		var elm = document.getElementById(curKeyp.id);
		var s = elm.value;
		while (s.charAt(0) == ' ' || s.charAt(0) == '#')
			s = s.substr(1);
		var val = parseInt(s, 16);
		if (isNaN(val))
			alert("Unable to parse number");
		if (curKeyp.lineIndex == i) {
			r = (val >> 16) & 0xff;
			g = (val >> 8) & 0xff;
			b = val & 0xff;
			cr = r;
			cg = g;
			cb = b;
			var nelm = document.getElementById(nextKeyp.id);
			var ns = nelm.value;
			while (ns.charAt(0) == ' ' || ns.charAt(0) == '#')
				ns = ns.substr(1);
			var nval = parseInt(ns, 16);
			if (isNaN(nval))
				alert("Unable to parse number");
			nr = (nval >> 16) & 0xff;
			ng = (nval >> 8) & 0xff;
			nb = nval & 0xff;
			var deltaLine = nextKeyp.lineIndex - curKeyp.lineIndex;
			if (deltaLine > 0) {
				pr[i] = (nr - r) / deltaLine;
				pg[i] = (ng - g) / deltaLine;
				pb[i] = (nb - b) / deltaLine;
			} else {
				pr[i] = 0;
				pg[i] = 0;
				pb[i] = 0;
			}
		} else {
			pr[i] = pr[i - 1];
			pg[i] = pg[i - 1];
			pb[i] = pb[i - 1];
		}

		switch (curKeyp.weight) {
			case 2: { // cosine
				var ratio = 1;
				if ((nextKeyp !== null) && (nextKeyp.lineIndex !== curKeyp.lineIndex))
					ratio = Math.cos((i - curKeyp.lineIndex) / (nextKeyp.lineIndex - curKeyp.lineIndex) * 3.14159 * .5);
				if (ratio > 1. || ratio < 0.)
					console.log("bad ratio: " + ratio);
				r = cr * ratio + nr * (1. - ratio);
				g = cg * ratio + ng * (1. - ratio);
				b = cb * ratio + nb * (1. - ratio);
			}
				break;

			case 3: { // invert cosine
				var ratio = 1;
				if ((nextKeyp !== null) && (nextKeyp.lineIndex !== curKeyp.lineIndex))
					ratio = 1. - Math.sin((i - curKeyp.lineIndex) / (nextKeyp.lineIndex - curKeyp.lineIndex) * 3.14159 * .5);
				if (ratio > 1. || ratio < 0.)
					console.log("bad ratio: " + ratio);
				r = cr * ratio + nr * (1. - ratio);
				g = cg * ratio + ng * (1. - ratio);
				b = cb * ratio + nb * (1. - ratio);
			}
				break;
		}

		val = colval;
		var hsl = rgbToHsl(r, g, b);
		var hue = hsl[0];
		var saturation = hsl[1];
		var value = hsl[2];
		hue += (vhue - 50.0) / 100.0;
		if (hue < 0.0) hue = 0.0;
		if (hue > 1.0) hue = 1.0;
		saturation += (sat - 50.0) / 100.0;
		if (saturation < 0.0) saturation = 0.0;
		if (saturation > 1.0) saturation = 1.0;
		value += (val - 50.0) / 100.0;
		if (value < 0.0) value = 0.0;
		if (value > 1.0) value = 1.0;
		var rgb = hslToRgb(hue, saturation, value);
		val = nearestCol(rgb[0], rgb[1], rgb[2]);

		//val = nearestCol(r,g,b);
		colors[i] = val;
		var sval = val.toString(16);
		r += pr[i];
		g += pg[i];
		b += pb[i];
	}

	var outCvs = document.getElementById('outImg');
	outCvs.width = 320;
	var zoom = 2;
	var cb = document.getElementById("Zoomed");
	if (cb.checked)
		zoom = 2;
	else
		zoom = 1;
	outCvs.height = cnt * zoom;
	var outContext = outCvs.getContext("2d");
	var outImageData = outContext.getImageData(0, 0, 320, cnt * zoom);
	var outPixels = outImageData.data;
	var index = 0;
	var err_r = 0;
	var err_g = 0;
	var err_b = 0;
	var ditherDensity = 0;
	var nextInvert = -1;

	localStorage.setItem('grdmstr_data', xp.value);

	var vperl = parseInt(document.getElementById('valperline').value);
	if (xportASM) {
		xp.value += "\npalette:\n";
		xp.value += "; colors count: " + cnt + "\n";
		xp.value += "\n\tdc.w\t\t";	
	} else {
		xp.value += '\t\tUWORD palette[] __attribute__((section (".MEMF_CHIP"))) = {\n\t\t\t';
	}

	for (var y = 0; y < cnt; y++) {
		var curKeyp = findPrevKeyPtIndex(y);
		var shuffled = curKeyp.shuffle;
		if (shuffled === 2)
			ditherDensity = 4;
		if (shuffled === 3)
			ditherDensity = 8;
		if (nextInvert < y)
			nextInvert = Math.floor(cnt / ditherDensity);

		for (var x = 0; x < 320; x++) {
			for (var z = 0; z < zoom; z++) {
				var ln = y;
				if (shuffled === 1) {
					if ((ln & 1) === 0)
						ln |= 1;
					else
						ln--;
				}
				var tr = (colors[ln] >> 16) & 0xff
				var tg = (colors[ln] >> 8) & 0xff;
				var tb = (colors[ln]) & 0xff;
				if (shuffled >= 1) {
					if (err_r >= 0x10) {
						tr = Math.min(0xff, tr + 0x10);
						err_r -= 0x10;
					}
					if (err_g >= 0x10) {
						tg = Math.min(0xff, tg + 0x10);
						err_g -= 0x10;
					}
					if (err_b >= 0x10) {
						tb = Math.min(0xff, tb + 0x10);
						err_b -= 0x10;
					}
					err_r += tr & 0x0f;
					err_g += tg & 0x0f;
					err_b += tb & 0x0f;
				}
				if (shuffled >= 1) {
					if (Math.floor(y) === Math.floor(nextInvert)) {
						if (x == 319) {
							var delaInvert = Math.floor((cnt - nextInvert) / ditherDensity);
							nextInvert = Math.floor(nextInvert + delaInvert);
						}
						var deltaY = nextKeyp.lineIndex - y;
						if (deltaY > 0) {
							if (pr[y] !== 0 || pg[y] !== 0 || pb[y] !== 0) {
								var or = tr;
								var og = tg;
								var ob = tb;
								var iterations = 0;
								while ((or & 0xf0) === (tr & 0xf0) && (og & 0xf0) === (tg & 0xf0) && (ob & 0xf0) === (tb & 0xf0)) {
									tr += pr[y];
									tg += pg[y];
									tb += pb[y];
									iterations++;
									if (iterations > 50)
										break;
								}
							}
						}
						tr = Math.max(0., tr);
						tr = Math.min(255., tr);
						tg = Math.max(0., tg);
						tg = Math.min(255., tg);
						tb = Math.max(0., tb);
						tb = Math.min(255., tb);
					}
				}

				outPixels[index++] = tr & 0xf0;
				outPixels[index++] = tg & 0xf0;
				outPixels[index++] = tb & 0xf0;
				outPixels[index++] = 255;

				if ((x === 0) && (z === 0)) {
					tr >>= 4;
					tg >>= 4;
					tb >>= 4;
					xp.value += hex + tr.toString(16) + tg.toString(16) + tb.toString(16);
					if (y != cnt - 1) {
						if ((y % vperl) == (vperl - 1)) {
							if (xportASM)
								xp.value += "\n\tdc.w\t\t";
							else
								xp.value += ",\n\t\t\t";
						}
						else xp.value += ",";
					}
				}
			}
		}
	}
	if (!xportASM)
		xp.value += "\n\t\t};";
	outContext.putImageData(outImageData, 0, 0);
	if (_omitUndoRedo !== true)
		updateUndoRedo();
}



function onShuffleChanged(_index) {
	KeyPts[_index].shuffle = getShuffle(_index);
	onLineCount(null);
}

function onWeightChanged(_index) {
	KeyPts[_index].weight = getWeight(_index);
	onLineCount(null);
}


function onLineIndexChanged(_index) {
	KeyPts[_index].lineIndex = getLineIndex(_index);
	onLineCount(null);
}

function onLineCount(param, _omitundoredo, _loadlStorage) {
	if (param)
		param.lines = getOptElmIntVal('linecount', param.lines);

	if (_loadlStorage) {
		loadPal(true, _omitundoredo);
		if (_omitundoredo !== true)
			updateUndoRedo();
	}

	checkKpRequirements();

	var mdiv = document.getElementById('content');
	var str = "";
	if (param != null) {
		str += '<label for="Hue">Hue: </label><input type="range" min="1" max="100" value=' + param.hue + ' class="slider" id="hue" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
		str += '<label for="Saturation">Saturation: </label><input type="range" min="1" max="100" value=' + param.sat + ' class="slider" id="saturation" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
		str += '<label for="Value">Value: </label><input type="range" min="1" max="100" value=' + param.val + ' class="slider" id="value" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
	} else {
		str += '<label for="Hue">Hue: </label><input type="range" min="1" max="100" value="50" class="slider" id="hue" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
		str += '<label for="Saturation">Saturation: </label><input type="range" min="1" max="100" value="50" class="slider" id="saturation" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
		str += '<label for="Value">Value: </label><input type="range" min="1" max="100" value="50" class="slider" id="value" oninput="doSaturation(false)" onchange="doSaturation(true)"><br>';
	}
	str += '<br>';
	// str += '<button class="inset" onclick="addKeyPoint();"><i class="fa fa-plus-square"></i>Keypoint</button>';
	str += '<button class="inset" onclick="onNew();"><i class="fa fa-edit"></i> New</button>';
	str += '<button class="inset" onclick="refreshPal();"><i class="fa fa-star"></i> Refresh</button>';
	str += '<button class="inset" onclick="importImage();"><i class="fa fa-file-image-o"></i> Import</button>';
	str += '<br><button onclick="undo();"><i class="fa fa-undo"></i> Undo</button>';
	str += '<button onclick="redo();"><i class="fa fa-repeat"></i> Redo</button>';
	str += '<br>';
	str += '<input id="file-input" type="file" name="name" style="display: none;" />';

	var weightOptions = [
		{ name: "linear", value: 1 },
		{ name: "near-->far", value: 2 },
		{ name: "far-->near", value: 3 }
	];

	var shuffleOptions = [
		{ name: "direct", value: 0 },
		{ name: "shuffle", value: 1 },
		{ name: "soft dither", value: 2 },
		{ name: "hard dither", value: 3 }
	];

	for (var i = 0; i < KeyPts.length; i++) {
		KeyPts[i].id = "colorBox_" + i.toString();
		var kcol = KeyPts[i].colorValue;
		str += "<br>";//"<tr><td>";
		str += '<input id="colorBox_' + i + '" onchange="refreshPal()" type="color" value="#' + formatColor(kcol.toString(16)) + '">';
		str += '<input id="index_' + i + "\" onchange=" + "'onLineIndexChanged(" + i.toString() + ");'" + ' type="text" value="' + KeyPts[i].lineIndex.toString() + '">';
		if (i < KeyPts.length - 1) {
			str += '<select id="weight_' + i + "\" oninput=" + "'onWeightChanged(" + i.toString() + ");'" + '">';
			for (var wo = 0; wo < weightOptions.length; wo++) {
				var entry = weightOptions[wo];
				str += '<option ';
				if (KeyPts[i].weight === entry.value)
					str += 'selected="selected" ';
				str += 'value="' + entry.value + '">' + entry.name + '</option>';
			}
			str += '</select>';
			str += '<select id="shuffle_' + i + "\" oninput=" + "'onShuffleChanged(" + i.toString() + ");'" + '">';
			for (var so = 0; so < shuffleOptions.length; so++) {
				var entry = shuffleOptions[so];
				str += '<option ';
				if (KeyPts[i].shuffle === entry.value)
					str += 'selected="selected" ';
				str += 'value="' + entry.value + '">' + entry.name + '</option>';
			}
			str += '</select>';
			str += '<button onclick="deleteKp(' + i.toString() + ');" class="small"><i class="fa fa-minus-square"></i></button>';
			str += '<button onclick="duplicateKp(' + i.toString() + ');" class="small"><i class="fa fa-plus-square"></i></button>';
		}
		str += '<button onclick="onCopyKp(' + i.toString() + ');" class="small"><i class="fa fa-files-o"></i></button>';
		str += '<button onclick="onPasteKp(' + i.toString() + ');" class="small"><i class="fa fa-clipboard"></i></button>';
	}

	str += '<br>';
	var newParam = { lines: "256", hue: "50", sat: "50", val: "50" };
	if (document.getElementById('linecount'))
		newParam.lines = document.getElementById('linecount').value;
	newParam.hue = getOptElmIntVal('hue', 50);
	newParam.sat = getOptElmIntVal('saturation', 50);
	newParam.val = getOptElmIntVal('value', 50);

	//	if (param != null) newParam = param;
	var sparam = "{lines:" + newParam.lines + ",hue:" + newParam.hue + ",sat:" + newParam.sat + ",val:" + newParam.val + "}";
	if (param !== null)
		str += "<br>Line Count: <input type='text' id='linecount'  onchange='onLineCount(" + sparam + ");' value=" + param.lines + ">";
	else
		str += "<br>Line Count: <input type='text' id='linecount'  onchange='onLineCount(" + sparam + ");' value=" + newParam.lines + ">";

	str += "<br><br>Zoomed <input type='checkbox' id='Zoomed' value='1' checked='checked' onchange='refreshPal();'/>";
	//str += "</table>";
	mdiv.innerHTML = str;

	let hue = localStorage.getItem('hue');
	if (hue)
		requireElm('hue').value = hue;
	let sat = localStorage.getItem('saturation');
	if (sat)
		requireElm('saturation').value = sat;
	let val = localStorage.getItem('value');
	if (val)
		requireElm('value').value = val;


	if (!_loadlStorage)
		refreshPal(false, _omitundoredo);

	$('#thisdiv').load(document.URL + ' #thisdiv');


}

function updateUndoRedo() {
	if (!LASTSTRING) return;
	let doUpdate = true;
	var STORAGE_TIME = null;
	if (STORAGE_TIME !== null) {
		var time = new Date();
		var timeDiff = time - STORAGE_TIME; //in ms
		if (timeDiff < 100) { // 0.1 second
			console.log("multiple ops in less thn 100 millisec seems suspicious");
			doUpdate = false;
		}
	}
	if (doUpdate) {
		if (FREEZE_UNDOREDO !== true) {
			var photo = [];
			for (var i = 0; i < KeyPts.length; i++) {
				photo.push(copyKp(i));
			}
			UNDOREDOINDEX++;
			console.log("new undo redo at " + UNDOREDOINDEX);
			let newEntry = LASTSTRING; /*{};
			newEntry.kp = photo;
			newEntry.hue = getOptElmVal('hue', 50);
			newEntry.saturation = getOptElmVal('saturation', 50);
			newEntry.value = getOptElmVal('value', 50);*/
			if (UNDOREDOINDEX >= UNDOREDO.length) {
				if (UNDOREDOINDEX > UNDOREDO.length) {
					console.log("undo redo bug");
					UNDOREDO.push(newEntry);
				}
				else UNDOREDO[UNDOREDOINDEX] = newEntry;
			}
		}
	}
}

/*
function updateLocalStorage() {
	localStorage.setItem('hue', document.getElementById('hue').value);
	localStorage.setItem('saturation', document.getElementById('saturation').value);
	localStorage.setItem('value', document.getElementById('value').value);
	localStorage.setItem('kpcount', KeyPts.length);
	for (var i = 0; i < KeyPts.length; i++) {
		localStorage.setItem('kp_' + i + 'colorValue', KeyPts[i].colorValue.toString(16));
		localStorage.setItem('kp_' + i + 'lineIndex', KeyPts[i].lineIndex);
		localStorage.setItem('kp_' + i + 'weight', KeyPts[i].weight);
		localStorage.setItem('kp_' + i + 'shuffle', KeyPts[i].shuffle);
		localStorage.setItem('kp_' + i + 'id', KeyPts[i].id);
	}
}
*/

function go() {
	// build reference image data
	origImg = document.getElementById('refImg');
	origCvs = document.createElement('canvas');
	origCvs.width = origImg.width;
	origCvs.height = origImg.height;
	origContext = origCvs.getContext('2d');
	origContext.drawImage(origImg, 0, 0, origImg.width, origImg.height);
	origImgData = origContext.getImageData(0, 0, origImg.width, origImg.height);
	origImgPixels = origImgData.data;

	// build out  image data
	var outCvs = document.getElementById('outImg');
	outCvs.width = origImg.width;
	outCvs.height = origImg.height;
	var outContext = outCvs.getContext("2d");
	var outImageData = outContext.getImageData(0, 0, origImg.width, origImg.height);
	var outPixels = outImageData.data;

	// invoke generator
	var gen = new gen_rgb();
	gen.generate_clamp(origImgPixels, outPixels, origImg.width, origImg.height);
	outContext.putImageData(outImageData, 0, 0);

	var outCvs2 = document.getElementById('outImg2');
	outCvs2.width = origImg.width;
	outCvs2.height = origImg.height;
	var outContext2 = outCvs2.getContext("2d");
	var outImageData2 = outContext2.getImageData(0, 0, origImg.width, origImg.height);
	var outPixels2 = outImageData2.data;
	gen.generate_near(origImgPixels, outPixels2, origImg.width, origImg.height);
	outContext2.putImageData(outImageData2, 0, 0);
}

function nearestCol(_r, _g, _b) {
	var rr = nearest(_r);
	var gg = nearest(_g);
	var bb = nearest(_b);
	return (rr << 16) + (gg << 8) + bb;
}

function nearest(val) {
	var res = val & 0xf0;
	if ((val & 15) >= 8)
		res += 0x10;
	if (res > 0xf0)
		res = 0xf0;
	return res;
}


global_palette = [];
globl_refImgPal = [];

function getPaletteIndex(_r, _g, _b) {
	for (var i = 0; i < global_palette.length; i++) {
		if ((global_palette[i].r == _r) && (global_palette[i].g == _g) && (global_palette[i].b == _b))
			return i;
	}
	global_palette.push({ r: _r, g: _g, b: _b });
	return global_palette.length - 1;
}

function palettize(_refPix, _width, _height) {
	var t = this;

	var i = 0;
	global_palette = [];
	globl_refImgPal = [];
	// ret.push();

	for (var y = 0; y < _height; y++) {
		for (var x = 0; x < _width; x++) {
			var val = getPaletteIndex(_refPix[i + 0], _refPix[i + 1], _refPix[i + 2]);
			globl_refImgPal.push(parseInt(val));
			i += 4;
		}
	}
}

function clampPalEntry(_e) {
	var r = _e.r & 0xf0;
	var g = _e.g & 0xf0;
	var b = _e.b & 0xf0;
	r >>= 4;
	g >>= 4;
	b >>= 4;
	return r.toString(16) + g.toString(16) + b.toString(16);
}

function nearestPalEntry(_e) {
	var r = _e.r & 0xf0;
	if ((r & 15) >= 8)
		r += 0x10;
	if (r > 0xf0)
		r = 0xf0;

	var g = _e.g & 0xf0;
	if ((g & 15) >= 8)
		g += 0x10;
	if (g > 0xf0)
		g = 0xf0;

	var b = _e.b & 0xf0;
	if ((b & 15) >= 8)
		b += 0x10;
	if (b > 0xf0)
		b = 0xf0;

	r >>= 4;
	g >>= 4;
	b >>= 4;
	return r.toString(16) + g.toString(16) + b.toString(16);
}

function xportPalette() {
	var t = this;
	var i = 0;

	var xp = document.getElementById('export');
	xp.value = "palette:\n";

	xp.value += "; colors count: " + origImg.height + "\n";
	for (var y = 0; y < origImg.height; y++) {
		for (var x = 0; x < 1; x++) {
			var r = origImgPixels[y * 4 * origImg.width];
			var g = origImgPixels[y * 4 * origImg.width + 1];
			var b = origImgPixels[y * 4 * origImg.width + 2];
			r >>= 4;
			g >>= 4;
			b >>= 4;
			xp.value += "\tdc.w\t$" + r.toString(16) + g.toString(16) + b.toString(16) + "\n";
		}
	}

}


function xportNearest() {
	palettize(origImgPixels, origImg.width, origImg.height);
	var xp = document.getElementById('export');
	xp.value = "colors_count:\tdc.w " + global_palette.length.toString() + "\npalette:\tdc.w\t";
	for (var i = 0; i < global_palette.length; i++) {
		xp.value += "$" + nearestPalEntry(global_palette[i]);
		if (i < global_palette.length - 1) xp.value += ",";
	}
}
