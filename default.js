alert(1111)
/************** common类js start ********************/
// 模拟 C# 的 Request.QueryString
function Request(name, bubble) {
    if (!name) return '';

    var val = ''
		, win = window;
    do {
        var qs = win.location.search;
        qs = qs.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)', 'i'));
        if (qs) {
            val = qs[2];
            break;
        }
        if (!bubble) break;
        win = win.parent;
    } while (win != win.parent);

    return decodeURIComponent(val);
}
// escape编码某些特殊符号，服务器解码后会乱码
escape = function (string) {
    return encodeURIComponent(string);
};

// 字符串转为 dom 对象
function ParseDom(arg) {
    var obj = document.createElement("div");
    obj.innerHTML = arg;
    return obj.childNodes;
}
// 获取文档可视区域宽高、完整宽高、滚动位置
function GetDocPos(doc) {
    doc = doc || document;
    var docElem = doc.documentElement,
		body = doc.body,
		d = (doc.compatMode == 'BackCompat') ? body : docElem;

    return {
        clientWidth: docElem.clientWidth || body.clientWidth,
        clientHeight: docElem.clientHeight || body.clientHeight,
        scrollWidth: Math.max(d.scrollWidth, d.clientWidth),
        scrollHeight: Math.max(d.scrollHeight, d.clientHeight),
        scrollTop: docElem.scrollTop || body.scrollTop,
        scrollLeft: docElem.scrollLeft || body.scrollLeft
    };
}
// 添加事件
function addEvent(elm, evType, fn) {
    if (elm.addEventListener) {
        elm.addEventListener(evType, fn, false);//DOM2.0
    } else if (elm.attachEvent) {
        elm.attachEvent('on' + evType, fn);//IE5+
    } else {
        elm['on' + evType] = fn;//DOM 0
    }
    return fn;
}
// 移除事件
function removeEvent(elm, evType, fn) {
    if (elm.removeEventListener) {
        elm.removeEventListener(evType, fn, false);//DOM2.0
    } else if (elm.detachEvent) {
        elm.detachEvent('on' + evType, fn);//IE5+
    } else {
        elm['on' + evType] = null;//DOM 0
    }
}
// 等候层的显示与隐藏
var Wait = function () {
    var mask, info, loading, timer,
		isShow = false,
		defText = GetLangValue('拼命加载中...');

    function init() {
        mask = ParseDom('<div style="display:none; position:absolute; z-index:99998; left:0; top:0; background-color:#ccc; filter:alpha(opacity:50); opacity:0.5"><div>')[0];
        info = ParseDom('<div style="display:none; position:absolute; z-index:99999; width:226px; height:46px; background-color:white; border:#9e9e9b 1px solid; font-size:14px;  color:#ff5a00; text-align:center; padding-top:16px;"></div>')[0];
        loading = ParseDom('<span style="display:inline-block; width:30px; text-align:left">.</span>')[0];
        document.body.appendChild(mask);
        document.body.appendChild(info);
    }
    function resize() {
        var d = GetDocPos();
        mask.style.width = d.scrollWidth + "px";
        mask.style.height = d.scrollHeight + "px";
        info.style.left = (d.clientWidth - 200) / 2 + 'px';
        info.style.top = d.scrollTop + (d.clientHeight - 100) / 2 + 'px';
    }
    function load() {
        var s = loading.innerHTML;
        if (s.length < 6) {
            s += '.';
        } else {
            s = '.';
        }
        loading.innerHTML = s;
    }

    function show(msg, autoHide) {
        if (!info) { init() }
        info.innerHTML = msg || defText;
        info.appendChild(loading);

        if (isShow) return;
        isShow = true;
        resize();
        mask.style.display = "block";
        info.style.display = "block";
        addEvent(window, 'resize', resize);
        timer = setInterval(load, 500);
        if (autoHide && autoHide == true) {
            setTimeout(function () { Wait.Hide(); }, 1000);
        }

    }
    function hide() {
        if (!isShow) return;
        isShow = false;
        mask.style.display = 'none';
        info.style.display = 'none';
        removeEvent(window, 'resize', resize);
        clearInterval(timer);
    }
    function toggle(msg) {
        isShow ? hide() : show(msg);
    }

    return {
        Show: show,
        Hide: hide,
        Toggle: toggle
    }
}();
//以 showModalDialog 方式打开窗口（经框架页中转）
//参数：sUrl		-- 文件路径，必须包含完整的文件路径
function OpenDlg(url, width, height, title) {
    // 最后一个参数若是function，即为callback
    var _a = arguments;
    var callback = _a[_a.length - 1];
    window._dialogReturn = (typeof callback == 'function') ? callback : function () { };
    // 参数默认值
    var au = function (i) { return (typeof _a[i] == 'function') ? null : _a[i]; };
    var _width = au(1) || 500,
		_height = au(2) || 340,
		_title = au(3) || '',
		arg = au(4) || window;
    url = sWebRoot + 'WebApp/SelfQuery/FrameAgent.html' + '?v=1&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(_title);

    window._dialogArguments = arg;

    ymPrompt.win({
        message: url,
        width: _width,
        height: _height,
        title: _title,
        fixPosition: false,
        iframe: true,
        handler: function () { ymPrompt.close(); },
        autoClose: false,
        allowRightMenu: false
    });

}
// 网站根目录
var sWebRoot = '/', sWebRoot = function (s) {
    var s = s.substring(0, s.lastIndexOf('/', s.length - 2) + 1)
    return s.substring(0, s.lastIndexOf('/', s.length - 2) + 1); //本文件位于二级目录，需要往上退二级，才是根目录
}('/' + getPath());
// 用于 js 文件获取自身相对路径，如 Script/
function getPath(path) {
    if (!path) {
        var js = document.scripts;
        js = js[js.length - 1].src;
        path = ParseDom('<a href="' + js + '"></a>')[0].href;
    }
    return path.substring(path.indexOf(sWebRoot, 8) + sWebRoot.length, path.lastIndexOf('/') + 1);
}
// frame 重定向到指定url
function FrameRedirect(oFrm, sUrl) {
    oFrm.location.replace(MakeNoCacheUrl(sUrl));
}
// 构造不缓存的 url
function MakeNoCacheUrl(url) {
    return url + (url.indexOf('?') > -1 ? '&' : '?') + '_=' + (new Date()).getTime(); //加时间戳，保证不缓存
}
/*
 功能：frame加载完成时，调用指定方法
 参数：
	frmId		- frame的id
	callback	- 回调函数
*/
function OnFrameLoad(frmId, callback) {
    var oFrm = typeof frmId == 'string' ? document.getElementById(frmId) : frmId;
    if (oFrm.attachEvent) {
        oFrm.attachEvent("onload", callback);
    } else {
        var oldonload = oFrm.onload;
        oFrm.onload = function () {
            if (oldonload) oldonload();
            callback();
        }
    }
}
//转换成json格式
function convertToJson(str) {
    return eval('(' + str + ')');
}
//关闭窗口
function CloseDlg() {
    var dlg = window.parent;
    // 模式窗口
    if (dlg.dialogArguments && !dlg._ym && !dlg.top.opener) {
        dlg.close();
        return;
    }

    // ym
    dlg = window;
    var ym;
    while (1) {
        ym = dlg.parent.ymPrompt;
        if (ym && ym.getPage() && ym.getPage().contentWindow == dlg) {
            ym.close();
            return;
        }
        if (dlg === window.top) break;
        dlg = dlg.parent;
    }

    // 普通窗口
    dlg = window.top;
    dlg.opener = null;
    dlg.open('', '_self');
    dlg.close();
}
// 阻止事件冒泡及浏览器默认行为
function stopBubble() {
    var e = getEvent();
    if (e && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    } else {
        window.event.cancelBubble = true;
        window.event.returnValue = false;
    }
    return false;
}
// 获取事件对象
function getEvent() {
    if (window.event) {
        var e = window.event;
        e.target = e.srcElement;
        return e;
    }

    var f = arguments.callee.caller;
    do {
        var e = f.arguments[0];
        if (e && (e.constructor === Event || e.constructor === MouseEvent || e.constructor === KeyboardEvent)) {
            return e;
        }
    } while (f = f.caller);
}
// 冒泡查找子节点指定类型的父节点
// 参数：子节点，类型（如：tr,div）
function BubbleNode(element, tagname) {
    tagname = tagname.toUpperCase();
    while (element && element.tagName != tagname) {
        element = element.parentNode;
    }
    return element;
}
//去除字符串左右空白
function Trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
//屏幕自适应
function screenFix(type, obj, fix) {
    switch (type) {
        case "width":
            var width = document.body.scrollWidth - fix;
            document.getElementById(obj).style.width = width + 'px';
            break;
        case "height":
            var height = window.innerHeight - fix;
            document.getElementById(obj).style.height = height + 'px';
            break;
    }
}

