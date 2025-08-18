$(document).ready(function () {    
    $(".KeyFile").each(function(){ 
        // if (KeyObjCheck($(this))) {
            var ID = $(this).attr("ID");
            window[ID] = new KeyFile(ID,$(this));               
            window[ID].Init();    
            window[ID].RefreshData();        
        // }                
    });     
});

//定義 KeyFileItem 
const KeyFileItem= function() {
    this.Index     = -1;              //檔案索引
    this.Name      = "";              //檔案名稱    
}


const KeyFile = function(ID, Element){
    this.ID = ID;
    this.Element = Element;
    this._Enabled = true;

    if(Element.attr("Enabled") === "false") {          
        this._Enabled = false;          
    }    

    //取得DataSet
    this.DataSet = null;
    if(typeof(Element.attr("DataSet")) != "undefined") {          
        this.DataSet = window[Element.attr("DataSet")];                  
    }   


    this.OnChangeFunc = null;
    if(typeof(Element.attr("OnChangeFunc")) != "undefined") {  
        this.OnChangeFunc = Element.attr("OnChangeFunc");
    } 

    //取得 AutoClear (上傳後是否自動清空暫存)
    this.AutoClear = true;
    if(typeof(Element.attr("AutoClear")) != "undefined") {  
        this.AutoClear = Element.attr("AutoClear").toUpperCase() == "TRUE";  
    } 
    
    //取得 MaxCount (上傳檔案最大數量)
    this.MaxCount = null;
    if (parseInt(Element.attr("MaxCount"))){
        this.MaxCount = parseInt(Element.attr("MaxCount"));
    }

    //取得 KeyField (上傳檔案目錄名稱，DataSet.KeyField)
    this.KeyField = null;
    if(typeof(Element.attr("KeyField")) != "undefined") {  
        this.KeyField = Element.attr("KeyField");
    }     

    //取得 Field (當有檔名自動轉序號時，DataSet.Field 為實際檔名)
    this.Field = "";
    if(typeof(Element.attr("Field")) != "undefined") {  
        this.Field = Element.attr("Field");
    }       

    //取得 FileNameChangeSeq (上傳檔名是否自動轉為序號)
    this.FileNameChangeSeq = false;
    if(typeof(Element.attr("FileNameChangeSeq")) != "undefined") {  
        this.FileNameChangeSeq = Element.attr("FileNameChangeSeq").toUpperCase() == "TRUE";  
    } 

    this.KeyNo  = "";                   //檔案上傳目錄名稱
    this.Files  = [];                   //檔案集合(KeyFileItem)   

    //以下為不開放設定    
    this._FilesArray = null;            //紀錄input物件中由使用者上傳的檔案
    this._FileList   = null;            //檔案物件
    this._FileInput  = null;            //選取按鈕
}


Object.defineProperty(KeyFile.prototype, "Value",{
    get: function(){       
        let FileNames = this.Files?.map(f => f.Name).join(',');
        return FileNames || "";
    }
})       


Object.defineProperty(KeyFile.prototype, "Visible",{
    get: function(){
        return this.Element.is(":visible");

    },
    set: function(value){
        if (Boolean(value)){
            this.Element.show();
        }else{
            this.Element.hide();
        }
    }
})

Object.defineProperty(KeyFile.prototype, "Enabled",{
    get: function(){
        return this._Enabled;

    },
    set: function(value){
        this._Enabled = Boolean(value);
    }
})


Object.defineProperty(KeyFile.prototype, "IsEmpty",{
    get: function(){
        return (this._FilesArray.length == 0);
    }
})

KeyFile.prototype._DefaultStyle = {        
        //字體大小(單位用 vw 才會跟著解析度縮放) 
        LabelFontSize          : "3.5vw",     //預設標題字體大小
        LabelFontColor         : "  #000000" ,      //預設標題字體顏色    
};

