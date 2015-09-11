
//Message Type用
var CONSOLE = 1;
var STATUS = 2;
var MACHINE = 3;
var NETWORK = 4;
var ETC = 10;
var RETRYTIME=5;

var SERVER = 0;
var ROUTER = 1;
var SWITCH = 2;

var machineDB = [];
var templateDB = [];
var flavorDB = [];
var linkDB = [];
var l3DB = [];
var jname = "masterRouter";
var initok = false;		//初期化が済んだか
var openContext = false;	//contextmenuが開いているかどうか
var openConsole = false;	//shellが開いたかどうか

function init(){
   $("#exportTextArea").val("");
   $("#powerSwitch").bootstrapSwitch('size', 'normal');
   $("#ciscoSwitch").bootstrapSwitch('size', 'normal');
	if(($("#ciscoSwitch").bootstrapSwitch('state')) == true){  //ciscoライク表示スイッチがオンの場合
 		nodeStyle = CISCO;
   	}
	else{
		nodeStyle = CIRCLE;
	}
  //WebSocketエミュレート
  		//接続時
  initok = true;
  	serverHost = "Host";
  	serverPortNum = "PortNum";
  	$("#connectServerHostCaption").text("ネットワーク作成モード");

    update();
}

//送信処理
function send(msgType,msg){
  console.log(sendMsg);
}

function reloadDiag(){
  update();
}


//各種イベント系
$(document).ready(function(){

  //ciscoSwitchボタン
  $(".ciscolabel").click(function(){
	  if(($("#ciscoSwitch").bootstrapSwitch('state')) == true){  //falseだったものがクリックされたらtrueになるため
		nodeStyle = CIRCLE;
	  }
	  else{
		nodeStyle = CISCO;
	  }
	  update();

	  $("#ciscoSwitch").bootstrapSwitch('toggleState');
  });

  //machinePropertyのdeleteボタン
  $("#machineDelete").click(function(){
	confirm_addHead("マシンの削除");
	confirm_addBody("以下のマシンを削除します。よろしいですか？");
	confirm_addBody("・" + $("#machineProperty .name .name").val());
	confirm_addCmd('jail_delete($("#machineProperty .name .name").val());');
	confirm_show();
  });


  //l3submitボタン
  $("#l3Form").submit(function(){
	var data = {"epair" : $("#l3Form .link").text(), "ipaddr" : $("#l3Form .ipaddr").val(), "ipmask" : $("#l3Form .ipmask").val(), "ip6addr" : $("#l3Form .ip6addr").val(), "ip6mask" : $("#l3Form .ip6mask").val(), "as" : $("#l3Form .as").val()};
	$("#l3Modal").modal("hide");
    diag_setL3(data);
  });

  //deleteAllMachineボタン
  $("#deleteAllMachine").click(function(){
	confirm_addHead("全マシンの削除");
	confirm_addBody("全てのマシンを削除します。よろしいですか？");
	confirm_addCmd("jail_delete('_all');");
	confirm_show();
  });

  //deleteAllNetworkボタン
  $("#deleteAllNetwork").click(function(){
	confirm_addHead("全ネットワークの削除");
	confirm_addBody("全てのネットワークを削除します。よろしいですか？");
	confirm_addCmd("diag_deleteLink('_all');");
	confirm_show();
  });

	//簡易作成ボタン
  $("#easyServerBtn").click(function(){
	jail_easyCreate(SERVER);
  });

  $("#easyRouterBtn").click(function(){
      jail_easyCreate(ROUTER);
  });

  $("#easySwitchBtn").click(function(){
      jail_easyCreate(SWITCH);
  });

  $("#l3inputData").submit(function(e){
  	console.log("aaa");
  	e.preventDefault();
  });





  //モーダルが開いた時のイベント
  //exportモーダルが開いたら
  $('#exportModal').on('shown.bs.modal', function() {
    vexport();
  });

  //モーダルが消えた場合のイベント
  //exportモーダルが消えたら
  $("#exportModal").on("hidden.bs.modal", function(){
	$("#exportTextArea").val("");
  });


	//入力イベント
	//l3inputData
	//カーソル、Tab、Shift以外のkeyupを認める
	$("body").on('keyup', "#l3inputData input", function(e){
		if ($(this).val().length == 3 && e.keyCode != 9 && e.keyCode != 16 && !(37 <= e.keyCode && e.keyCode <= 40) ) { // 次入力欄にフォーカス移動
		//	$('#l3inputData .ipaddr2').focus();
			if( $(this).hasClass("ipaddr4") ){
				$("#l3inputData .ipmask1").focus();
			}else{
				$(this).next().focus();
			}
		}
	});

	//ipmask
	//ipmaskフィールドにフォーカスが当たった時、一度だけmaskを自動入力する。自動入力したらhiddenフィールドにmaskパラメータを付加する
	$("body").on('focus', "#l3inputData .ipmask1", function(e){
		if(!$("#l3inputData .param").hasClass("mask")){
			if($("#l3inputData .ipaddr1").val() == "10"){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("0");
				$("#l3inputData .ipmask3").val("0");
				$("#l3inputData .ipmask4").val("0");
			}else if($("#l3inputData .ipaddr1").val() == "172" && (16 <= parseInt($("#l3inputData .ipaddr2").val(),10) && parseInt($("#l3inputData .ipaddr2").val(),10) <= 31) ){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("255");
				$("#l3inputData .ipmask3").val("0");
				$("#l3inputData .ipmask4").val("0");
			}else if($("#l3inputData .ipaddr1").val() == "192" && $("#l3inputData .ipaddr2").val() == "168"){
				$("#l3inputData .ipmask1").val("255");
				$("#l3inputData .ipmask2").val("255");
				$("#l3inputData .ipmask3").val("255");
				$("#l3inputData .ipmask4").val("0");
			}
		$("#l3inputData .param").addClass("mask");
		}
	});


	//その他

	//contextmenuを閉じる
	$(document).click(function() {
		if(openContext){
			context_hide();
			openContext = false;
		}
	});

	//test
});


//その他関数


//eval
function cmdEval(str){
  eval(str);
}

//IPアドレスモーダル
function l3Modal_show(name,epair){
	$("#l3Form .name").text(name);
	$("#l3Form .link").text(epair);
	$("#l3Modal").modal("show");
}


//contextを形成する

function context_init(){
    $("#contextMenu .dropdown-menu").empty();
}

function context_addList(caption,func){
	$("#contextMenu .dropdown-menu").append('<li><a "tabindex="-1" href="javascript:' + func + ';context_hide();">' + caption + '</a></li>');
}

function context_show(){
	$("#contextMenu").css({
		display: "block",
		left: d3.event.pageX,
		top: d3.event.pageY
	});
}

function context_divider(){
	$("#contextMenu .dropdown-menu").append('<li class="divider"></li>');
}

function context_hide(){
	$("#contextMenu").hide();
	$("#contextMenu .dropdown-menu").empty();
}

function context_nest(caption, array){
	var str="";
	str +='<li class="dropdown-submenu">\n';
	str +='	<a tabindex="-1" href="#">' + caption + '</a>\n';
	str +='	<ul class="dropdown-menu">\n';
	array.forEach(function(value,index){
		str +='		<li><a tabindex="-1" href="javascript:' + value.func + ';context_hide();">' + value.caption + '</a></li>\n';
	});
	str +='	</ul>\n'
	str +='</li>\n';
	$("#contextMenu .dropdown-menu").append(str);
}