//通过ajax请求获取数据
function ajax(url, callback) {
    var xmlHttpRequest;
    var data;
    var sync = (typeof callback == 'function' ? true : callback); //有回调函数时，固定为异步

    //XmlHttpRequest对象  
    function createXmlHttpRequest() {
        if (window.ActiveXObject) { //如果是IE浏览器  
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) { //非IE浏览器  
            return new XMLHttpRequest();
        }
    }

    function getAjaxData() {
        //1.创建XMLHttpRequest组建  
        xmlHttpRequest = createXmlHttpRequest();
        //2.设置回调函数  
        xmlHttpRequest.onreadystatechange = getAjaxDataSuccess;
        //3.初始化XMLHttpRequest组建  
        xmlHttpRequest.open("POST", url, sync); //第3个参数true是异步，false是同步
        //4.发送请求  
        xmlHttpRequest.send(null);
    }

    var ok = 0;
    function getAjaxDataSuccess() {
        if (xmlHttpRequest.readyState != 4) return;
        if (xmlHttpRequest.status == 200) {
            data = xmlHttpRequest.responseText;
            ok = 1;
        }
        if (typeof callback == 'function') {
            callback({
                ok: ok,
                data: data
            });
        }
    }

    getAjaxData();
    if (typeof callback == 'function') return;
    if (ok) {
        if (data) {
            var json = convertToJson(data);
            switch (json.ret) {
                case 1001:
                    Wait.Show(GetLangValue("拼命加载中..."), true);
                    window.location.href = json.info;
                    return;
                    break;
                case 1002:
                    document.write("<p>" + json.info + "</p >");
                    return false;
                    break;
                default:
                    return json;
                    break;
            }
        }
    }
    else {
        netError();
    }
}

function setCookie(cookieName, cookieValue, seconds, path, domain, secure) {
	var expires = new Date();
	expires.setTime(expires.getTime() + (seconds || 0) * 1000);
	document.cookie = escape(cookieName) + '=' + escape(cookieValue)
		+ (expires ? ';expires=' + expires.toUTCString() : '')
		+ (path ? ';path=' + path : '')
		+ (domain ? ';domain=' + domain : '')
		+ (secure ? ';secure' : '');
}
function netError() {
    document.write("<p>"+GetLangValue("网络走丢了，")+GetLangValue("请")+"<a href='#' onclick='window.location.reload();'>"+GetLangValue("刷新")+"</a>"+GetLangValue("重试！")+"</p>");
    return false;
}

//多语言
function GetLangValue(src) {
    var lang = localStorage.getItem("lang") ? localStorage.getItem("lang") : "chinese";
    switch (lang) {
        case "english":
            return (langDic_en[src] || src);
            break;
        default:
            return (langDic_cn[src] || src);
            break;
    }

}
//拆分html内容，替换翻译
function getMultiResult(result) {
    var temp_result = result.split('@@@');
    var f_result = '';
    for (var i = 0; i < temp_result.length; i++) {
        f_result += GetLangValue(temp_result[i]);
    }
    return f_result;
}
/************** common类js end ********************/

;(function(){
    var otoken = Request("otoken");
	if(otoken)
	{
	    setCookie('otoken', otoken, 30000, '/');
	    //测试用
	    //setCookie('d719b3d9db434d09bd9e1373bcd798bb', unescape('WFNK6MzMPjek%2f5VhZS6Y2pm5KT798rZnHl6Td34DBn1YWnrDiSOr2jB77QGGSGaIHd%2fc4Al9oBe%2bcTh%2bO1pOWD9xNdPDi4RWqyWuRWDM8eq%2f1mXIIluxm6SaRcU5gE6BuEFTqs%2bRjPJfqEfex%2frgQnmMtaz8CrxK'), 30000, '/');
	    //setCookie('faid', '6970', 30000, '/');
	}
})();


function watermark() {

    //获取水印字眼
    var url = "AJAX/GetWaterMark.ashx";
    var json = ajax(url, false);
    if (!json) { Wait.Hide(); return; }

    if (json.info.length > 0) {
        //默认设置
        var defaultSettings = {
            watermark_txt: json.info,
            watermark_x: 20,//水印起始位置x轴坐标
            watermark_y: 70,//水印起始位置Y轴坐标
            watermark_rows: 3,//水印行数
            watermark_cols: 2,//水印列数
            watermark_x_space: 120,//水印x轴间隔
            watermark_y_space: 120,//水印y轴间隔
            watermark_color: '#aaaaaa',//水印字体颜色
            watermark_alpha: 1,//水印透明度
            watermark_fontsize: '16px',//水印字体大小
            watermark_font: '微软雅黑',//水印字体
            watermark_width: 70,//水印宽度
            watermark_height: 20,//水印长度
            watermark_angle: 30//水印倾斜度数
        };
        //采用配置项替换默认值，作用类似jquery.extend
        if (arguments.length === 1 && typeof arguments[0] === "object") {
            var src = arguments[0] || {};
            for (key in src) {
                if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key])
                    continue;
                else if (src[key])
                    defaultSettings[key] = src[key];
            }
        }

        var oTemp = document.createDocumentFragment();

        //获取页面最大宽度
        var page_width = Math.max(document.body.scrollWidth, document.body.clientWidth);
        //获取页面最大长度
        var page_height = Math.max(document.body.scrollHeight, document.body.clientHeight);

        //如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
        if (defaultSettings.watermark_cols == 0 || (parseInt(defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1)) > page_width)) {
            defaultSettings.watermark_cols = parseInt((page_width - defaultSettings.watermark_x + defaultSettings.watermark_x_space) / (defaultSettings.watermark_width + defaultSettings.watermark_x_space));
            defaultSettings.watermark_x_space = parseInt((page_width - defaultSettings.watermark_x - defaultSettings.watermark_width * defaultSettings.watermark_cols) / (defaultSettings.watermark_cols - 1));
        }
        //如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
        if (defaultSettings.watermark_rows == 0 || (parseInt(defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1)) > page_height)) {
            defaultSettings.watermark_rows = parseInt((defaultSettings.watermark_y_space + page_height - defaultSettings.watermark_y) / (defaultSettings.watermark_height + defaultSettings.watermark_y_space));
            defaultSettings.watermark_y_space = parseInt(((page_height - defaultSettings.watermark_y) - defaultSettings.watermark_height * defaultSettings.watermark_rows) / (defaultSettings.watermark_rows - 1));
        }
        var x;
        var y;
        for (var i = 0; i < defaultSettings.watermark_rows; i++) {
            y = defaultSettings.watermark_y + (defaultSettings.watermark_y_space + defaultSettings.watermark_height) * i;
            for (var j = 0; j < defaultSettings.watermark_cols; j++) {
                x = defaultSettings.watermark_x + (defaultSettings.watermark_width + defaultSettings.watermark_x_space) * j;

                var mask_div = document.createElement('div');
                mask_div.id = 'mask_div' + i + j;
                mask_div.appendChild(document.createTextNode(defaultSettings.watermark_txt));
                //设置水印div倾斜显示
                mask_div.style.webkitTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.MozTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.msTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.OTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.transform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.visibility = "";
                mask_div.style.position = "absolute";
                mask_div.style.left = x + 'px';
                mask_div.style.top = y + 'px';
                mask_div.style.overflow = "hidden";
                mask_div.style.zIndex = "9999";
                //mask_div.style.border="solid #eee 1px";
                mask_div.style.opacity = defaultSettings.watermark_alpha;
                mask_div.style.fontSize = defaultSettings.watermark_fontsize;
                mask_div.style.fontFamily = defaultSettings.watermark_font;
                mask_div.style.color = defaultSettings.watermark_color;
                mask_div.style.textAlign = "center";
                mask_div.style.width = defaultSettings.watermark_width + 'px';
                mask_div.style.height = defaultSettings.watermark_height + 'px';
                mask_div.style.display = "block";
                oTemp.appendChild(mask_div);
            };
        };
        document.body.appendChild(oTemp);
    }
    
}



function initIndex() {
    var lang = localStorage.getItem("lang") ? localStorage.getItem("lang") : "chinese";
    document.title = GetLangValue("碧桂园微信选房");
    //多语言处理
    document.getElementById("optCn").textContent = GetLangValue("中文");
    document.getElementById("optEn").textContent = GetLangValue("英文");
    document.getElementById("lang").value = localStorage.getItem("lang") ? localStorage.getItem("lang") : "chinese";
}

function LanguageChange(type) {
    var lang = document.getElementById("lang").value;
    localStorage.setItem("lang", lang);
    if (type == 1) {
        initIndex();
    }
    else if (type == 2) {
        initUserInfo();
    }
    else {
        //initLogin();
    }
}

function goToQueuenoList() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "queuenoselect.html?faid=" + escape(Request("faid")) + "&queueno=" + escape(Request("queueno"));
}

