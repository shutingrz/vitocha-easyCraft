var easyNumber = 0;

function jail_showDeleteModal(name){

    jail_deleteEpairWithJail(name);
    db_machine("delete", name);
    update();
}

function jail_deleteEpairWithJail(name){
    var flag = true;

    while(flag){
        var epair = db_link("linkwithjail", name);

        if(epair == null){
            break;
        }
        diag_deleteLink(epair);
    }

}


function jail_easyCreate(machineType){
    var jailName = "";
    switch(machineType){
        case SERVER:
            jailName = "Server";
            break;
        case ROUTER:
            jailName = "Router";
            break;
        case SWITCH:
            jailName = "Switch";
            break;
        default:
            jailName = "Machine";
    }
    jailName = jailName + jail_easyNumber();
    db_machine("insert",{name:jailName, type:machineType, comment:"easyCreate"});
    update();
}

function jail_easyNumber(){
    easyNumber++;
    return easyNumber;
}
