#!/usr/local/bin/ruby
#
# T.Suzuki
#


require File.expand_path(File.dirname(__FILE__) + '/vitocha.rb')

# jails path
$jails="/jails"

################################################################
# Main
################################################################

################################################################
# tomocha as a operator
################################################################

tomocha=Operator.new

################################################################
# Setup Bridge
#  realsever-epair0a-epair0b-bridge0
################################################################

tomocha.setupbridge("bridge0")
epaira,epairb,n=tomocha.createpair
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
# 
ifconfig("#{epaira} inet 192.168.11.254 netmask 255.255.255.0")
ifconfig("#{epaira} up")
#

##########################################################################
# Connect Servers
##########################################################################

# server_nom1
tomocha.setupserver("server_nom1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_nom1",epaira)
tomocha.assignip("server_nom1",epaira,"192.168.11.1","255.255.255.0")
tomocha.up("server_nom1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_nom1","192.168.11.254")

# server_orz1
tomocha.setupserver("server_orz1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_orz1",epaira)
tomocha.assignip("server_orz1",epaira,"192.168.11.2","255.255.255.128")
tomocha.up("server_orz1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_orz1","192.168.11.254")

# server_sld_nom1
tomocha.setupserver("server_sld_nom1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_sld_nom1",epaira)
tomocha.assignip("server_sld_nom1",epaira,"192.168.11.11","255.255.255.0")
tomocha.up("server_sld_nom1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_sld_nom1","192.168.11.254")

# server_sld_orz1
tomocha.setupserver("server_sld_orz1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_sld_orz1",epaira)
tomocha.assignip("server_sld_orz1",epaira,"192.168.11.12","255.255.255.0")
tomocha.up("server_sld_nom1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_sld_orz1","192.168.11.254")

# server_bind1
tomocha.setupserver("server_bind1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_bind1",epaira)
tomocha.assignip("server_bind1",epaira,"192.168.11.21","255.255.255.0")
tomocha.up("server_bind1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_bind1","192.168.11.254")

# server_unbound1
tomocha.setupserver("server_unbound1")
epaira,epairb,n=tomocha.createpair
tomocha.connect("server_unbound1",epaira)
tomocha.assignip("server_unbound1",epaira,"192.168.11.22","255.255.255.0")
tomocha.up("server_unbound1",epaira)
tomocha.connect("bridge0",epairb)
tomocha.up("bridge0",epairb)
tomocha.assigngw("server_unbound1","192.168.11.254")

# start daemons
tomocha.start("server_nom1","nsd")
tomocha.start("server_orz1","nsd")
tomocha.start("server_sld_nom1","nsd")
tomocha.start("server_sld_orz1","nsd")
tomocha.start("server_bind1","named")
tomocha.start("server_unbound1","unbound")

# for DUMMYNET
system("sysctl net.link.bridge.ipfw=1")

# make nwdiag
puts "Now I'm drawing network diagram!"
f=open("#{$jails}/data/net.diag","w")
  f.puts tomocha.gendiag
f.close

# make html
f=open("#{$jails}/data/index.html","w")
  f.puts tomocha.genhtml
f.close

system("nwdiag -o #{$jails}/data/net.png #{$jails}/data/net.diag")

puts "Finish!"

