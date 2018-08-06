PREFIX ?= /usr
SHARED ?= /usr/share
PKG_CONFIG ?= pkg-config

SERVICEDIR_DBUS ?= $(shell $(PKG_CONFIG) dbus-1 --variable=session_bus_services_dir)
SERVICEDIR_DBUS := ${SERVICEDIR_DBUS}
ifeq (,${SERVICEDIR_DBUS})
$(error "Failed to query $(PKG_CONFIG) for package 'dbus-1'!")
endif

build:
	npm i
	npm run build

install:
	@sed "s|##PREFIX##|$(DESTDIR)$(PREFIX)|" ./org.fliife.newtifyd.service.in > ./org.fliife.newtifyd.service
	@sed "s|##SHARED##|$(DESTDIR)$(SHARED)|" ./newtify.in > ./newtify
	install -Dm755 newtify ${DESTDIR}${PREFIX}/bin/newtify
	install -Dm644 org.fliife.newtifyd.service ${DESTDIR}${SERVICEDIR_DBUS}/org.fliife.newtifyd.service
	cp -r . ${DESTDIR}${SHARED}/newtifyd/
