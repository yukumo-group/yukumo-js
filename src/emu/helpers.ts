import { V86Emu } from "./v86.js";

export function hook_lib_call(
  emu: V86Emu,
  address: number,
  callback: (emu: V86Emu, ...args: any[]) => void,
  arg: any = null
) {
  emu.set_hook(address, (emu: V86Emu, userData: any) => {
    callback(emu, userData);
  }, arg);
}

export function reg_read_uint32(emu: V86Emu, reg: number): number {
  return emu.reg_read(reg);
}

export function reg_write_uint32(emu: V86Emu, reg: number, value: number) {
  emu.reg_write(reg, value);
}

export function align_to_0x1000(number: number): number {
  return Math.floor((number + 0xfff) / 0x1000) * 0x1000;
}
