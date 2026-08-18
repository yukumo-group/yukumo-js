export {
  malloc_hook,
  free_hook,
  heapAlloc_hook,
  heapFree_hook,
  heapReAlloc_hook,
  heapSize_hook,
} from "./heap.js";

export {
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
  multiByteToWideChar_hook,
  wideCharToMultiByte_hook,
} from "./codepage.js";

export {
  createFileW_hook,
  readFile_hook,
  getFileSizeEx_hook,
  setFilePointerEx_hook,
  getFileType_hook,
  getFileInformationByHandle_hook,
  closeHandle_hook,
} from "./fs.js";

export {
  getProcessHeap_hook,
  stdcall_return,
  stdcall_zero_struct,
  stdcall_unsupported,
  stdcall_return0,
  stdcall_return1,
  stdcall_identity,
  queryPerformanceCounter_hook,
  getSystemTimeAsFileTime_hook,
} from "./win32.js";
