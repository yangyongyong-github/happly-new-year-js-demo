"use strict";

//设置页面的整体属性
var pageContainer = $(".page-container");

function toPage(index) {
  pageContainer.style.marginLeft = "-".concat(7.5 * index, "rem");
}

toPage(0); // 第一页

var page1 = {
  doms: {
    // 第1页涉及的dom元素
    txtAuthor: $("#txtAuthor"),
    // 作者文本框
    txtContent: $("#txtContent"),
    // 祝福内容文本框
    btnNext: $("#page1Next") // 下一步按钮

  },
  init: function init() {
    // 1. 解决 聚焦note区域的聚焦输入问题
    var initHeight = window.innerHeight; // 初始高度

    pageContainer.style.height = initHeight + "px"; // 让高度不要变化

    var contentIsFocus = false; // 祝福语区域是否是聚焦状态，初值不聚焦

    this.doms.txtContent.onfocus = function () {
      //this.doms.txtContent 聚焦时的状态函数
      contentIsFocus = true;
      resetMarginTop();
    };

    this.doms.txtContent.onblur = function () {
      //this.doms.txtContent 失去焦时的状态函数
      contentIsFocus = false;
    };

    function resetMarginTop() {
      if (window.innerHeight < initHeight - 100 && contentIsFocus) {
        //这里只针对note区域的限制性条件，不对author生效
        // 如果祝福内容聚焦，并且窗口变小
        pageContainer.style.marginTop = "-3rem";
      } else {
        pageContainer.style.marginTop = 0;
      }
    } // 监听窗口尺寸的变化


    window.addEventListener("resize", resetMarginTop); // 2. 点击下一页的按钮事件的前提（author和note区域有文字） -----------------------------------

    this.doms.btnNext.onclick = function () {
      //  if (this.doms.txtAuthor.value.trim()) {  ------- 不能使用this,【这里this为注册对象】，我们要的是【事件源】不知道时直接用其name
      if (!page1.doms.txtAuthor.value.trim()) {
        //trim() 去空格
        alert("请输入 作者");
        return;
      }

      if (!page1.doms.txtContent.innerText.trim()) {
        alert("请输入 祝福内容");
        return;
      }

      toPage(1);
    };
  }
};
page1.init(); // page2 ---------------------------------

