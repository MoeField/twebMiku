import IDBStorage, { IDBOptions } from "./idb";
import { DatabaseStore, DatabaseStoreName } from "./mtproto/mtproto_config";

export default class AppStorage<Storage extends Record<string, any>/* Storage extends {[name: string]: any} *//* Storage extends Record<string, any> */> {
  private storage: IDBStorage;//new CacheStorageController('session');

  //private cache: Partial<{[key: string]: Storage[typeof key]}> = {};
  private cache: Partial<Storage> = {};
  private useStorage = true;

  constructor(storageOptions: Omit<IDBOptions, 'storeName' | 'stores'> & {stores?: DatabaseStore[], storeName: DatabaseStoreName}) {
    this.storage = new IDBStorage(storageOptions);
  }

  public getCache() {
    return this.cache;
  }

  public getFromCache(key: keyof Storage) {
    return this.cache[key];
  }

  public setToCache(key: keyof Storage, value: Storage[typeof key]) {
    return this.cache[key] = value;
  }

  public async get(key: keyof Storage): Promise<Storage[typeof key]> {
    if(this.cache.hasOwnProperty(key)) {
      return this.getFromCache(key);
    } else if(this.useStorage) {
      let value: any;
      try {
        value = await this.storage.get(key as string);
        //console.log('[AS]: get result:', key, value);
        //value = JSON.parse(value);
      } catch(e) {
        if(e !== 'NO_ENTRY_FOUND') {
          this.useStorage = false;
          value = undefined;
          console.error('[AS]: get error:', e, key, value);
        }
      }

      return this.cache[key] = value;
    } else {
      throw 'something went wrong';
    }
  }

  public async set(obj: Partial<Storage>) {
    //console.log('storageSetValue', obj, callback, arguments);

    for(let key in obj) {
      if(obj.hasOwnProperty(key)) {
        let value = obj[key];
        this.setToCache(key, value);

        // let perf = /* DEBUG */false ? performance.now() : 0;
        // value = JSON.stringify(value);

        // if(perf) {
        //   let elapsedTime = performance.now() - perf;
        //   if(elapsedTime > 10) {
        //     console.warn('LocalStorage set: stringify time by JSON.stringify:', elapsedTime, key);
        //   }
        // }
        
        /* perf = performance.now();
        value = stringify(value);
        console.log('LocalStorage set: stringify time by own stringify:', performance.now() - perf); */

        if(this.useStorage) {
          try {
            //console.log('setItem: will set', key/* , value */);
            //await this.cacheStorage.delete(key); // * try to prevent memory leak in Chrome leading to 'Unexpected internal error.'
            //await this.storage.save(key, new Response(value, {headers: {'Content-Type': 'application/json'}}));
            await this.storage.save(key, value);
            //console.log('setItem: have set', key/* , value */);
          } catch(e) {
            //this.useCS = false;
            console.error('[AS]: set error:', e, key/* , value */);
          }
        }
      }
    }
  }

  public async remove(key: keyof Storage) {
    delete this.cache[key];
    if(this.useStorage) {
      try {
        await this.storage.delete(key as string);
      } catch(e) {
        this.useStorage = false;
        console.error('[AS]: remove error:', e);
      }
    }
  }

  public clear() {
    return this.storage.deleteAll();
  }
}
