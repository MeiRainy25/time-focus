const DEFAULT_DB_NAME = "time-focus";
const DEFAULT_DB_VERSION = 3;
const DEFAULT_STORE_NAME = "focus-records";
const DEFAULT_CREATED_AT_INDEX = "createdAt";
const DEFAULT_TYPE_CREATED_AT_INDEX = "type-createdAt";

type IndexedDbKey = IDBValidKey | IDBKeyRange;

type OpenDbOptions = {
  dbName?: string;
  storeName?: string;
  version?: number;
};

type StoreOptions = OpenDbOptions & {
  mode?: IDBTransactionMode;
};

type PageOptions = OpenDbOptions & {
  direction?: IDBCursorDirection;
  indexName?: string;
  page?: number;
  pageSize?: number;
  query?: IDBValidKey | IDBKeyRange | null;
};

function ensureDefaultIndexes(store: IDBObjectStore) {
  if (!store.indexNames.contains(DEFAULT_CREATED_AT_INDEX)) {
    store.createIndex(DEFAULT_CREATED_AT_INDEX, DEFAULT_CREATED_AT_INDEX);
  }

  if (!store.indexNames.contains(DEFAULT_TYPE_CREATED_AT_INDEX)) {
    store.createIndex(DEFAULT_TYPE_CREATED_AT_INDEX, ["type", "createdAt"]);
  }
}

function openDatabase({
  dbName = DEFAULT_DB_NAME,
  storeName = DEFAULT_STORE_NAME,
  version = DEFAULT_DB_VERSION,
}: OpenDbOptions = {}) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = () => {
      const database = request.result;
      let store: IDBObjectStore;

      if (!database.objectStoreNames.contains(storeName)) {
        store = database.createObjectStore(storeName, { keyPath: "id" });
      } else {
        store = request.transaction!.objectStore(storeName);
      }

      if (storeName === DEFAULT_STORE_NAME) {
        ensureDefaultIndexes(store);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function createRequestPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function withStore<T>(
  { mode = "readonly", ...options }: StoreOptions,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openDatabase(options);

  try {
    const storeName = options.storeName ?? DEFAULT_STORE_NAME;
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    return await createRequestPromise(callback(store));
  } finally {
    database.close();
  }
}

async function withStorePromise<T>(
  { mode = "readonly", ...options }: StoreOptions,
  callback: (store: IDBObjectStore) => Promise<T>,
) {
  const database = await openDatabase(options);

  try {
    const storeName = options.storeName ?? DEFAULT_STORE_NAME;
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    return await callback(store);
  } finally {
    database.close();
  }
}

export function addIndexedDbItem<T extends { id: IDBValidKey }>(
  item: T,
  options: OpenDbOptions = {},
) {
  return withStore<IDBValidKey>(
    { ...options, mode: "readwrite" },
    (store) => store.add(item),
  );
}

export function updateIndexedDbItem<T extends { id: IDBValidKey }>(
  item: T,
  options: OpenDbOptions = {},
) {
  return withStore<IDBValidKey>(
    { ...options, mode: "readwrite" },
    (store) => store.put(item),
  );
}

export function getIndexedDbItem<T>(
  key: IndexedDbKey,
  options: OpenDbOptions = {},
) {
  return withStore<T | undefined>(options, (store) => store.get(key));
}

export function getAllIndexedDbItems<T>(options: OpenDbOptions = {}) {
  return withStore<T[]>(options, (store) => store.getAll());
}

export function getPagedIndexedDbItems<T>({
  direction = "prev",
  indexName = DEFAULT_CREATED_AT_INDEX,
  page = 1,
  pageSize = 20,
  query = null,
  ...options
}: PageOptions = {}) {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const offset = (safePage - 1) * safePageSize;

  return withStorePromise<T[]>(options, (store) => {
    return new Promise((resolve, reject) => {
      const items: T[] = [];
      const source = indexName ? store.index(indexName) : store;
      const request = source.openCursor(query, direction);
      let skippedItems = 0;

      request.onsuccess = () => {
        const cursor = request.result;

        if (!cursor || items.length >= safePageSize) {
          resolve(items);
          return;
        }

        if (skippedItems < offset) {
          skippedItems += 1;
          cursor.continue();
          return;
        }

        items.push(cursor.value as T);
        cursor.continue();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}

export function deleteIndexedDbItem(
  key: IndexedDbKey,
  options: OpenDbOptions = {},
) {
  return withStore<undefined>(
    { ...options, mode: "readwrite" },
    (store) => store.delete(key),
  );
}

export function clearIndexedDbStore(options: OpenDbOptions = {}) {
  return withStore<undefined>(
    { ...options, mode: "readwrite" },
    (store) => store.clear(),
  );
}
