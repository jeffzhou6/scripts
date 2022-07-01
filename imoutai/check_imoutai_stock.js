/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */

 const $ = API("[i茅台] 库存监控", true)

 const locationList = [
   {
     name: "情侣路",
     shopId: "144440424002",
   },
   {
     name: "横琴路",
     shopId: "144440400007",
   },
   {
     name: "白蕉路",
     shopId: "144440400004",
   },
   {
     name: "翠微路",
     shopId: "144440400005",
   },
   {
     name: "仙桥路",
     shopId: "144440400006",
   }
]

function getStockInfo(shopInfo){
    const url = `https://h5.moutai519.com.cn/xhr/front/mall/item/purchaseInfo`;
    const method = `POST`;
    const headers = {
    'X-Requested-With' : `XMLHttpRequest`,
    'x-csrf-token' : ``,
    'Connection' : `keep-alive`,
    'Accept-Encoding' : `gzip, deflate, br`,
    'MT-BIZID' : `mt.shop.app.sale`,
    'Content-Type' : `application/json`,
    'Origin' : `https://fe.moutai519.com.cn`,
    'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 moutaiapp/1.2.3 device-id/2c767877412325bb20c8621da60666d6`,
    'Cookie' : `MT-Device-ID-Wap=D3C6F7D3-ED4B-414B-9383-6A1A7573795A; MT-Token-Wap=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtdCIsImV4cCI6MTY1OTI0MjcxMCwidXNlcklkIjoxMDg2ODUzMzQ4LCJkZXZpY2VJZCI6IkQzQzZGN0QzLUVENEItNDE0Qi05MzgzLTZBMUE3NTczNzk1QSIsImlhdCI6MTY1NjY1MDcxMH0.-_IJaBbfzIj3QfmgtZjb581KDp-9iW3sWZMxNRi0010`,
    'Host' : `h5.moutai519.com.cn`,
    'Referer' : `https://fe.moutai519.com.cn/mt-frontend/hxm/html/mt/item/detail/index.html?appConfig=2_1_2&id=10193`,
    'MT-APP-Version' : `1.2.3`,
    'Accept-Language' : `zh-cn`,
    'Accept' : `application/json, text/javascript, */*; q=0.01`
    };
    const body = `{"hot":true,"itemCode":"10193","province":"440000000","city":"440400000","district":"440402000","shopId":"${shopInfo.shopId}","jt":"anonymous"}`;

    const myRequest = {
        url: url,
        method: method,
        headers: headers,
        body: body
    };

    return new Promise((resolve) => {
        $task.fetch(myRequest).then(response => {
            const data = JSON.parse(response.body)
            if(data.data.purchaseInfo.inventory > 0){
                $.notify(
                    `${$.name} ${shopInfo.name} ⏰ 库存补货！`,
                );
            }
            resolve(response)
        });
    })
}


;(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  for(let i=0; i<locationList.length; i++){
      const item = locationList[i]
      await getStockInfo(item).then()

      $task.fetch({
        method: "GET",
        url: `https://api2.pushdeer.com/message/push?pushkey=PDU12785TStrw2b9cqjgesrwi5XPi6acmlzSBnHGQ&text=${item.name} 库存补货`
      }).then(_ => {
        $done();
      });
  }
})().then(() => {
    $.done()
}).catch(err => {
  $.error('', `🔔 ${$.name}, 异常!`, '')
  $.done()
}).finally(() => {
    $.done()
})


// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/