var page2 = {
  // 第2页的相关dom
  doms: {
    btnPrev: $("#page2Prev"),
    // 上一步按钮
    btnNext: $("#page2Next"),
    // 下一步按钮
    audio: $("#audSound"),
    // 音频元素，用于播放录制的音频
    btnRecord: $("#btnRecord"),
    // 录制语音按钮
    btnPlay: $("#btnPlay"),
    // 播放/暂停语音按钮
    btnDelete: $("#btnDelete"),
    // 删除语音按钮
    desc: $(".page2 .banner p"),
    // 用于描述可录制时间的文本
    number: $(".page2 .number"),
    // 用于提示剩余时间的元素
    tape: $(".page2 .g-tape") // 磁带元素

  },

  /*
   * 用于描述当前的录音信息
   */
  sound: {
    /**
     * 录制状态，共4种：
        * no-voice: 没有录制声音
        * recording: 正在录制中
        * playing: 正在播放中
        * stop: 停止播放
     */
    status: "no-voice",
    maxSeconds: 60,
    // 最大可录制秒数
    remainSeconds: 0,
    // 剩余可录制秒数
    timer: null,
    // 用于屏幕上显示不断更新剩余秒数的计时器,用于显示 界面的弹出的大数字
    audioUrl: null // 录制完成后生成音频播放地址

  },
  render: function render() {
    // 根据当前的录音信息，设置界面
    // 该函数要根据 this.sound 中的信息，设置正确的界面
    // 预先设置好状态
    this.doms.desc.innerText = "\u4F60\u53EF\u4EE5\u5F55\u5236".concat(this.sound.maxSeconds, "\u79D2\u7684\u97F3\u9891"); // 设置提示文本

    this.doms.number.innerText = ""; // 设置剩余时间为不显示

    if (this.sound.status === "no-voice") {
      // 状态为：「没有录音」时的各种情况
      // 1. 磁带不再转动
      this.doms.tape.classList.remove("playing"); // 2. 录音按钮的文本为：「录制」

      this.doms.btnRecord.innerText = "录制"; // 3. 录音按钮的样式为：「普通」

      this.doms.btnRecord.className = "btn2"; // 4. 播放按钮的文本为：「播放」

      this.doms.btnPlay.innerText = "播放"; // 5. 播放按钮的样式为：「不可用」

      this.doms.btnPlay.className = "btn2 disabled"; // 6. 删除按钮的样式为：「不可用」

      this.doms.btnDelete.className = "btn2 disabled";
    } else if (this.sound.status === "recording") {
      // 状态为：「正在录音」
      // 1. 磁带转动
      this.doms.tape.classList.add("playing"); // 2. 录音按钮的文本为：「停止」

      this.doms.btnRecord.innerText = "停止"; // 3. 录音按钮的样式为：「按下」

      this.doms.btnRecord.className = "btn2 press"; // 4. 播放按钮的文本为：「播放」

      this.doms.btnPlay.innerText = "播放"; // 5. 播放按钮的样式为：「不可用」

      this.doms.btnPlay.className = "btn2 disabled"; // 6. 删除按钮的样式为：「不可用」

      this.doms.btnDelete.className = "btn2 disabled"; // 7. 如果剩余时间小于等于10秒，则需要显示

      if (this.sound.remainSeconds <= 10) {
        this.doms.number.innerText = this.sound.remainSeconds;
      }
    } else if (this.sound.status === "playing") {
      // 状态为：「正在播放」
      // 1. 磁带转动
      this.doms.tape.classList.add("playing"); // 2. 录音按钮的文本为：「重录」

      this.doms.btnRecord.innerText = "重录"; // 3. 录音按钮的样式为：「不可用」

      this.doms.btnRecord.className = "btn2 disabled"; // 4. 播放按钮的文本为：「停止」

      this.doms.btnPlay.innerText = "停止"; // 5. 播放按钮的样式为：「按下」

      this.doms.btnPlay.className = "btn2 press"; // 6. 删除按钮的样式为：「普通」

      this.doms.btnDelete.className = "btn2";
    } else if (this.sound.status === "stop") {
      // 状态为：「停止播放」
      // 1. 磁带不再转动
      this.doms.tape.classList.remove("playing"); // 2. 录制按钮的文字为：「重录」

      this.doms.btnRecord.innerText = "重录"; // 3. 录制按钮的样式为：「普通」

      this.doms.btnRecord.className = "btn2"; // 4. 播放按钮的文本为：「播放」

      this.doms.btnPlay.innerText = "播放"; // 5. 播放按钮的样式为：「普通」

      this.doms.btnPlay.className = "btn2"; // 6. 删除按钮的样式为：「普通」

      this.doms.btnDelete.className = "btn2";
    }
  },
  // 开始录制声音 
  startRecord: function startRecord() {
    return regeneratorRuntime.async(function startRecord$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(this.sound.status !== "no-voice" && this.sound.status !== "stop")) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            _context.prev = 2;
            _context.next = 5;
            return regeneratorRuntime.awrap(utils.audioRecorder.start());

          case 5:
            // 2. 状态变化。 no-voice, stop --> recording
            this.sound.status = "recording"; // 3. 初始化剩余时间。剩余时间 = 最大可录制时间

            this.sound.remainSeconds = this.sound.maxSeconds; // 4. render

            this.render(); // 5. 开启计时器，每隔一秒钟减少剩余时间，直到剩余时间为0时停止录音

            this.sound.timer = setInterval(function () {
              // 每隔一秒钟，剩余时间-1
              page2.sound.remainSeconds--;
              page2.render(); // 重新设置界面

              if (page2.sound.remainSeconds === 0) {
                page2.stopRecord();
              }
            }, 1000);
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](2);
            alert("无法获取录音权限");

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, null, this, [[2, 11]]);
  },
  // 停止录制声音
  stopRecord: function stopRecord() {
    var resp;
    return regeneratorRuntime.async(function stopRecord$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(this.sound.status !== "recording")) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            // 1. 状态变化。 recording --> stop
            this.sound.status = "stop"; // 2. 停止计时器

            clearInterval(this.sound.timer); // 3. render

            this.render(); // 4. 开启loading界面，便于后台上穿等功能

            showLoading(); // 5. 停止录音并上传

            _context2.next = 8;
            return regeneratorRuntime.awrap(utils.audioRecorder.stopAndUpload("https://bless.yuanjin.tech/api/upload", {
              // 以下为阿里云OSS空间信息，这些信息需要申请阿里云OSS空间后即可获取
              region: "oss-cn-beijing",
              accessKeyId: "LTAI4G2rBkjq2fHPMuK7os8N",
              accessKeySecret: "FM6I6RoV4PPj0vv3sxhlxN9Ggsa8UU",
              bucket: "happy-new-year-res"
            }));

          case 8:
            resp = _context2.sent;
            // resp.data.url 即为音频url
            // 6. 设置audio元素的音频源
            this.doms.audio.src = resp.data.url; // 7. 设置sound.audioUrl

            this.sound.audioUrl = resp.data.url; // 8. 关闭loading

            hideLoading();

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, null, this);
  },
  // 播放录音
  play: function play() {
    /*
     * 1. 状态变化。 stop --> playing
     * 2. 音频元素播放
     * 3. render
     */
    if (this.sound.status !== "stop") {
      return;
    }

    this.sound.status = "playing";
    this.doms.audio.play();
    this.render();
  },
  // 停止播放录音
  stop: function stop() {
    /*
     * 1. 状态变化。 playing --> stop
     * 2. 音频元素暂停
     * 3. 音频元素播放时间归零
     * 4. render
     */
    if (this.sound.status !== "playing") {
      return;
    }

    this.sound.status = "stop";
    this.doms.audio.pause();
    this.doms.audio.currentTime = 0;
    this.render();
  },
  // 移除录音
  remove: function remove() {
    /*
     * 1. 状态变化。 stop, playing --> no-voice
     * 2. 去掉音频元素的音频源
     * 3. 设置 sound.audioUrl 为 null
     * 4. render
     */
    if (this.sound.status !== "stop" && this.sound.status !== "playing") {
      return;
    }

    this.sound.status = "no-voice";
    this.doms.audio.pause();
    this.doms.audio.src = "";
    this.sound.audioUrl = null;
    this.render();
  },
  // 初始化第2页
  init: function init() {
    //1. 根据录音信息设置界面
    this.render(); //2. 录音按钮事件

    this.doms.btnRecord.onclick = function () {
      if (page2.sound.status === "stop" || page2.sound.status === "no-voice") {
        page2.startRecord();
      } else if (page2.sound.status === "recording") {
        page2.stopRecord();
      }
    }; //3. 播放/暂停按钮事件


    this.doms.btnPlay.onclick = function () {
      if (page2.sound.status === "stop") {
        page2.play();
      } else if (page2.sound.status === "playing") {
        page2.stop();
      }
    }; //4. 移除录音事件


    this.doms.btnDelete.onclick = function () {
      if (page2.sound.status === "stop" || page2.sound.status === "playing") {
        page2.remove();
      }
    }; //5. 录音播放完成后事件


    this.doms.audio.addEventListener("ended", function () {
      page2.stop();
    }); //6. 上一步按钮事件

    this.doms.btnPrev.onclick = function () {
      toPage(0);
    }; //7. 下一步按钮事件


    this.doms.btnNext.onclick = function () {
      toPage(2);
      page2.stop();
      page3.play(); //第二页点击第三页的时候，背景音乐播放
    };
  }
};
page2.init();
var page3 = {
  doms: {
    btnPrev: $("#page3Prev"),
    //上一步按钮
    btnFinish: $("#page3Finish"),
    //完成并分享按钮
    musicPrev: $(".page3 .arrow-left"),
    //上一曲按钮
    musicNext: $(".page3 .arrow-right"),
    //下一曲按钮
    musicText: $(".page3 .bg-music"),
    //背景音乐文本
    audBg: $("#audBg") //背景音乐音频元素

  },
  // 背景音乐名称
  bgMusicNames: ["春节序曲1", "春节序曲2", "春节序曲3", "辞旧迎新", "财源滚滚"],
  currentBgMusicIndex: 0,
  // 当前背景音乐的索引
  // 通过索引设置背景音乐
  setBgMusic: function setBgMusic(index) {
    this.currentBgMusicIndex = index; // 当前索引变化
    // 设置显示的音乐名称

    this.doms.musicText.innerText = "".concat(index + 1, ". ").concat(this.bgMusicNames[index]);
    this.doms.audBg.src = "./assets/media/".concat(index, ".mp3");
  },
  // 播放背景音乐
  play: function play() {
    this.doms.audBg.play();
  },
  // 暂停播放背景音乐
  stop: function stop() {
    this.doms.audBg.pause();
  },
  // 收集全部页面的数据，提交到服务器
  submit: function submit() {
    var resp;
    return regeneratorRuntime.async(function submit$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(fetch("https://bless.yuanjin.tech/api/bless", {
              // 请求配置，固定写法，学了 http 协议后自然懂
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                author: page1.doms.txtAuthor.value,
                content: page1.doms.txtContent.innerText,
                audioUrl: page2.sound.audioUrl,
                bgMusicIndex: page3.currentBgMusicIndex // 背景音乐的索引

              })
            }));

          case 2:
            resp = _context3.sent;
            _context3.next = 5;
            return regeneratorRuntime.awrap(resp.json());

          case 5:
            resp = _context3.sent;
            return _context3.abrupt("return", resp.data);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    });
  },
  // 弹出分享区域
  showShareArea: function showShareArea() {
    var divModal, resp, url, imgSrc;
    return regeneratorRuntime.async(function showShareArea$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            showLoading();
            divModal = $$$("div");
            divModal.className = "g-modal";
            _context4.next = 5;
            return regeneratorRuntime.awrap(this.submit());

          case 5:
            resp = _context4.sent;
            url = "".concat(location.origin, "/?").concat(resp._id);
            _context4.next = 9;
            return regeneratorRuntime.awrap(utils.share.createImg("./assets/cover-bg.jpg", url, resp.author));

          case 9:
            imgSrc = _context4.sent;
            divModal.innerHTML = "<div class=\"share-container\">\n    <img src=\"".concat(imgSrc, "\" alt=\"\">\n    <div class=\"g-btn\" data-default=\"true\">\u590D\u5236\u5206\u4EAB\u56FE\u7247</div>\n  </div>");
            document.body.appendChild(divModal);

            divModal.querySelector(".g-btn").onclick = function () {
              page3.copyShareImage();
            };

            hideLoading();

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, null, this);
  },
  // 复制分享图片
  copyShareImage: function copyShareImage() {
    var imgDom;
    return regeneratorRuntime.async(function copyShareImage$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            imgDom = $(".share-container img");
            _context5.next = 4;
            return regeneratorRuntime.awrap(utils.share.copyImage(imgDom));

          case 4:
            alert("复制图片成功\n你可以把图片粘贴给你的小伙伴");
            _context5.next = 10;
            break;

          case 7:
            _context5.prev = 7;
            _context5.t0 = _context5["catch"](0);
            alert("由于浏览器的限制，无法完成图片复制，请自行截图");

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, null, null, [[0, 7]]);
  },
  init: function init() {
    this.setBgMusic(0); // 1. 上一曲事件

    this.doms.musicPrev.onclick = function () {
      var newIndex = page3.currentBgMusicIndex - 1;

      if (newIndex < 0) {
        newIndex = page3.bgMusicNames.length - 1;
      }

      page3.setBgMusic(newIndex);
      page3.play();
    }; // 2. 下一曲事件


    this.doms.musicNext.onclick = function () {
      var newIndex = page3.currentBgMusicIndex + 1;

      if (newIndex > page3.bgMusicNames.length - 1) {
        newIndex = 0;
      }

      page3.setBgMusic(newIndex);
      page3.play();
    }; // 3. 上一步按钮事件


    this.doms.btnPrev.onclick = function () {
      toPage(1);
      page3.stop();
    }; // 4. 完成并分享按钮事件


    this.doms.btnFinish.onclick = function () {
      page3.showShareArea();
    };
  }
};
page3.init();

function init() {
  var resp;
  return regeneratorRuntime.async(function init$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // 显示默认的祝福信息
          showLoading(); // 加载中
          // 1. 获取远程数据

          _context6.next = 3;
          return regeneratorRuntime.awrap(fetch("https://bless.yuanjin.tech/api/bless?id=".concat(location.search.replace("?", ""))));

        case 3:
          resp = _context6.sent;
          _context6.next = 6;
          return regeneratorRuntime.awrap(resp.json());

        case 6:
          resp = _context6.sent;
          resp = resp.data;
          hideLoading();

          if (resp) {
            // 设置默认
            page1.doms.txtAuthor.value = resp.author;
            page1.doms.txtContent.innerText = resp.content;
            page3.setBgMusic(resp.bgMusicIndex);
          }

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  });
}

init();