function initQueuenoSelect() {
    Wait.Show(GetLangValue("拼命加载中..."), true);

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");


    var url = "AJAX/GetQueuenoList.ashx?faid=" + escape(Request("faid"));
    var json = ajax(url, false);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 2) {
        localStorage.setItem("regfaid", Request("faid"));//11732      	肃宁碧桂园御府     YXJSZ2018051600002
        window.location.href = "reg.html?queueno=" + escape(Request("queueno"));
        return;
    }

    //只绑定1个微信方案
    if (json.info.length == 1) {
        goToSelfQuery(json.info[0].faid, json.info[0].queueno);
        return;
    }
    //绑定多个微信方案
    var sb = '';
    for (var i = 0; i < json.info.length; i++) {
        sb += "<div style='width: 100%;color: #808080;margin-bottom:5px;background-color:#ffffff;' onclick=\"goToSelfQuery('" + json.info[i].faid + "','" + json.info[i].queueno + "')\">";
        sb += "<table class='tblcollectinfo'>";
        sb += '<tr><td colspan="2">' + json.info[i].areaname + '</td></tr>';
        sb += '<tr><td width="50%">' + json.info[i].cstnames + '</td><td>' + json.info[i].handtel + '</td></tr>';
        sb += '<tr><td width="50%">' + json.info[i].faid + '</td><td>' + json.info[i].queueno + '</td></tr>';
        sb += '</table>';
        sb += '</div>';
    }
    document.getElementById("divQueueno").innerHTML = getMultiResult(sb);
    Wait.Hide();
}
function goToSelfQuery(faid, queueno,type) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    //设置faid和筹号
    localStorage.setItem("regfaid", faid);
    var url = "AJAX/SetQueueInfo.ashx?faid=" + escape(faid) + "&queueno=" + escape(queueno)+"&type="+escape(type);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        window.location.href = "roomlist.html";
    }
}

function initAlertBox() {
    //内容处理
    document.getElementById("title1").textContent = GetLangValue("提示");
    document.getElementById("btnYes").innerHTML = GetLangValue("知道了");


    var msg = Request("msg");
    var type = Request("type");
    document.getElementById("msg").innerHTML = msg;
    if (type == "hx") {
        document.getElementById("divImg").style.display = "none";
    }
}



function initReg() {
    Wait.Show(GetLangValue("拼命加载中..."), true);

    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("title1").textContent = GetLangValue("微信选房系统");

    //11732      	肃宁碧桂园御府     YXJSZ2018051600002
    var regfaid = localStorage.getItem("regfaid");
    var regcontent = (regfaid == "11732" ? "   请输入您的登记号" : "   请输入您的筹号");
    document.getElementById("txtQueueNo").setAttribute("placeholder", GetLangValue(regcontent));

    document.getElementById("spanDocument").textContent = GetLangValue("本人已经阅读并同意微信选房协议");
    document.getElementById("btnReg").innerHTML = GetLangValue("下一步");

    var queueno = Request("queueno");
    if (queueno.length > 0) {
        document.getElementById("txtQueueNo").value = queueno;
    }
    document.getElementById("txtQueueNo").style.width = '200px';
    screenFix("height", "divMain", 130);
}
function goDocFromReg() {
    var queueno = document.getElementById("txtQueueNo").value.trim();
    documentClick("xy", "reg", queueno, "", "");
}
//点击跳转到选房协议
function documentClick(type, docfrom, queueno, roomid, detailfrom) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "document.html?docfrom=" + escape(docfrom) + "&type=" + escape(type) + "&queueno=" + escape(queueno) + "&roomid=" + escape(roomid) + "&detailfrom=" + escape(detailfrom);
}
function initDocument() {
    //设置协议信息
    Wait.Show(GetLangValue("拼命加载中..."), true);

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("lblTitle").innerHTML = GetLangValue("碧桂园微信选房");
    document.getElementById("divButton").innerHTML = GetLangValue("同意上述协议，下一步");


    var type = Request("type");
    var queueno = Request("queueno");
    var roomid = Request('roomid');
    var url = "AJAX/GetDocument.ashx?roomid=" + escape(roomid) + "&type=" + escape(type) + "&queueno=" + escape(queueno);
    var json = ajax(url, false);
    if (!json) { Wait.Hide(); return; }


    queueno = (queueno.length > 0 ? queueno : json.queueno);
    var guid = (type == "rg" ? roomid : json.queueid);

    var frame = document.createElement("iframe");
    frame.src = "../../Setting/Print/PrintAll.aspx?docid=" + json.docid + "&guid=" + guid + "&params=" + escape("weixin|" + json.faid + "|" + queueno + "|" + roomid);
    frame.width = "100%";
    frame.height = "100%";
    document.getElementById("divDocument").appendChild(frame);

    if (Request("docfrom") == "roomdetail") {
        document.getElementById("divButton").style.display = "block";
        var btnHeight = document.getElementById("divButton").clientHeight;
        var titleHeight = document.getElementById("divTitle").clientHeight;
        screenFix("height", "divDocument", btnHeight + titleHeight+10);
    }
    else {
        document.getElementById("divButton").style.display = "none";
        var titleHeight = document.getElementById("divTitle").clientHeight;
        screenFix("height", "divDocument", titleHeight);
    }
    screenFix("width", "lblTitle", 140);
}
//返回
function back() {
    Wait.Show();
    var docfrom = Request("docfrom");
    var detailfrom = Request("detailfrom");
    var roomid = Request("roomid");
    switch (docfrom) {
        case "reg":
            window.location.href = "reg.html?queueno=" + escape(Request("queueno"));
            break;
        case "roomdetail":
            window.location.href = "roomdetail.html?detailfrom=" + escape(detailfrom) + "&roomid=" + escape(roomid);
            break;
        case "roomlist":
            window.location.href = "roomlist.html?detailfrom=" + escape(detailfrom);
            break
        case "userinfo":
            window.location.href = "userinfo.html?detailfrom=" + escape(detailfrom);
            break;
    }
}
//点击下一步
function RegCheck() {
    //判断是否勾选选房协议
    var cb = document.getElementById("cbAgree");
    if (!cb.checked) {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        OpenDlg("alertbox.html?msg=" + escape("<p>"+GetLangValue("请阅读并同意微信选房协议")+"</p>"), 270, 320, "");
        return;
    }
    //检测筹号是否为空
    var queueno = document.getElementById("txtQueueNo").value.trim();
    if (queueno.length <= 0) {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        OpenDlg("alertbox.html?msg=" + escape("<p>"+GetLangValue("请输入筹号")+"</p>"), 270, 320, "");
        return
    }
    //判断该筹号是否已经注册
    var url = "AJAX/GetQueuenoCheck.ashx?queueno=" + escape(queueno);
    var json = ajax(url);
    if (json.ret == "1") {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        OpenDlg("alertbox.html?msg=" + escape("<p>" + GetLangValue(json.info) + "</p>"), 270, 320, "");
    }
    else {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        OpenDlg("validation.html?queueno=" + escape(queueno), 270, 410, "验证", function (re) {
            if (re == 1) {
                Wait.Show();
                window.location.href = "roomlist.html";
            }

        });
    }
}
var code_countdate = 0;
var code_icount;
function initValidation() {
    Wait.Show();

    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("title1").innerHTML = GetLangValue("验证");
    document.getElementById("second").value = GetLangValue("获取验证码");
    document.getElementById("btnReg").textContent = GetLangValue("验证");

    var url = "AJAX/GetCstHandTel.ashx?queueno=" + escape(Request("queueno"));
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }

    if (json.ret == 0) {
        document.getElementById("handtel").innerHTML = json.info;
        Wait.Hide();
        return;
    }
    else {
        document.getElementById("lblMsg").innerHTML = GetLangValue(json.info);
        Wait.Hide();
        return;
    }
}
//获取验证码
function secondClick(type) {
    Wait.Show();
    var handtel = document.getElementById("handtel").value;
    if (handtel.length <= 0) {
        document.getElementById("lblMsg").innerHTML = GetLangValue("请联系销售顾问在筹号资料录入手机号码");
        Wait.Hide();
        return;
    }
    var url = "AJAX/GetCode.ashx?handtel=" + escape(handtel) + "&type=" + escape(type);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    //短信验证码
    if (type == 1) {
        if (json.ret == 1) {
            document.getElementById("lblMsg").innerHTML = GetLangValue(json.info);
            Wait.Hide();
            return;
        }
        code_countdate = 30;
        code_icount = setInterval("codetimer()", 1000);
    }
        //语音验证码
    else {
        if (json.ret == 1) {
            document.getElementById("lblMsg").innerHTML = GetLangValue("即将为您发送语音验证码，请注意接听！");
            document.getElementById("second2").style.display = "none";

        }
        else {
            document.getElementById("lblMsg").innerHTML = GetLangValue("语音验证码发送失败，请重试！");
            Wait.Hide();
        }
        Wait.Hide();
    }
}
function codetimer() {
    var second = document.getElementById("second");
    if (code_countdate <= 0) {
        clearInterval(code_icount);
        second.value = GetLangValue("获取验证码");
        second.removeAttribute("disabled");
        var second2 = document.getElementById("second2");
        second2.style.display = "block";
        second2.innerHTML = GetLangValue("收不到？点击使用语音验证码");
        return;
    }
    second.disabled = "disabled";
    second.value = GetLangValue("重新发送")+"(" + code_countdate + ")";
    code_countdate--;
    Wait.Hide();
}

