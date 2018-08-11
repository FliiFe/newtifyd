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
	cd front && npm i
	npm run build

install:
	@sed "s|##PREFIX##|$(DESTDIR)$(PREFIX)|" ./org.fliife.newtifyd.service.in > ./org.fliife.newtifyd.service
	@sed "s|##SHARED##|$(DESTDIR)$(SHARED)|" ./newtify.in > ./newtify
	install -Dm755 newtify ${DESTDIR}${PREFIX}/bin/newtify
	install -Dm644 org.fliife.newtifyd.service ${DESTDIR}${SERVICEDIR_DBUS}/org.fliife.newtifyd.service
	mkdir -p ${DESTDIR}${SHARED}/newtifyd
	cp -r ./lib ./node_modules ./front ./package.json ./LICENSE ./org.fliife.newtifyd.service ./package-lock.json ./README.md ${DESTDIR}${SHARED}/newtifyd

clean:
	rm lib/*.js
	rm ./org.fliife.newtifyd.service
	rm ./newtify
	rm -rf front/dist/*
