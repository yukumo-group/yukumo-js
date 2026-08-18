import type { Heap, V86Emu } from "../../emu/index.js";
import {
  malloc_hook,
  free_hook,
  heapAlloc_hook,
  heapFree_hook,
  heapReAlloc_hook,
  heapSize_hook,
  getProcessHeap_hook,
  stdcall_return0,
  stdcall_return1,
  stdcall_identity,
  queryPerformanceCounter_hook,
  getSystemTimeAsFileTime_hook,
  NATIVE_CLIB_SYMBOLS,
} from "../../emu/index.js";

type HookHandler = (emu: V86Emu, ...args: any[]) => void;

export type JsHook = {
  handler: HookHandler;
  arg?: unknown;
};

export function createJsHookMap(heap: Heap): {
  [key: string]: JsHook;
} {
  return {
    malloc: { handler: malloc_hook(heap) },
    free: { handler: free_hook(heap) },
    HeapAlloc: { handler: heapAlloc_hook(heap) },
    HeapFree: { handler: heapFree_hook(heap) },
    HeapReAlloc: { handler: heapReAlloc_hook(heap) },
    GetProcessHeap: { handler: getProcessHeap_hook },
    HeapSize: { handler: heapSize_hook(heap) },
    EncodePointer: { handler: stdcall_identity(4) },
    DecodePointer: { handler: stdcall_identity(4) },
    IsProcessorFeaturePresent: { handler: stdcall_return0(4) },
    TlsAlloc: { handler: stdcall_return0(0) },
    TlsGetValue: { handler: stdcall_return0(4) },
    TlsSetValue: { handler: stdcall_return1(8) },
    TlsFree: { handler: stdcall_return1(4) },
    GetLastError: { handler: stdcall_return0(0) },
    SetLastError: { handler: stdcall_return0(4) },
    InitializeCriticalSectionAndSpinCount: { handler: stdcall_return1(8) },
    EnterCriticalSection: { handler: stdcall_return0(4) },
    LeaveCriticalSection: { handler: stdcall_return0(4) },
    DeleteCriticalSection: { handler: stdcall_return0(4) },
    QueryPerformanceCounter: { handler: queryPerformanceCounter_hook },
    GetCurrentProcessId: { handler: stdcall_return1(0) },
    GetCurrentThreadId: { handler: stdcall_return1(0) },
    GetSystemTimeAsFileTime: { handler: getSystemTimeAsFileTime_hook },
    InitializeSListHead: { handler: stdcall_return0(4) },
    IsDebuggerPresent: { handler: stdcall_return0(0) },
    GetCurrentProcess: { handler: stdcall_return1(0) },
    InterlockedFlushSList: { handler: stdcall_return0(4) },
  };
}

export const NATIVE_IAT_HOOKS: { [key: string]: number } = {
  strncmp: NATIVE_CLIB_SYMBOLS.strncmp,
  strncpy: NATIVE_CLIB_SYMBOLS.strncpy,
  strtok: NATIVE_CLIB_SYMBOLS.strtok,
  strchr: NATIVE_CLIB_SYMBOLS.strchr,
  stricmp: NATIVE_CLIB_SYMBOLS.stricmp,
  _stricmp: NATIVE_CLIB_SYMBOLS.stricmp,
  _initterm: NATIVE_CLIB_SYMBOLS._initterm,
  initterm: NATIVE_CLIB_SYMBOLS._initterm,
  __CxxFrameHandler: NATIVE_CLIB_SYMBOLS.__CxxFrameHandler,
  DisableThreadLibraryCalls: NATIVE_CLIB_SYMBOLS.DisableThreadLibraryCalls,
};
