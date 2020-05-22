# newtifyd

This project aims at making a slick and modern notification daemon.

## Screenshots

<center>
<img src=img/screen1.png alt=screenshot-spotify></img>
</center>

## Running

Node and npm are required.

First time:
```bash
git clone https://github.com/FliiFe/newtifyd.git
cd newtifyd
npm i
npm run build
```

Then to start the daemon
```bash
npm run start
```

You need to make sure no other notification daemon is running.

## TODO

- [ ] Make packaging easier & distribute binaries
- [ ] Support `image-data` hint
- [ ] Custom middlewares
- [ ] Custom CSS
