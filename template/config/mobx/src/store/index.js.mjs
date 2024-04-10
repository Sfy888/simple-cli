import { observable, runInAction, makeAutoObservable } from "mobx";

class Normal {
//公共属性，或者可以理解为多页面需要使用的属性
  singlePrice = 0.07;
  doublePrice = 0.1;
  order = {};
  isNeedPrint = false;
  eqId = 1;

//更改属性的方法
  changeSinglePrice(price) {
    this.singlePrice = price;
  }
  changeDoublePrice(price) {
    this.doublePrice = price;
  }
  changeEq(id) {
    this.eqId = id;
  }
  setOrder(item) {
    this.order = item;
  }
  setNeedPrint(status) {
    this.isNeedPrint = status;
  }
  clearOrder() {
    this.order = {};
  }
//不要漏了这个
  constructor() {
    makeAutoObservable(this);
  }
}
//导出 new 对象名
export default new Normal();