//注册
function reg() {
    Wait.Show();
    var queueno = Request("queueno");
    var code = document.getElementById("code").value;
    if (code.length <= 0) {
        document.getElementById("lblMsg").innerHTML = GetLangValue("请输入验证码");
        Wait.Hide();
        return;
    }

    //判断验证码是否正确
    var handtel = document.getElementById("handtel").value;
    var url = "AJAX/CodeCheck.ashx?handtel=" + escape(handtel) + "&code=" + escape(code) + "&queueno=" + escape(queueno);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        alert(GetLangValue("验证成功"));
        Wait.Hide();
        window.dialogReturn(1);
        CloseDlg();
    }
    else {
        document.getElementById("lblMsg").innerHTML = GetLangValue(json.info);
        Wait.Hide();
        return;
    }
}
var roomlist_countmsg;
var roomlist_countdate;
var roomlist_icount; //记录定时器id
var roomlist_ext1;
var _zoom = 0.2;
var hasbuild = true;
function initRoomList() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var faid = localStorage.getItem("regfaid");
    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanSearch").textContent = GetLangValue("搜索");
    document.getElementById("spanSearch1").textContent = GetLangValue("搜索");
    document.getElementById("spanRefresh").textContent = GetLangValue("刷新");
    if (faid == "18692") {//【东江凤凰城凤凰湾A区】，因该车位仅有使用权，不出产权，不对外销售，销售状态为“未售”、“已售”，改为“未选”、“已选”。 by abin 对接 张惠华
        document.getElementById("spanWS").textContent = GetLangValue("未选");
        document.getElementById("spanYS").textContent = GetLangValue("已选");
    } else {
        document.getElementById("spanWS").textContent = GetLangValue("未售");
        document.getElementById("spanYS").textContent = GetLangValue("已售");
    }
    document.getElementById("spanWT").textContent = GetLangValue("未推");
    document.getElementById("txtKeyword").setAttribute("placeholder", GetLangValue("请输入关键字"));

    var tab = localStorage.getItem("tab") != null ? localStorage.getItem("tab") : "all";

    //查找roomlist界面所需的数据集
    var url = "AJAX/GetRoomListInfo.ashx";
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    //设置标题
    document.getElementById("lblTitle").innerHTML = GetLangValue(json.areaname);
    localStorage.setItem("ipaddocumentid", json.ipaddocumentid);

    //设置楼栋和建筑性质
    getBuildList(json.buildjson);

    //设置房间列表自适应
    var barHeight = document.getElementById("divTab").clientHeight;
    var countHeight = document.getElementById("divCount").clientHeight;
    var stateHeight = document.getElementById("divState").clientHeight;
    var buildHeight = document.getElementById("divBuild").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;

    screenFix("height", "divRoomList", barHeight + countHeight + stateHeight + buildHeight + titleHeight + 12);
    screenFix('width', 'lblTitle', 140);
    screenFix('height', 'divCollectList', barHeight + countHeight + titleHeight+1);

    if (tab == "collect") {
        collectClick();
    }
    else if (tab == "ipad" || localStorage.getItem("bldname") == "@@@规划图@@@") {
        ipadClick();
    }
    else {
        allClick();
    }
    getRoomListCount(json);
    Wait.Hide();
}
//获取楼栋列表/建筑性质列表
function getBuildList(buildJson) {
    var json = buildJson;
    var sb = "<table id='tblBuild' class='tblBuild'><tr>";
    var right = false;
    for (var i = 0; i < json.length; i++) {
        sb += "<td id='" + json[i].bldid + "' " + (i == 0 ? " clickcolor='blue' class='clickblue' " : " class='clickwhite' ") + " onclick=\"bldClick('" + json[i].bldid + "','" + json[i].bldname + "')\"  >" + getMultiResult(json[i].bldname) + "</td>";
        if (json[i].bldid == localStorage.getItem("bldid")) {
            right = true;
        }
    }
    if (json.length > 0) {
        if (!right) {
            localStorage.setItem("bldid", json[0].bldid);
            localStorage.setItem("bldname", json[0].bldname);
        }
    }
    else {
        localStorage.setItem("bldid", "");
        localStorage.setItem("bldname", "");
        sb += "<td>"+GetLangValue("暂无数据")+"</td>";
    }
    sb += "</tr></table>";
    document.getElementById("divBuild").innerHTML = sb;
}
//点击收藏列表
function collectClick() {
    roomlistMode("collect");
    getCollectList();
}
//点击规划图
function ipadJsCover(iframe) {
    window.frmIpad.YF.GoToBld = function (obj) {
        var div = BubbleNode(obj, 'div');
        if (!div) return;

        //处理微信选房规划图
        window.parent.bldClick(div.id, '');
    }
    zoom(_zoom);
    iframe.style.display = "block";
    Wait.Hide();
}
function initFrameBtn(obj) {
    obj.style.width = "80px";
    obj.style.height = "30px";
    obj.style.margin = "5px";
    obj.style.position = "absolute";
    obj.style.zIndex = "100";
}
function changeFrame(type) {
    if (type == "add") {
        _zoom = _zoom + 0.2;
    }
    else {
        _zoom = _zoom <= 0.3 ? 0.2 : _zoom - 0.2;
    }
    zoom(_zoom);
}
function zoom(zoom) {
    var win = window.frmIpad;
    win.document.body.style.zoom = zoom;
    var o = win.frames;
    for (var i = 0, f; f = o[i++];) {
        f.document.body.style.zoom = zoom;
    }
}
function ipadClick() {
    Wait.Show();
    var ipaddocumentid = localStorage.getItem("ipaddocumentid");;
    if (ipaddocumentid.length <= 0) {
        OpenDlg("alertbox.html?msg=" + escape("<p>"+GetLangValue("当前微信选房方案没有设置规划图")+"</p>"), 270, 320, "");
        Wait.Hide();
        return;
    }
    setBuild(ipaddocumentid, "规划图");
    //
    roomlistMode("ipad");
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = "frmIpad";
    iframe.id = "frmIpad";
    iframe.style.overflow = "auto";
    iframe.scrolling = "yes";
    iframe.src = "../../Setting/Print/Print.aspx?mod=print&docid=" + ipaddocumentid + "&pageno=2&guid=BCW01J-09&params=7091c96a-e2d4-410a-b555-ab2dc8c031cb";
    iframe.width = "98%";
    iframe.height = "98%";
    if (iframe.attachEvent) {
        iframe.attachEvent("onload", function () {
            ipadJsCover(iframe);
        });
    } else {
        iframe.onload = function () {
            ipadJsCover(iframe);
        };
    }

    var add = document.createElement("button");
    add.id = "btnAddFrame";
    add.textContent = GetLangValue("放大");
    initFrameBtn(add);
    add.onclick = function () { changeFrame("add"); }

    var min = document.createElement("button");
    min.id = "btnMinFrame";
    min.textContent = GetLangValue("缩小");
    initFrameBtn(min);
    min.style.left = "90px";
    min.onclick = function () { changeFrame("min"); }

    var roomlist = document.getElementById("divRoomList");
    roomlist.innerHTML = "";
    roomlist.parentNode.insertBefore(add, roomlist);
    roomlist.parentNode.insertBefore(min, roomlist);
    roomlist.appendChild(iframe);
    setTimeout(function () { Wait.Hide(); }, 2500);
}
//设置楼栋
function setBuild(bldid, bldname) {
    if (!document.getElementById(bldid)) {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        hasbuild = false;
        OpenDlg("alertbox.html?msg=" + escape("<p>"+GetLangValue("当前楼栋未增加到微信选房，请检查设置！")+"</p>"), 270, 350, "");
        return;
    }
    hasbuild = true;
    var tds = document.getElementById("tblBuild").getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        var clickcolor = tds[i].getAttribute("clickcolor");
        if (clickcolor == "blue") {
            tds[i].removeAttribute("clickcolor");
            tds[i].setAttribute("class", "clickwhite");
            break;
        }
    }

    document.getElementById(bldid).setAttribute("class", "clickblue");
    document.getElementById(bldid).setAttribute("clickcolor", "blue");
    var left = document.getElementById(bldid).offsetLeft;
    document.getElementById("divBuild").scrollLeft = left;

}
//楼栋点击事件
function bldClick(bldid, bldname) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    if (bldname == "@@@规划图@@@") {
        ipadClick();
    }
    else {
        localStorage.setItem("bldid", bldid);
        localStorage.setItem("bldname", bldname);
        allClick();
    }
}
//房源格子页面模式切换
function roomlistMode(type) {
    var state1 = "";
    var state2 = "";
    var all = "";
    var allcolor = "";
    var ipad = "";
    var ipadcolor = "";
    var collect = "";
    var collectcolor = "";
    switch (type) {
        case "collect":
            state1 = "none";
            state2 = "block";
            all = "5";
            allcolor = "343434";
            ipad = "5";
            ipadcolor = "343434";
            collect = "4";
            collectcolor = "f31e1f";
            break;
        case "ipad":
            state1 = "block";
            state2 = "none";
            all = "5";
            allcolor = "343434";
            ipad = "4";
            ipadcolor = "f31e1f";
            collect = "5";
            collectcolor = "343434";
            break;
        case "all":
            state1 = "block";
            state2 = "none";
            all = "4";
            allcolor = "f31e1f";
            ipad = "5";
            ipadcolor = "343434";
            collect = "5";
            collectcolor = "343434";
            break;
    }

    document.getElementById("divState").style.display = state1;
    document.getElementById("divBuild").style.display = state1;
    document.getElementById("divRoomList").style.display = state1;
    document.getElementById("divCollectList").style.display = state2;
    document.getElementById("btnAll").innerHTML = '<div style="width:100%;height:25px;text-align:center;"><img width="24px" src="Images/fy'+all+'.png" /></div><div><span style="font-size:12px;color:#'+allcolor+';">'+GetLangValue("房源")+'</span></div>';
    document.getElementById("btnIpad").innerHTML = '<div style="width:100%;height:25px;text-align:center;"><img width="24px"  src="Images/ght' + ipad + '.png" /></div><div><span style="font-size:12px;color:#' + ipadcolor + ';">' + GetLangValue("规划图") + '</span></div>';
    document.getElementById("btnCollect").innerHTML = '<div style="width:100%;height:25px;text-align:center;"><img width="24px"  src="Images/sc' + collect + '.png" /></div><div><span style="font-size:12px;color:#' + collectcolor + ';">' + GetLangValue("收藏") + '</span></div>';
    document.getElementById("btnUser").innerHTML = '<div style="width:100%;height:25px;text-align:center;"><img width="24px"  src="Images/wd5.png" /></div><div><span style="font-size:12px;color:#343434;">' + GetLangValue("我的") + '</span></div>';
    localStorage.setItem("tab", type);

}
//查看全部
function allClick() {
    var bldid = localStorage.getItem("bldid");
    var bldname = localStorage.getItem("bldname");
    setBuild(bldid, bldname);
    if (hasbuild) {
        roomlistMode("all");
        getRoomList();
    }
}
//获取房间列表
function getRoomList() {
    Wait.Show();
    var keyword = document.getElementById("txtKeyword").value;
    var bldid = localStorage.getItem("bldid");
    var url = "AJAX/GetRoomList.ashx?bldid=" + escape(bldid) + "&keyword=" + escape(keyword);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        document.getElementById("divRoomList").innerHTML = getMultiResult(json.info);
    }

    var addBtn = document.getElementById("btnAddFrame");
    var minBtn = document.getElementById("btnMinFrame");
    if (addBtn) {
        addBtn.parentNode.removeChild(addBtn);
        minBtn.parentNode.removeChild(minBtn);
    }
    setTimeout(function () { Wait.Hide(); }, 500);
}
//获取倒计时
function getRoomListCount(json) {
    if (!json) {
        var url = "AJAX/GetRoomListInfo.ashx?faid=" + escape(Request("faid"));
        json = ajax(url);
        if (!json) { Wait.Hide(); return; }
    }
    clearInterval(roomlist_icount);

    roomlist_countdate = json.time;
    roomlist_countmsg = json.msg;
    roomlist_ext1 = json.ext1;

    if (roomlist_countdate == -1) {
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>" + roomlist_countmsg + "</span>";
        setext1(roomlist_ext1);
    }
    else if (roomlist_countdate > 0) {
        roomlist_icount = setInterval("roomlisttimer()", 1000);
    }
    else {
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>" + GetLangValue("本次选房已开始") + "</span>";
        setext1(roomlist_ext1);
    }

}
function setext1(ext1) {
    if (ext1.length > 0) {
        var span = document.createElement("span");
        span.textContent = ext1;
        span.style.color = "blue";
        span.style.zIndex = "100";
        span.style.textAlign = "center";
        document.getElementById("divCount").appendChild(span);
    }
}
function roomlisttimer() {
    var ts = roomlist_countdate;//计算剩余的毫秒数
    var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
    var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
    var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
    var ss = parseInt(ts % 60, 10);//计算剩余的秒数
    if (ts <= 0) {
        clearInterval(roomlist_icount);
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>"+ GetLangValue("本次选房已开始")+"</span>";
        setext1(roomlist_ext1);
        return;
    }
    dd = checkTime(dd);
    hh = checkTime(hh);
    mm = checkTime(mm);
    ss = checkTime(ss);
    document.getElementById("divCount").innerHTML = GetLangValue(roomlist_countmsg) +
        "&nbsp;&nbsp;<span style='color:red;'>" + dd +
        GetLangValue("天")+"<span style='color:red;'>" + hh +
        GetLangValue("时")+"</span><span style='color:red;'>" + mm +
        GetLangValue("分")+"</span><span style='color:red;'>" + ss +
        GetLangValue("秒")+"</span>&nbsp;&nbsp;";
    setext1(roomlist_ext1);
    roomlist_countdate--;
    if (ss == 10 || ss == 40) {
        getRoomListCount();
    }
}
//获取收藏列表
function getCollectList() {
    Wait.Show();
    var keyword = document.getElementById("txtKeyword").value;
    var url = "AJAX/GetCollectList.ashx?keyword=" + escape(keyword);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        document.getElementById("divCollectList").innerHTML = getMultiResult(json.info);
    }
    var addBtn = document.getElementById("btnAddFrame");
    var minBtn = document.getElementById("btnMinFrame");
    if (addBtn) {
        addBtn.parentNode.removeChild(addBtn);
        minBtn.parentNode.removeChild(minBtn);
    }
    setTimeout(function () { Wait.Hide(); }, 500);
}
//房间列表页面刷新
function refresh() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "roomlist.html";
}
//显示搜索框
function searchShow() {
    document.getElementById("lblTitle").style.display = "none";
    document.getElementById("divSearch").style.display = "block";
    screenFix("width", "divSearch", 150)
}
//搜索
function search() {
    var tab = localStorage.getItem("tab");
    if (tab == "all") {
        allClick();
    }
    else {
        collectClick();
    }
}
//查看个人信息
function getUser() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "userinfo.html";
}
//点击进入房间详细
function goToDetail(roomid, detailfrom) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    stopBubble();
    if (!detailfrom) detailfrom = "roomlist";
    window.location.href = "roomdetail.html?detailfrom=" + escape(detailfrom) + "&roomid=" + escape(roomid);
}
//排序
function orderChange(type, roomid) {
    Wait.Show();
    stopBubble();
    var url = "AJAX/SetOrderChange.ashx?roomid=" + escape(roomid) + "&type=" + escape(type);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        setTimeout(function () { getCollectList(); Wait.Hide(); }, 1000);
    }
    else {
        OpenDlg("alertbox.html?type=hide&msg=" + escape("<p>" + GetLangValue(json.info) + "</p>"), 270, 320, "");
        Wait.Hide();
    }

}

