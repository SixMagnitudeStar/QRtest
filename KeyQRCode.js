$(document).ready(function () {    
    $(".KeyQRCode").each(function(){ 
        if (KeyObjCheck($(this))) {
            var ID = $(this).attr("ID");
            window[ID] = new KeyQRCode(ID,$(this));               
            window[ID].Init();
            // window[ID].LoadData();
            // window[ID].RefreshData();         
            // window[ID].EventBind();
        }                
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

    this.currentQRCodeText = '';

    this.scanResultTarget = null;
    if(typeof(Element.attr("scanResultTarget")) != "undefined") {  
        this.scanResultTarget = Element.attr("scanResultTarget");
    } 


    this.OnChangeFunc = null;
    if(typeof(Element.attr("OnChangeFunc")) != "undefined") {  
        this.OnChangeFunc = Element.attr("OnChangeFunc");
    } 

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

	// 創建QRCode掃碼物件
	const html5QrCode = new Html5Qrcode(readerID);
	
	// 將QRCode掃碼物件存取進KeyQRCode屬性內，方便在Method中呼叫
	this.html5QrCode = html5QrCode;


	// QRCode掃碼的區塊
	const reader = $('<div></div');


	reader.css({
		//
		'width': '250px',
		'height': '250px',
		'position': 'absolute',
		'top': '50%',
		'left': '50%',
		'transform': 'translate(-50%, -50%)'		
	})


	const readerID = this.ID+'_reader';// 用物件ID+_reader組成掃碼區塊id

	reader.attr('ID', readerID);

	// QRCode掃描按鈕
	const qrBtn = $('<button>QRCode scan</button>');

	// 加上樣式
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
	qrBtn.on('click', () => this.StartScan());


	// 創建容器區塊，批次將所有生成的物件加入DOM
	const container = $('<div></div>');

	// 有給LabelText值就創建 p 標籤
	if (this.LabelText){
		//
		const label = $('<p></p>').text(this.LabelText);
		container.append(label);
	}



	container.append(qrBtn, reader);

	// 將物件相關HTML元素加入DOM
	this.Element.append(container);

}

// 有一個Method，傳入參數，可以指定QRCode要


KeyQRCode.prototype.StartScan = function(){
	this.html5QrCode.start(
		{ facingMode: "environment" },
		{ fps: 10, qrbox: 250},
		(decodedText) => {
			this.currentQRCodeText = decodedText;
			this.StopScan();// 自動停止


			if (this.scanResultTarget && window[this.scanResultTarget]){
				try{
					window[this.scanResultTarget].Value = this.currentQRCodeText;
				}catch(error){
					console.log('QRCode值傳送至'+this.scanResultTarget+'失敗，請確認該ID為Key物件!!');
				}
			}

		
			// 執行掃完條碼後希望執行的事件
			let CurOnChangeFunc = this.OnChangeFunc;	
			if (CurOnChangeFunc && typeof window[CurOnChangeFunc] === "function") {
            	window[CurOnChangeFunc]();  // 執行 MyFunc()
        	}
		},
		(errorMessage) => {
			// 可以忽略掃不到時的錯誤
		}
	).catch(err => {
			console.error("無法啟動相機", err);
	});
}


KeyQRCode.prototype.StopScan = function(){
	this.html5QrCode.stop().then(() => {
		console.log("已停止掃描");
	}).catch(err => {
		console.error("停止掃描失敗", err);
	});
}




function testf(){
	alert('測試OnChangeFunc');
}