KeyFile.prototype.Init = function(){
    
    // 上傳檔案的input標籤
    let FileInput = $(`<input id="${this.ID}fileUploadInput" type="file" multiple>`);
    this._FileInput = FileInput;

    let inputLabelHtml = '<label class="file-upload-wrapper">'
                       + '選取檔案'
                       + '</label>';

    // 代替input標籤讓使用者點擊的label (方便樣式處理)
    let inputLabel = $(inputLabelHtml);

    if (this.MaxCount){
        inputLabel.text(`選取檔案(最大上傳傳數量：${this.MaxCount})`);
    }

    let confirm_btn = $('<button class="uploadbtn">新增</button>');

    // 顯示使用者選取的檔案
    let FileList = $('<div class="file-list" id="fileList"></div>');
    this._FileList = FileList;


    // 標題
    let LabelText = this.Element.attr('LabelText');
    let label = $('<p></p>').text(LabelText);


    //// 取得CSS樣式設定
    let LabelFontSize = this._DefaultStyle.LabelFontSize;//取得標題預設資料字體大小
    if(typeof(this.Element.attr("LabelFontSize")) != "undefined") {
        LabelFontSize = this.Element.attr("LabelFontSize");
    }

    let LabelFontColor = this._DefaultStyle.LabelFontColor;//取得標題資料文字顏色
    if(typeof(this.Element.attr("LabelFontColor")) != "undefined") {
        LabelFontColor = this.Element.attr("LabelFontColor");
    }

    if (label){// 標題<p>標籤套上css
        label.css({
            'margin'    : '24px 0 0 0',
            'font-size'     : LabelFontSize,
            'color'         : LabelFontColor,
            'height'    : 'auto'
            });
    }

    
    this._FilesArray = [];
    this.Files = [];    

    let CurOnChangeFunc = this.OnChangeFunc;


    // 當使用者選取檔案, 將選取檔案加入檔案佇列fileArray中
    FileInput.on('change', (e) => {
        
        if (CurOnChangeFunc && typeof window[CurOnChangeFunc] === "function") {
            window[CurOnChangeFunc]();  // 執行 MyFunc()
        }

        // 檢查有沒有超過限制上傳數量
        if (this.MaxCount){                    
            if (this._FilesArray.length + e.target.files.length > this.MaxCount){
                alert(`上傳檔案請勿超過 ${this.MaxCount.toString()} 個!!`);
                return
            }
        }

        // 檢查上傳的檔案是否已存在陣列
        for (const file of e.target.files) {
            const exists = this._FilesArray.some(f =>
                f.name === file.name &&
                f.size === file.size &&
                f.lastModified === file.lastModified
            );

            // 如果不存在，將檔案存入檔案陣列
            if (!exists) {
                this._FilesArray.push(file);

                let FileItem = new KeyFileItem();
                FileItem.Index = this.Files.length;
                FileItem.Name  = file.name;              
                this.Files.push(FileItem); 
            }
        }

        // 清空input，讓同一檔案可重複選取
        FileInput.val('');

        this.renderFileList();

    });


    // 點擊上傳檔案的label , 觸發檔案上傳input物件的點擊事件, 展開選取檔案視窗
    inputLabel.on('click', ()=>{
        // 如果enabled = false, 直接離開不觸發input點擊事件上傳檔案
        if (!this.Enabled){
            return;
        }
        FileInput.click();
    })

    if (!this._Enabled){
        inputLabel.hide();
    }


    //  將所有生成的標籤加入Element中
    this.Element.append(label, inputLabel,FileInput, FileList);
}



KeyFile.prototype.renderFileList= function(){

    // 清空畫面上檔案列表UI
    this._FileList.empty();

    // 如果沒有選擇的檔案，離開
    if (!this._FilesArray && this._FilesArray.length === 0) return;
        //
    for (let i=0; i<this._FilesArray.length; i++){

        let file = this._FilesArray[i];

        // 建立本地暫存url
        const url = URL.createObjectURL(file);


        // 建立檔案放置區塊
        const item = $('<div class="file-item"></div>');
        
        // 建立連結標籤
        let a = $( `
            <a href="${url}"  target="_blank" >${this.Files[i].Name} (${(file.size / 1024).toFixed(1)} KB) </a>            
        `);        

        // 設定超連結模式
        if (this.Connection_Mode === 2){
            a.attr('download',file.name)
        }

        // 建立刪除按鈕
        let deleteBtn = $(`<button>刪除</button>`);
        deleteBtn.on('click', () => {
            this._FilesArray.splice(i, 1)
            this.Files.splice(i, 1)
            item.remove();
        });     

        // 區塊內放入連結標籤與刪除按鈕
        item.append(a);

        if (this.Enabled) item.append(deleteBtn);  

        // 將檔案區塊放入檔案列表
        this._FileList.append(item);
    }
}