var iscollect = 0;
var roomdetail_buttontype = 0;
var roomdetail_countmsg;
var roomdetail_countdate;
var roomdetail_ext1;
var roomdetail_icount; //记录定时器id
function initRoomDetail() {
    Wait.Show(GetLangValue("拼命加载中..."), true);

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("spanRefresh").textContent = GetLangValue("刷新");
    document.getElementById("divBase").innerHTML = GetLangValue("基本信息");
    document.getElementById("divDeal").innerHTML = GetLangValue("成交信息");


    var roomid = Request("roomid");
    var url = "AJAX/GetRoomDetailInfo.ashx?roomid=" + escape(roomid);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }

    //设置标题
    document.getElementById("lblTitle").innerHTML = json.htroomname;


    //获取收藏状态
    iscollect = json.count;
    if (iscollect > 0) {
        document.getElementById("divCollect").innerHTML = '<img src="Images/ysc.png" width="22" style="vertical-align:middle;" /> ' + GetLangValue("取消收藏");
    }
    else {
        document.getElementById("divCollect").innerHTML = '<img src="Images/wsc.png" width="22"  style="vertical-align:middle;"  /> ' + GetLangValue("收藏");
    }
    //设置基本信息
    document.getElementById("divBaseInfo").innerHTML = getMultiResult(json.baseinfo);
    //设置成交信息 
    document.getElementById("divDealInfo").innerHTML = getMultiResult(json.dealinfo);

    //设置房源推荐
    document.getElementById("divRecommond").style.display = json.is_tj == 1 ? "block" : "none";
    localStorage.setItem("is_tj", json.is_tj);

    //获取各配置值
    localStorage.setItem("is_rg", json.is_rg); //是否线上认购
    localStorage.setItem("isonlinepay", json.isonlinepay); //是否在线支付
    localStorage.setItem("isoverpay", json.isoverpay);  //是否允许超时支付
    localStorage.setItem("ispay", json.ispay);  //当前单位是否已成功支付
    localStorage.setItem("isbuyer", json.isbuyer);  //当前单位是否当前用户购买
    localStorage.setItem("hasysxkz", json.hasysxkz);  //当前单位是否有预售证
    localStorage.setItem("areaname", json.areaname);  //当前单位是否有预售证

    //设置滑动显示字段
    if (json.slideinfo && json.slideinfo.length > 0)
    {
        document.getElementById("divSlide").style.display = "block";
        document.getElementById("sliderLabel").textContent = json.slideinfo;
    }


    //设置按钮信息
    roomdetail_buttontype = "1";
    var color = '';
    var text = '';
    switch (roomdetail_buttontype) {
        case "0":
            color = "#f7abab";
            text = GetLangValue("即将开始");
            break;
        case "1":
            color = "#ef4c4c";
            if (json.hasysxkz == 0) {
                text = GetLangValue("我要锁定房源");
            }
            else {
                text = GetLangValue("我要选房");
            }
            document.getElementById("divButton").setAttribute("onclick", "buyClick()");
            break;
        case "2":
            var cb = document.getElementById("cbAgree");
            if (cb) {
                cb.checked = true;
            }
            color = "#f7abab";
            if (json.hasysxkz == 0) {
                text = GetLangValue("已锁定房源");
            }
            else if (json.isonlinepay == 1 && json.ispay == 0 && json.isbuyer==1) {
                text = GetLangValue("已锁定未支付");
                color = "#ef4c4c";
                document.getElementById("divButton").setAttribute("onclick", "buyClick()");
            }
            else if (json.isonlinepay == 1 && json.ispay == 1 && json.isbuyer==1) {
                text =  GetLangValue("已支付");
            }
            else {
                text = GetLangValue("已成交");
            }
            break;
    }
    document.getElementById("divButton").style.backgroundColor = color;
    document.getElementById("divButton").innerHTML = text;


    //设置房间列表自适应
    var btnHeight = document.getElementById("divButton").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;
    var countHeight = document.getElementById("divCount").clientHeight;
    screenFix("height", "divDetailMain", btnHeight + titleHeight + countHeight+10);
    screenFix("width", "lblTitle", 140);

    getRoomDetailCount();
    Wait.Hide();
}
function onekey(roomid) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    stopBubble();
    var url = "AJAX/GetRoomDetailInfo.ashx?roomid=" + escape(roomid);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }

    localStorage.setItem("is_rg", json.is_rg); //是否线上认购
    localStorage.setItem("isonlinepay", json.isonlinepay); //是否在线支付
    localStorage.setItem("isoverpay", json.isoverpay);  //是否允许超时支付
    localStorage.setItem("ispay", json.ispay);  //当前单位是否已成功支付
    localStorage.setItem("isbuyer", json.isbuyer);  //当前单位是否当前用户购买
    localStorage.setItem("hasysxkz", json.hasysxkz);  //当前单位是否有预售证
    localStorage.setItem("areaname", json.areaname);  //当前单位是否有预售证

    setTimeout(function () { }, Math.random() * 500);
    switch ("1") {
        case "1":
            var is_rg = json.is_rg;
            var hasysxkz = json.hasysxkz;
            var areaname = json.areaname;
            window.location.href = "choosebox.html?roomid=" + escape(roomid);
            //if (is_rg == 1 && (hasysxkz == 1 || areaname == "凤凰城" )) {
            //    documentClick("rg", "roomdetail", "", roomid, "roomlist");
            //}
            //else {
            //    window.location.href = "choosebox.html?roomid=" + escape(roomid);
            //}
            break;
        case "2":
            var isonlinepay = json.isonlinepay;
            var ispay = json.ispay;
            var isbuyer = json.isbuyer;
            var hasysxkz = json.hasysxkz;
            if (isonlinepay == 1 && ispay == 0 && isbuyer == 1 && hasysxkz==1) {
                var roomid = Request("roomid");
                window.location.href = "djpay.html?roomid=" + escape(roomid) + "&type=2";
            }
            break;
        default:
            OpenDlg("alertbox.html?type=hide&msg=" + escape("<p>当前微信选房未开始，不能一键认购</p>"), 270, 320, "");
            break
    }
}
//获取倒计时
function getRoomDetailCount() {
    var roomid = Request("roomid");
    var url = "AJAX/GetRoomDetailInfo.ashx?roomid=" + escape(roomid);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    clearInterval(roomdetail_icount);

    roomdetail_countdate = json.time;
    roomdetail_countmsg = json.msg;
    roomdetail_ext1 = json.ext1;

    if (roomdetail_countdate == -1) {
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>" + roomdetail_countmsg + "</span>";
        setext1(roomdetail_ext1);
    }
    else if (roomdetail_countdate > 0) {
        roomdetail_icount = setInterval("roomdetailtimer()", 1000);
    }
    else {
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>"+GetLangValue("本次选房已开始")+"</span>";
        setext1(roomdetail_ext1);
    }
}
function roomdetailtimer() {
    var ts = roomdetail_countdate;//计算剩余的毫秒数
    var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
    var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
    var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
    var ss = parseInt(ts % 60, 10);//计算剩余的秒数
    if (ts <= 0) {
        clearInterval(roomdetail_icount);
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>"+GetLangValue("本次选房已开始")+"</span>";
        setext1(roomdetail_ext1);
        return;
    }
    dd = checkTime(dd);
    hh = checkTime(hh);
    mm = checkTime(mm);
    ss = checkTime(ss);
    document.getElementById("divCount").innerHTML = GetLangValue(roomdetail_countmsg) +
    "&nbsp;&nbsp;<span style='color:red;'>" + dd +
    GetLangValue("天") + "<span style='color:red;'>" + hh +
    GetLangValue("时") + "</span><span style='color:red;'>" + mm +
    GetLangValue("分") + "</span><span style='color:red;'>" + ss +
    GetLangValue("秒") + "</span>&nbsp;&nbsp;";
    setext1(roomdetail_ext1);
    roomdetail_countdate--;

    if (ss == 10 || ss == 40) {
        getRoomDetailCount();
    }
}
//收藏/取消收藏
function setCollect() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var roomid = Request("roomid");
    var is_tj = localStorage.getItem("is_tj");
    var url = "AJAX/SetCollect.ashx?roomid=" + escape(roomid) + "&iscollect=" + escape(iscollect);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        if (iscollect == 0) {
            document.getElementById("divCollect").innerHTML = '<img src="Images/ysc.png" width="22" style="vertical-align:middle;" /> '+GetLangValue("取消收藏");
            iscollect = 1;
        }
        else {
            document.getElementById("divCollect").innerHTML = '<img src="Images/wsc.png" width="22"  style="vertical-align:middle;"  /> '+GetLangValue("收藏");
            iscollect = 0;
        }
    }
    OpenDlg("alertbox.html?msg=" + escape("<p>" + getMultiResult(json.info) + "</p>"+(is_tj==1 ? "<div style='width:100%;text-align:center;color:blue;margin-bottom:3px;' onclick='window.top.returnValue=1;window.parent.dialogReturn(1); window.parent.CloseDlg();'>查看房源推荐</div>" : "")), 270, 340, "", function (re) {
        if (re == 1) {
            recommond();
        }
    });

}
function refreshDetail() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var roomid = Request("roomid");
    var detailfrom = Request("detailfrom");
    window.location.href = "roomdetail.html?detailfrom=" + escape(detailfrom) + "&roomid=" + escape(roomid);
}

