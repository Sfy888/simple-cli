import { observable, runInAction, makeAutoObservable } from "mobx";

class Normal {
//公共属性，或者可以理解为多页面需要使用的属性
  singlePrice: number = 0.07;
  doublePrice: number = 0.1;
  order = {};
  isNeedPrint: boolean = false;
  eqId: number = 1;

//更改属性的方法
  changeSinglePrice(price: number) {
    this.singlePrice = price;
  }
  changeDoublePrice(price: number) {
    this.doublePrice = price;
  }
  changeEq(id: number) {
    this.eqId = id;
  }
  setOrder(item: any) {
    this.order = item;
  }
  setNeedPrint(status: boolean) {
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
