$(document).ready(function () {    
    $(".KeyQRCode").each(function(){ 
  
            var ID = $(this).attr("ID");
            window[ID] = new KeyQRCode(ID,$(this));               
            window[ID].Init();
            // window[ID].LoadData();
            // window[ID].RefreshData();         
              
    });     
});



const KeyQRCode = function(ID, Element){
    this.ID = ID;
    this.Element = Element;
    this._Enabled = true;

    this.LabelText = Element.attr('LabelText');


    if(Element.attr("Enabled") === "false") {          
        this._Enabled = false;          
    }    

    //取得DataSet
    this.DataSet = null;
    if(typeof(Element.attr("DataSet")) != "undefined") {          
        this.DataSet = window[Element.attr("DataSet")];                  
    }   

    //取得Field
    this.Field = "";
    if(typeof(Element.attr("Field")) != "undefined") {  
        this.Field = Element.attr("Field");
    }   

 
    this.html5QrCode = null;

    this.qrBtn = null;
    this.qrIcon = null;

    this.currentQRCodeText = '';

    this.scanResultTarget = null;
    if(typeof(Element.attr("scanResultTarget")) != "undefined") {  
        this.scanResultTarget = Element.attr("scanResultTarget");
    } 


    this.OnChangeFunc = null;
    if(typeof(Element.attr("OnChangeFunc")) != "undefined") {  
        this.OnChangeFunc = Element.attr("OnChangeFunc");
    } 

    this.Binding_Edit = null;
    if(typeof(Element.attr("Binding_Edit")) != "undefined") {  
        this.Binding_Edit = Element.attr("Binding_Edit");
    } 

    this.Mode = 'self';
    if (this.Element.attr('Mode') == 'embedding'){
    	this.Mode = 'embedding';
    }

	this.reader = null;
	this.overlay =  null;
	this.scannerContainer = null;
	this.closebtn = null;
}



Object.defineProperty(KeyQRCode.prototype, "Value",{
	get: function(){
		// 
		return this.currentQRCodeText ? this.currentQRCodeText : "" ;
	},
	set: function(value){
		//
		this.currentQRCodeText = value;

	}
});


KeyQRCode.prototype.Init = function(){


	// QRCode掃碼的區塊
	const reader = $('<div></div');

	this.reader = reader;

	reader.css({
		'width': '100vw',
		'height': '100%',
		'position': 'relative',
		// 'background': '#16213e',
		'border-radius': '20px',
		'top': '0'
	
		// 'width': '80%',
		// 'height': '100%',
		// 'position': 'relative',
		// 'background-color':'green'

		// 'transform': 'translate(-50%, -50%)'		
	})

	const readerID = this.ID+'_reader';// 用物件ID+_reader組成掃碼區塊id


	reader.attr('ID', readerID);


	// QRCode掃描按鈕
	const qrBtn = $('<button>QRCode888 scan</button>');

	const qrIcon = $('<img src="scan.png" alt="請掃描QRCode"/>');
	this.qrIcon = qrIcon

	const Icondiv = $('<div></div>');
	Icondiv.css({
		// 'background-color': 'white',
		'width' : 'auto',
		'height' : 'auto',
		'display': 'inline-block',
		'padding' : '0'
	});

	Icondiv.append(qrIcon);

	this.getIconCss();
	// 加上樣式// 
	qrBtn.css({
		'border': '2px dashed #4a90e2',
		'padding': '20px',
		'text-align': 'center',
		'cursor': 'pointer',
		'color': '#4a90e2',
		'border-radius': '8px',
		'width': '30%',
		'background-color': '#f0f8ff'
	});



	// 點擊觸發掃描事件
//	qrBtn.on('click', () => this.StartScan());
	qrIcon.on('click', () => this.StartScan());

	// 創建容器區塊，批次將所有生成的物件加入DOM
	const scannerContainer = $('<div></div>');
	
	this.scannerContainer = scannerContainer;
	
	scannerContainer.css({
		'position': 'relative',
		'width': '100vw',
		'hegiht': '70vh' 
	})


	const overlay = $('<div class="scanner-overlay"></div>');

	const closebtn = $('<div class="close-button"></div>');
	//const closebtn = $('<img src="cancel.png" alt="叉叉"/>');
	closebtn.css({
		// 'height': '60px',
		// 'width': '60px',
		// 'z-index': '1100'
	})

	const closebtnDiv = $('<div class="close-button" ></div>');
	this.closebtn = closebtn;

	// closebtnDiv.css({
	// 	'position': 'ab',
	// 	'top': '20px',
	// 	'left': '20px',
	// 	'background': 'rgba(0, 0, 0, 0.5)',
	// 	'border-radius': '50%',
	// 	'display': 'flex'
	// })

	closebtn.on('click', ()=>{
		this.StopScan();
		
	})

	// const scanframe = $('<div class="scan-frame"></div>');

	// 有給LabelText值就創建 p 標籤
	if (this.LabelText){
		//
		const label = $('<p></p>').text(this.LabelText);
		scannerContainer.append(label);
	}

//	closebtnDiv.append(closebtn);
    overlay.append(closebtn);
	this.overlay = overlay;
	
	scannerContainer.append(reader, overlay);
	
	// 將物件相關HTML元素加入DOM
	this.Element.append(Icondiv,scannerContainer);

	overlay.hide();
	
	// 創建QRCode掃碼物件
	const html5QrCode = new Html5Qrcode(readerID);
	
	// 將QRCode掃碼物件存取進KeyQRCode屬性內，方便在Method中呼叫
	this.html5QrCode = html5QrCode;
	alert('測試oo');
}