//房源推荐
function recommond() {
    var roomid = Request("roomid");
    localStorage.setItem("recommondroomid", roomid);
    window.location.href = "recommond.html";
}
function refreshRecommond() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "recommond.html";
}
function backFromRecommond() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var roomid = localStorage.getItem("recommondroomid");
    window.location.href = "roomdetail.html?detailfrom=roomlist&roomid=" + escape(roomid);
}

function initRecommond() {
    Wait.Show(GetLangValue("拼命加载中..."), true);

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("spanRefresh").textContent = GetLangValue("刷新");
    //设置标题
    document.getElementById("lblTitle").innerHTML = GetLangValue("房源推荐");

    var recommondtype = localStorage.getItem("recommondtype");
    if (!recommondtype) {
        recommondtype = "zhtj";
        localStorage.setItem("recommondtype", "zhtj");
    }
    setRecommondType(recommondtype);

   
    //设置房间列表自适应
    var TypeHeight = document.getElementById("divBuild").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;

    screenFix("height", "divRecommondList", TypeHeight + titleHeight+50);
    screenFix('width', 'lblTitle', 140);



}
function setRecommondType(type) {
    localStorage.setItem("recommondtype", type);
    var tds = document.getElementById("tblBuild").getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        var clickcolor = tds[i].getAttribute("clickcolor");
        if (clickcolor == "blue") {
            tds[i].removeAttribute("clickcolor");
            tds[i].setAttribute("class", "clickwhite");
            break;
        }
    }
    document.getElementById(type).setAttribute("class", "clickblue");
    document.getElementById(type).setAttribute("clickcolor", "blue");
    getRecommondList();
}
function getRecommondList() {
    var roomid = localStorage.getItem("recommondroomid");
    var recommondtype = localStorage.getItem("recommondtype");
    var url = "AJAX/GetRecommondList.ashx?roomid=" + escape(roomid)+"&type="+escape(recommondtype);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        if (json.priceshow == 0) {
            document.getElementById("jgxj").style.display = "none";
        }
        document.getElementById("divRecommondList").innerHTML = getMultiResult(json.recommondlist);
    }
    if (recommondtype == "lcxj") {
        ScrollToControl('divChoose');
    }

}
function elementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop = obj.offsetTop;
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }
    }
    //alert(curleft + "|" + curtop);
    return { x: curleft, y: curtop };
}
function ScrollToControl(id) {
    var elem = document.getElementById(id);
    var scrollPos = elementPosition(elem).y;
    var scrollPosx = elementPosition(elem).x;
    scrollPos = scrollPos - document.documentElement.scrollTop;
    scrollPosx = scrollPosx - document.documentElement.scrollLeft;
    var remainder = scrollPos % 70;
    var remainderx = scrollPosx % 50;
    var repeatTimes = (scrollPos - remainder) / 70;
    var repeatTimesx = (scrollPosx - remainderx) / 50;
    var r = document.getElementById("divRecommondList");
    r.scrollBy(remainderx, remainder);
    
    ScrollSmoothly(scrollPos,  repeatTimes);
    ScrollSmoothlx(scrollPosx, repeatTimesx);
    
}
var repeatCount = 0;
var repeatCountx = 0;
var cTimeout;
var cTimeoutx;
var timeoutIntervals = new Array();
var timeoutIntervalSpeed;
function ScrollSmoothly( scrollPos, repeatTimes) {
    if (repeatCount < repeatTimes) {
        var r = document.getElementById("divRecommondList");
        r.scrollBy(0, 70);
    }
    else {
        repeatCount = 0;
        clearTimeout(cTimeout);
        return;
    }
    repeatCount++;
    cTimeout = setTimeout("ScrollSmoothly('" + scrollPos + "','" + repeatTimes + "')", 10);
}
function ScrollSmoothlx(scrollPos, repeatTimes) {
    if (repeatCountx < repeatTimes) {
        var r = document.getElementById("divRecommondList");
        r.scrollBy(50, 0);
    }
    else {
        repeatCountx = 0;
        clearTimeout(cTimeoutx);
        return;
    }
    repeatCountx++;
    cTimeoutx = setTimeout("ScrollSmoothlx('" + scrollPos + "','" + repeatTimes + "')", 10);
}


