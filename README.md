# dyi - David's yarn installer
> A custom installer made by me, David

## Installation

yarn and yarn-dedupe are peer dependencies to dyi

```shell
npm -g i dyi yarn yarn-dedupe
```

## Usage

`dyi` installs and remove packages using `yarn`.

```shell
dyi -a react react-dom -d ts-node typescript -r babel 
```

Is the equivalent of running
```shell
yarn add react react-dom
yarn add ts-node typescript -D
yarn remove babel
yarn-dedupe
yarn
```

but in just one command. Convenient!
