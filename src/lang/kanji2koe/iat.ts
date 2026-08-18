/**
 * Import table stubs for AqKanji2Koe.dll.
 *
 * The DLL statically links the CRT, so KERNEL32 is its only import. Anything
 * not listed here raises a descriptive error instead of crashing the guest.
 */

import {
  V86Emu,
  Heap,
  VirtualFS,
  REG_EAX,
  get_arg,
  ret_n,
  reg_write_uint32,
  stdcall_zero_struct,
  malloc_hook,
  free_hook,
  heapAlloc_hook,
  heapFree_hook,
  heapReAlloc_hook,
  heapSize_hook,
  getProcessHeap_hook,
  queryPerformanceCounter_hook,
  getSystemTimeAsFileTime_hook,
  createFileW_hook,
  readFile_hook,
  getFileSizeEx_hook,
  setFilePointerEx_hook,
  getFileType_hook,
  getFileInformationByHandle_hook,
  closeHandle_hook,
  multiByteToWideChar_hook,
  wideCharToMultiByte_hook,
  stdcall_return,
  stdcall_return0,
  stdcall_return1,
  stdcall_identity,
  stdcall_unsupported,
} from "../../emu/index.js";

export type Hook = (emu: V86Emu, ...args: any[]) => void;

export interface JsHook {
  handler: Hook;
  arg?: unknown;
}

const INVALID_HANDLE_VALUE = 0xffff_ffff;
const DRIVE_FIXED = 3;
const CP_UTF8 = 65001;

/** Imports that must never be reached; reaching them means a bad emulation state. */
const UNSUPPORTED = [
  "ExitProcess",
  "TerminateProcess",
  "RaiseException",
  "RtlUnwind",
  "UnhandledExceptionFilter",
];

/** STARTUPINFOW, zeroed out for the CRT's startup bookkeeping. */
const STARTUPINFOW_SIZE = 68;
const CPINFO_SIZE = 18;

/** CPINFO describing a single-byte code page. */
function getCPInfo_hook(emu: V86Emu) {
  const ptr = get_arg(emu, 1);
  if (ptr) {
    const info = new Uint8Array(CPINFO_SIZE);
    info[0] = 1; // MaxCharSize
    info[4] = 0x3f; // DefaultChar '?'
    emu.mem_write(ptr, info);
  }
  reg_write_uint32(emu, REG_EAX, 1);
  ret_n(emu, 8);
}

