import NodeCache from "node-cache";

const cacheInstance = new NodeCache({ stdTTL: 3600 });

export const cacheService = {
    get: (key: string) => cacheInstance.get(key),
    set: (key: string, value: any) => cacheInstance.set(key, value)
};