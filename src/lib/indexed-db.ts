const DEFAULT_DB_NAME = "time-focus";
const DEFAULT_DB_VERSION = 1;
const DEFAULT_STORE_NAME = "focus-records";

type IndexedDbKey = IDBValidKey | IDBKeyRange;

type OpenDbOptions = {
  dbName?: string;
  storeName?: string;
  version?: number;
};

type StoreOptions = OpenDbOptions & {
  mode?: IDBTransactionMode;
};

function openDatabase({
  dbName = DEFAULT_DB_NAME,
  storeName = DEFAULT_STORE_NAME,
  version = DEFAULT_DB_VERSION,
}: OpenDbOptions = {}) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "id" });
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