export function createHookMap(
  emu: V86Emu,
  heap: Heap,
  fs: VirtualFS
): Record<string, JsHook> {
  // Allocated up front so the returned pointers stay valid for the run.
  const emptyAnsi = heap.set_mem_value(emu, new Uint8Array(1));
  const emptyWide = heap.set_mem_value(emu, new Uint8Array(2));
  const emptyEnvironment = heap.set_mem_value(emu, new Uint8Array(4));

  const hooks: Record<string, JsHook> = {
    // Heap
    malloc: { handler: malloc_hook(heap) },
    free: { handler: free_hook(heap) },
    HeapAlloc: { handler: heapAlloc_hook(heap) },
    HeapFree: { handler: heapFree_hook(heap) },
    HeapReAlloc: { handler: heapReAlloc_hook(heap) },
    HeapSize: { handler: heapSize_hook(heap) },
    GetProcessHeap: { handler: getProcessHeap_hook },

    // File system
    CreateFileW: { handler: createFileW_hook(fs) },
    ReadFile: { handler: readFile_hook(fs) },
    GetFileSizeEx: { handler: getFileSizeEx_hook(fs) },
    SetFilePointerEx: { handler: setFilePointerEx_hook(fs) },
    GetFileType: { handler: getFileType_hook(fs) },
    GetFileInformationByHandle: { handler: getFileInformationByHandle_hook(fs) },
    CloseHandle: { handler: closeHandle_hook(fs) },
    GetDriveTypeW: { handler: stdcall_return(DRIVE_FIXED, 4) },
    FindNextFileW: { handler: stdcall_return0(8) },
    FindClose: { handler: stdcall_return1(4) },
    FlushFileBuffers: { handler: stdcall_return1(4) },
    SetEndOfFile: { handler: stdcall_return1(4) },
    GetCurrentDirectoryW: { handler: stdcall_return0(8) },

    // Console / stdio: the engine produces no output, so writes are swallowed.
    GetStdHandle: { handler: stdcall_return(INVALID_HANDLE_VALUE, 4) },
    SetStdHandle: { handler: stdcall_return1(8) },
    WriteFile: { handler: stdcall_return1(20) },
    WriteConsoleW: { handler: stdcall_return1(20) },
    GetConsoleCP: { handler: stdcall_return0(0) },
    GetConsoleMode: { handler: stdcall_return0(8) },

    // Code pages and locale: the engine never relies on CRT locale support.
    GetACP: { handler: stdcall_return(CP_UTF8, 0) },
    GetOEMCP: { handler: stdcall_return(CP_UTF8, 0) },
    IsValidCodePage: { handler: stdcall_return1(4) },
    GetCPInfo: { handler: getCPInfo_hook },
    CompareStringW: { handler: stdcall_return0(24) },
    LCMapStringW: { handler: stdcall_return0(24) },
    GetStringTypeW: { handler: stdcall_return0(16) },
    MultiByteToWideChar: { handler: multiByteToWideChar_hook },
    WideCharToMultiByte: { handler: wideCharToMultiByte_hook },

    // Threading / TLS
    TlsAlloc: { handler: stdcall_return0(0) },
    TlsGetValue: { handler: stdcall_return0(4) },
    TlsSetValue: { handler: stdcall_return1(8) },
    TlsFree: { handler: stdcall_return1(4) },
    InitializeCriticalSectionAndSpinCount: { handler: stdcall_return1(8) },
    EnterCriticalSection: { handler: stdcall_return0(4) },
    LeaveCriticalSection: { handler: stdcall_return0(4) },
    DeleteCriticalSection: { handler: stdcall_return0(4) },
    InitializeSListHead: { handler: stdcall_return0(4) },
    InterlockedFlushSList: { handler: stdcall_return0(4) },

    // Process / module
    GetCurrentProcess: { handler: stdcall_return1(0) },
    GetCurrentProcessId: { handler: stdcall_return1(0) },
    GetCurrentThreadId: { handler: stdcall_return1(0) },
    GetModuleHandleW: { handler: stdcall_return0(4) },
    GetModuleHandleExW: { handler: stdcall_return0(12) },
    GetModuleFileNameW: { handler: stdcall_return0(12) },
    FreeLibrary: { handler: stdcall_return1(4) },
    SetEnvironmentVariableW: { handler: stdcall_return1(8) },
    GetStartupInfoW: { handler: stdcall_zero_struct(STARTUPINFOW_SIZE, 4) },
    GetCommandLineA: { handler: stdcall_return(emptyAnsi, 0) },
    GetCommandLineW: { handler: stdcall_return(emptyWide, 0) },
    GetEnvironmentStringsW: { handler: stdcall_return(emptyEnvironment, 0) },
    FreeEnvironmentStringsW: { handler: stdcall_return1(4) },
    // Reporting every optional OS API as missing makes the CRT use its
    // built-in fallbacks rather than dispatching through a null pointer.
    LoadLibraryExW: { handler: stdcall_return0(12) },
    GetProcAddress: { handler: stdcall_return0(8) },

    // Time
    GetTimeZoneInformation: { handler: stdcall_return0(4) },
    SystemTimeToTzSpecificLocalTime: { handler: stdcall_return1(12) },
    FileTimeToSystemTime: { handler: stdcall_return1(8) },

    // Pipes / directory enumeration are not backed by the virtual filesystem.
    PeekNamedPipe: { handler: stdcall_return0(24) },
    FindFirstFileExW: { handler: stdcall_return(INVALID_HANDLE_VALUE, 24) },
    GetFullPathNameW: { handler: stdcall_return0(16) },
    ReadConsoleW: { handler: stdcall_return0(20) },

    // Misc runtime support
    GetLastError: { handler: stdcall_return0(0) },
    SetLastError: { handler: stdcall_return0(4) },
    EncodePointer: { handler: stdcall_identity(4) },
    DecodePointer: { handler: stdcall_identity(4) },
    IsProcessorFeaturePresent: { handler: stdcall_return0(4) },
    IsDebuggerPresent: { handler: stdcall_return0(0) },
    SetUnhandledExceptionFilter: { handler: stdcall_return0(4) },
    QueryPerformanceCounter: { handler: queryPerformanceCounter_hook },
    GetSystemTimeAsFileTime: { handler: getSystemTimeAsFileTime_hook },
  };

  for (const name of UNSUPPORTED) {
    hooks[name] = { handler: stdcall_unsupported(name) };
  }

  return hooks;
}
