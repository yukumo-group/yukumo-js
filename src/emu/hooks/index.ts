export {
  malloc_hook,
  free_hook,
  strncmp_hook,
  strncpy_hook,
  strtok_hook,
  strchr_hook,
  stricmp_hook,
  initterm_hook,
  cxx_frame_handler_hook,
  disable_thread_library_calls_hook,
} from "./clib.js";

export {
  heapAlloc_hook,
  heapFree_hook,
  heapReAlloc_hook,
  getProcessHeap_hook,
  stdcall_return0,
  stdcall_return1,
  stdcall_identity,
  queryPerformanceCounter_hook,
  getSystemTimeAsFileTime_hook,
} from "./win32.js";