//从详细页返回
function backFromDetail() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    if (Request("detailfrom") == "recommond") {
        window.location.href = "recommond.html";
    }
    else if (Request("detailfrom") == "roomlist") {
        window.location.href = "roomlist.html";
    }
    else {
        window.location.href = "userinfo.html";
    }
}
//点击打开户型图
function hxtClick(map) {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    OpenDlg("alertbox.html?type=hx&msg=" + escape("<div style='width:290px;height:300px;overflow:auto;'><img src='" + map + "' /></div><br/>"), 300, 420, "户型图");
}
function initUserInfo() {
    Wait.Show();

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("spanDel").textContent = GetLangValue("解绑");
    //document.getElementById("spanDocument").textContent = GetLangValue("本人已经阅读并同意微信选房协议");
    document.getElementById("lblTitle").innerHTML = GetLangValue("我的信息");
    //多语言处理
    document.getElementById("optCn").textContent = GetLangValue("中文");
    document.getElementById("optEn").textContent = GetLangValue("英文");
    document.getElementById("lang").value = localStorage.getItem("lang") ? localStorage.getItem("lang") : "chinese";


    var titleHeight = document.getElementById("divTitle").clientHeight;
    var footHeight = 0;
    screenFix("height", "divUserInfo", titleHeight + footHeight+20);
    screenFix("width", "lblTitle", 210);
    var url = "AJAX/GetUserInfo.ashx";

    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        document.getElementById("divUserInfo").innerHTML = getMultiResult(json.info);
    }

    Wait.Hide();
}
function backFromUserInfo() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    window.location.href = "roomlist.html";
}
//解绑当前微信号
function delReg() {
    if (confirm(GetLangValue('确定要解绑吗？'))) {
        var url = "AJAX/DelReg.ashx";
        var json = ajax(url);
        //if (!json) Wait.Hide(); return;
        if (json.ret == 2) {
            Wait.Show(GetLangValue("拼命加载中..."), true);
            alert(GetLangValue("解绑成功！"));
            window.location.href = "index.html?faid=" + escape(json.info);
        }
        else {
            Wait.Show("拼命加载中", true);
            OpenDlg("alertbox.html?msg=" + escape("<p>" + GetLangValue(json.info) + "</p>"), 270, 320, "");
        }
    }
}
//点击跳转到选房协议
function goDocFromUserInfo() {
    documentClick("xy", "userinfo", "", "", Request("detailfrom"));
}
//点击购买按钮
function buyClick() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var roomid = Request("roomid");

    switch(roomdetail_buttontype)
    {
        case "1":
            setTimeout(function () { }, Math.random() * 500);
            var is_rg = localStorage.getItem("is_rg");
            var hasysxkz = localStorage.getItem("hasysxkz");
            var areaname = localStorage.getItem("areaname");
            goChooseBox();
            //if (is_rg == 1 && (hasysxkz == 1 || areaname == "凤凰城")) {
            //    documentClick("rg", "roomdetail", "", roomid, Request("detailfrom"));
            //}
            //else {
            //    goChooseBox();
            //}
            break;
        case "2":
            var isonlinepay = localStorage.getItem("isonlinepay");
            var ispay=localStorage.getItem("ispay");
            var isbuyer=localStorage.getItem("isbuyer");
            if (isonlinepay == 1 && ispay == 0 && isbuyer == 1) {
                var roomid = Request("roomid");
                window.location.href = "djpay.html?roomid=" + escape(roomid) + "&type=2";
            }
            break;
    }
}
//初始化确认界面
function initChooseBox() {

    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("lblTitle").innerHTML = GetLangValue("碧桂园微信选房");

    var roomid = Request("roomid");

    var url = "AJAX/GetChooseInfo.ashx?roomid=" + escape(roomid);
    var json = ajax(url);
    json = {
        ret: 0,
        chooseinfo: "test",
        openpoint: 1,
    }
    // if (!json) { Wait.Hide(); return; }
    // if (json.ret == 1) {
    //     document.getElementById("divButton").innerText = GetLangValue("返 回");
    //     document.getElementById("divInfo").innerHTML = GetLangValue(json.info);
    //     screenFix("height", "divMain", 95);
    //     return;
    // }
    localStorage.setItem("openpoint", json.openpoint);
    document.getElementById("divInfo").innerHTML = getMultiResult(json.chooseinfo);
    var is_rg = localStorage.getItem("is_rg");
    var hasysxkz = localStorage.getItem("hasysxkz");
    if (is_rg == 1 && hasysxkz == 1) {
        document.getElementById("divComfirm").style.display = "none";
        document.getElementById("divButton").innerText = GetLangValue("下一步"); 
        document.getElementById("divButton").setAttribute("onclick", "nextClick()");
    }
    else
    {
        document.getElementById("divComfirm").style.display = "block";
        document.getElementById("divButton").innerHTML = GetLangValue("确 定");
        document.getElementById("divButton").setAttribute("onclick", "yesclick()");
    }

    
    var btnHeight = document.getElementById("divButton").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;
    screenFix("height", "divMain", btnHeight + titleHeight+10);
    yesclick()
}
function backToRoomDetail() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var roomid = Request("roomid");
    window.location.href = "roomdetail.html?detailfrom=roomlist&roomid=" + escape(roomid);
}
function goChooseBox() {
    var roomid = Request("roomid");
    window.location.href = "choosebox.html?roomid=" + escape(roomid);
}
function nextClick() {
    var roomid = Request("roomid");
    window.location.href = "promise.html?roomid=" + escape(roomid);
}
function captchaRefresh() {
    var d = new Date().toLocaleTimeString();
    document.getElementById("captcha").src = "AJAX/CheckCodeHandler.ashx?v=" + escape(d) + "&roomid=" + escape(Request("roomid"));
}
function initPromise() {
    Wait.Show(GetLangValue("拼命加载中..."), true);


    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("spanPromise").textContent = GetLangValue("上述承诺为本人真实意思表示，本人将严格履行。");
    document.getElementById("lblTitle").innerHTML = GetLangValue("碧桂园微信选房");


    var roomid = Request("roomid");

    var url = "AJAX/GetPromise.ashx?roomid=" + escape(roomid);
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    if (json.ret == 0) {
        document.getElementById("divPromise").innerHTML = json.info;
    }
    if (localStorage.getItem("isonlinepay") == "1") {
        document.getElementById("divButton").textContent =GetLangValue("确认锁定房源");
    }
    else {
        document.getElementById("divButton").textContent = GetLangValue("确 定");
    }
    //document.getElementById("divComfirm").style.display = "block";
    document.getElementById("divButton").setAttribute("onclick", "yesclick()");

    setTimeout(function () { Wait.Hide(); }, Math.random() * 500);

    var btnHeight = document.getElementById("divButton").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;
    screenFix("height", "divMain", btnHeight + titleHeight + 10);
}

function yesclick() {
    Wait.Show(GetLangValue("拼命加载中..."), true);
    //判断是否勾选选房协议
    // var cb = document.getElementById("cbAgree");
    // if (cb && !cb.checked) {
    //     alert(GetLangValue("请阅读并同意上述条款"));
    //     Wait.Hide();
    //     return;
    // }

    //判断是否启用验证码
    var openpoint = localStorage.getItem("openpoint");
    if (openpoint == 1) {
        OpenDlg(sWebRoot+"HtmlControl/HDYZM/Test.aspx", 300, 320, "验证码", function (re) {
            if (re.length > 0) {
                lastBuy(re);
            }
        });
    }
    else {
        lastBuy("");
    }    
}

