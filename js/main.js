/**
 * Video工厂模式的构造函数
 * @param _id
 * @returns {{}}
 * @constructor
 */

function Video (_id)
{
  var o = {};
  o.danmukuQueue = []; //弹幕队列
  o.storage = []; //存储池
  o.id = _id; //保存播放器的ID
  o.volume = 1.0; //保存音量，默认满音量
  o.fullScreen = 0; //全屏标记 0窗口 1全屏
  o.showDanmukuPanel = 0; //显示弹幕控制面板
  o.showDanmuku = 1; //显示弹幕，默认
  o.danmukuPos = "1"; //1:滚动 2:顶部 3:底部
  o.danmukuSpeed = 200;// 默认:200px/s 慢:100px/s 快:400px/s biu:800px/s
  o.danmukuColor = "white"; // 默认white red lime blue yellow fuchsia aqua black hotpink
  o.timingFlag = ""; //计时器
  o.topIndex = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  //[顶部弹幕]的标记
  o.bottomIndex = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //底部弹幕的标记
  o.scrollIndex = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //滚动弹幕的标记

  //*********************DOM对象部分******************************************
  o.playerWhole = playerListOri[o.id].getElementsByClassName("main-player-zone")[0]; //播放器整体
  o.controlBar = playerListOri[o.id].getElementsByClassName("main-control-bar")[0]; //控制条
  o.danmukuBar = playerListOri[o.id].getElementsByClassName("main-danmuku-panel")[0]; //弹幕条
  o.danmukuPanel = playerListOri[o.id].getElementsByClassName("main-danmuku-setting")[0]; //弹幕面板
  o.playBtn = playerListOri[o.id].getElementsByClassName("main-play-status")[0];  //播放按钮
  o.video = playerListOri[o.id].getElementsByTagName("video")[0]; //视频对象
  o.progressBarOuter = playerListOri[o.id].getElementsByClassName("main-progress")[0]; //进度条外围，可点击控制
  o.progressBarInner = playerListOri[o.id].getElementsByClassName("main-progress-inner")[0]; //进度条内部条，随进度变化
  o.volumeBtn = playerListOri[o.id].getElementsByClassName("main-control-vol-img")[0]; //音量按钮，点击切换静音
  o.volumeDropOuter = playerListOri[o.id].getElementsByClassName("main-control-vol-outer")[0];
  o.volumeDropInner = playerListOri[o.id].getElementsByClassName("main-control-vol-inner")[0];
  o.danmukuBtn = playerListOri[o.id].getElementsByClassName("main-control-danmuku-switch")[0]; //弹幕开关
  o.fullScreenBtn = playerListOri[o.id].getElementsByClassName("main-control-full-screen")[0]; //全屏开关，同时会暂停其他视频播放
  o.danmukuPanelBtn = playerListOri[o.id].getElementsByClassName("main-danmuku-control-btn")[0]; //弹幕面板开关
  o.danmukuBiuBtn = playerListOri[o.id].getElementsByClassName("main-danmuku-biu-btn")[0]; //弹幕发射按钮
  o.danmukuInput = playerListOri[o.id].getElementsByClassName("main-danmuku-input-bar")[0]; //弹幕输入框
  o.danmuku = playerListOri[o.id].getElementsByClassName("main-zone-danmuku")[0]; //弹幕区域
  o.timeCount = playerListOri[o.id].getElementsByClassName("main-time-counter")[0]; //时间标记
  o.playerIDBlock = playerListOri[o.id].getElementsByClassName("player-ID")[0]; //ID方块
  //*************************************************************************

  /**
   * 发送弹幕
   * @param obj 格式化好的json对象
   */
  o.insertDanmuku = function insertDanmuku (obj)
  {
    o.danmukuQueue.push(obj);
    o.danmukuQueue.sort(function (a, b)
    {
      return a.time - b.time;
    });
  };
  /**
   * 从localstorage读取本地数据
   */
  o.loadStorage = function ()
  {
    var name = "danmukuPool_" + o.id;
    if (!window.localStorage.getItem(name))
    {
      var obj = {
        "pos": "2",
        "col": "white",
        "spd": 200,
        "ctx": o.id + " 这是自动初始化的弹幕",
        "time": 0
      };
      o.storage.push(obj);
      localStorage.setItem(name, JSON.stringify(o.storage));
      o.danmukuQueue.push(obj);
    }
    else
    {
      o.storage = JSON.parse(localStorage.getItem(name));
      for (var ele in o.storage)
      {
        if (o.storage.hasOwnProperty(ele))
        {
          o.insertDanmuku(o.storage[ele]);
        }
      }
    }
  };

  /**
   * 绑定按键->弹幕位置
   */
  o.bindDanmukuPanelPosition = function ()
  {
    var positionList = playerListOri[o.id].getElementsByClassName("main-danmuku-position")[0].getElementsByTagName("div");
    for (var listBtn in positionList)
    {
      if (positionList.hasOwnProperty(listBtn))
      {
        positionList[listBtn].addEventListener("click", function (e)
        {
          o.danmukuPos = e.target.dataset.pos;
          e.target.classList.add("danmuku-positon-select");
          var sblArr = o.sibilings(e.target);
          for (var sbl in sblArr)
          {
            if (sblArr.hasOwnProperty(sbl))
            {
              sblArr[sbl].classList.remove("danmuku-positon-select");
            }
          }
        });
      }
    }
  };

  /**
   * 绑定按键->弹幕颜色
   */

  o.bindDanmukuPanelColor = function ()
  {
    var colorList = playerListOri[o.id].getElementsByClassName("main-danmuku-color")[0].getElementsByTagName("span");
    for (var listBtn in colorList)
    {
      if (colorList.hasOwnProperty(listBtn))
      {
        colorList[listBtn].addEventListener("click", function (e)
        {
          o.danmukuColor = e.target.dataset.col;
          e.target.classList.add("danmuku-color-select");
          var sblArr = o.sibilings(e.target);
          for (var sbl in sblArr)
          {
            if (sblArr.hasOwnProperty(sbl))
            {
              sblArr[sbl].classList.remove("danmuku-color-select");
            }
          }
        });
      }
    }
  };

  /**
   * 绑定按键->弹幕速度
   */

  o.bindDanmukuPanelSpeed = function ()
  {
    var speedList = playerListOri[o.id].getElementsByClassName("main-danmuku-speed")[0].getElementsByTagName("div");
    for (var listBtn in speedList)
    {
      if (speedList.hasOwnProperty(listBtn))
      {
        speedList[listBtn].addEventListener("click", function (e)
        {
          o.danmukuSpeed = parseInt(e.target.dataset.spd);
          e.target.classList.add("danmuku-speed-select");
          var sblArr = o.sibilings(e.target);
          for (var sbl in sblArr)
          {
            if (sblArr.hasOwnProperty(sbl))
            {
              sblArr[sbl].classList.remove("danmuku-speed-select");
            }
          }
        });
      }
    }
  };

  /**
   * 通过计时器刷新弹幕，获取需要发送的弹幕
   * @param T 当前时间
   */

  o.danmukuFresh = function (T)
  {
    while (o.danmukuQueue.length)
    {
      if (o.danmukuQueue[0].time > T)
      {
        break;
      }
      else
      {
        o.formatShoot(o.danmukuQueue[0]);
        o.danmukuQueue.shift();
      }
    }
  };

  /**
   * 立刻发送弹幕
   * @param obj 表示弹幕信息的json对象
   */

  o.formatShoot = function formatShoot (obj)
  {
    var fly = document.createElement("div");
    fly.appendChild(document.createTextNode(obj.ctx));
    fly.style.color = obj.col;

    switch (obj.pos)
    {
      case "1":
      {
        var sdest = 0;
        for (var k = 0; k <= 19; k++)
        {
          if (o.scrollIndex[k] < o.scrollIndex[sdest])
          {
            sdest = k;
          }
        }
        o.scrollIndex[sdest]++;
        o.danmuku.appendChild(fly);
        fly.style.display = "block";
        fly.style.top = sdest * 30 + "px";
        fly.style.right = "-" + fly.offsetWidth + "px";
        var flyTime = (o.danmuku.offsetWidth + fly.offsetWidth) / obj.spd;
        fly.style.transitionDuration = flyTime + "s";
        fly.style.transform = "translateX(-" + (o.danmuku.offsetWidth + fly.offsetWidth) + "px)";
        setTimeout(function ()
        {
          o.scrollIndex[sdest]--;
        }, fly.offsetWidth * 1000 / obj.spd);
        setTimeout(function ()
        {
          o.danmuku.removeChild(fly);
        }, flyTime * 1000);
        break;
      }
      case "2":
      {
        var dest = 0;
        for (var i = 0; i <= 19; i++)
        {
          if (o.topIndex[i] < o.topIndex[dest])
          {
            dest = i;
          }
        }
        o.topIndex[dest]++;
        fly.style.top = dest * 30 + "px";
        o.danmuku.appendChild(fly);
        fly.style.display = "block";
        fly.style.left = (o.danmuku.offsetWidth - fly.offsetWidth) / 2 + "px";
        setTimeout(function ()
        {
          o.topIndex[dest]--;
          o.danmuku.removeChild(fly);
        }, 5000);
        break;
      }
      case "3":
      {
        var ddest = 0;
        for (var j = 0; j <= 19; j++)
        {
          if (o.bottomIndex[j] < o.bottomIndex[ddest])
          {
            ddest = j;
          }
        }
        o.bottomIndex[ddest]++;
        fly.style.bottom = ddest * 30 + "px";
        o.danmuku.appendChild(fly);
        fly.style.display = "block";
        fly.style.left = (o.danmuku.offsetWidth - fly.offsetWidth) / 2 + "px";
        setTimeout(function ()
        {
          o.bottomIndex[ddest]--;
          o.danmuku.removeChild(fly);
        }, 5000);
        break;
      }
    }
  };

  /**
   * 绑定按键->发送
   */

  o.shootDanmuku = function ()
  {
    var txt = o.danmukuInput.value;
    if (txt.length)
    {
      o.danmukuInput.value = "";
      var obj = {
        "pos": o.danmukuPos,
        "col": o.danmukuColor,
        "spd": o.danmukuSpeed,
        "ctx": txt,
        "time": parseFloat(o.video.currentTime.toFixed(1))
      };
      var name = "danmukuPool_" + o.id;
      o.storage.push(obj);
      localStorage.setItem(name, JSON.stringify(o.storage));
      o.insertDanmuku(obj);
    }
  };

  /**
   *  绑定按键->打开弹幕设置面板
   */

  o.toggleDanmukuPanel = function ()
  {
    if (!o.showDanmukuPanel)
    {
      o.danmukuPanel.style.display = "block";
      o.danmukuPanelBtn.getElementsByTagName("img")[0].setAttribute("src", "images/panel_off.png");
    }
    else
    {
      o.danmukuPanel.style.display = "none";
      o.danmukuPanelBtn.getElementsByTagName("img")[0].setAttribute("src", "images/panel_on.png");
    }
    o.showDanmukuPanel = !o.showDanmukuPanel;
  };

  /**
   * 在点击进度条跳转之后重新载入弹幕池
   */

  o.seekQueue = function ()
  {
    o.danmukuQueue = [];
    for (var ele in o.storage)
    {
      if (o.storage.hasOwnProperty(ele))
      {
        if (o.storage[ele].time >= o.video.currentTime)
        {
          o.insertDanmuku(o.storage[ele]);
        }
      }
    }
  };

  /**
   *  按键绑定->打开/关闭弹幕
   */

  o.toggleDanmuku = function ()
  {
    if (o.showDanmuku)
    {
      o.danmuku.style.display = "none";
      o.danmukuBtn.getElementsByTagName("img")[0].setAttribute("src", "images/no_danmu.png");
    }
    else
    {
      o.danmuku.style.display = "block";
      o.danmukuBtn.getElementsByTagName("img")[0].setAttribute("src", "images/danmu.png");
    }
    o.showDanmuku = !o.showDanmuku;
  };

  /**
   * 事件绑定->视频播放结束
   */

  o.videoEnd = function ()
  {
    o.videoPause();
    o.video.currentTime = 0;
    o.progressBarInner.style.width = "0";
    o.updateProgressBar();
  };

  /**
   * 事件绑定->切换全屏导致按钮图标的变化
   */

  o.toggleFullScreenIcon = function ()
  {
    if (document.webkitIsFullScreen)
    {
      o.fullScreen = 1;
      o.fullScreenBtn.getElementsByTagName("img")[0].setAttribute("src", "images/no_full.png");
    }
    else
    {
      o.fullScreen = 0;
      o.fullScreenBtn.getElementsByTagName("img")[0].setAttribute("src", "images/full.png");
    }
  };

  /**
   * 按键绑定->切换全屏
   */

  o.toggleFullScreen = function ()
  {
    if (!o.fullScreen)
    {
      o.playerWhole.webkitRequestFullScreen();
    }
    else
    {
      document.webkitCancelFullScreen();
    }
  };

  /**
   * 按键绑定->设置音量
   * @param e 鼠标点击的位置
   */

  o.setVolume = function (e)
  {
    var length = o.getTop(o.volumeDropOuter) + o.volumeDropOuter.offsetHeight - e.pageY;
    var per = length / o.volumeDropOuter.offsetHeight;
    o.volumeDropInner.style.height = o.volumeDropOuter.offsetHeight * per + "px";
    o.volume = per;
    o.video.volume = o.volume;

    if (o.volume >= 0.5)
    {
      o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/v_up.png");
    }
    else if (o.volume >= 0.0)
    {
      o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/v_down.png");
    }
    else
    {
      o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/mute.png");
    }

  };

  /**
   * 按键绑定->静音
   */

  o.videoMute = function ()
  {
    if (o.video.volume !== 0.0) //应当被静音
    {
      o.volume = o.video.volume;
      o.video.volume = 0.0;
      o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/mute.png");
      o.volumeDropInner.style.height = "0";
    }
    else //恢复音量
    {
      o.video.volume = o.volume;
      o.volumeDropInner.style.height = o.volumeDropOuter.offsetHeight * o.volume + "px";
      if (o.volume >= 0.5)
      {
        o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/v_up.png");
      }
      else
      {
        o.volumeBtn.getElementsByTagName("img")[0].setAttribute("src", "images/v_down.png");
      }
    }
  };

  /**
   * 按键绑定->进度条跳转
   * @param e 鼠标点击的位置
   */

  o.videoSeek = function (e)
  {
    clearInterval(o.timingFlag);
    var length = e.pageX - o.getLeft(o.progressBarOuter);
    var per = length / o.progressBarOuter.offsetWidth;
    o.progressBarInner.style.width = o.progressBarOuter.offsetWidth * per + "px";
    o.video.currentTime = o.video.duration * per;
    o.seekQueue();
    if (!o.video.ended && !o.video.paused)
    {
      o.timingFlag = setInterval(o.updateProgressBar, 50);
    }

  };

  /**
   * 数字补齐为两位
   * @param val 待转换的数字
   * @returns {string} 字符串结果
   */

  o.toTwo = function (val)
  {
    return (val < 0) ? "00" : (val < 10 ? ("0" + parseInt(val).toString()) : (parseInt(val).toString()));
  };

  /**
   *  初始化时间戳
   */

  o.initDuration = function ()
  {
    var fullMin = o.toTwo(o.video.duration / 60);
    var fullSec = o.toTwo(o.video.duration - fullMin * 60);
    o.timeCount.innerHTML = "00:00/" + fullMin + ":" + fullSec;
  };

  /**
   *  更新进度条及时间戳
   */

  o.updateProgressBar = function updateProgressBar ()
  {
    var per = o.video.currentTime / o.video.duration;
    o.progressBarInner.style.width = o.progressBarOuter.offsetWidth * per + "px";
    var curMin = o.toTwo(o.video.currentTime / 60);
    var curSec = o.toTwo(o.video.currentTime - 60 * curMin);
    var fullMin = o.toTwo(o.video.duration / 60);
    var fullSec = o.toTwo(o.video.duration - fullMin * 60);
    o.timeCount.innerHTML = curMin + ":" + curSec + "/" + fullMin + ":" + fullSec;
    o.danmukuFresh(o.video.currentTime.toFixed(1));
  };

  /**
   * 视频播放
   */
  o.videoPlay = function videoPlay ()
  {
    o.video.play();
    o.timingFlag = setInterval(o.updateProgressBar, 50);
    o.playBtn.getElementsByTagName("img")[0].setAttribute("src", "images/pause.png");
  };

  /**
   * 视频暂停
   */
  o.videoPause = function ()
  {
    o.video.pause();
    clearInterval(o.timingFlag);
    o.playBtn.getElementsByTagName("img")[0].setAttribute("src", "images/play.png");
  };

  /**
   * 切换视频播放/暂停
   */
  o.togglePlay = function ()
  {
    if (o.video.paused || o.video.ended)
    {
      if (o.video.ended)
      {
        o.video.currentTime = 0;
      }
      o.videoPlay();
    }
    else
    {
      o.videoPause();
    }
  };

  /**
   * 点击ID方块后更换样式
   */
  o.freshIDBlock = function ()
  {
    for (var ele in playerListOri)
    {
      if (playerListOri.hasOwnProperty(ele))
      {
        var code = parseInt(playerListOri[ele].getElementsByClassName("player-ID")[0].innerHTML);
        if (code !== o.id)
        {
          playerListOri[ele].getElementsByClassName("player-ID")[0].classList.remove("player-select");
        }
        else
        {
          playerListOri[ele].getElementsByClassName("player-ID")[0].classList.add("player-select");
          side.sideBarUpdate(o.id);
        }
      }
    }
    side.updateMiniVisble();
  };

  /**
   * 获得到元素距离屏幕左边的精确值
   * @param e 待处理对象
   * @returns {number} 到左边的距离
   */
  o.getLeft = function (e)
  {
    var actLeft = e.offsetLeft;
    var current = e.offsetParent;
    while (current !== null)
    {
      actLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    return actLeft;
  };

  /**
   * 获得到元素距离屏幕上边的精确值
   * @param e 待处理对象
   * @returns {number} 到顶端的距离
   */
  o.getTop = function (e)
  {
    var actTop = e.offsetTop;
    var current = e.offsetParent;
    while (current !== null)
    {
      actTop += current.offsetTop;
      current = current.offsetParent;
    }
    return actTop;
  };

  /**
   * 返回el的所有同胞[轮子]
   * @param el 节点
   * @returns {Array} 节点的所有同胞
   */
  o.sibilings = function (el)
  {
    var a = [];
    var p = el.previousSibling;
    while (p)
    {
      if (p.nodeType === 1)
      {
        a.push(p);
      }
      p = p.previousSibling;
    }
    a.reverse();
    var n = el.nextSibling;
    while (n)
    {
      if (n.nodeType === 1)
      {
        a.push(n);
      }
      n = n.nextSibling;
    }
    return a;
  };

  /**
   * 播放器对象，各种绑定及初始化操作
   * @type {{init: init, bindBtns: bindBtns}}
   */
  o.player =
    {
      init: function ()
      {
        o.video.removeAttribute("controls");
        o.loadStorage();
        //video.addEventListener("canplaythrough", player.bindBtns);
        o.video.oncanplaythrough = o.player.bindBtns();
        o.video.addEventListener("ended", o.videoEnd);
      },
      bindBtns: function ()
      {
        o.initDuration();
        o.playBtn.addEventListener("click", o.togglePlay); //点击按钮播放/暂停
        o.video.addEventListener("click", o.togglePlay);
        o.danmuku.addEventListener("click", o.togglePlay);
        o.progressBarOuter.addEventListener("click", o.videoSeek); //点击进度条跳转，传递参数e
        o.volumeBtn.addEventListener("click", o.videoMute);
        o.volumeDropOuter.addEventListener("click", o.setVolume); //点击竖直音量条调整音量，传递参数e
        o.danmukuBtn.addEventListener("click", o.toggleDanmuku);
        o.fullScreenBtn.addEventListener("click", o.toggleFullScreen);
        o.playerWhole.addEventListener("webkitfullscreenchange", o.toggleFullScreenIcon);
        o.danmukuBiuBtn.addEventListener("click", o.shootDanmuku);
        o.danmukuPanelBtn.addEventListener("click", o.toggleDanmukuPanel);
        o.playerIDBlock.addEventListener("click", o.freshIDBlock);
        o.bindDanmukuPanelPosition();
        o.bindDanmukuPanelColor();
        o.bindDanmukuPanelSpeed();
      }
    };
  o.player.init();

  return o;
}

/**
 * 初始化所有播放器
 */
function playerInitAll ()
{
  window.playerList = [];  //全局变量，用于保存实例对象
  window.playerListOri = document.getElementsByClassName("player");  //全局变量，用于保存原型 //保存原型到数组

  if (!playerListOri.length)
  {
    console.log("Error: No player find, module exit!");
    return;
  }
  //检测播放器数量
  console.log("player(s) find : " + playerListOri.length);
  for (var i = 0; i < playerListOri.length; ++i)
  {
    //设置ID方块
    var idCard = playerListOri[i].getElementsByClassName("player-ID")[0];
    idCard.innerHTML = (i + 1).toString();
    var videoElement = Video(i);
    playerList.push(videoElement);
  }
  side.playerCount = playerListOri.length;
  side.sideBarUpdate(0);
  side.updateMiniVisble();

}

/**
 * 构造生成迷你播放器+状态栏对象
 * @returns {{}}
 * @constructor
 */
function SidePart ()
{
  var o = {};
  o.playerCount = 0;
  o.activeMiniID = 0;
  o.isPlaying = 0;

  /**
   * 迷你播放器初始化
   */
  o.miniPlayerInit = function ()
  {
    var miniBar = document.getElementById("mini-bar");
    var miniAll = document.getElementById("mini-player");
    o.startDrag(miniBar, miniAll); //绑定拖拽
    window.addEventListener("scroll", o.updateMiniVisble);
    var video = miniAll.getElementsByTagName("video")[0];
    video.addEventListener("click", toggleMini);

    function toggleMini ()
    {
      if (!o.isPlaying)
      {
        if (video.ended)
        {
          video.duration = 0;
        }
        video.play();
        o.isPlaying = 1;
      }
      else
      {
        video.pause();
        o.isPlaying = 0;
      }
    }
  };

  /**
   * 刷新迷你播放器的可见性
   */
  o.updateMiniVisble = function ()
  {
    var miniAll = document.getElementById("mini-player");
    var actTop = playerListOri[o.activeMiniID].offsetTop - document.body.scrollTop;
    if (actTop <= 0)
    {
      if ((-1) * actTop >= playerListOri[o.activeMiniID].offsetHeight)
      {
        miniAll.style.display = "block";
        if (!o.isPlaying)
        {
          if (!playerList[o.activeMiniID].video.paused && !playerList[o.activeMiniID].video.ended)
          {
            o.isPlaying = 1;
            o.receive();
          }

        }
      }
      else
      {
        if (miniAll.style.display !== "none")
        {
          miniAll.style.display = "none";
          if (playerList[o.activeMiniID].video.paused || playerList[o.activeMiniID].video.ended) //如果本来就在播放，不用传递
          {
            o.drawBack();
          }
        }
      }
    }
    else
    {
      if (actTop >= playerListOri[o.activeMiniID].offsetHeight)
      {
        miniAll.style.display = "block";
        if (!o.isPlaying)
        {
          if (!playerList[o.activeMiniID].video.paused && !playerList[o.activeMiniID].video.ended)
          {
            o.isPlaying = 1;
            o.receive();
          }
        }
      }
      else
      {
        if (miniAll.style.display !== "none")
        {
          miniAll.style.display = "none";
          if (playerList[o.activeMiniID].video.paused || playerList[o.activeMiniID].video.ended) //如果本来就在播放，不用传递
          {
            o.drawBack();
          }
        }
      }
    }
  };

  /**
   * 隐藏迷你播放器后的回调
   */
  o.drawBack = function ()
  {
    var miniAll = document.getElementById("mini-player");
    var video = miniAll.getElementsByTagName("video")[0];
    var videoOri = playerList[o.activeMiniID].video;
    videoOri.currentTime = video.currentTime;
    if (o.isPlaying)
    {
      video.pause();
      playerList[o.activeMiniID].videoPlay();
    }
    o.isPlaying = 0;
  };

  /**
   * 显示迷你播放器后的回调
   */
  o.receive = function ()  //receive 是导致迷你播放器开始播放的函数，如果迷你播放器本身就在播放，直接返回
  {
    var miniAll = document.getElementById("mini-player");
    var video = miniAll.getElementsByTagName("video")[0];
    var videoOri = playerList[o.activeMiniID].video;
    video.currentTime = videoOri.currentTime;
    if (!videoOri.paused && !videoOri.ended)
    {
      playerList[o.activeMiniID].videoPause();
      video.play();
    }
  };

  window.params = {
    left: 0,
    top: 0,
    currentX: 0,
    currentY: 0,
    flag: false
  };
  /**
   * 得到对象o的[key]CSS
   * @param o  对象
   * @param key CSS名
   * @returns {string} 返回属性
   */
  o.getCss = function (o, key)
  {
    return document.defaultView.getComputedStyle(o)[key];
  };

  /**
   * 拖拽绑定
   * @param bar 引起拖拽的元素
   * @param target 导致移动的元素
   */
  o.startDrag = function (bar, target)
  {
    if (o.getCss(target, "left") !== "auto")
    {
      params.left = o.getCss(target, "left");
    }
    if (o.getCss(target, "top") !== "auto")
    {
      params.top = o.getCss(target, "top");
    }
    //o是移动对象
    bar.onmousedown = function (event)
    {
      params.flag = true;
      if (!event)
      {
        event = window.event;
        //防止IE文字选中
        bar.onselectstart = function ()
        {
          return false;
        };
      }
      var e = event;
      params.currentX = e.clientX;
      params.currentY = e.clientY;
    };
    document.onmouseup = function ()
    {
      params.flag = false;
      if (o.getCss(target, "left") !== "auto")
      {
        params.left = o.getCss(target, "left");
      }
      if (o.getCss(target, "top") !== "auto")
      {
        params.top = o.getCss(target, "top");
      }
    };
    document.onmousemove = function (event)
    {
      var e = event ? event : window.event;
      if (params.flag)
      {
        var nowX = e.clientX, nowY = e.clientY;
        var disX = nowX - params.currentX, disY = nowY - params.currentY;
        target.style.left = parseInt(params.left.toString()) + disX + "px";
        target.style.top = parseInt(params.top.toString()) + disY + "px";
        if (event.preventDefault)
        {
          event.preventDefault();
        }
        return false;
      }
    };
  };

  /**
   * 更新状态栏
   * @param id 播放器ID
   */
  o.sideBarUpdate = function (id)
  {
    o.activeMiniID = id;
    console.log(
      "update status bar : " +
      o.playerCount + " " +
      o.activeMiniID);
    document.getElementById("status-player-count").innerHTML = o.playerCount.toString();
    document.getElementById("status-mini-ID").innerHTML = o.activeMiniID.toString();
    var mini = document.getElementById("mini-player");
    mini.getElementsByTagName("video")[0].setAttribute("src", "images/video/" + (id + 1) + ".mp4");
    mini.getElementsByTagName("span")[0].innerHTML = id + 1;
    o.isPlaying = 0;
  };
  return o;
}

/**
 * 主调函数
 */
window.onload = function ()
{
  window.side = new SidePart();
  side.miniPlayerInit();
  playerInitAll();
};