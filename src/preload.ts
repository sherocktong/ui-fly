import { contextBridge, ipcRenderer } from 'electron';

export interface CcDesignAPI {
  getEnv: (key: string) => string | undefined;
  platform: string;
}

const api: CcDesignAPI = {
  getEnv: (key: string) => ipcRenderer.sendSync('get-env', key),
  platform: process.platform,
};

contextBridge.exposeInMainWorld('ccDesign', api);
