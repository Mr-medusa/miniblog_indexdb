var months = new Map();
['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'].forEach(function (month, index) {
    months.set(index + 1, month);
});
export default {
    isArrayFn: function (value) {
        if (typeof Array.isArray === "function") {
            return Array.isArray(value);
        } else {
            return Object.prototype.toString.call(value) === "[object Array]";
        }
    },
    removeDuplicate:function(strArr){
        return strArr.filter(function(element,index,self){
           return self.indexOf(element) === index;
        });
    },
    simpleDateFormat: function (date, fmt = "yyyy-MM-dd") {
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    debounce: function (fn, delay) {
        var delay = delay || 200;
        var timer;
        return function () {
            var th = this;
            var args = arguments;
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(function () {
                timer = null;
                fn.apply(th, args);
            }, delay);
        };
    },
    /**
     * Fast UUID generator, RFC4122 version 4 compliant.
     * @author Jeff Ward (jcward.com).
     * @license MIT license
     * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
     **/
    UUID: function () {
        var self = {};
        var lut = [];
        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }
        self.generate = function () {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        }
        return self.generate();
    },
    UUID2:function(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
},
    numberMonthToEnMonth: function (number) {
        return months.get(parseInt(number)) || "";
    },
    numberDayToEnOrdinal: function (number) {
        number = number.toString();
        if (["1", "2", "3", "21", "22", "23", "31"].indexOf(number) > -1) {
            var unit = -1;
            if (number.length > 1) {
                unit = number.substr(1);
            } else {
                unit = number;
            }
            if (unit === "1") {
                return number + "st";
            } else if (unit === "2") {
                return number + "nd";
            } else if (unit === "3") {
                return number + "rd";
            }
        } else {
            return number + "th";
        }
    },
    getBackground: function (name) {
        let url = require('../static/img/material/' + name);
        return "url('" + url + "')"
    },

    isInViewport: function ($box, paddingTop = 0) {
        function GetRect(element) {
            var rect = element.getBoundingClientRect() // 距离视窗的距离
            var top = document.documentElement.clientTop ? document.documentElement.clientTop : 0; // html元素对象的上边框的宽度
            var left = document.documentElement.clientLeft ? document.documentElement.clientLeft : 0;
            return {
                top: rect.top - top,
                bottom: rect.bottom - top,
                left: rect.left - left,
                right: rect.right - left
            }
        }

        if (!$box)
            return -1;
        var divH = $box.offsetHeight; // div高度
        var windowH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 浏览器高度兼容写法

        var obj = GetRect($box);
        if (obj.top >= windowH) { // 在视口之下
            // console.log('在视口之下');
            return "UNDER";
        }
        if (obj.top < windowH && obj.bottom >= windowH && obj.top > paddingTop) { // 正在出现
            // console.log('正在出现');
            return "APPEARING";
        }

        if (obj.top > 0 && obj.top < windowH && obj.bottom > 0 && obj.bottom < windowH && obj.top > paddingTop) { // 正在视口中
            // console.log('正在视口中')
            // console.log("在视口里面");
            return "INNER";
        }

        if (obj.top <= 0 + paddingTop && obj.bottom <= divH && obj.bottom > 0 + paddingTop) { // 正在离开视口
            // console.log('正在离开视口')
            return "LEAVING";
        }
        if (obj.bottom <= 0 + paddingTop) { // 已经离开视口
            // console.log('在视口之上');
            return "TOP";
        }
    },
    goToViewport: function (element, limitHeight) {
        let rect = element.getBoundingClientRect();
        var speed = Math.abs(rect.top) / 10;
        speed = speed >= 30 ? speed : 30;

        var pageYOffset = window.pageYOffset || document.documentElement.scrollTop;  // pageYOffset所有浏览器，scrollTop 除了 IE9 及更早版本 IE9 及更早版本

        let myTop = pageYOffset + rect.top;

        if (limitHeight && myTop <= limitHeight)
            myTop = 0;

        var coefficient = 1;
        if (rect.top < 0)
            coefficient = -1;
        var requestId;

        function step() {
            pageYOffset += (speed * coefficient);

            if (coefficient === 1) {
                if (pageYOffset <= myTop) {
                    window.scrollTo(0, pageYOffset);
                    requestId = window.requestAnimationFrame(step);
                } else {
                    window.cancelAnimationFrame(requestId);
                }
            } else {
                if (pageYOffset >= myTop - speed) {
                    window.scrollTo(0, pageYOffset);
                    requestId = window.requestAnimationFrame(step);
                } else {
                    window.cancelAnimationFrame(requestId);
                }
            }
        }

        window.requestAnimationFrame(step);
    },
    copyText: function (text) {
        let target = document.createElement('div');
        target.id = 'tempTarget';
        target.style.opacity = '0';

        target.innerText = text;
        document.body.appendChild(target);
        try {
            let range = document.createRange();
            range.selectNode(target);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            target.parentElement.removeChild(target);
            return true;
        } catch (e) {
            target.parentElement.removeChild(target);
            return false;
        }
    },
    makeScrollBar: function (selector, options = {scrollInertia: 400, deltaFactor: 40, axis: "y"}) {
        $(selector).mCustomScrollbar({
            axis: options.axis,
            advanced: {autoExpandHorizontalScroll: true},
            autoDraggerLength: true,
            autoHideScrollbar: true,
            theme: "dark",
            scrollInertia: options.scrollInertia,
            autoHideScrollbar: false,
            autoExpandScrollbar: false,
            mouseWheel: {
                invert: false,
                deltaFactor: options.deltaFactor
            },
            keyboard: {scrollAmount: 40},
            scrollButtons: {enable: false}
        });
    },
    makeMuuri: function (selector, option) {
        return new Muuri(selector, {
            dragEnabled: true,
            items: '.pad-item',
            showDuration: 1000,
            showEasing: 'ease-in-out',
            hideDuration: 1000,
            hideEasing: 'ease-in-out',
            visibleStyles: {opacity: 1, transform: 'rotate(0deg)'},
            hiddenStyles: {opacity: 0, transform: 'rotate(-180deg)'},
            layout: {
                fillGaps: true,
                rounding: false
            },
            layoutDuration: 1000,
            layoutEasing: 'ease-in-out',
            sortData: option.sortData,
            dragStartPredicate: {
                distance: 0,
                delay: 0,
                handle: '.draggable'
            },
            dragSortInterval: 50,
            dragReleaseDuration: 1000,
            dragReleaseEasing: 'ease-in-out',
            dragSortPredicate: {
                threshold: 40,
                action: 'swap'
            },
        });
    },
    makeCodeMirror: function (textArea, content, type = "clike", callbackOption) {
        var codeMirror = CodeMirror(function (elt) {
            textArea.parentNode.replaceChild(elt, textArea);
        }, {
            mode: type,
            value: content || textArea.value,
            showCursorWhenSelecting: true,
            theme: "darcula",
            indentUnit: 2,
            smartIndent: true,
            tabSize: 4,
            readOnly: "nocursor",
            lineWrapping: false,
            lineNumbers: true,
            autoCloseBrackets: true,
            scrollbarStyle: "simple",
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                },
                'Ctrl-S': function () {
                    callbackOption.saveText();
                }
            }
        });
        return codeMirror;
    },
    makeQuillEditor: function (selector, bindings) {
        var toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote'],

            [{'header': 1}, {'header': 2}],               // custom button values
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
            [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
            [{'direction': 'rtl'}],                         // text direction

            [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
            [{'header': [1, 2, 3, 4, 5, 6, false]}],

            [{'color': []}, {'background': []}],          // dropdown with defaults from theme
            [{'font': []}],
            [{'align': []}],
            ['link', 'image', 'video'],
            ['code-block'],
            ['clean']                                         // remove formatting button
        ];
        var quill = new Quill(selector, {
            modules: {
                toolbar: toolbarOptions,
                keyboard: {
                    bindings: bindings
                }
            },
            theme: 'snow'
        });
        return quill;
    }
}