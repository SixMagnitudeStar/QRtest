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
		'width': '100%',
		'height': '100%',
		'position': 'relative',
		'background': '#16213e',
		'border-radius': '20px'
	
		// 'width': '80%',
		// 'height': '100%',
		// 'position': 'relative',
		// 'background-color':'green'

		// 'transform': 'translate(-50%, -50%)'		
	})

	// let close = $('<img src="images/close.png" alt="結束掃描">');

	// close.css({
	// 	'width': '30px',
	// 	'height': '30px',
	// 	'position': 'absolute',
	// 	'margin-top': '0',
	// 	'margin-left':'0',
	// 	'z-index': '1001'
	// })

	// close.on('click', ()=>{
	// 	 if (!this.html5QrCode){
	// 	 	this.StopScan();
	// 	 }
	// });


	const readerID = this.ID+'_reader';// 用物件ID+_reader組成掃碼區塊id


	reader.attr('ID', readerID);


	// QRCode掃描按鈕
	const qrBtn = $('<button>QRCode888 scan</button>');

	const qrIcon = $('<img src="images/scan.png" alt="請掃描QRCode"/>');
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

	const readerWrapper = $('<div></div>');
	readerWrapper.css({
		'width' : '100%',
		'height': '80%',
		'background-color': 'red',
		'position': 'relative'
	})
	

	// 點擊觸發掃描事件
//	qrBtn.on('click', () => this.StartScan());
	qrIcon.on('click', () => this.StartScan());

	// 創建容器區塊，批次將所有生成的物件加入DOM
	const container = $('<div></div>');

	container.css({
		'position': 'absolute',
		'width': '100vw',
		'hegiht': '70vh' 
	})


	const overlay = $('<div class="scanner-overlay"></div>');
	// overlay.css({
	// 	'position': 'absolute',
 //        'top': '0',
 //        'left': '0',
 //        'width': '100%',
 //        'height': '100%',
 //        'pointer-events': 'none',
 //        'z-index': '1000'
	// })
	const closebtn = $('<div class="lose-button"></div>');

	const scanframe = $('<div class="can-frame"></div>');

	// 有給LabelText值就創建 p 標籤
	if (this.LabelText){
		//
		const label = $('<p></p>').text(this.LabelText);
		container.append(label);
	}

	overlay.append(closebtn, scanframe);
	
	// readerWrapper.append(reader,testdiv);
	container.append(Icondiv, reader, overlay);
	//container.append(close);
	
	// 將物件相關HTML元素加入DOM
	this.Element.append(container);



	// 創建QRCode掃碼物件
	const html5QrCode = new Html5Qrcode(readerID);
	
	// 將QRCode掃碼物件存取進KeyQRCode屬性內，方便在Method中呼叫
	this.html5QrCode = html5QrCode;

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
			//'background-color': 'transparent',
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
			
			if (this.html5QrCode) this.StopScan();// 自動停止

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
	    // 掃描器啟動後，設定圓角
	    $('#' + readerID + ' canvas').css({
	        'border-radius': '20px',
	        'border': '2px solid #4a90e2'
	    });

        // 確保 video 已生成，這時 append overlay
        const overlay = $('<div></div>');
        overlay.css({
            'position': 'absolute',
            'top': '30px',
            'width': '150px',
            'height': '150px',
            'transform': 'translate(-50%, -50%)',
            'border': '2px solid #4a90e2',
            'border-radius': '20px',
            'z-index': '1001',
			'background-color': 'yellow',
            'pointer-events': 'none'
        });
        self.Element.append(overlay);
		
	}).catch(err => {
	    console.error("無法啟動相機", err);
	});

}


KeyQRCode.prototype.StopScan = function(){

    if (this.html5QrCode) {
        this.html5QrCode.stop().then(() => {
            console.log("已停止掃描");
        }).catch(err => {
            console.error("停止掃描失敗", err);
        });
    } else {
        console.warn("html5QrCode 尚未初始化，無法停止掃描");
    }


	// this.html5QrCode.stop().then(() => {
	// 	console.log("已停止掃描");
	// }).catch(err => {
	// 	console.error("停止掃描失敗", err);
	// });
}





function testf(){
	alert('測試OnChangeFunc');
}


