KeyFile.prototype.Upload = async function(IsNew){
    if(IsNew) {
        this._sendTobackend('add',this.KeyNo);
    } else {
        this._sendTobackend('modify',this.KeyNo);
    }
}

KeyFile.prototype.Delete = async function(){
    this._sendTobackend('delete',this.KeyNo);
}

// 將檔案資料發送寫入後端
KeyFile.prototype._sendTobackend = async function(action, KeyNo){

    if (KeyNo.trim() === '' ){
        console.log('sendTobackend缺少單號參數');
        return;
    }
    // HTTP請求參數一律轉大寫
    action = action.toLowerCase().trim();  


    if (action != 'add' && action != 'modify' && action != 'delete' )
    {
        console.log("sendTobackend單數action應為add、modify、delete其一，請檢查確認");
        return;
    }

    // 創建formData，用來打包全部檔案，放在http請求的body傳輸
    const formData = new FormData();

    for (let i=0; i < this._FilesArray.length; i++) {
        const file = this._FilesArray[i];
        formData.append('file', file); // 重複 append 多個 "file   
    }


    try {
        const response = await fetch(gWebConnect + 'Files/' + action + '/' + KeyNo + '/' + (this.FileNameChangeSeq ? '1' : '0'), {
            method: 'POST',
            body: formData
        });

        const data = await response.json().catch(() => {
            throw new Error('回傳不是合法 JSON');
        });


        if (!response.ok) {
            throw new Error(data.message || `伺服器錯誤 (${response.status})`);
        }

        console.log(JSON.stringify(data));

        if (data.Status != 'success'){
            alert("檔案異動失敗!");
            console.log(JSON.stringify(data));
            return;
        }
        
        //上傳後判斷是否自動清空暫存
        if (this.AutoClear){
            //清空暫存
            this.Clear();            
        };

    } catch (error) {

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            alert('⚠️ 網路錯誤（可能是伺服器沒開或 CORS 問題）');
        } else {
            alert('❌ 發生錯誤：' + error.message);
        }
    }
}


KeyFile.prototype.RefreshData = function(){   
    const mimeTypes = {
        'txt': 'text/plain',
        'html': 'text/html',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'csv': 'text/csv',
        'json': 'application/json',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    this.Clear();
    this.KeyNo = 'AaxA1';

    fetch(gFilesChangeUrl + this.KeyNo, { method: 'GET' })
    .then(response => {
        if (!response.ok) {
            throw new Error("伺服器回應錯誤，狀態碼：" + response.status);
        }

        const contentType = response.headers.get("Content-Type") || "";
        alert(contentType);

        if (contentType.includes("application/zip")) {
            return response.blob().then(blob => ({ type: "zip", data: blob }));
        } else if (contentType.includes("application/json")) {
            return response.json().then(json => {
                const msg = json.error || json.message || "伺服器回應格式錯誤";
                console.log("伺服器訊息:", msg);
                // 回傳一個標記，讓後面知道不用處理 ZIP
                return { type: "json", data: msg };
            });
        } else {
            return response.text().then(text => {
                throw new Error("伺服器回應格式錯誤: " + text);
            });
        }
    })
    .then(result => {
        // 🚫 如果是 JSON 回應，就直接結束，不繼續處理 zip
        if (result.type === "json") {
            this.Element.find('p').text(result.data); // 顯示錯誤或提示訊息
            return; 
        }

        // ✅ 只有 ZIP 才走這裡
        return JSZip.loadAsync(result.data);
    })
    .then(zip => {
        if (!zip) return; // 如果不是 zip，就不要繼續

        const filePromises = [];

        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const promise = zipEntry.async('blob').then(fileContent => {
                    const ext = zipEntry.name.split('.').pop().toLowerCase();
                    const mime = mimeTypes[ext] || 'application/octet-stream';
                    const fileObj = new File([fileContent], zipEntry.name, { type: mime });
                    this._FilesArray.push(fileObj);

                    let FileItem = new KeyFileItem();
                    FileItem.Index = this.Files.length;
                    FileItem.Name  = zipEntry.name;              
                    this.Files.push(FileItem); 
                });
                filePromises.push(promise);
            }
        });

        return Promise.all(filePromises);
    })
    .then(() => {
        if (this._FilesArray.length > 0) {
            console.log("所有檔案已處理完畢");
            this.renderFileList();
        } else {
            this.Element.find('p').text(this.ID+' 目前暫無檔案');
        }
    })
    .catch(error => {
        console.error("處理檔案時發生錯誤:", error);
        alert(error.message);
    });
}
// KeyFile.prototype.RefreshData = function(){   
//     // if (!this.DataSet || !this.KeyField) return;

