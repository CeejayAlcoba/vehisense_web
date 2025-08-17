import { openDB, IDBPDatabase, DBSchema } from "idb";
import { VehicleLogs } from "../types/VehicleLogs";

type StoreName = "vehicleLogs";

export interface MyDB extends DBSchema {
  vehicleLogs: {
    key: number;
    value: { vehicleLogs: VehicleLogs[]; id: number };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>>;

export function initDB() {
  dbPromise = openDB<MyDB>("VehisenseDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("vehicleLogs")) {
        db.createObjectStore("vehicleLogs", { keyPath: "id" });
      }
    },
  });
}

export function _indexDbService() {
  initDB();

  const addItem = async <K extends StoreName>(
    storeName: K,
    item: MyDB[K]["value"]
  ): Promise<MyDB[K]["key"]> => {
    const db = await dbPromise;
    return db.add(storeName, item);
  };

  const getItem = async <K extends StoreName>(
    storeName: K,
    key: MyDB[K]["key"]
  ): Promise<MyDB[K]["value"] | undefined> => {
    const db = await dbPromise;
    return db.get(storeName, key);
  };

  const updateItem = async <K extends StoreName>(
    storeName: K,
    key: MyDB[K]["key"],
    updates: Partial<MyDB[K]["value"]>
  ): Promise<boolean> => {
    const db = await dbPromise;
    const item = await db.get(storeName, key);
    if (!item) return false;

    const updatedItem = { ...item, ...updates };
    await db.put(storeName, updatedItem);
    return true;
  };

  const deleteItem = async (
    storeName: StoreName,
    key: number | IDBKeyRange
  ): Promise<void> => {
    const db = await dbPromise;
    await db.delete(storeName, key);
  };

  const getAllItems = async <K extends StoreName>(
    storeName: K
  ): Promise<MyDB[K]["value"][]> => {
    const db = await dbPromise;
    return db.getAll(storeName);
  };

  const getItemsByFilter = async <K extends StoreName>(
    storeName: K,
    filterFn: (item: MyDB[K]["value"]) => boolean
  ): Promise<MyDB[K]["value"][]> => {
    const db = await dbPromise;
    const all = await db.getAll(storeName);
    return all.filter(filterFn);
  };

  const getSingleItemByFilter = async <K extends StoreName>(
    storeName: K,
    filterFn: (item: MyDB[K]["value"]) => boolean
  ): Promise<MyDB[K]["value"] | undefined> => {
    const db = await dbPromise;
    const all = await db.getAll(storeName);
    return all.find(filterFn);
  };

  const upsertItem = async <K extends StoreName>(
    storeName: K,
    item: MyDB[K]["value"] & { id: MyDB[K]["key"] }
  ): Promise<MyDB[K]["key"]> => {
    const db = await dbPromise;
    const existing = await db.get(storeName, item.id);
    if (existing) {
      await db.put(storeName, { ...existing, ...item });
      return item.id;
    } else {
      return db.add(storeName, item);
    }
  };

  return {
    addItem,
    getItem,
    updateItem,
    deleteItem,
    getAllItems,
    getItemsByFilter,
    getSingleItemByFilter,
    upsertItem,
  };
}

export const indexDbService = _indexDbService();