KeyQRCode.prototype.getIconCss = function(){
	//
	if (this.Mode === 'embedding'){
		const height = this.Element.prev().height(); 
		this.qrIcon.css({
			'height' : '100%',
			'width' : '100%'
			// 'display': 'block'
			// 'background-color': 'transparent',
			// 'margin': '0',

			// 'z-index': '1000'
		});

		this.Element.css({
			'height' : height,
			'width' : height,
			'right': '3%',
			'position': 'absolute',
			'margin': '2px',
			'display': 'block'
	
		})
		//
	}else{
		//
		this.qrIcon.css({
			'height' : '40px',
			'width'  : '40px',
			'display': 'block',
			 'background-color': 'white',
			'margin': '0'
		});

	}
}


KeyQRCode.prototype.StartScan = function(){

	const self = this;

    if (!this.html5QrCode) {
        console.error("html5QrCode 尚未初始化，無法開始掃描");
        return;
    }


	this.html5QrCode.start(
	    { facingMode: "environment" },
	    { fps: 10, qrbox: 450 },
	    (decodedText) => {
			this.currentQRCodeText = decodedText;
			alert('進入');
			if (this.html5QrCode){
				alert('停止');
				this.StopScan();// 自動停止
			} 

			if (this.scanResultTarget && window[this.scanResultTarget]){
				try{
					window[this.scanResultTarget].Value = this.currentQRCodeText;
				}catch(error){
					console.log('QRCode值傳送至'+this.scanResultTarget+'失敗，請確認該ID為Key物件!!');
				}
			}


			// 若QRCode有綁定Edit , 掃描後將值傳入Edit
			if (this.Binding_Edit){
				window[this.Binding_Edit].Value = this.currentQRCodeText;
			}
		
			// 執行掃完條碼後希望執行的事件
			let CurOnChangeFunc = this.OnChangeFunc;	
			if (CurOnChangeFunc && typeof window[CurOnChangeFunc] === "function") {
            	window[CurOnChangeFunc]();  // 執行 MyFunc()
        	}
	    },
	    (errorMessage) => {}
	).then(() => {
		self.overlay.show();
	}).catch(err => {
	    console.error("無法啟動相機", err);
	});

}


KeyQRCode.prototype.StopScan = function(){
	this.overlay.hide();
    if (this.html5QrCode) {
        this.html5QrCode.stop().then(() => {
            console.log("已停止掃描");
        }).catch(err => {
            console.error("停止掃描失敗", err);
        });
    } else {
        console.warn("html5QrCode 尚未初始化，無法停止掃描");
    }

}





function testf(){
	alert('測試OnChangeFunc');
}




























































