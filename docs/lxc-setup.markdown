System
------

	sudo apt-get update && sudo apt-get upgrade


Container
---------

	sudo apt-get install lxc
	
	sudo lxc-checkconfig
	>>> some yellow (mising) and red (required)


Kernel
------

For Ubuntu 12.04

	sudo apt-get install linux-virtual grub-legacy-ec2
	
select `xvda`

Then:

	sudo nano /boot/grub/menu.lst

edit:

	- # defoptions=console=hvc0
	+ # defoptions=console=hvc0 rootflags=nobarrier

And then:

	sudo update-grub-legacy-ec2


Linode
------

	uname -m

Enter Linode Configuration Profile in your Linode Manager. Change Kernel to pv-grub-x86_32 or pv-grub-x86_64, depending on installed kernel and userspace.

Click Reboot.



LXC
---


	sudo lxc-checkconfig
	# >>> all green and enabled
	
	ifconfig | grep lxc
	# >>> lxcbr0 ...
	
	sudo lxc-create -t ubuntu -n demo1
	# >>> lots of packages
	
	# the template
	sudo du -sh /var/cache/lxc/
	# >>> 363M   /var/cache/lxc/
	
	# the container
	sudo du -sh /var/lib/lxc/demo1/
	# >>> 364M	/var/lib/lxc/demo1/
	
	
	sudo lxc-start -n demo1
	# ubuntu ubuntu
	ping 8.8.8.8
	ping ya.ru
	
	+Q

later

	sudo lxc-console -n demo1
	# to exit: ctrl+a q

	sudo ln -s /var/lib/lxc/demo1/config /etc/lxc/auto/demo1.conf



See also
--------

http://www.linode.com/wiki/index.php/PV-GRUB