//     // let state = this.DataSet.State;

//     const mimeTypes = {
//         'txt': 'text/plain',
//         'html': 'text/html',
//         'jpg': 'image/jpeg',
//         'jpeg': 'image/jpeg',
//         'png': 'image/png',
//         'gif': 'image/gif',
//         'pdf': 'application/pdf',
//         'csv': 'text/csv',
//         'json': 'application/json',
//         'doc': 'application/msword',
//         'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'xls': 'application/vnd.ms-excel',
//         'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     };

//     //清空暫存
//     this.Clear();

//     // this.KeyNo = this.DataSet.FieldByName(this.KeyField).Value;  

//     // if (this.KeyNo == '') return;
    
//     this.KeyNo = 'AaxA1';

//     fetch(gFilesChangeUrl+ this.KeyNo, {
//         method: 'GET'
//     })  
//     // fetch(gWebConnect + 'Files/' + this.KeyNo, {
//     //     method: 'GET'
//     // })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error("伺服器回應錯誤，狀態碼：" + response.status);
//         }

//         const contentType = response.headers.get("Content-Type") || "";
//         alert(contentType);   

//         if (contentType.includes("application/zip")) {
//             return response.blob(); // 返回 ZIP 檔案的 Blob
//         } else if (contentType.includes("application/json")) {
//             // 明確處理 JSON 回應
//             alert('joson');
//             return response.json().then(data => {
//                 const msg = data.error || data.message || "伺服器回應格式錯誤";
 
//                 console.log('測試'+msg);
//             });
//         } else {
//             // 非 ZIP 且非 JSON 的回應，作為未知格式處理
//             return response.text().then(text => {
//                 throw new Error("伺服器回應格式錯誤: " + text);
//             });

//         }
//     .then(blob => {
//         return JSZip.loadAsync(blob);
//     })
//     .then(zip => {
//         if (!zip) return; // 如果不是 zip，就不要繼續

//         const filePromises = [];

//         zip.forEach((relativePath, zipEntry) => {
//             if (!zipEntry.dir) {
//                 const promise = zipEntry.async('blob').then(fileContent => {
//                     const ext = zipEntry.name.split('.').pop().toLowerCase();
//                     const mime = mimeTypes[ext] || 'application/octet-stream';
//                     const fileObj = new File([fileContent], zipEntry.name, { type: mime });
//                     this._FilesArray.push(fileObj);

//                     let FileItem = new KeyFileItem();
//                     FileItem.Index = this.Files.length;
//                     FileItem.Name  = zipEntry.name;              
//                     this.Files.push(FileItem); 
//                 });
//                 filePromises.push(promise);
//             }
//         });

//         return Promise.all(filePromises);
//     })
//     .then(() => {
//         console.log("所有檔案已處理完畢");

//         //當有設定要轉換檔名 且 有指定檔名欄位時，檔名依照 檔名欄位的值
//         if(this.FileNameChangeSeq) {
//             let FileNames = this.DataSet ? this.DataSet.FieldByName(this.Field).Value.trim() : "";
//             if(FileNames != ''){
//                 let Names = FileNames.split('|');
//                 for (let i = 0; i < Names.length; i++) {
//                     this.Files[i].Name = Names[i];               
//                 }    
//             }    
//         }
                
//         this.renderFileList();        
//         if (this._FilesArray.length == 0){
//             this.Element.find('p').text(this.ID+' 目前暫無檔案');
//         }
//         // this.DataSet.State = state;
//     })
//     .catch(error => {
//         console.error("處理 ZIP 檔時發生錯誤:", error);
//         alert(error.message);
//     });

// }

KeyFile.prototype.Clear = function(){
    this.Files       = [];
    this._FilesArray = [];
    this._FileList.empty();
}
