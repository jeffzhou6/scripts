const $ = new Env('茅台100ml库存监控')

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

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  locationList.map(item => {
      await getStockInfo(item)
  })
})()
.catch((e) => {
    $.log(`❌ ${$.name}, 失败! 原因: ${e}!`)
})
.finally(() => {
    $.done()
})


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
  return new Promise((resolve, reject) => {
    $.post(myRequest, (err, resp, data) => {
        $.log("err", JSON.stringify(err))
        $.log("resp", JSON.stringify(resp))
        $.log("data", JSON.stringify(data))
        resolve(data)
    })
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}