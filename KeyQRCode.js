$(document).ready(function () {    
    $(".KeyQRCode").each(function(){ 
            var ID = $(this).attr("ID");
            window[ID] = new KeyQRCode(ID,$(this));               
            window[ID].Init();
            // window[ID].LoadData();
            // window[ID].RefreshData();         
            // window[ID].EventBind();
            
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

    this.OnChangeFunc = null;
    if(typeof(Element.attr("OnChangeFunc")) != "undefined") {  
        this.OnChangeFunc = Element.attr("OnChangeFunc");
    } 

}



Object.defineProperty(KeyQRCode.prototype, "Value",{
	get: function(){
		return this.currentQRCodeText ? this.currentQRCodeText : "" ;
	}
});



KeyQRCode.prototype.Init = function(){
	//
	const qrBtn = $('<button>QRCode scan</button>');

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

	qrBtn.on('click', () => this.StartScan());


	const container = $('<div></div>');


	if (this.LabelText){
		//
		const label = $('<p></p>').text(this.LabelText);
		container.append(label);
	}

	// QRCode掃碼的區塊
	const reader = $('<div></div');

	// 用物件ID+_reader組成掃碼區塊id
	const readerID = this.ID+'_reader';

	reader.attr('ID', readerID);
	alert(reader.attr('ID'));

	container.append(qrBtn, reader);
	this.Element.append(container);

	const html5QrCode = new Html5Qrcode(readerID);
	this.html5QrCode = html5QrCode;
	alert('一:'+html5QrCode);
	alert('二:'+this.html5QrCode);


    let currentQRCodeText = ""; 
}



KeyQRCode.prototype.StartScan = function(){
	this.html5QrCode.start(
		{ facingMode: "environment" },
		{ fps: 10, qrbox: 250},
		(decodedText) => {
			this.currentQRCodeText = decodedText;
			this.StopScan();// 自動停止
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


