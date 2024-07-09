var REFIMGCVS = null;
var REFIMGDATA = null;
var REFIMG_ALPHA = 0.4;
var REFIMG_SCALEX = 1.0;
var REFIMG_SCALEY = 1.0;
var REFIMG_POSX = 0;
var REFIMG_POSY = 0;


function showToolbar(name, hide) {
    var windows = ["refImageWindow", "exportWindow", "helpWindow"];
    if (hide) {
        for (var i = 0; i < windows.length; i++) {
            var elem = document.getElementById(windows[i]);
            elem.style.display = 'none';
        }
    }
    var refElem = document.getElementById(name);
    refElem.style.display = 'block';
}

function createExportWindow() {
    var refElem = document.getElementById("AmigaScreen");
    var div3 = document.getElementById("exportWindow");
    div3.style.top = '0px';
    div3.style.left = refElem.width + 'px';
    div3.style.color = 'white';
    var str = "";
    str += '<br><input type="checkbox" id="xprt_mode1" onclick="XPORT_TRIANGLE_LIST = this.checked;">Triangle List';
    str += '<br><input type="checkbox" id="xprt_mode2" onclick="XPORT_ROCKLOBSTER_NGON = this.checked;">RockLobster NGon';
    str += '<br><input type="checkbox" id="xprt_cossin" onclick="XPORT_COSSIN = this.checked;">Cos Sin';
    str += '<br><br><button onclick="launchExport();">go Amiga!</button>';
    div3.innerHTML = str;
    div3.style.display = "none";
}

function createHelpWindow() {
    var help = [
        'n', 'new polygon',
        's', 'snap to nearest',
        'shift + drag', 'select handles',
        'x', 'align X for selected handles',
        'y', 'align Y for selected handles',
        'arrows', 'translate selected handles',
        'g', 'grid',
        'b', 'toggle blitter fill'
    ];

    var refElem = document.getElementById("AmigaScreen");
    var div3 = document.getElementById("helpWindow");
    div3.style.top = '0px';
    div3.style.left = refElem.width + 'px';
    div3.style.color = 'white';

    var content = '<table style="position:relative; color:white">';
    for (var i = 0; i < help.length; i += 2) {
        content += "<tr><td>" + help[i] + "</td><td>:</td><td>" + help[i + 1] + "</td></tr>";
    }
    content += "</table>";

    div3.innerHTML = content;
}


function buildAllDivs() {
    var refElem = document.getElementById("AmigaScreen");

    var div = document.getElementById("status");
    div.style.position = "absolute";
    div.style.left = '0px';
    div.style.top = refElem.height + 'px';
    div.style.width = refElem.width + 'px';


    createPropertiesWindow();
    createExportWindow();
    createHelpWindow();
    document.getElementById('file-input').addEventListener('change', readSingleFile, false);
    document.getElementById('refimg').addEventListener('change', readSingleImgFile, false);
}

function status(msg) {
    document.getElementById("status").innerHTML = msg;
}

function readSingleImgFile(e) {
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    var imgtag = document.getElementById("refImageTag");
    imgtag.title = selectedFile.name;

    reader.onload = function (event) {
        imgtag.src = event.target.result;
        var cvs = document.getElementById('cvs4img');
        cvs.width = imgtag.width;
        cvs.height = imgtag.height;
        REFIMGCVS = cvs.getContext("2d");
        REFIMGCVS.drawImage(imgtag, 0, 0, imgtag.width, imgtag.height);
        REFIMGDATA = REFIMGCVS.getImageData(0, 0, imgtag.width, imgtag.height);
    };

    reader.readAsDataURL(selectedFile);
}

function mixRefImage(color, x, y) {
    if (REFIMGCVS == null)
        return color;

    x = Math.floor(REFIMG_POSX) + Math.floor(x / REFIMG_SCALEX);    
    y = Math.floor(REFIMG_POSY) + Math.floor(y / REFIMG_SCALEY);
    if (x < 0 || x >= REFIMGDATA.width || y < 0 || y >= REFIMGDATA.height)
        return color;

    var i = REFIMG_ALPHA;
    var c = 1.0 - REFIMG_ALPHA;
    var index = 4 * x + 4 * y * REFIMGDATA.width;
    var col = REFIMGDATA.data;
    return { r: color.r * c + col[index + 0] * i, g: color.g * c + col[index + 1] * i, b: color.b * c + col[index + 2] * i };
}