
var Server = function(){
    var jail = new JailServer();
}

Server.prototype.recv = function(jsonMsg){
    if(jsonMsg.msgType == SERVER){
        this.machine(jsonMsg.data);
    }
}

Server.prototype.machine = function(data){
    if(data.mode == "jail"){
        jail.recv(data);
    }
}


var JailServer = function(){
}
