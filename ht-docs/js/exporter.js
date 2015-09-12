var op = "shu";

function vexport(){
	var exporter = new Exporter();

	exporter.addLines(exporter.header);
    if(linkDB.length === 0 && l3DB.length === 0 && machineDB.length === 0){
	//	this.addLines("#何もない");
		return;
	}


/*
	Jailの作成
	/jails/にjailnameディレクトリが存在しない場合はmkserver, mkrouterを用いてjailディレクトリを作成する。
 */
 	if(machineDB.length === 0){
	 	return;
 	}
	var jaillines = "#create Jail.\n";

	machineDB.forEach(function(jail,index){
      jaillines +=  exporter.mkJail(jail.name, jail.type);
    });
	exporter.addLines(jaillines + "\n\n");

/*
	Jailの起動
 */
	var startjaillines = "#start Jail.\n";
 	machineDB.forEach(function(jail,index){
   		startjaillines +=  exporter.startJail(jail.name, jail.type);
 	});
	exporter.addLines(startjaillines + "\n\n");

/*
	linkDBの配列の最初から、vepair変数をepair0, epair1・・・と設定していき、l3DBのvepairをlinkDBの元の"epair"を頼りにvepairを設定していく
 */
 	linkDB.forEach(function(link, index){
		linkDB[index].vepair = "epair" + index;
			l3DB.forEach(function(l3, idx){
				if(l3DB[idx].epair == linkDB[index].epair + "a"){
					l3DB[idx].vepair = linkDB[index].vepair + "a";
				}
				if(l3DB[idx].epair == linkDB[index].epair + "b"){
					l3DB[idx].vepair = linkDB[index].vepair + "b";
				}
	    	});
 	});

/*
	linkの作成
 */
	if(linkDB.length === 0){
		return;
	}

	var linklines = "#create link.\n";

	linkDB.forEach(function(link, index){
      linklines +=  exporter.mkLink(link.vepair, link.source, link.target);
    });
	exporter.addLines(linklines + "\n\n");

/*
	IPアドレスの設定
 */
 	if(l3DB.length === 0){
	 	return;
 	}

	var l3lines = "#set IPAddr.\n";

	l3DB.forEach(function(l3, index){
      l3lines +=  exporter.setL3(l3.name, l3.vepair, l3.ipaddr, l3.ipmask, l3.ip6addr, l3.ip6mask, l3.as);
    });
	exporter.addLines(l3lines + "\n\n");

/*
	デフォルトゲートウェイの設定
 */
	var gwlines = "#set Gateway.\n";

	machineDB.forEach(function(jail,index){
      gwlines +=  exporter.setGw(jail.name, jail.gw);
    });
	exporter.addLines(gwlines + "\n\n");

/*
	フッター
 */
	exporter.addLines(exporter.footer);
}

var Exporter = function(){
	this.shell = "/bin/sh";
	this.shebang = "#!/usr/local/bin/ruby";
	this.header = this.shebang
					+ "\n#@shutingrz\n\n"
					+ "require File.expand_path(File.dirname(__FILE__) + '/vitocha.rb')\n\n"
					+ "# jails path\n"
					+ "$jails='/jails'\n\n"
					+ "#Operator is shutingrz!!\n"
					+ op + "=Operator.new\n\n\n";

	this.footer = ''
				+ '# for DUMMYNET\n'
				+ 'system("sysctl net.link.bridge.ipfw=1")\n\n'

				+ '# make nwdiag\n'
				+ 'puts "Now I\'m drawing network diagram!"\n'
				+ 'f=open("#{$jails}/data/net.diag","w")\n'
				+ '  f.puts ' + op + '.gendiag\n'
				+ 'f.close\n\n'

				+ '# make html\n'
				+ 'f=open("#{$jails}/data/index.html","w")\n'
				+ '  f.puts ' + op + '.genhtml\n'
				+ 'f.close\n\n'

				+ 'system("nwdiag -o #{$jails}/data/net.png #{$jails}/data/net.diag")\n\n'

				+ 'puts "Finish!"';
};

Exporter.prototype.addLines = function(lines){
	$("#exportTextArea").val($("#exportTextArea").val()+lines);
}

Exporter.prototype.exportJail = function(machineDB){
	var jaillines = "";

	machineDB.forEach(function(jail,index){
      jaillines = jaillines +  mkJail(jail.name, jail.type);
    });

	return jaillines;
};

Exporter.prototype.mkJail = function(jailName, type){
	var mkJailCmd = "";
	if (type == SERVER){
		mkJailCmd = "mkserver";
	}else{
		mkJailCmd = "mkrouter";
	}
	mkJailCmd += " " + jailName;

	var mkJailStr = "if File.exist?('/jails/" + jailName +"') == false then\n"
				+	"\tsystem('" + this.shell + " " + mkJailCmd + "')\n"
				+	"end\n";

	return mkJailStr;
};

Exporter.prototype.startJail = function(jailname, type){
	var setupFunc = "";
	switch (type){
		case SERVER:
			setupFunc = "setupserver";
			break;
		case ROUTER:
			setupFunc = "setuprouter";
			break;
		case SWITCH:
			setupFunc = "setupbridge";
			break;
		default:
			setupFunc = "setupserver";
	}

	var startJailStr = op + "." + setupFunc + "('" + jailname + "')\n";

	return startJailStr;
}

Exporter.prototype.mkLink = function(epair, source, target){
	var returnParam = new Array();

	var linkStr = "epaira, epairb=" + op + ".createpair\n"
				+ op + ".connect('" + source + "', epaira)\n"
				+ op + ".connect('" + target + "', epairb)\n";

	return linkStr;
}

Exporter.prototype.setL3 = function(name, epair, ipaddr, ipmask, ip6addr, ip6mask, as){

	var l3Str = "";

	//IPv4 Addr
	if(ipaddr != "" && ipmask != ""){
	 	l3Str += op + ".assignip('" + name + "','" + epair + "','" + ipaddr + "','" + ipmask + "')\n";
	}

	//IPv6 Addr
	if(ip6addr != "" && ip6mask != ""){
	 	l3Str += op + ".assignip6('" + name + "','" + epair + "','" + ip6addr + "','" + ip6mask + "')\n";
	}

	//IPアドレス降っていなくてもインターフェースはupさせる。
	l3Str += 	op + ".up('" + name + "','" + epair + "')\n"


	return l3Str;
}

Exporter.prototype.setGw = function(name, gw){
	var gwStr="";

	if(gw != ""){
		gwStr = op + ".assigngw('" + name + "','" + gw + "')\n";
	}

	return gwStr;
}