function lastBuy(code) {
    var roomid = Request("roomid");
    var inputCode = code;
    Wait.Show(GetLangValue("拼命加载中..."), true);
    document.getElementById('divButton').innerText = GetLangValue("正在认购中...");
    document.getElementById('divButton').setAttribute('disabled', 'disabled');

    setTimeout(function () {
        var url = "AJAX/BuyClick.ashx?roomid=" + escape(roomid) + "&inputcode=" + escape(inputCode);
        var json = ajax(url);
        //ret=0时，开启队列，每秒访问一次接口查询结果
        if (json.ret == 0) {
            var urlresult = "AJAX/GetBuyResult.ashx?roomid=" + escape(roomid) + "&guid=" + escape(json.info);
            
            var waitcount = 30;
            var getBuyResultTimer = setInterval(function () {
                if (waitcount % 2 == 0) {
                    var jsonresult = ajax(urlresult);

                    if (jsonresult.ret == 1) {
                        clearInterval(getBuyResultTimer);
                        OpenDlg("alertbox.html?type=hx&msg=" + escape("<p>" + getMultiResult(jsonresult.info) + "</p>"), 270, 380, "");
                        resetBuy(roomid);
                        return;
                    }
                    else if (jsonresult.ret == 2 || jsonresult.ret == 3) {
                        clearInterval(getBuyResultTimer);
                        window.location.href = "djpay.html?roomid=" + escape(roomid) + "&type=" + escape(jsonresult.ret);
                    }
                    else {
                        if (waitcount == 0) {
                            clearInterval(getBuyResultTimer);
                            OpenDlg("alertbox.html?type=hx&msg=" + escape("<p>" + getMultiResult("等待超时，请重试") + "</p>"), 270, 380, "");
                            resetBuy(roomid);
                            return;
                        }
                        else {
                            Wait.Hide();
                            waitcount--;
                            Wait.Show("正在选房中," + waitcount);
                        }

                    }
                }
                else {
                    Wait.Hide();
                    waitcount--;
                    Wait.Show("正在选房中," + waitcount);
                } 
            }, 1000);
            
        }
        //选房失败
        else if (json.ret == 1) {
            OpenDlg("alertbox.html?type=hx&msg=" + escape("<p>" + getMultiResult(json.info) + "</p>"), 270, 380, "");
            resetBuy(roomid);
            return;
        }
        //选房成功
        else {
            window.location.href = "djpay.html?roomid=" + escape(roomid) + "&type=" + escape(json.ret);
        }
    }, Math.random() * 500);
}

function resetBuy(roomid) {
    var d = new Date().toLocaleTimeString();
    if (localStorage.getItem("isonlinepay") == "1") {
        document.getElementById("divButton").textContent = GetLangValue("确认锁定房源");
    }
    else {
        document.getElementById("divButton").textContent = GetLangValue("确 定");
    }
    document.getElementById('divButton').removeAttribute('disabled');
    Wait.Hide();
}

var timerpay_count;
function initDjPay() {
    //内容处理
    document.title = GetLangValue("碧桂园微信选房");
    document.getElementById("spanBack").textContent = GetLangValue("返回");
    document.getElementById("lblTitle").innerHTML = GetLangValue("碧桂园微信选房");
    var fhybtnHeight = 0;

    var type = Request("type");
    var roomid = Request("roomid");
    var btn = '';
    if (type == 3) {
        var url = "AJAX/GetSuccessMsg.ashx?roomid=" + escape(roomid);
        var json = ajax(url);
        document.getElementById("divInfo").innerHTML = getMultiResult(json.info);
        document.getElementById("divButton").textContent = GetLangValue("确 定");
        document.getElementById("divButton").setAttribute("onclick", "goToDetail(\'" + roomid + "\')");

        var fhyUrl = "AJAX/CheckFHYRGSet.ashx?roomid=" + escape(roomid);
        var json = ajax(fhyUrl);
        if (json.info != "") {
            document.getElementById("divGotoFHYRG").textContent = GetLangValue("前往完成认购");
            document.getElementById("divGotoFHYRG").setAttribute("onclick", "goToFHY(\'" + json.info + "\')");
            fhybtnHeight = 50;
            document.getElementById("divGotoFHYRG").setAttribute("style", "display:block");
        }
        else {
            document.getElementById("divGotoFHYRG").setAttribute("style", "display:none");
        }
        
    }
    else {
        var url = "AJAX/GetDjPayInfo.ashx?roomid=" + escape(roomid);
        var json = ajax(url);
        if (!json) { Wait.Hide(); return; }
        if (json.ret == 1) {
            document.getElementById("divInfo").innerHTML = json.info;
            document.getElementById("divButton").textContent = GetLangValue("返回");
            document.getElementById("divButton").setAttribute("onclick", "history.back()");
        }
        else if (json.ret == 3) {
            document.getElementById("divInfo").innerHTML = json.payinfo;
            if (json.code == 1) {
                document.getElementById("divButton").textContent = GetLangValue("已支付，点击返回");
                document.getElementById("divButton").setAttribute("onclick", "goToDetail(\'" + roomid + "\')");
            }
            else {
                document.getElementById("divButton").textContent = GetLangValue("支付定金");
                document.getElementById("divButton").setAttribute("onclick", "bankclick(\'" + json.ourl + "\',\'" + roomid + "\')");
                countdate = json.time;
                timerpay_count = setInterval("timerpay()", 1000);
            }

        }
        else {
            document.getElementById("divInfo").innerHTML = json.payinfo;
            if (json.code == 1) {
                document.getElementById("divButton").textContent = GetLangValue("支付定金"); 
                document.getElementById("divButton").setAttribute("onclick", "window.location.href=\'" + json.ourl + "\'");
                countdate = json.time;
                timerpay_count = setInterval("timerpay()", 1000);
            }
            else {
                document.getElementById("divButton").textContent = json.msg;
            }
        }
    }
    var btnHeight = document.getElementById("divButton").clientHeight;
    var titleHeight = document.getElementById("divTitle").clientHeight;
    screenFix("height", "divMain", btnHeight + titleHeight + 10 + fhybtnHeight);
}
function bankclick(url, roomid) {

    Wait.Show(GetLangValue('拼命加载中...'));
    document.getElementById('divButton').innerText = GetLangValue("正在支付中...");
    document.getElementById('divButton').setAttribute('disabled', 'disabled');

    ajax(url, function (o) {
        Wait.Hide();
        var json = JSON.parse(o.data);
        if (!json) {  return; }
        if (json.ret == 1) {
            OpenDlg("alertbox.html?msg=" + escape("<p>" + getMultiResult(json.info) + "</p>"), 270, 340, "");
            document.getElementById('divButton').innerText = GetLangValue("支付定金");
            document.getElementById('divButton').removeAttribute('disabled');
        }
        else {
            clearInterval(timerpay_count);
            var url = "AJAX/GetSuccessMsg.ashx?roomid=" + escape(roomid);
            var json = ajax(url);
            document.getElementById("divInfo").innerHTML = getMultiResult(json.info);
            document.getElementById("divButton").textContent = GetLangValue("确 定");
            document.getElementById("divButton").setAttribute("onclick", "goToDetail(\'" + roomid + "\')");
        }
    });
    

}

//凤凰云小程序跳转处理 by 张茗权 2020.05.15
function goToFHY(url) {
    wx.miniProgram.navigateTo({
        url: url
    });
}

function gotopay() {
    var roomid = Request("roomid");
    window.location.href = "djpay.html?roomid=" + escape(roomid) + "&type=2";
}

var countdate;
function timerpay() {
    var ts = 60 * 60 - countdate;//计算剩余的毫秒数
    var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
    var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
    var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
    var ss = parseInt(ts % 60, 10);//计算剩余的秒数
    if (ts <= 0) {
        clearInterval(timerpay_count);
        document.getElementById("divCount").innerHTML = "<span style='color:red;'>支付剩余时间：00:00</span>";
        if (localStorage.getItem("isoverpay") == 0) {
            document.getElementById("divButton").textContent = "支付超时";
            document.getElementById("divButton").setAttribute("onclick", "alert('已超出支付时间，请联系您的销售顾问');");
            document.getElementById("lblMsg").textContent = "如需继续支付，请联系您的销售顾问";
        }
        return;
    }
    dd = checkTime(dd);
    hh = checkTime(hh);
    mm = checkTime(mm);
    ss = checkTime(ss);
    document.getElementById("divCount").innerHTML = "支付剩余时间：" + "<span style='color:red;'>" + mm + "</span>:<span style='color:red;'>" +
        ss + "</span>";

    countdate++;
}

function initAutoReg() {
    //判断当前用户是否有筹号
    Wait.Show(GetLangValue("拼命加载中..."), true);
    var url = "AJAX/AutoReg.ashx?faid=" + Request("faid")
        + "&appid=" + Request("appid")
        + "&appopenid=" + Request("appopenid")
        + "&ctime=" + Request("ctime")
        + "&sysflag=" + Request("sysflag")
        + "&pwd=" + Request("pwd")
        
        ;
    var json = ajax(url);
    if (!json) { Wait.Hide(); return; }
    //无筹号
    if (json.ret == "1") {
        Wait.Show(GetLangValue("拼命加载中..."), true);
        OpenDlg("alertbox.html?msg=" + escape("<p>" + GetLangValue(json.info) + "</p>"), 270, 320, "");
    }
    else {
        var sb = '';
        for (var i = 0; i < json.info.length; i++) {
            sb += "<div style='width: 100%;color: #808080;margin-bottom:5px;background-color:#ffffff;' onclick=\"goToSelfQuery('" + json.info[i].faid + "','" + json.info[i].queueno + "','fhy')\">";
            sb += "<table class='tblcollectinfo'>";
            sb += '<tr><td colspan="2">' + json.info[i].areaname + '</td></tr>';
            sb += '<tr><td width="50%">' + json.info[i].cstname + '</td><td>' + json.info[i].csthandtel + '</td></tr>';
            sb += '<tr><td width="50%">' + json.info[i].faid + '</td><td>' + json.info[i].queueno + '</td></tr>';
            sb += '</table>';
            sb += '</div>';
        }
        document.getElementById("divQueueno").innerHTML = getMultiResult(sb);
    }
}
