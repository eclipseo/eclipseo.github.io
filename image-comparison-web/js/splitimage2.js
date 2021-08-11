var select = {
    file: getElId('fileSel'), scale: getElId('scaleSel'),
    left: getElId('leftSel'), right: getElId('rightSel'),
    subset: getElId('subsetSel'),
};

var viewOptions = {
    file: '', scale: '',
    left: '', leftQ: '',
    right: '', rightQ: '',
    subset: ''
};

var infoText = {
    left: getElId('leftText'),
    right: getElId('rightText'),
    center: getElId('center-head')
};

var urlFolder, urlFile;
var urlStorage = "https://images-comparison.fra1.digitaloceanspaces.com";
var textHeight = infoText.left.offsetHeight;
var first = 1;
var splitMode = 1;

var canvases = {
    left: prepCanvas(800, 800),
    right: prepCanvas(800, 800),
    leftScaled: prepCanvas(100, 100),
    rightScaled: prepCanvas(100, 100),
    leftDest: getElId('canvasLeft'),
    rightDest: getElId('canvasRight')
}

function prepCanvas(width, height, which) {
    var c;

    if (which !== undefined) {
        c = which;
        c.getContext("2d").clearRect(0, 0, c.width, c.height);
    }
    else { c = document.createElement("canvas"); }

    c.width = width;
    c.height = height;
    return c;
}

var resizer;

var resizer_mode = {
    js:   true,
    wasm: true,
    cib:  false,
    ww:   true
};

function create_resizer() {
    var opts = [];

    Object.keys(resizer_mode).forEach(function (k) {
        if (resizer_mode[k]) opts.push(k);
    });

    resizer = window.pica({ features: opts });
}


/* file|scale|codec|qual > setSide > setImage > processCanvasScale > setSize > setSplit */
select.file.onchange = function () {
    setFile();
};

select.scale.onchange = processCanvasScale;

select.subset.onchange = subsetChange;

select.left.onchange = function () {
    setSide('left');
};
select.right.onchange = function () {
    setSide('right');
};

leftQual.onchange = function () {
    setSide('left');
};
rightQual.onchange = function () {
    setSide('right');
};

function getElId(id) {
    return document.getElementById(id);
}

function getSelValue(el, attr) {
    return el.options[el.selectedIndex].getAttribute(attr);
}

/* Get web-friendly string */
function getSlugName(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}


function processCanvasScale(canvas, choseSide) {
    if (choseSide) {
        // Process only one side
        scaleCanvas(canvas, choseSide);
    } else {
        // Process both sides at once
        scaleCanvas(canvases.right, 'right');
        scaleCanvas(canvases.left, 'left');
    }

    function scaleCanvas(inCanvas, side) {
        var scale = getSelValue(scaleSel, 'value');
        var outCnvs = canvases[side + 'Scaled'];
        var destCnvs = canvases[side + 'Dest'];

        if (scale == 1) {
            viewOptions.scale = '';
        }

        var width = Math.round(inCanvas.width * scale);
        var height = Math.round(inCanvas.height * scale);

        viewOptions.scale = '*' + getSelValue(scaleSel, 'ratio');
        prepCanvas(width, height, outCnvs);
        prepCanvas(width, height, destCnvs);
        // set container height
        var container = document.getElementsByClassName("img-comp-container")[0];
        container.style.height = height + "px";
        container.style.left = ((container.offsetWidth - width)/2) + "px";

        // Resize with pica
        resizer.resize(inCanvas, outCnvs, {
            quality: 3,
            alpha: true,
            unsharpAmount: 0,
            unsharpRadius: 0,
            unsharpThreshold: 0,
            transferable: true
        })
            .then(function () {
            // Copy buffer to visible element
            destCnvs.getContext('2d').drawImage(outCnvs, 0, 0);
            updateslider()
            window.location.hash = (viewOptions.file).concat(viewOptions.scale,
                                                             '&', viewOptions.left, '=', viewOptions.leftQ,
                                                             '&', viewOptions.right, '=', viewOptions.rightQ,
                                                             '&', viewOptions.subset)
        })
            .catch(function (err) {
            console.log(err);
            throw err;
        });

    }
}

