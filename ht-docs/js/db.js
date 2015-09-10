/*
dbval

machineDB
templateDB
flavorDB

*/



//sql処理
function db(mode,control,msg){
  if(mode == "machine"){
    db_machine(control,msg)
  }
  else if(mode == "template"){
    db_template(control,msg)
  }

}

function db_machine(control,msg){

  if (control == "delete"){
    if (msg == "all"){
      machineDB = [];
    }
    else{
      machineDB.splice(db_selectDB("machine",msg),1);
    }
  }
  else if (control == "select"){
    if (msg == "all"){
      return machineDB;
    }
    else{
      return machineDB[db_selectDB("machine",msg)];
    }
  }
  else if (control == "insert"){
    machineDB.push({name: msg.name, type: msg.type, template: "0", flavour: "0", comment: msg.comment, createTime: "0", modifyTime: "0", boot: "1"});
  }
  else if (control == "boot"){
    machineDB[db_selectDB("machine",msg.name)].boot = msg.state;
  }
}

function db_template(control,msg){
  if (control == "delete"){
    if (msg == "all"){
      templateDB = [];
    }else{
      templateDB.splice(db_selectDB("template",msg),1);
    }
  }

  else if (control == "select"){
    if (msg == "all"){
      return templateDB;
    }
    else{
      return templateDB[db_selectDB("template",msg)];
    }
  }

  else if (control == "insert"){
    templateDB.push({name: msg.name, pkg: msg.pkg});
  }

}

function db_link(control,msg){

  if (control == "delete"){
    if (msg == "all"){
      linkDB = [];
    }
    else{
      linkDB.splice(db_selectDB("link",msg),1);
    }
  }
  else if (control == "select"){
    if (msg == "all"){
      return linkDB;
  }else{
      return linkDB[db_selectDB("link",msg)];
    }
  }else if(control == "linkwithjail"){
      var idx =  db_selectDB(control, msg);

      if(idx == null){
          return null;
      }else{
          return linkDB[idx].epair;
      }
  }else if (control == "insert"){
    linkDB.push( {source: msg.source, target: msg.target, epair: msg.epair});
  }
}

function db_l3(control, msg){
    if (control == "delete"){
      if (msg == "all"){
        l3DB = [];
      }
      else{
        l3DB.splice(db_selectDB("l3",msg),1);
      }
    }
    else if (control == "select"){
      if (msg == "all"){
        return l3DB;
      }else{
        return l3DB[db_selectDB("l3",msg)];
      }
    }else if (control == "insert"){
    //    var epairF = msg.epair.replace("epair","");
//      l3DB.push( {source: msg.source, target: msg.target, epair: msg.epair});
        l3DB.push( {epair:msg.epair, type:msg.type, name: msg.name, ipaddr: msg.ipaddr, ipmask: msg.ipmask, ip6addr: msg.ip6addr, ip6mask: msg.ip6mask})
    }
}

function db_selectDB(control,name){
  idx = null;

  if(control == "machine"){
    machineDB.forEach(function(values,index){
      if(name == values.name){
        idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
      }
    });
  }else if(control == "template"){
    templateDB.forEach(function(values,index){
      if(name == values.name){
        idx = index;    //ここでreturnしても恐らくスコープの関係で値返せないので外の変数に渡す
      }
    });
  }else if(control == "l3"){
    l3DB.forEach(function(values,index){
      if(name == values.epair){
        idx = index;
      }
    });
  }else if(control == "link"){
    linkDB.forEach(function(values,index){
        if(name == values.epair){
            idx = index;
        }
    });
}  else if(control == "linkwithjail"){
    linkDB.forEach(function(values, index){
        if(name == values.source || name == values.target){
            idx = index;
        }
    });
}
  return idx;
}
