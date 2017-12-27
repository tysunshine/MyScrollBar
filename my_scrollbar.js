(function (win, dom) {

	/**
	 * 参数：
	 * o [object]
	 * o.selId -> 滚动内容盒子的id （必须）
	 * o.width -> 滚动条的宽度 （默认10，请设置为偶数)
	 * o.bgColor -> 滚动条包裹层的颜色 (默认#eaeaea)
	 * o.barColor -> 滚动条的颜色 (默认#ccc)
	 * o.enterShow -> 是否为鼠标进入包裹层后显示滚动条 （默认true是）
	 * o.hasY -> 是否需要Y轴滚动条（默认true需要）
	 * o.hasX -> 是否需要X轴滚动条（默认false不需要）
	 * 注：通过调用MyScrollBar.setSize()函数可以重置滚动条高度
	 */
	function MyScrollBar (o) {
		this.init(o);
	}

	MyScrollBar.prototype.init = function (o) {
		this.bXBar = false;						// 是否有x轴滚动条
		this.bYBar = false;						// 是否有y轴滚动条
					
		this.iScrollTop = 0;					// 滚动内容的y轴滚动距离
		this.iScrollLeft = 0;					// 滚动内容的x轴滚动距离

		// this.bMax = true;								// 滚动条是否为最长，为最长时不做事

		this.oWrapper = dom.getElementById(o.selId);		// 滚动盒子
		this.oScroll = this.oWrapper.firstElementChild;		// 滚动内容

		this.setParam(o);									// 调用设置初始参数喊
		this.addScrollBar();								// 调用添加滚动条函数

		this.initState();									// 调用设置初始状态函数
		this.initEvent();									// 调用设置事件函数
	}

	// 初始化状态
	MyScrollBar.prototype.initState = function () {
		// 给包裹层设置默认定位
		var sWPosition = getStyle(this.oWrapper, 'position');
		if(sWPosition == 'static') {
			this.oWrapper.style.position = 'relative';
		}

		if ( this.bYBar ) {
			this.oYBox.style.display = this.enterShow ? 'none' : 'block';		// 如果enterShow为true就是需要进入包裹层才显示滚动条
			this.oYBox.style.position = "absolute";
			this.oYBox.style.top = 0;
			this.oYBox.style.right = 0;
			this.oYBox.style.zIndex = 10;
			this.oYBox.style.width = this.width + 'px';
			this.oYBox.style.height = "100%";
			this.oYBox.style.backgroundColor = this.bgColor;

			this.oYBar.style.position = 'absolute';
			this.oYBar.style.top = 0;
			this.oYBar.style.left = 0;
			this.oYBar.style.width = '100%';
			this.oYBar.style.backgroundColor = this.barColor;
			this.oYBar.style.borderRadius = this.width / 2 + 'px';
			// this.oYBar.style.transition = 'all 50ms linear';					// ie过渡有问题
		}

		if ( this.bXBar ) {
			this.oXBox.style.display = this.enterShow ? 'none' : 'block';		// 如果enterShow为true就是需要进入包裹层才显示滚动条
			this.oXBox.style.position = "absolute";
			this.oXBox.style.bottom = 0;
			this.oXBox.style.left = 0;
			this.oXBox.style.zIndex = 10;
			this.oXBox.style.height = this.width + 'px';
			this.oXBox.style.width = "100%";
			this.oXBox.style.backgroundColor = this.bgColor;

			this.oXBar.style.position = 'absolute';
			this.oXBar.style.bottom = 0;
			this.oXBar.style.left = 0;
			this.oXBar.style.height = '100%';
			this.oXBar.style.backgroundColor = this.barColor;
			this.oXBar.style.borderRadius = this.width / 2 + 'px';
			// this.oXBar.style.transition = 'all 50ms linear';
		}

		this.setSize();		// 设置滚动条的宽高
	}

	// 初始化事件
	MyScrollBar.prototype.initEvent = function () {
		var _this = this;

		// 鼠标在包裹层中然后滚轴上下滚动
		var sUserAgent = win.navigator.userAgent.toLowerCase();
		if ( sUserAgent.indexOf('firefox') != -1 ) {
			// 火狐浏览器滚轴滚动
			this.oWrapper.addEventListener('DOMMouseScroll', function (e) {
				if ( _this.bYBar ) {
					e.preventDefault();

					_this.iScrollTop += e.detail > 0 ? 60 : -60;
					_this.iScrollTop = _this.iScrollTop <= 0 ? 0 : _this.iScrollTop >= _this.iScrollH - _this.iWrapperH ? _this.iScrollH - _this.iWrapperH : _this.iScrollTop;
					_this.setTransLate();
					_this.setYTop(_this.iScrollTop / _this.iScrollH * _this.iYBoxH);
				}
			})
		} else {
			// 谷歌、ie滚轴滚动
			this.oWrapper.onmousewheel = function (evt) {
				if ( _this.bYBar ) {
					var e = evt || win.event;
					evt ? e.preventDefault() : e.returnValue = false;

					_this.iScrollTop += e.wheelDelta < 0 ? 60 : -60;
					_this.iScrollTop = _this.iScrollTop <= 0 ? 0 : _this.iScrollTop >= _this.iScrollH - _this.iWrapperH ? _this.iScrollH - _this.iWrapperH : _this.iScrollTop;
					_this.setTransLate();
					_this.setYTop(_this.iScrollTop / _this.iScrollH * _this.iYBoxH);
				}
			}
		}

		// 输入表移入包裹层显示滚动条、移出隐藏滚动条
		var isInWrapper = false;
		this.oWrapper.onmouseenter = function () {
			isInWrapper = true;
			if ( _this.enterShow ) {
				if ( _this.bYBar ) {
					_this.oYBox.style.display = 'block';
				}
				if ( _this.bXBar ) {
					_this.oXBox.style.display = 'block';
				}
			}
		}
		this.oWrapper.onmouseleave = function () {
			isInWrapper = false;
			if ( _this.enterShow ) {
				if ( _this.bYBar && !bYDown ) {
					_this.oYBox.style.display = 'none';
				}
				if ( _this.bXBar && !bXDown ) {
					_this.oXBox.style.display = 'none';
				}
			}
		}


		// 鼠标在滚动条上按下，想要拖动
		var bYDown = false, bXDown = false;		// 在滚动条上是否按下
		var iDownPageY = 0, iDownPageX = 0;		// 按下时鼠标到页面顶部的距离
		var iYBarTop = 0, iXBarLeft = 0;		// 按下时滚动条的top/left
		if ( _this.bYBar ) {
			// 鼠标在Y轴滚动条按下
			this.oYBar.onmousedown = function (e) {
				bYDown = true;
				iDownPageY = e.clientY + dom.documentElement.scrollTop || dom.body.scrollTop;
				iYBarTop = parseInt(getStyle(this, 'top'));

				// 禁止文本可选中
				dom.body.style.mozUserSelect = 'none';
				dom.body.style.webkitUserSelect = 'none';
				dom.body.style.msUserSelect = 'none';
				dom.body.style.khtmlUserSelect = 'none';
				dom.body.style.userSelect = 'none';
			}

			// 鼠标在按下Y轴滚动条后抬起
			dom.addEventListener('mouseup', function () {
				if ( bYDown ) {
					bYDown = false;
					// 恢复文本可选中
					dom.body.style.mozUserSelect = 'text';
	    			dom.body.style.webkitUserSelect = 'text';
	    			dom.body.style.msUserSelect = 'text';
					dom.body.style.khtmlUserSelect = 'text';
	    			dom.body.style.userSelect = 'text';

	    			if ( !isInWrapper && _this.enterShow ) {
	    				_this.oYBox.style.display = 'none';
	    			}
				}
			})

			// 鼠标按下Y轴滚动条后拖动
			dom.addEventListener('mousemove', function (e) {
				if ( bYDown ) {
					var iNowPageY = e.clientY + dom.documentElement.scrollTop || dom.body.scrollTop;
					var iNowTop = iYBarTop + iNowPageY - iDownPageY;

					iNowTop = iNowTop <= 0 ? 0 : iNowTop >= _this.iYBoxH - _this.iYBarH ? _this.iYBoxH - _this.iYBarH : iNowTop;
					_this.iScrollTop = iNowTop / _this.iYBoxH * _this.iScrollH;
					_this.setTransLate();
					_this.setYTop(iNowTop);
				}
			})

			// 禁止默认拖动事件
			this.oYBar.ondrag = function (e) {
				var e = evt || win.event;
				evt ? e.preventDefault() : e.returnValue = false;
			}
		}

		if ( this.bXBar ) {
			// 鼠标在X轴滚动条按下
			this.oXBar.onmousedown = function (e) {
				bXDown = true;
				iDownPageX = e.clientX + dom.documentElement.scrollLeft || dom.body.scrollLeft;
				iXBarLeft = parseInt(getStyle(this, 'left'));

				// 禁止文本可选中
				dom.body.style.mozUserSelect = 'none';
				dom.body.style.webkitUserSelect = 'none';
				dom.body.style.userSelect = 'none';
			}

			// 鼠标在按下X轴滚动条后抬起
			dom.addEventListener('mouseup', function () {
				if ( bXDown ) {
					bXDown = false;
					// 恢复文本可选中
					dom.body.style.mozUserSelect = 'text';
	    			dom.body.style.webkitUserSelect = 'text';
	    			dom.body.style.userSelect = 'text';

	    			if ( !isInWrapper && _this.enterShow ) {
	    				_this.oXBox.style.display = 'none';
	    			}
	    		}
			})

			// 鼠标按下X轴滚动条后拖动
			dom.addEventListener('mousemove', function (e) {
				if ( bXDown ) {
					var iNowPageX = e.clientX + dom.documentElement.scrollLeft || dom.body.scrollLeft;
					var iNowLeft = iXBarLeft + iNowPageX - iDownPageX;

					iNowLeft = iNowLeft <= 0 ? 0 : iNowLeft >= _this.iXBoxW - _this.iXBarW ? _this.iXBoxW - _this.iXBarW : iNowLeft;
					_this.iScrollLeft = iNowLeft / _this.iXBoxW * _this.iScrollW;
					_this.setTransLate();
					_this.setXLeft(iNowLeft);
				}
			})

			// 禁止默认拖动事件
			this.oXBar.ondrag = function (e) {
				var e = evt || win.event;
				evt ? e.preventDefault() : e.returnValue = false;
			}
		}	
	}

	// 设置默认参数
	MyScrollBar.prototype.setParam = function (o) {
		this.width = o.width ? o.width : 10;

		this.bgColor = o.bgColor ? o.bgColor : '#eaeaea';

		this.barColor = o.barColor ? o.barColor : '#ccc';

		this.enterShow = o.enterShow === false ? false : true;

		this.hasY = o.hasY === false ? false : true;

		this.hasX = o.hasX === true ? true : false;
	}

	// 判断是否添加XY轴滚动条
	MyScrollBar.prototype.addScrollBar = function () {
		// 获取包裹层与滚动层的尺寸
		this.getSize();

		if ( this.iWrapperW < this.iScrollW && this.hasX ) {
			this.bXBar = true;
			
			this.oXBox = dom.createElement('div');					// X轴滚动条盒子
			this.oXBar = dom.createElement('div');					// X轴滚动条

			this.oXBox.appendChild(this.oXBar);						// 滚动条插入滚动条盒子
			this.oWrapper.insertBefore(this.oXBox, this.oScroll);	// 滚动条盒子插到oScroll之前
		}

		if ( this.iWrapperH < this.iScrollH && this.hasY ) {
			this.bYBar = true;
			
			this.oYBox = dom.createElement('div');					// X轴滚动条盒子
			this.oYBar = dom.createElement('div');					// X轴滚动条

			this.oYBox.appendChild(this.oYBar);						// 滚动条插入滚动条盒子
			this.oWrapper.insertBefore(this.oYBox, this.oScroll);	// 滚动条盒子插到oScroll之前
		}
	}

	// 更新/获取包裹层与滚动层的尺寸
	MyScrollBar.prototype.getSize = function () {
		var oWrapperSize = getClientSize(this.oWrapper);
		var oScrollSize = getClientSize(this.oScroll);

		this.iWrapperW = oWrapperSize.width;
		this.iWrapperH = oWrapperSize.height;
		this.iScrollW = oScrollSize.width;
		this.iScrollH = oScrollSize.height;

		if ( this.bYBar ) {
			this.iYBoxH = this.iWrapperH;
			this.iYBarH = this.iWrapperH / this.iScrollH * this.iYBoxH;
		}

		if ( this.bXBar ) {
			this.iXBoxW = this.iWrapperW;
			this.iXBarW = this.iWrapperW /this.iScrollW * this.iXBoxW;
		}
	}

	// 设置尺寸
	MyScrollBar.prototype.setSize = function () {
		// 更新包裹层与滚动层的尺寸
		this.getSize();

		if ( this.bYBar ) {
			this.oYBar.style.height = this.iYBarH + 'px';
			this.oYBar.style.top = 0;
		}

		if ( this.bXBar ) {
			this.oXBar.style.width = this.iXBarW + 'px';
			this.oXBar.style.left = 0;
		}

		this.iScrollTop = 0;
		this.iScrollLeft = 0;
		this.setTransLate();
	}

	// 设置oScroll的位置转换transform:translate
	MyScrollBar.prototype.setTransLate = function () {
		var sTranslate = 'translate(-' + this.iScrollLeft + 'px, -' + this.iScrollTop + 'px)';
		this.oScroll.style.transform = sTranslate;
		this.oScroll.style.msTransform = sTranslate; 
		this.oScroll.style.mozTransform = sTranslate; 
		this.oScroll.style.webkitTransform = sTranslate; 
		this.oScroll.style.oTransform = sTranslate; 
	}

	// 设置滚动top
	MyScrollBar.prototype.setYTop = function (iTop) {
		this.oYBar.style.top = iTop + 'px';
	}

	// 设置滚动left
	MyScrollBar.prototype.setXLeft = function (iLeft) {
		this.oXBar.style.left = iLeft + 'px';
	}

	// 获取样式
	function getStyle (obj, name) {
		if(win.getComputedStyle) {
			return getComputedStyle(obj, null)[name];
		} else {
			return obj.currentStyle[name];
		}
	}

	/**
	 * 作用：获取对象的offset（内容尺寸+padding+border）尺寸，display:none;元素也可以获取
	 * 参数：obj -> 要获取尺寸的元素
	 * 返回：res -> width 宽; res -> height 高
	 * 依赖：getStyle
	 */
	function getOffsetSize (obj) {
	    var sDisplay = getStyle(obj, "display");
	    var res = {}

	    if ( sDisplay != "none" ) {
	        res.width = obj.offsetWidth;
	        res.height = obj.offsetHeight;
	    } else {
	        var oldStyle = {
	            position: getStyle(obj, "position"),
	            visibility: getStyle(obj, "visibility"),
	            display: sDisplay
	        }
	        var newStyle = {
	            position: "absolute",
	            visibility: "hidden",
	            display: "inline-block"
	        }
	        setStyle(obj, newStyle);
	        res.width = obj.offsetWidth;
	        res.height = obj.offsetHeight;
	        setStyle(obj, oldStyle);
	    }
	    return res;

	    function setStyle (obj, oStyle) {
	        for(var i in oStyle) {
	            obj.style[i] = oStyle[i];
	        }
	    }
	}

	// 计算实际内容+padding宽高即clientWidth/clientHeight，但ie时client包含边框
	function getClientSize (obj) {
		var iTopW = parseInt(getStyle(obj, 'borderTopWidth'));
		var iRightW = parseInt(getStyle(obj, 'borderRightWidth'));
		var iBottomW = parseInt(getStyle(obj, 'borderBottomWidth'));
		var iLeftW = parseInt(getStyle(obj, 'borderLeftWidth'));

		var oOffset = getOffsetSize(obj);
		return {
			width: oOffset.width - iLeftW - iRightW,
			height: oOffset.height - iTopW - iBottomW
		}
	}

	if ( typeof define === "function" && define.amd ) {
		define([], function () {
			return MyScrollBar;
		});
	}
	win.MyScrollBar = MyScrollBar;
})(window, document);