function setImage(side, pathBase, codec, setText) {
    var canvas = canvases[side];

    var path = urlFolder.concat(pathBase, '/', urlFile, '.', codec);
    var xhr = new XMLHttpRequest();

    xhr.open("GET", path, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function () {

        var blob = new Blob([xhr.response], {
            type: "image/png"
        });
        var blobPath = window.URL.createObjectURL(blob);

        var canvas = canvases[side];
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        var image = new Image();
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            var area = canvas.width * canvas.height;
            setText((blob.size / 1024).toFixed(1) + " KB", (blob.size * 8 / area).toFixed(2) + " bpp");
            canvas.getContext("2d").drawImage(image, 0, 0);
            processCanvasScale(canvas, side);
            window.URL.revokeObjectURL(blobPath);
        };
        image.onerror = function () {
            var arrayData = new Uint8Array(xhr.response);
            image.src = urlFolder.concat(pathBase, '/', urlFile, '.', 'png');
        };
        image.src = blobPath;
    };
    xhr.send();
}

function setSide(side) {
    var isRight = (side == 'right') ? 1 : 0;
    var whichQual = (isRight) ? rightQual : leftQual;
    var image = getSelValue(select[side], 'value');
    var pathBase = getSelValue(select[side], 'folder');
    var quality;

    if (pathBase != 'Original') {
        whichQual.disabled = false;
        quality = whichQual.options[whichQual.selectedIndex].innerHTML.toLowerCase() + '/';
    } else {
        whichQual.disabled = true;
        quality = '';
    }

    viewOptions[side] = pathBase;
    viewOptions[side + 'Q'] = getSelValue(whichQual, 'value');
    pathBase = quality + pathBase;

    setImage(side.toLowerCase(), pathBase, image,
             function (kbytes, bpp) {
        infoText[side].innerHTML = (isRight) ? "&rarr;&nbsp;" + kbytes + "<br>&emsp;&nbsp;" + bpp : kbytes + "&nbsp;&larr;<br>\n" + bpp;
        textHeight = (isRight) ? textHeight : infoText[side].offsetHeight;
    });
}

function setFile() {
    urlFile = getSelValue(select.file, 'value');

    /* Flag for special processing when both left & right are both new. */
    first = 1;
    /* Any view change will update hash. */
    viewOptions.file = getSlugName(select.file.options[select.file.selectedIndex].text);

    setSide('right');
    setSide('left');
}


/* Shift key to enter 'flip-view'. Repeat to flip between images. Any other key to return to split-view. */
function switchMode(keyCode) {
    var img = document.getElementsByClassName("img-comp-overlay")[0];
    if (keyCode && keyCode == "16") {
        splitMode = 0;
        var currLeft = (canvases.leftDest.style.opacity > 0) ? 1 : 0; // current focus
        var switchTo = (currLeft) ? 'right' : 'left'

        infoText.center.innerHTML = getSelValue(select[switchTo], 'folder') + ' '
            + infoText[switchTo].innerHTML.replace(/&nbsp;/g, '').replace(/←|→/g, '');

        img.style.borderRight = "none";
        canvases.leftDest.style.opacity = 1 - currLeft;
        img.style.width = canvases.rightDest.offsetWidth + "px";
    } else if (!splitMode) {
        img.style.borderRight = "1px dotted white";
        canvases.leftDest.style.opacity = 1;
        infoText.center.innerHTML = "--- vs ---";
        splitMode = 1;
    }

    infoText.left.style.opacity = splitMode;
    infoText.right.style.opacity = splitMode;
}

function subsetChange (event) {

    fetch("comparisonfiles.json")
        .then(response => response.json())
        .then(function (json) {

        var hashArr, ampArr, imgOpts, name, scale, leftOpts, rightOpts, selectOpts;

        hashArr = (location.hash).split('#', 3);
        ampArr = (hashArr.pop()+'&=&=&').split('&', 4);

        imgOpts = ampArr[0].split('*', 2);
        leftOpts = ampArr[1].split('=', 2);
        rightOpts = ampArr[2].split('=', 2);
        selectOpts = ampArr[3].split('=', 2)

        if (!event) {
            selectOpts = (selectOpts == "") ? select.subset.value : selectOpts ;
        } else {
            selectOpts = event.target.value;
        }

        // format
        while (select.left.firstChild) {
            select.left.removeChild(leftSel.firstChild);
        }
        while (select.right.firstChild) {
            select.right.removeChild(rightSel.firstChild);
        }
        for (var format of json.comparisonfiles[selectOpts].format) {
            var optLeft = document.createElement("option");
            var optRight = document.createElement("option");

            optLeft.setAttribute("folder", format.folder);
            optLeft.text = format.name;
            optLeft.value = format.extension;
            select.left.add(optLeft, null);

            optRight.setAttribute("folder", format.folder);
            optRight.text = format.name;
            optRight.value = format.extension;
            select.right.add(optRight, null);
        }
        // files
        while (select.file.firstChild) {
            select.file.removeChild(fileSel.firstChild);
        }
        var filesList = json.comparisonfiles[selectOpts].files;
        filesList.sort(function(a,b) {
            if ( a.title < b.title ) {
                return -1;
            }
            if ( a.title > b.title ) {
                return 1;
            }
            return 0;
        })
        for (var file of filesList) {
            let opt = document.createElement("option");
            opt.value = file.filename;
            opt.text = file.title;
            select.file.add(opt, null);
        }
        urlFolder = urlStorage + "/comparisonfiles/" + getSelValue(select.subset, 'value') + "/";

        viewOptions.subset = selectOpts;
        select.subset.value = selectOpts;

        for (var opt, j = 0; opt = select.file.options[j]; j++) {
            if (getSlugName(opt.text) == imgOpts[0]) {
                select.file.selectedIndex = j;
                var z, s, q;

                if (imgOpts[1]) {
                    z = document.querySelector('#scaleSel [ratio="' + imgOpts[1] + '"]');
                    if (z) {z.selected = true};
                }

                if (leftOpts) {
                    s = document.querySelector('#leftSel [folder="' + leftOpts[0] + '"]');
                    if (s) {s.selected = true};
                    q = document.querySelector('#leftQual [value="' + leftOpts[1] + '"]');
                    if (q) {q.selected = true};
                }
                if (rightOpts) {
                    s = document.querySelector('#rightSel [folder="' + rightOpts[0] + '"]');
                    if (s) {s.selected = true};
                    q = document.querySelector('#rightQual [value="' + rightOpts[1] + '"]');
                    if (q) {q.selected = true};
                }
                break;
            }
        };

        setFile();
    });
}


function updateslider() {
    var slider, img, clicked = 0, w, h;

    img = document.getElementsByClassName("img-comp-overlay")[0];
    /*get the width and height of the img element*/
    w = canvases.rightDest.offsetWidth;
    h = canvases.rightDest.offsetHeight;
    /*set the width of the img element to 50%:*/
    img.style.width = (w / 2) + "px";
    img.style.borderRight = "1px dotted white";


    /*execute a function when the mouse button is pressed:*/

    window.addEventListener("mousemove", slideMove);
    function slideReady(e) {
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*the slider is now clicked and ready to move:*/
        clicked = 1;
        /*execute a function when the slider is moved:*/
    }
    function slideMove(e) {
        if (splitMode) {
            var posx, posy;
            /*get the cursor's x position:*/
            [posx, posy] = getCursorPos(e);
            /*prevent the slider from being positioned outside the image:*/
            if (posx < 0) posx = 0;
            if (posx > w) posx = w;
            if (posy < 0) posy = 0;
            if (posy > h) posy = h;
            /*execute a function that will resize the overlay image according to the cursor:*/
            slide(posx, posy);
        }
    }
    function getCursorPos(e) {
        var a, x, y = 0;
        e = e || window.event;
        /*get the x positions of the image:*/
        a = img.getBoundingClientRect();
        /*calculate the cursor's x coordinate, relative to the image:*/
        x = e.pageX - a.left;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        /*calculate the cursor's y coordinate, relative to the image:*/
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        y = y - window.pageYOffset;
        return [x, y];
    }
    function slide(x, y) {
        var bound;
        /*resize the image:*/
        img.style.width = x + "px";
        /*position the slider:*/
        infoText.left.style.left = (img.offsetWidth - infoText.left.offsetWidth) + "px";
        infoText.right.style.left = (img.offsetWidth) + "px";
        if (y + infoText.left.offsetHeight > h) {
            bound = y - infoText.left.offsetHeight;
        } else {
            bound = y;
        }
        infoText.left.style.top = bound + "px";
        infoText.right.style.top = bound + "px";
    }
}



window.addEventListener("load", function (event) {
    fetch("comparisonfiles.json")
        .then(response => response.json())
        .then(function (json) {
        // subset
        for (var subset in json.comparisonfiles) {
            var opt = document.createElement("option");
            opt.value = subset;
            opt.text = subset;
            select.subset.add(opt, null);
        }
        subsetChange();
        create_resizer();
        urlFolder = urlStorage + "/comparisonfiles/" + getSelValue(select.subset, 'value') + "/";
        setFile();
    });
});

window.addEventListener("keydown", function (event) {
    switchMode(event.keyCode);
}, false);


infoText.right.style.backgroundColor = "rgba(0,0,0,.3)";
infoText.left.style.backgroundColor = "rgba(0,0,0,.3)";
